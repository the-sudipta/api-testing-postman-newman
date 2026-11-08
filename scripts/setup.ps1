# Prepares everything inside the repo on Windows without admin rights.
# Uses Node.js from PATH if present, otherwise downloads a portable Node.js LTS into tools/node.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $repo 'tools'

function Install-PortableNode {
    $version = 'v24.11.1'
    $zip = Join-Path $tools 'node.zip'
    New-Item -ItemType Directory -Force $tools | Out-Null
    Invoke-WebRequest "https://nodejs.org/dist/$version/node-$version-win-x64.zip" -OutFile $zip
    Expand-Archive $zip -DestinationPath $tools -Force
    Move-Item (Join-Path $tools "node-$version-win-x64") (Join-Path $tools 'node') -Force
    Remove-Item $zip
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    if (-not (Test-Path (Join-Path $tools 'node\node.exe'))) { Install-PortableNode }
    $env:Path = (Join-Path $tools 'node') + ';' + $env:Path
}

Push-Location $repo
try {
    npm ci
    npm run build
    Write-Host "Setup complete. Run: npm test"
} finally {
    Pop-Location
}
