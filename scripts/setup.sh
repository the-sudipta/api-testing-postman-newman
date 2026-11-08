#!/usr/bin/env bash
# Prepares the repo on Linux/macOS or CI (Node.js 20+ must be installed).
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
npm run build
echo "Setup complete. Run: npm test"
