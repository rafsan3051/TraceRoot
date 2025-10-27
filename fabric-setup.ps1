# Fabric Network Helper for Windows
# Runs fabric-samples test-network via Git Bash

param(
    [Parameter(Mandatory=$false)]
    [string]$Command = "up"
)

$testNetworkPath = "H:\VSCODE\fabric-samples\test-network"
$gitBashPaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "${env:ProgramFiles}\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe"
)

# Find Git Bash
$bashExe = $null
foreach ($path in $gitBashPaths) {
    if (Test-Path $path) {
        $bashExe = $path
        break
    }
}

if (-not $bashExe) {
    Write-Host "❌ Git Bash not found. Trying WSL..." -ForegroundColor Red
    $bashExe = "wsl"
}

Set-Location $testNetworkPath

Write-Host "🚀 Running Fabric network command: $Command" -ForegroundColor Cyan
Write-Host "Using: $bashExe" -ForegroundColor Gray

switch ($Command) {
    "up" {
        Write-Host "`nStarting Fabric network with CA..." -ForegroundColor Green
        if ($bashExe -eq "wsl") {
            wsl -e sh -c "cd /mnt/h/VSCODE/fabric-samples/test-network && ./network.sh down && ./network.sh up createChannel -ca -c mychannel"
        } else {
            & $bashExe -c "./network.sh down && ./network.sh up createChannel -ca -c mychannel"
        }
    }
    "down" {
        Write-Host "`nStopping Fabric network..." -ForegroundColor Yellow
        if ($bashExe -eq "wsl") {
            wsl -e sh -c "cd /mnt/h/VSCODE/fabric-samples/test-network && ./network.sh down"
        } else {
            & $bashExe -c "./network.sh down"
        }
    }
    "status" {
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "example.com|ca_"
    }
    default {
        Write-Host "Usage: .\fabric-setup.ps1 [up|down|status]" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Command completed!" -ForegroundColor Green
