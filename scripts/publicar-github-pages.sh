#!/usr/bin/env bash
# Gera a versão web do SOMA para o GitHub Pages do fork e envia para a branch gh-pages.
# Endereço: https://akathigas.github.io/projeto-soma/
# Uso: bash scripts/publicar-github-pages.sh
set -euo pipefail

BASE=/projeto-soma
SAIDA=dist-pages
RAIZ=$(git rev-parse --show-toplevel)
cd "$RAIZ"

rm -rf "$SAIDA"
SOMA_BASE_URL=$BASE npx expo export --platform web --output-dir "$SAIDA"

# Links fixos do +html.tsx e do manifest passam a apontar para o subcaminho.
find "$SAIDA" -name '*.html' -print0 | xargs -0 sed -i \
  -e "s#href=\"/manifest.json\"#href=\"$BASE/manifest.json\"#g" \
  -e "s#href=\"/apple-touch-icon.png\"#href=\"$BASE/apple-touch-icon.png\"#g"
sed -i \
  -e "s#\"start_url\": \"/\"#\"start_url\": \"$BASE/\"#" \
  -e "s#\"scope\": \"/\"#\"scope\": \"$BASE/\"#" \
  -e "s#\"src\": \"/icon-#\"src\": \"$BASE/icon-#g" \
  "$SAIDA/manifest.json"

# Sem Jekyll, para o GitHub Pages servir a pasta _expo.
touch "$SAIDA/.nojekyll"
# Endereço desconhecido mostra a página "não encontrada" do app.
cp "$SAIDA/+not-found.html" "$SAIDA/404.html"

# Envia o conteúdo para a branch gh-pages (histórico próprio, sem o código-fonte).
TMP=$(mktemp -d)
git worktree add --detach "$TMP" >/dev/null
(
  cd "$TMP"
  if git ls-remote --exit-code origin gh-pages >/dev/null 2>&1; then
    git fetch -q origin gh-pages:refs/remotes/origin/gh-pages && git checkout -q -B gh-pages origin/gh-pages
  else
    git checkout -q --orphan gh-pages
  fi
  git rm -rq --cached . >/dev/null 2>&1 || true
  find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  cp -r "$RAIZ/$SAIDA/." .
  git add -A
  git commit -qm "Publica versão web ($(git -C "$RAIZ" rev-parse --short HEAD))" || echo "Nada mudou."
  git push -q origin gh-pages
)
git worktree remove --force "$TMP"
echo "Publicado em https://akathigas.github.io$BASE/"
