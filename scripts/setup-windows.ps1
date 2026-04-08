#!/usr/bin/env pwsh
#Requires -Version 7.0
<#
.SYNOPSIS
  ClaudeCo - Windows development environment setup script.

.DESCRIPTION
  Verifies prerequisites, installs dependencies, builds shared packages,
  and starts Docker services for local development.

.PARAMETER SkipDocker
  Skip Docker Compose step (if Docker Desktop is not installed).

.PARAMETER SkipInstall
  Skip pnpm install (if already installed).

.EXAMPLE
  .\scripts\setup-windows.ps1
  .\scripts\setup-windows.ps1 -SkipDocker
#>

param(
  [switch]$SkipDocker,
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

function Write-Step { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "    !   $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "    ERR $msg" -ForegroundColor Red; exit 1 }

Write-Host "`n=============================" -ForegroundColor Magenta
Write-Host "  ClaudeCo - Windows Setup  " -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

# -------------------------------------------------------
# 1. Prerequisites check
# -------------------------------------------------------
Write-Step "Checking prerequisites..."

# Node.js
try {
  $nodeVer = node --version
  $major = [int]($nodeVer -replace 'v(\d+)\..*', '$1')
  if ($major -lt 20) { Write-Fail "Node.js $nodeVer found but v20+ required. Download: https://nodejs.org" }
  Write-OK "Node.js $nodeVer"
} catch {
  Write-Fail "Node.js not found. Install from https://nodejs.org (v20 LTS recommended)"
}

# pnpm
try {
  $pnpmVer = pnpm --version
  $pnpmMajor = [int]($pnpmVer -split '\.')[0]
  if ($pnpmMajor -lt 9) { Write-Warn "pnpm $pnpmVer found; v9+ recommended. Run: npm install -g pnpm@latest" }
  else { Write-OK "pnpm $pnpmVer" }
} catch {
  Write-Fail "pnpm not found. Run: npm install -g pnpm"
}

# Git
try {
  $gitVer = git --version
  Write-OK $gitVer
} catch {
  Write-Fail "Git not found. Download from https://git-scm.com"
}

# -------------------------------------------------------
# 2. Copy .env files
# -------------------------------------------------------
Write-Step "Setting up environment files..."

$envFiles = @(
  @{ Example = "apps\api\.env.example"; Target = "apps\api\.env" },
  @{ Example = "apps\web\.env.example"; Target = "apps\web\.env" }
)

foreach ($ef in $envFiles) {
  if (-not (Test-Path $ef.Target)) {
    Copy-Item $ef.Example $ef.Target
    Write-OK "Created $($ef.Target) from example"
  } else {
    Write-OK "$($ef.Target) already exists, skipping"
  }
}

# -------------------------------------------------------
# 3. Install dependencies
# -------------------------------------------------------
if (-not $SkipInstall) {
  Write-Step "Installing workspace dependencies (pnpm install)..."
  pnpm install
  if ($LASTEXITCODE -ne 0) { Write-Fail "pnpm install failed. Check errors above." }
  Write-OK "All dependencies installed"
}

# -------------------------------------------------------
# 4. Build shared package
# -------------------------------------------------------
Write-Step "Building shared package (@claudeco/shared)..."
pnpm --filter @claudeco/shared build
if ($LASTEXITCODE -ne 0) { Write-Fail "Shared package build failed." }
Write-OK "Shared package built"

# -------------------------------------------------------
# 5. Docker services
# -------------------------------------------------------
if (-not $SkipDocker) {
  Write-Step "Checking Docker..."
  try {
    docker info 2>&1 | Out-Null
    Write-Step "Starting services (PostgreSQL + Redis)..."
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { Write-Warn "docker compose up failed. Check Docker Desktop." }
    else { Write-OK "PostgreSQL running on :5432, Redis on :6379" }
  } catch {
    Write-Warn "Docker not available. Install Docker Desktop and run: docker compose up -d"
  }
}

# -------------------------------------------------------
# 6. Summary
# -------------------------------------------------------
Write-Host "`n=============================" -ForegroundColor Green
Write-Host "  Setup complete!            " -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor White
Write-Host "  pnpm dev             Start frontend (http://localhost:3000) + API (http://localhost:3001)" -ForegroundColor Gray
Write-Host "  pnpm test            Run all tests" -ForegroundColor Gray
Write-Host "  pnpm lint            Run Biome linter" -ForegroundColor Gray
Write-Host "  pnpm lint:fix        Auto-fix lint issues" -ForegroundColor Gray
Write-Host "  docker compose up    Start database services" -ForegroundColor Gray
Write-Host ""
Write-Host "VS Code extensions: install from .vscode/extensions.json" -ForegroundColor DarkGray
Write-Host ""
