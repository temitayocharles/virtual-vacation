#!/bin/bash

# Vault Setup Script for Virtual Vacation
# Initializes Vault, unseals it, and configures secrets for the application

set -e

NAMESPACE="vault"
APP_NAMESPACE="virtual-vacation"
VAULT_POD=""
VAULT_ADDR="http://localhost:8200"

echo "🔐 Virtual Vacation - Vault Setup"
echo "=================================="
echo ""

# Wait for Vault pod to be ready
echo "⏳ Waiting for Vault pod to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=vault -n $NAMESPACE --timeout=300s 2>/dev/null || true

# Get Vault pod name
VAULT_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=vault -o jsonpath='{.items[0].metadata.name}')

if [ -z "$VAULT_POD" ]; then
    echo "❌ Vault pod not found. Deploy Vault first:"
    echo "   kubectl apply -f k8s-testing/vault-setup.yaml"
    exit 1
fi

echo "✓ Vault pod: $VAULT_POD"
echo ""

# Port forward Vault
echo "🔗 Setting up port forwarding..."
kubectl port-forward -n $NAMESPACE pod/$VAULT_POD 8200:8200 &> /tmp/vault-portforward.log &
PF_PID=$!
sleep 2

echo "✓ Port forwarding established (PID: $PF_PID)"
echo ""

# Check if Vault is initialized
echo "🔍 Checking Vault status..."
STATUS=$(curl -s $VAULT_ADDR/v1/sys/init | grep -o '"initialized":[^,}]*' || echo "")

if [[ $STATUS == *"true"* ]]; then
    echo "✓ Vault is already initialized"
    echo "⚠️  Note: If Vault is sealed, you'll need the unseal key"
else
    echo "🔧 Initializing Vault..."
    INIT_OUTPUT=$(curl -s -X POST \
      -d '{"secret_shares": 1, "secret_threshold": 1}' \
      $VAULT_ADDR/v1/sys/init)
    
    ROOT_TOKEN=$(echo $INIT_OUTPUT | grep -o '"root_token":"[^"]*' | cut -d'"' -f4)
    UNSEAL_KEY=$(echo $INIT_OUTPUT | grep -o '"keys":\[\["[^"]*' | cut -d'"' -f4)
    
    echo "✓ Vault initialized"
    echo ""
    echo "⚠️  IMPORTANT - Save these credentials securely:"
    echo "ROOT_TOKEN: $ROOT_TOKEN"
    echo "UNSEAL_KEY: $UNSEAL_KEY"
    echo ""
    
    # Unseal Vault
    echo "🔓 Unsealing Vault..."
    curl -s -X PUT \
      -d "{\"key\": \"$UNSEAL_KEY\"}" \
      $VAULT_ADDR/v1/sys/unseal > /dev/null
    
    echo "✓ Vault unsealed"
    echo ""
fi

# Prompt for root token
read -sp "Enter Vault Root Token: " ROOT_TOKEN
echo ""
echo ""

# Enable Kubernetes auth method
echo "🔐 Configuring Kubernetes authentication..."
curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d '{"type": "kubernetes"}' \
  $VAULT_ADDR/v1/sys/auth/kubernetes &> /dev/null || echo "ℹ️  Kubernetes auth method already enabled"

