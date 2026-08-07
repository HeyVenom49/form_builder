#!/bin/bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
fi

root_env="$(cd "$(dirname "$0")" && pwd)/.env"

for dir in apps/* packages/*; do
  [ -d "$dir" ] || continue
  target="$dir/.env"
  if [ -L "$target" ] || [ -e "$target" ]; then
    rm -f "$target"
  fi
  ln -s "$root_env" "$target"
done