from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import os

app = Flask(__name__)
CORS(app)

# Feature mapping
WEATHER_MAP = {'Clear': 0, 'Rainy': 1, 'Stormy': 2, 'Extreme': 3}
TIME_MAP = {'Morning': 0, 'Afternoon': 1, 'Evening': 2, 'Night': 3}
DAY_MAP = {'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6}

# Generate synthetic training dataset for Random Forest model
np.random.seed(42)
n_samples = 1500

patients = np.random.randint(10, 150, n_samples)
beds = np.random.randint(5, 60, n_samples)
doctors = np.random.randint(2, 25, n_samples)
nurses = np.random.randint(5, 50, n_samples)
severity = np.random.uniform(1.0, 5.0, n_samples)
ambulances = np.random.randint(0, 15, n_samples)
wait_time = np.random.randint(10, 120, n_samples)
weather_encoded = np.random.choice([0, 1, 2, 3], n_samples, p=[0.5, 0.3, 0.15, 0.05])
holiday = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
time_encoded = np.random.choice([0, 1, 2, 3], n_samples)
day_encoded = np.random.choice(range(7), n_samples)

# Logic for synthetic rush level target based on operational physics
occupancy_ratio = patients / (beds + 1)
load_score = (patients * 0.3) + (wait_time * 0.2) + (ambulances * 3) + (severity * 5) - (doctors * 2) - (nurses * 1) + (weather_encoded * 4) + (holiday * 8)

labels = []
for score in load_score:
    if score < 35:
        labels.append(0) # Low Rush
    elif score < 65:
        labels.append(1) # Medium Rush
    else:
        labels.append(2) # High Rush

X = np.column_stack([
    patients, beds, doctors, nurses, severity, ambulances, wait_time,
    weather_encoded, holiday, time_encoded, day_encoded
])
y = np.array(labels)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
model.fit(X_train, y_train)

# Calculate model metrics
y_pred = model.predict(X_test)
acc = float(accuracy_score(y_test, y_pred))
prec = float(precision_score(y_test, y_pred, average='weighted'))
rec = float(recall_score(y_test, y_pred, average='weighted'))
f1 = float(f1_score(y_test, y_pred, average='weighted'))
cm = confusion_matrix(y_test, y_pred).tolist()

feature_names = [
    'Patient_Count', 'Available_Beds', 'Doctor_Count', 'Nurse_Count',
    'Severity_Level', 'Ambulance_Arrivals', 'Waiting_Time',
    'Weather', 'Holiday', 'Time_of_Day', 'Day_of_Week'
]
importances = dict(zip(feature_names, model.feature_importances_.round(4).tolist()))

def generate_recommendations(rush_level, occupancy):
    if rush_level == 'High Rush':
        return [
            "Increase emergency medical staff & nurses immediately.",
            "Prepare ICU and overflow ward beds.",
            "Notify ambulance dispatch to reroute non-critical cases.",
            "Activate rapid triage protocol for waiting patients."
        ]
    elif rush_level == 'Medium Rush':
        return [
            "Prepare additional nursing staff on call.",
            "Monitor bed availability in General Ward.",
            "Alert senior medical officer of impending peak.",
            "Ensure emergency pharmacy stock is replenished."
        ]
    else:
        return [
            "Maintain current staffing level.",
            "Standard patient monitoring procedures in effect.",
            "Conduct routine equipment maintenance checks."
        ]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "Emergency Ward Rush ML API", "accuracy": f"{acc*100:.1f}%"})

@app.route('/metrics', methods=['GET'])
def get_metrics():
    return jsonify({
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "feature_importance": importances,
        "model_name": "RandomForestClassifier",
        "n_estimators": 100
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}
    
    pat = float(data.get('Patient_Count', 45))
    beds_avail = float(data.get('Available_Beds', 15))
    docs = float(data.get('Doctor_Count', 5))
    nurses_cnt = float(data.get('Nurse_Count', 12))
    sev = float(data.get('Severity_Level', 3))
    amb = float(data.get('Ambulance_Arrivals', 3))
    wait = float(data.get('Waiting_Time', 35))
    w_str = str(data.get('Weather', 'Clear'))
    hol = int(data.get('Holiday', 0))
    t_str = str(data.get('Time_of_Day', 'Afternoon'))
    d_str = str(data.get('Day_of_Week', 'Mon'))

    w_enc = WEATHER_MAP.get(w_str, 0)
    t_enc = TIME_MAP.get(t_str, 1)
    d_enc = DAY_MAP.get(d_str, 0)

    input_vector = np.array([[pat, beds_avail, docs, nurses_cnt, sev, amb, wait, w_enc, hol, t_enc, d_enc]])
    
    probs = model.predict_proba(input_vector)[0]
    pred_idx = np.argmax(probs)
    
    levels = ['Low Rush', 'Medium Rush', 'High Rush']
    rush_level = levels[pred_idx]
    confidence = float(np.max(probs))
    
    # Calculate occupancy percentage for context
    total_est_beds = max(beds_avail + pat * 0.4, 30)
    occupancy = min(round((pat / total_est_beds) * 100, 1), 100.0)

    recommendations = generate_recommendations(rush_level, occupancy)

    return jsonify({
        "rush_level": rush_level,
        "probability": round(confidence * 100, 1),
        "confidence": round(confidence, 2),
        "risk_score": round(confidence * 100),
        "occupancy_percent": occupancy,
        "recommendations": recommendations,
        "probabilities": {
            "Low Rush": round(float(probs[0]) * 100, 1),
            "Medium Rush": round(float(probs[1]) * 100, 1),
            "High Rush": round(float(probs[2]) * 100, 1)
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
