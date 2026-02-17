#!/usr/bin/env bash
# Convertit le PPTX en PNG dans static/slides/ (optionnel)
# Prérequis : LibreOffice (`soffice`) installé

set -euo pipefail

PPTX="${1:-Pharmacometrie Pratique.pptx}"
OUTDIR="static/slides"

if ! command -v soffice >/dev/null 2>&1; then
  echo "Erreur: soffice (LibreOffice) non trouvé. Installez-le pour exporter les slides." >&2
  exit 1
fi

mkdir -p "$OUTDIR"
echo "Export de \"$PPTX\" vers $OUTDIR ..."
soffice --headless --convert-to png --outdir "$OUTDIR" "$PPTX"

echo "Renommage en slide-XX.png ..."
idx=1
find "$OUTDIR" -maxdepth 1 -type f -name '*.png' -print0 | sort -z | while IFS= read -r -d '' file; do
  num=$(printf "%02d" "$idx")
  mv -f "$file" "$OUTDIR/slide-${num}.png"
  idx=$((idx + 1))
done

echo "Terminé. Les fichiers sont dans $OUTDIR/slide-XX.png"
