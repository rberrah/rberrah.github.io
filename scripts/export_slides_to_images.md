# Export des slides en images (optionnel)

Ce site fonctionne sans images du PPTX. Si vous voulez illustrer avec les diapositives :

1. Ouvrez `Pharmacométrie Pratique.pptx` dans LibreOffice ou PowerPoint.
2. Exportez chaque slide en PNG (1920px largeur minimum).
3. Placez les fichiers dans `static/slides/slide-XX.png`.
4. Les routes afficheront automatiquement une illustration si le fichier existe, sinon un fallback SVG est utilisé.

> Ne pas exécuter à runtime ; c’est un enrichissement manuel. Les pages restent statiques et prérendues.
