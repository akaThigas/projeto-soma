#!/usr/bin/env bash
# Gera a versão web do SOMA e publica no GitHub Pages.
#
# Padrão (fork): https://akathigas.github.io/projeto-soma/
#   bash scripts/publicar-github-pages.sh
#
# Endereço próprio da organização: https://projeto-soma.github.io/
#   SOMA_BASE_URL= \
#   SOMA_PAGES_REMOTO=https://github.com/projeto-soma/projeto-soma.github.io.git \
#   SOMA_PAGES_BRANCH=main \
#   SOMA_PAGES_URL=https://projeto-soma.github.io \
#   bash scripts/publicar-github-pages.sh
set -euo pipefail

BASE=${SOMA_BASE_URL-/projeto-soma}        # vazio = site na raiz do domínio
REMOTO=${SOMA_PAGES_REMOTO:-origin}
BRANCH=${SOMA_PAGES_BRANCH:-gh-pages}
URL_FINAL=${SOMA_PAGES_URL:-https://akathigas.github.io}
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
  if git ls-remote --exit-code "$REMOTO" "$BRANCH" >/dev/null 2>&1; then
    git fetch -q "$REMOTO" "$BRANCH:refs/remotes/pages/$BRANCH"
    git checkout -q -B pages-publicar "pages/$BRANCH"
  else
    git checkout -q --orphan pages-publicar
  fi
  git rm -rq --cached . >/dev/null 2>&1 || true
  find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  cp -r "$RAIZ/$SAIDA/." .
  git add -A
  git commit -qm "Publica versão web ($(git -C "$RAIZ" rev-parse --short HEAD))" || echo "Nada mudou."
  git push -q "$REMOTO" "pages-publicar:$BRANCH"
)
git worktree remove --force "$TMP"
git branch -D pages-publicar >/dev/null 2>&1 || true
echo "Publicado em $URL_FINAL$BASE/"
