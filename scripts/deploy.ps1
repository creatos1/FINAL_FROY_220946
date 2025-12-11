Param(
  [int]$CanaryWeight = 10,
  [int]$FinalWeight = 100,
  [int]$BlueWeightAfterFinal = 0
)

Write-Host "Build image"
docker compose build transaction-validator-green | Out-Null

Write-Host "Start green"
docker compose up -d transaction-validator-green | Out-Null

Write-Host "Waiting for green container..."
$greenContainer = ""

for ($i = 0; $i -lt 10; $i++) {
    $greenContainer = docker ps -q -f name=transaction-validator-green
    if ($greenContainer) {
        Write-Host "Green container is running: $greenContainer"
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $greenContainer) {
  Write-Error "Green container failed to start!"
  exit 1
}

Write-Host "Ensure reverse-proxy and blue are running"
docker compose up -d reverse-proxy transaction-validator-blue | Out-Null

Start-Sleep -Seconds 3

function Set-Weights($blue, $green) {
  $bw = [Math]::Max(1, [int]$blue)
  $gw = [Math]::Max(1, [int]$green)
  $cmd = "export NGINX_BLUE_WEIGHT=$bw NGINX_GREEN_WEIGHT=$gw; envsubst < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf && nginx -s reload"
  docker exec reverse-proxy sh -c $cmd | Out-Null
}

Write-Host "Set canary weights"
Set-Weights -blue (100 - $CanaryWeight) -green $CanaryWeight

Start-Sleep -Seconds 5

Write-Host "Smoke test"
$ok = 0; $fail = 0
for ($i=0; $i -lt 50; $i++) {
  try {
    $res = Invoke-RestMethod -Method Post -Uri http://localhost:8080/validate -Body (@{ transactionId = [guid]::NewGuid().ToString(); amount = 10; currency = 'MXN' } | ConvertTo-Json) -ContentType 'application/json'
    if ($res.ok) { $ok++ } else { $fail++ }
  } catch {
    $fail++
  }
}

Write-Host "OK=$ok FAIL=$fail"
if ($fail -gt 5) {
  Write-Host "Rollback"
  Set-Weights -blue 100 -green 0
  exit 1
}

Write-Host "Promote green"
Set-Weights -blue $BlueWeightAfterFinal -green $FinalWeight

Write-Host "Stop blue"
docker compose stop transaction-validator-blue | Out-Null
