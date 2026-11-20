#!/usr/bin/env bash
set -euo pipefail

repo=P3TERX/GeoLite.mmdb
dir=/var/lib/GeoIP

release=$(curl -fsSL "https://api.github.com/repos/$repo/releases/latest")
trap 'rm -f "$dir"/.*.part' EXIT

for name in GeoLite2-City.mmdb GeoLite2-ASN.mmdb; do
  asset=$(jq -c --arg name "$name" '.assets[] | select(.name == $name)' <<<"$release")
  digest=$(jq -r '.digest // ""' <<<"$asset")
  url=$(jq -r '.browser_download_url // ""' <<<"$asset")
  [[ $digest == sha256:* && -n $url ]] || { echo "$name: no asset or digest in the latest release" >&2; exit 1; }
  sum=${digest#sha256:}

  [[ -f $dir/$name ]] && [[ $(sha256sum "$dir/$name" | cut -d' ' -f1) == "$sum" ]] && continue

  part=$dir/.$name.part
  curl -fsSL -o "$part" "$url"
  echo "$sum  $part" | sha256sum -c --quiet
  chmod 644 "$part"
  mv -f "$part" "$dir/$name"
  echo "$name updated to $(jq -r .tag_name <<<"$release")"
done
