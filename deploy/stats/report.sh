#!/usr/bin/env bash
set -euo pipefail

log=/var/log/nginx/senzi.access.log
logs=()
[[ -f $log.1 ]] && logs+=("$log.1")
[[ -f $log ]] && logs+=("$log")
((${#logs[@]})) || exit 0

geoip=()
for db in /var/lib/GeoIP/GeoLite2-City.mmdb /var/lib/GeoIP/GeoLite2-ASN.mmdb; do
  [[ -f $db ]] && geoip+=("--geoip-database=$db")
done

exec goaccess "${logs[@]}" --config-file=/etc/goaccess/senzi.conf "${geoip[@]}"
