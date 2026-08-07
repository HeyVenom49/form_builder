#!/usr/bin/env sh

set -eu

ROOT="${1:-.}"

printf 'Cleaning AppleDouble files in: %s\n' "$ROOT"

count=$(find "$ROOT" -type f -name '._*' -print | wc -l | tr -d ' ')

if [ "$count" -eq 0 ]; then
  printf '✓ No ._* files found.\n'
  exit 0
fi

find "$ROOT" -type f -name '._*' -delete

printf '✓ Deleted %s ._* file(s).\n' "$count"