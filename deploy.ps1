<#
.SYNOPSIS
    Build and deploy מתחלקים (BillSplitter) to Firebase Hosting.

.PARAMETER Rules
    Also deploy the Firestore security rules (firestore.rules). Off by default —
    rules change far less often than the app itself, and deserve a deliberate,
    separate push rather than going out silently with every app deploy.

.EXAMPLE
    ./deploy.ps1
    Builds and deploys just the app.

.EXAMPLE
    ./deploy.ps1 -Rules
    Builds and deploys the app AND the Firestore security rules.
#>
param(
    [switch]$Rules
)

$ErrorActionPreference = "Stop"
$ProjectId = "we-splits"

Set-Location $PSScriptRoot

Write-Host "==> Building production bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed - aborting deploy." -ForegroundColor Red
    exit 1
}

$target = if ($Rules) { "hosting,firestore:rules" } else { "hosting" }

Write-Host ""
Write-Host "==> Deploying to Firebase ($target)..." -ForegroundColor Cyan
npx firebase-tools deploy --only $target --project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deploy complete: https://$ProjectId.web.app" -ForegroundColor Green
