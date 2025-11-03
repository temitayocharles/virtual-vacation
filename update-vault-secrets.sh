#!/bin/bash

# Update Vault with Real API Keys
# This script updates Vault with the actual API keys from your template

set -e

NAMESPACE="vault"
VAULT_ADDR="http://localhost:8200"
VAULT_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=vault -o jsonpath='{.items[0].metadata.name}')

echo "🔐 Updating Vault with Real API Keys"
echo "===================================="
echo ""

# Check if port forwarding is still active
if ! curl -s $VAULT_ADDR/v1/sys/health > /dev/null 2>&1; then
    echo "🔗 Setting up port forwarding..."
    kubectl port-forward -n $NAMESPACE pod/$VAULT_POD 8200:8200 &> /tmp/vault-portforward.log &
    PF_PID=$!
    sleep 3
    echo "✓ Port forwarding established (PID: $PF_PID)"
else
    echo "✓ Port forwarding already active"
fi

echo ""

# Prompt for root token
read -sp "Enter Vault Root Token: " ROOT_TOKEN
echo ""
echo ""

# Your actual API keys from the template
GOOGLE_MAPS_API_KEY="AIzaSyD2DpZUc-RwcRs-hLoLma17AcQs_XYyRa4"
OPENWEATHER_API_KEY="45cc2605bdeeb9e0dbb2dc8298641172"
UNSPLASH_ACCESS_KEY="taU1t8bQNaxcCyrYjJHagGngLcio6Srrm9-qrusePTA"
FREESOUND_API_KEY="LhBHwya8SJv3EAfXYH3fDUHq8zbU2hlJTYXLaO75"
SKETCHFAB_API_KEY="c61ac4eb7df8436c9904fabedb93199c"

echo "🔒 Updating API keys in Vault..."

# Store your real API keys in Vault
curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d "{
    \"data\": {
      \"google_maps_api_key\": \"$GOOGLE_MAPS_API_KEY\",
      \"openweather_api_key\": \"$OPENWEATHER_API_KEY\",
      \"unsplash_access_key\": \"$UNSPLASH_ACCESS_KEY\",
      \"freesound_api_key\": \"$FREESOUND_API_KEY\",
      \"sketchfab_api_key\": \"$SKETCHFAB_API_KEY\"
    }
  }" \
  $VAULT_ADDR/v1/secret/data/virtual-vacation/api-keys > /dev/null

echo "✅ Real API keys stored in Vault!"
echo ""

# Store database credentials
echo "🔒 Updating database credentials..."
curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d "{
    \"data\": {
      \"postgres_password\": \"vzWcioNW7UMxjxUDLA6bmtOvxXoOAdlm\",
      \"jwt_secret\": \"7a43a0817c964b8a5b0df50034d0254501d43ea82b99f120ddfb57f93ed340a9\",
      \"session_secret\": \"dc4be4e3c97035cdeb17e81940cff65aa0513f38f6d8ccdb578033354b793318\",
      \"encryption_key\": \"ca0e16ac9922ff4d0f96fb50f8e05fb0\",
      \"api_encryption_key\": \"aeadd7836a16f51c0552512a24aeea2a\"
    }
  }" \
  $VAULT_ADDR/v1/secret/data/virtual-vacation/database > /dev/null

echo "✅ Database credentials stored in Vault!"
echo ""

# Verify secrets are stored
echo "🔍 Verifying stored secrets..."
echo ""
echo "📋 API Keys stored:"
curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  $VAULT_ADDR/v1/secret/data/virtual-vacation/api-keys | \
  jq -r '.data.data | keys[]' | sed 's/^/  - /'

echo ""
echo "📋 Database secrets stored:"
curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  $VAULT_ADDR/v1/secret/data/virtual-vacation/database | \
  jq -r '.data.data | keys[]' | sed 's/^/  - /'

echo ""
echo "✅ All secrets successfully stored in Vault!"
echo ""
echo "🔐 Your secrets are now secure and ready for use!"

# Cleanup - kill port forwarding if we started it
if [[ ! -z "$PF_PID" ]]; then
    kill $PF_PID 2>/dev/null || true
fi