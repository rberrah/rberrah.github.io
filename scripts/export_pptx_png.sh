#!/usr/bin/env bash
# Convertit le PPTX en PNG dans static/slides/ (optionnel)
# Prérequis : LibreOffice (`soffice`) installé

set -e

PPTX="${1:-Pharmacométrie Pratique.pptx}"
OUTDIR="static/slides"

if ! command -v soffice >/dev/null 2>&1; then
  echo "Erreur: soffice (LibreOffice) non trouvé. Installez-le pour exporter les slides." >&2
  exit 1
fi

mkdir -p "$OUTDIR"
echo "Export de $PPTX vers $OUTDIR ..."
soffice --headless --convert-to png --outdir "$OUTDIR" "$PPTX"
echo "Fait. Renommez éventuellement en slide-XX.png."
