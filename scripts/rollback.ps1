Write-Host "Rollback to blue"
$cmd = "export NGINX_BLUE_WEIGHT=100 NGINX_GREEN_WEIGHT=1; envsubst < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf && nginx -s reload"
docker exec reverse-proxy sh -c $cmd | Out-Null
docker compose stop transaction-validator-green | Out-Null