# Configure Kubernetes auth
KUBERNETES_HOST=$(kubectl cluster-info | grep 'Kubernetes master' | awk '/https/ {print $NF}' || echo "https://kubernetes.default.svc:443")
TOKEN_REVIEW_JWT=$(kubectl create token vault -n $NAMESPACE)
KUBE_CA_CERT=$(kubectl get secret $(kubectl get secret -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}') -n $NAMESPACE -o jsonpath="{['data']['ca\.crt']}" | base64 --decode)

curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d "{\"kubernetes_host\": \"$KUBERNETES_HOST\", \"kubernetes_ca_cert\": \"$KUBE_CA_CERT\", \"token_reviewer_jwt\": \"$TOKEN_REVIEW_JWT\"}" \
  $VAULT_ADDR/v1/auth/kubernetes/config > /dev/null

echo "✓ Kubernetes auth configured"
echo ""

# Enable KV secrets engine
echo "📦 Enabling KV secrets engine..."
curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d '{"type": "kv-v2"}' \
  $VAULT_ADDR/v1/sys/mounts/secret &> /dev/null || echo "ℹ️  KV secrets engine already enabled"

echo "✓ KV secrets engine enabled"
echo ""

# Create policy for application
echo "👤 Creating Vault policy for Virtual Vacation..."
cat > /tmp/vault-policy.hcl <<EOF
path "secret/data/virtual-vacation/*" {
  capabilities = ["read", "list"]
}

path "secret/metadata/virtual-vacation/*" {
  capabilities = ["read", "list"]
}
EOF

curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X PUT \
  -d @/tmp/vault-policy.hcl \
  $VAULT_ADDR/v1/sys/policies/acl/virtual-vacation > /dev/null

echo "✓ Policy created: virtual-vacation"
echo ""

# Store secrets in Vault
echo "🔒 Storing application secrets in Vault..."

# API Keys
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:-"CONFIGURE_YOUR_API_KEY_HERE"}
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY:-"CONFIGURE_YOUR_API_KEY_HERE"}
UNSPLASH_API_KEY=${UNSPLASH_API_KEY:-"CONFIGURE_YOUR_API_KEY_HERE"}
FREESOUND_API_KEY=${FREESOUND_API_KEY:-"CONFIGURE_YOUR_API_KEY_HERE"}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"secure-password-change-me"}

curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d "{
    \"data\": {
      \"google_maps_api_key\": \"$GOOGLE_MAPS_API_KEY\",
      \"openweather_api_key\": \"$OPENWEATHER_API_KEY\",
      \"unsplash_api_key\": \"$UNSPLASH_API_KEY\",
      \"freesound_api_key\": \"$FREESOUND_API_KEY\",
      \"postgres_password\": \"$POSTGRES_PASSWORD\"
    }
  }" \
  $VAULT_ADDR/v1/secret/data/virtual-vacation/api-keys > /dev/null

echo "✓ API keys stored in Vault"
echo ""

# Create Kubernetes Service Account role
echo "🎫 Creating Kubernetes ServiceAccount role..."
cat > /tmp/vault-role.json <<EOF
{
  "bound_service_account_names": "backend,frontend",
  "bound_service_account_namespaces": "$APP_NAMESPACE",
  "policies": "virtual-vacation",
  "ttl": "24h"
}
EOF

curl -s -H "X-Vault-Token: $ROOT_TOKEN" \
  -X POST \
  -d @/tmp/vault-role.json \
  $VAULT_ADDR/v1/auth/kubernetes/role/virtual-vacation > /dev/null

echo "✓ ServiceAccount role created"
echo ""

# Cleanup
kill $PF_PID 2>/dev/null || true
rm -f /tmp/vault-portforward.log /tmp/vault-policy.hcl /tmp/vault-role.json

echo "✅ Vault setup complete!"
echo ""
echo "📋 Summary:"
echo "- Vault namespace: $NAMESPACE"
echo "- Vault API: http://localhost:8200"
echo "- Secrets path: secret/virtual-vacation/*"
echo "- Kubernetes auth: Enabled"
echo ""
echo "🚀 Next steps:"
echo "1. Update your app deployments to use Vault agent injection"
echo "2. Add annotations to Deployment specs:"
echo "   vault.hashicorp.com/agent-inject: 'true'"
echo "   vault.hashicorp.com/role: 'virtual-vacation'"
echo "   vault.hashicorp.com/agent-inject-secret-api-keys: 'secret/data/virtual-vacation/api-keys'"
echo ""
