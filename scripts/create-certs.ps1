param([string[]]$IpAddress, [switch]$Trust)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$openssl = Get-Command openssl -ErrorAction Stop
if (-not $IpAddress) {
  $IpAddress = @(node -e "const os=require('node:os'); for(const rows of Object.values(os.networkInterfaces())) for(const r of rows||[]) if(r.family==='IPv4'&&!r.internal) console.log(r.address)")
}
if (-not $IpAddress) { throw 'Specify the laptop LAN IP: npm run certs -- -IpAddress 192.168.1.10' }
New-Item -ItemType Directory -Force certs | Out-Null
# CA persists between runs, so a changed LAN IP only requires a new leaf certificate.
if (-not (Test-Path certs/ca-key.pem)) {
  & $openssl req -x509 -newkey rsa:2048 -sha256 -nodes -days 3650 -keyout certs/ca-key.pem -out certs/ca.crt -subj '/CN=HEATCALC Local Lab CA' -addext 'basicConstraints=critical,CA:TRUE' -addext 'keyUsage=critical,keyCertSign,cRLSign'
  if ($LASTEXITCODE -ne 0) { throw 'CA generation failed' }
}
$san = 'DNS:localhost,IP:127.0.0.1,' + (($IpAddress | ForEach-Object { 'IP:' + $_ }) -join ',')
@"
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=$san
"@ | Set-Content -Encoding ascii certs/server.ext
& $openssl req -newkey rsa:2048 -nodes -keyout certs/localhost-key.pem -out certs/server.csr -subj '/CN=HEATCALC Laptop'
if ($LASTEXITCODE -ne 0) { throw 'CSR generation failed' }
& $openssl x509 -req -in certs/server.csr -CA certs/ca.crt -CAkey certs/ca-key.pem -CAcreateserial -out certs/localhost.pem -days 365 -sha256 -extfile certs/server.ext
if ($LASTEXITCODE -ne 0) { throw 'Certificate signing failed' }
if ($Trust) {
  certutil -user -addstore Root certs/ca.crt
  if ($LASTEXITCODE -ne 0) { throw 'CA trust installation failed' }
}
Write-Host 'Certificate SAN:' $san
Write-Host 'Install ONLY certs/ca.crt as a trusted CA on your phone. Never transfer private keys.'
$IpAddress | ForEach-Object { Write-Host "Open https://$($_):3000/#/grid" }
