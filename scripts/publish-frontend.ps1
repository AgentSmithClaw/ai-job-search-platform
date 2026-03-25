$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$distDir = Join-Path $repoRoot "frontend\\dist"
$publicDir = Join-Path $repoRoot "public"

if (-not (Test-Path $distDir)) {
  throw "Build output not found: $distDir"
}

if (Test-Path $publicDir) {
  Remove-Item -Path $publicDir -Recurse -Force
}

New-Item -ItemType Directory -Path $publicDir | Out-Null
Copy-Item -Path (Join-Path $distDir "*") -Destination $publicDir -Recurse -Force

Write-Output "Published frontend assets to $publicDir"
