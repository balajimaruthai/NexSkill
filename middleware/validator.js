const XSS_REGEX = /<[^>]*script/gi;

function sanitizeInput(val) {
    if (typeof val === 'string') {
        // Strip out HTML tags to prevent XSS injection attacks
        return val.replace(/<[^>]*>?/gm, '').trim();
    }
    return val;
}

function validateBody(schema) {
    return (req, res, next) => {
        const errors = [];
        
        // Sanitize and Validate
        for (const [key, rules] of Object.entries(schema)) {
            let val = req.body[key];
            
            // Apply Sanitization
            if (rules.sanitize !== false && val !== undefined) {
                req.body[key] = sanitizeInput(val);
                val = req.body[key];
            }

            // Check Required
            if (rules.required && (val === undefined || val === null || val === '')) {
                errors.push(`Field '${key}' is required.`);
                continue;
            }

            if (val !== undefined && val !== null && val !== '') {
                // Check Email
                if (rules.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val)) {
                        errors.push(`Field '${key}' must be a valid email address.`);
                    }
                }
                
                // Check Min Length
                if (rules.minLength && val.length < rules.minLength) {
                    errors.push(`Field '${key}' must be at least ${rules.minLength} characters long.`);
                }

                // Check Max Length
                if (rules.maxLength && val.length > rules.maxLength) {
                    errors.push(`Field '${key}' must not exceed ${rules.maxLength} characters.`);
                }

                // Check numeric min/max
                if (rules.type === 'number') {
                    const num = Number(val);
                    if (isNaN(num)) {
                        errors.push(`Field '${key}' must be a numeric value.`);
                    } else {
                        if (rules.min !== undefined && num < rules.min) {
                            errors.push(`Field '${key}' must be at least ${rules.min}.`);
                        }
                        if (rules.max !== undefined && num > rules.max) {
                            errors.push(`Field '${key}' must be at most ${rules.max}.`);
                        }
                    }
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ msg: errors.join(' ') });
        }
        next();
    };
}

module.exports = {
    validateBody,
    sanitizeInput
};
