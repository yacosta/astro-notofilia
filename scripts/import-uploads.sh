#!/usr/bin/env bash
# Copy the image/asset library (uploads/) from the original static-site repo
# into public/uploads/ for this Astro build.
#
# Usage: bash scripts/import-uploads.sh /path/to/notofilia
set -euo pipefail

SRC="${1:-}"
if [ -z "$SRC" ]; then
  echo "Usage: bash scripts/import-uploads.sh /path/to/notofilia" >&2
  exit 1
fi
if [ ! -d "$SRC/uploads" ]; then
  echo "Error: '$SRC/uploads' not found. Point at your notofilia repo checkout." >&2
  exit 1
fi

DST="$(cd "$(dirname "$0")/.." && pwd)/public/uploads"
mkdir -p "$DST"
cp -R "$SRC/uploads/." "$DST/"
echo "Imported $(find "$DST" -type f | wc -l) files into public/uploads/"
