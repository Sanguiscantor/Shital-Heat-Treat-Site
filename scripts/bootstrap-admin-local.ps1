$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".env.local"

if (-not (Test-Path $envFile)) {
  throw ".env.local was not found at $envFile"
}

$values = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match "^([^#][^=]+)=(.*)$") {
    $values[$matches[1].Trim()] = $matches[2].Trim()
  }
}

$email = $values["BOOTSTRAP_ADMIN_EMAIL"]
$password = $values["BOOTSTRAP_ADMIN_PASSWORD"]
$fullName = $values["BOOTSTRAP_ADMIN_FULL_NAME"]

if (-not $email -or -not $password -or -not $fullName) {
  throw "BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, and BOOTSTRAP_ADMIN_FULL_NAME must be set in .env.local"
}

if ($password -eq "replace-with-strong-password") {
  throw "Replace BOOTSTRAP_ADMIN_PASSWORD in .env.local before bootstrapping."
}

$body = @{
  email = $email
  password = $password
  fullName = $fullName
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/auth/bootstrap-admin" `
  -ContentType "application/json" `
  -Body $body
