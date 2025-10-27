# TraceRoot Hyperledger Fabric Network Management Script
# Usage: .\network.ps1 [up|down|restart|enrolladmin]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('up','down','restart','enrolladmin','status')]
    [string]$Command
)

$NetworkPath = $PSScriptRoot
$ProjectRoot = Split-Path $NetworkPath -Parent

function Show-Status {
    Write-Host "`n=== Fabric Network Status ===" -ForegroundColor Cyan
    docker ps --filter "name=org1" --filter "name=orderer" --filter "name=ca" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
}

function Start-Network {
    Write-Host "`n🚀 Starting Hyperledger Fabric Network..." -ForegroundColor Green
    
    # Check if cryptogen tool is available (from fabric-samples)
    $fabricSamplesPath = "H:\VSCODE\fabric-samples"
    if (Test-Path "$fabricSamplesPath\bin\cryptogen.exe") {
        $env:PATH = "$fabricSamplesPath\bin;$env:PATH"
        Write-Host "✅ Using cryptogen from fabric-samples" -ForegroundColor Green
    } else {
        Write-Host "⚠️  cryptogen not found. Using fabric-samples test-network..." -ForegroundColor Yellow
        
        # Use the existing test-network
        Set-Location "$fabricSamplesPath\test-network"
        
        Write-Host "Cleaning up any existing network..." -ForegroundColor Yellow
        docker-compose down -v 2>$null
        Remove-Item -Recurse -Force organizations -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force channel-artifacts -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force system-genesis-block -ErrorAction SilentlyContinue
        
        Write-Host "`nStarting Fabric test network with CA..." -ForegroundColor Cyan
        & docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Fabric network started successfully!" -ForegroundColor Green
            Start-Sleep -Seconds 5
            
            Write-Host "`nCreating channel 'mychannel'..." -ForegroundColor Cyan
            # Create channel using fabric-samples scripts
            docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Channel created!" -ForegroundColor Green
                
                # Copy certificates to TraceRoot project
                Write-Host "`nCopying certificates to TraceRoot project..." -ForegroundColor Cyan
                $orgPath = "$fabricSamplesPath\test-network\organizations\peerOrganizations\org1.example.com"
                $caPath = "$fabricSamplesPath\test-network\organizations\peerOrganizations\org1.example.com\ca"
                
                if (Test-Path $orgPath) {
                    Copy-Item -Path $orgPath -Destination "$NetworkPath\crypto-config\peerOrganizations\" -Recurse -Force
                    Write-Host "✅ Certificates copied!" -ForegroundColor Green
                }
                
                Show-Status
                
                Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
                Write-Host "1. Run: npm run fabric:enroll" -ForegroundColor White
                Write-Host "2. In .env, set: USE_REAL_BLOCKCHAIN=`"true`"" -ForegroundColor White
                Write-Host "3. Test: npm run fabric:test" -ForegroundColor White
            } else {
                Write-Host "❌ Failed to create channel" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Failed to start network" -ForegroundColor Red
            return
        }
        
        Set-Location $ProjectRoot
        return
    }
}

function Stop-Network {
    Write-Host "`n🛑 Stopping Hyperledger Fabric Network..." -ForegroundColor Yellow
    
    $fabricSamplesPath = "H:\VSCODE\fabric-samples\test-network"
    
    if (Test-Path $fabricSamplesPath) {
        Set-Location $fabricSamplesPath
        docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml down -v
        Set-Location $ProjectRoot
    }
    
    # Also stop any containers from our docker-compose
    Set-Location $NetworkPath
    docker-compose down -v 2>$null
    Set-Location $ProjectRoot
    
    Write-Host "✅ Network stopped" -ForegroundColor Green
}

function Restart-Network {
    Stop-Network
    Start-Sleep -Seconds 2
    Start-Network
}

function Enroll-Admin {
    Write-Host "`n🔐 Enrolling Fabric admin and app user..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    npm run fabric:enroll
}

# Main execution
Set-Location $ProjectRoot

switch ($Command) {
    'up' { Start-Network }
    'down' { Stop-Network }
    'restart' { Restart-Network }
    'enrolladmin' { Enroll-Admin }
    'status' { Show-Status }
}

Write-Host "`n✅ Done!`n" -ForegroundColor Green
