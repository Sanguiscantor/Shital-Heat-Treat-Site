$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".env.local"

if (-not (Test-Path $envFile)) {
  throw ".env.local was not found at $envFile"
}

$databaseUrl = Get-Content $envFile |
  Where-Object { $_ -match "^DATABASE_URL=" } |
  Select-Object -First 1

if (-not $databaseUrl) {
  throw "DATABASE_URL was not found in .env.local"
}

$env:DATABASE_URL = $databaseUrl -replace "^DATABASE_URL=", ""
$env:PORT = "4000"
$env:NODE_ENV = "development"
$env:CORS_ORIGIN = "http://localhost:5173"
$env:AUTH_SECRET = "local-dev-auth-secret-change-before-production"

Set-Location $repoRoot
node --enable-source-maps ".\artifacts\api-server\dist\index.mjs"
