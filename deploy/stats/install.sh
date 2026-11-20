#!/usr/bin/env bash
set -euo pipefail

[[ $EUID == 0 ]] || { echo "run as root" >&2; exit 1; }
cd "$(dirname "$0")"

htpasswd_file=/etc/nginx/senzi-stats.htpasswd

id goaccess >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin goaccess
install -d -o goaccess -g goaccess -m 755 /var/www/senzi-stats
install -D -m 644 goaccess.conf /etc/goaccess/senzi.conf
install -m 755 report.sh /usr/local/bin/senzi-stats
install -m 755 geoip.sh /usr/local/bin/senzi-geoip
install -m 644 senzi-stats.service senzi-stats.timer senzi-geoip.service senzi-geoip.timer /etc/systemd/system/

if [[ ! -f $htpasswd_file ]]; then
  htpasswd -B -c "$htpasswd_file" "${STATS_USER:-senzi}"
  chown root:www-data "$htpasswd_file"
  chmod 640 "$htpasswd_file"
fi

systemctl daemon-reload
systemctl enable --now senzi-stats.timer senzi-geoip.timer
systemctl start senzi-geoip.service
