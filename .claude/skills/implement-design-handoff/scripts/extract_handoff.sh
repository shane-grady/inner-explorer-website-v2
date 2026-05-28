#!/usr/bin/env bash
# extract_handoff.sh — unpack a Claude Design handoff bundle and summarize it.
#
# WHY: the handoff link is a short-lived *signed* URL — plain curl/wget 404s.
# Download it with the WebFetch tool (it carries the session auth and saves the
# gzip body to a `webfetch-*.bin` file), then pass that path here. This script
# only does the deterministic part: extract + show you what's inside so you can
# read the README, the chats (intent!), and the target HTML.
#
# Usage:
#   extract_handoff.sh [BUNDLE] [DEST] [OPEN_FILE]
#     BUNDLE     path to the .bin/.tar.gz (default: newest webfetch-*.bin under
#                ~/.claude/projects/**/tool-results/)
#     DEST       extraction dir (default: /tmp/design-handoff)
#     OPEN_FILE  the file the user had open (e.g. "About Us.html") — highlighted
#
set -euo pipefail

BUNDLE="${1:-}"
DEST="${2:-/tmp/design-handoff}"
OPEN_FILE="${3:-}"

if [[ -z "$BUNDLE" ]]; then
  BUNDLE="$(find "$HOME/.claude/projects" -type f -name 'webfetch-*.bin' 2>/dev/null \
            | xargs -r ls -t 2>/dev/null | head -1 || true)"
  [[ -n "$BUNDLE" ]] && echo "→ Auto-selected newest WebFetch download: $BUNDLE"
fi

if [[ -z "$BUNDLE" || ! -f "$BUNDLE" ]]; then
  echo "ERROR: no bundle found. Download the handoff URL with WebFetch first, then pass"
  echo "       the saved webfetch-*.bin path as the first argument." >&2
  exit 1
fi

if ! gzip -t "$BUNDLE" 2>/dev/null; then
  echo "ERROR: '$BUNDLE' is not a gzip bundle. If WebFetch returned an error page" >&2
  echo "       (e.g. 404), the handoff link likely expired — ask the user for a fresh URL." >&2
  exit 1
fi

rm -rf "$DEST"; mkdir -p "$DEST"
tar -xzf "$BUNDLE" -C "$DEST"

ROOT="$(find "$DEST" -mindepth 1 -maxdepth 1 -type d | head -1)"
ROOT="${ROOT:-$DEST}"

echo
echo "=================================================================="
echo " HANDOFF EXTRACTED → $ROOT"
echo "=================================================================="

echo
echo "── File tree ─────────────────────────────────────────────────────"
( cd "$DEST" && find . -type f | sed 's|^\./||' | sort )

README="$(find "$ROOT" -maxdepth 2 -iname 'README*' | head -1 || true)"
if [[ -n "$README" ]]; then
  echo
  echo "── README ($README) ──────────────────────────────────────────────"
  cat "$README"
fi

CHATS_DIR="$(find "$ROOT" -maxdepth 2 -type d -iname 'chats' | head -1 || true)"
if [[ -n "$CHATS_DIR" ]]; then
  echo
  echo "── Chat transcripts (READ THESE — they hold the user's intent) ───"
  find "$CHATS_DIR" -type f | sort | sed 's|^|  |'
fi

echo
echo "── HTML prototypes (the designs) ─────────────────────────────────"
while IFS= read -r html; do
  rel="${html#"$ROOT"/}"
  if [[ -n "$OPEN_FILE" && "$(basename "$html")" == "$OPEN_FILE" ]]; then
    echo "  ★ $rel   <-- open_file: BUILD THIS ONE"
  else
    echo "    $rel"
  fi
done < <(find "$ROOT" -type f -iname '*.html' | sort)

echo
echo "── Design tokens / shared CSS (follow these imports) ─────────────"
find "$ROOT" -type f \( -iname '*.css' -o -iname '*color*' -o -iname '*type*' \) | sort | sed 's|^|    |'

echo
echo "── Bundled fonts & images (import the real ones; stand-ins to swap) ─"
find "$ROOT" -type f \( -iname '*.otf' -o -iname '*.ttf' -o -iname '*.woff*' \) | sort | sed 's|^|    font:  |'
find "$ROOT" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.svg' -o -iname '*.webp' \) \
  | grep -ivE '/(screenshots|uploads)/' | sort | sed 's|^|    img:   |'

echo
echo "Next: read the README, then the chats, then the ★ HTML in full and the CSS it imports."
