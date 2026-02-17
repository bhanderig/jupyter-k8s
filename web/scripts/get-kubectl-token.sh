#!/bin/bash
# Helper script to extract JWT token from kubectl for local development

set -e

echo "🔍 Extracting OIDC configuration from kubeconfig..."

# Extract OIDC issuer URL from kubeconfig
ISSUER_URL=$(kubectl config view --minify --raw | grep "oidc-issuer-url" | head -1 | cut -d'=' -f2)

if [ -z "$ISSUER_URL" ]; then
  echo "❌ Error: Could not find OIDC issuer URL in kubeconfig"
  echo "   Make sure you're using kubectl with OIDC authentication"
  exit 1
fi

echo "✅ Found OIDC issuer: $ISSUER_URL"
echo ""
echo "🔑 Getting fresh token from kubectl..."

# Get token from kubectl oidc-login
TOKEN=$(kubectl oidc-login get-token \
  --oidc-issuer-url="$ISSUER_URL" \
  --oidc-client-id=kubectl-oidc \
  --oidc-extra-scope=profile \
  --oidc-extra-scope=groups \
  2>/dev/null | jq -r '.status.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error: Failed to get token from kubectl"
  echo "   Make sure kubectl-oidc-login plugin is installed"
  exit 1
fi

echo "✅ Token retrieved successfully!"
echo ""
echo "📋 Token claims:"
echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
echo ""
echo "📝 Copy this token to web/.env:"
echo "DEV_ACCESS_TOKEN=$TOKEN"
echo ""
echo "Or run this command to update .env automatically:"
echo "  sed -i '' 's|^DEV_ACCESS_TOKEN=.*|DEV_ACCESS_TOKEN=$TOKEN|' web/.env"
