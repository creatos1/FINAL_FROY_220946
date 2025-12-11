$ok = 0; $fail = 0
for ($i=0; $i -lt 20; $i++) {
  try {
    $res = Invoke-RestMethod -Method Post -Uri http://localhost:8080/validate -Body (@{ transactionId = [guid]::NewGuid().ToString(); amount = 10; currency = 'MXN' } | ConvertTo-Json) -ContentType 'application/json'
    if ($res.ok) { $ok++ } else { $fail++ }
  } catch { $fail++ }
}
Write-Host "OK=$ok FAIL=$fail"

