/**
 * trust-cert.js
 * Installs ./ssl/cert.pem into the Windows Trusted Root Certification
 * Authorities store so Chrome/Edge/IE trust the self-signed cert without
 * showing "Your connection is not private".
 *
 * Run ONCE after first boot:
 *   node trust-cert.js
 *
 * Requires: Administrator privileges
 */

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const certPath = path.join(__dirname, 'ssl', 'cert.pem');

if (!fs.existsSync(certPath)) {
    console.error('❌  cert.pem not found. Start the server first:  node server.js');
    process.exit(1);
}

console.log('🛡️   Installing SSL certificate into Windows Trusted Root store…');
console.log('    (You may see a UAC security prompt — click Yes to allow)');
console.log('');

try {
    // Use certutil to import into LocalMachine root store
    execSync(
        `certutil -addstore -f "Root" "${certPath}"`,
        { stdio: 'inherit' }
    );
    console.log('');
    console.log('✅  Certificate trusted! Restart Chrome/Edge and visit:');
    console.log('    https://localhost:5000');
    console.log('    The "Not secure" warning will be gone.');
} catch (err) {
    console.log('');
    console.log('⚠️   certutil failed. Try running this script as Administrator:');
    console.log('    1. Open PowerShell as Administrator');
    console.log('    2. cd "d:\\Projects\\Skill Swap AI"');
    console.log('    3. node trust-cert.js');
    console.log('');
    console.log('    OR manually in Chrome:');
    console.log('    1. Go to chrome://settings/security → Manage certificates');
    console.log('    2. Import → Trusted Root Certification Authorities → Browse to ssl/cert.pem');
}
