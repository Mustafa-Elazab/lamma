#!/bin/bash
set -euo pipefail
export PATH="/Users/mostafamohamedelazab/.nvm/versions/node/v18.20.4/bin:$PATH"
cd /Users/mostafamohamedelazab/Documents/lamma
echo "Using firebase: $(which firebase)"
echo "Signing into Firebase CLI (browser will open)…"
"/Users/mostafamohamedelazab/.nvm/versions/node/v18.20.4/bin/firebase" login --reauth
echo
echo "Writing Application Default Credentials…"
"/Users/mostafamohamedelazab/.nvm/versions/node/v18.20.4/bin/node" << 'NODE'
const fs = require('fs');
const path = require('path');
const os = require('os');
const api = require('/Users/mostafamohamedelazab/.nvm/versions/node/v18.20.4/lib/node_modules/firebase-tools/lib/api.js');
const cfg = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'),
);
const tokens = cfg.tokens || {};
if (!tokens.refresh_token) {
  console.error('No refresh_token after login');
  process.exit(1);
}
const adcDir = path.join(os.homedir(), '.config/gcloud');
fs.mkdirSync(adcDir, { recursive: true });
const adc = {
  client_id: api.clientId(),
  client_secret: api.clientSecret(),
  refresh_token: tokens.refresh_token,
  type: 'authorized_user',
};
const adcPath = path.join(adcDir, 'application_default_credentials.json');
fs.writeFileSync(adcPath, JSON.stringify(adc, null, 2));
console.log('Wrote', adcPath);
NODE
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json"
"/Users/mostafamohamedelazab/.nvm/versions/node/v18.20.4/bin/firebase" projects:list
echo
echo "Running games seed…"
"/Users/mostafamohamedelazab/.nvm/versions/node/v18.20.4/bin/node" scripts/seed-games-content.js
echo "Done. You can close this window."
