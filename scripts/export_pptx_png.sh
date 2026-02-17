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
mapfile -d '' files < <(find "$OUTDIR" -maxdepth 1 -type f -name '*.png' -print0)
if [ ${#files[@]} -eq 0 ]; then
  echo "Aucun PNG généré."
  exit 1
fi

# Extraire un numéro depuis le nom (suite de chiffres la plus à droite)
extract_num() {
  local f="$1"
  local base=$(basename "$f")
  local num=$(echo "$base" | grep -oE '([0-9]+)(\\.png)$' | sed 's/\\.png//' | tail -n1)
  echo "${num:-0}"
}

sorted=($(for f in "${files[@]}"; do printf "%s:%s\n" "$(extract_num "$f")" "$f"; done | sort -t: -k1,1n))
idx=1
for entry in "${sorted[@]}"; do
  file="${entry#*:}"
  num=$(printf "%02d" "$idx")
  mv -f "$file" "$OUTDIR/slide-${num}.png"
  idx=$((idx + 1))
done

count=$((idx - 1))
echo "$count fichiers renommés."

echo "Terminé. Les fichiers sont dans $OUTDIR/slide-XX.png"
