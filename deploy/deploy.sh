#!/usr/bin/env bash
set -euo pipefail

: "${IMAGE:?IMAGE is required}"
cd "$(dirname "$0")"
CONTAINER=site
HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-60}

previous=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)

wait_healthy() {
  local deadline=$((SECONDS + HEALTH_TIMEOUT))
  while ((SECONDS < deadline)); do
    status=$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)
    [[ $status == healthy ]] && return 0
    sleep 2
  done
  return 1
}

docker pull "$IMAGE" || docker image inspect "$IMAGE" >/dev/null
if docker compose up -d --remove-orphans && wait_healthy; then
  echo "Deployed $IMAGE"
  docker image ls "${IMAGE%:*}" --format '{{.Repository}}:{{.Tag}}' |
    grep -vxF -e "$IMAGE" -e "${previous:-}" | xargs -r docker image rm >/dev/null 2>&1 || true
  docker image prune -f >/dev/null
  exit 0
fi

echo "Deploy failed for $IMAGE" >&2
docker logs --tail 50 "$CONTAINER" >&2 || true

if [[ -n $previous && $previous != "$IMAGE" ]]; then
  echo "Rolling back to $previous" >&2
  if ! IMAGE=$previous docker compose up -d --remove-orphans || ! wait_healthy; then
    echo "Rollback is unhealthy too" >&2
  fi
fi
exit 1
