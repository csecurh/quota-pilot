#!/bin/sh
# Local agent installer. No system Node/npm/Git. User/host must approve shell execution.
set -eu
# Require an explicitly requested local host. ChatGPT's onboarding must never call a bootstrap.
host=''
dry_run=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --host)
      shift
      host="${1:-}"
      ;;
    --dry-run)
      dry_run=1
      ;;
    *)
      echo 'Unsupported option' >&2; exit 2
      ;;
  esac
  shift
done
case "$host" in
  codex|claude) ;;
  *) echo 'Explicit --host codex or --host claude is required; ChatGPT onboarding is read-only' >&2; exit 2 ;;
esac
tag=v0.6.0-rc.2
case "$(uname -s):$(uname -m)" in
  Linux:x86_64) bundle=quota-pilot-linux-x64; digest=f89bbd4dfa90727105081fa72b9c1a610957e3ddb480190bd5e2f6a1ccbfc6b0;;
  Darwin:x86_64) bundle=quota-pilot-darwin-x64; digest=7b89486fd2e11d627a106db9dd0139442aa7013b78bb512ebac9063e72394bc9;;
  Darwin:arm64) bundle=quota-pilot-darwin-arm64; digest=18869fff83f173e49d8e32a7ff5b3a19ac6f255bebd2d6e8d5c2e2f258765019;;
  *) echo 'Unsupported OS or architecture' >&2; exit 2;;
esac
if [ "$dry_run" -eq 1 ]; then printf 'PLAN %s %s %s host=%s\n' "$tag" "$bundle" "$digest" "$host"; exit 0; fi
umask 077
root="$HOME/.quotapilot"
base="$root/agent-installs"
if [ -L "$root" ] || [ -L "$base" ]; then echo 'Unsafe destination' >&2; exit 2; fi
mkdir -p "$base"
chmod 700 "$root" "$base"
dest="$base/$tag-$bundle"
if [ -L "$dest" ]; then echo 'Unsafe destination' >&2; exit 2; fi
if [ -e "$dest" ]; then
  if [ -x "$dest/runtime/node" ] && [ -f "$dest/PORTABLE-BUILD.json" ]; then
    printf 'ALREADY_INSTALLED %s\n' "$dest"; exit 0
  fi
  echo 'Existing installation needs inspection' >&2; exit 2
fi
command -v curl >/dev/null || { echo 'curl is unavailable' >&2; exit 2; }
command -v tar >/dev/null || { echo 'tar is unavailable' >&2; exit 2; }
scratch="$(mktemp -d "$base/.bootstrap-XXXXXXXX")"
trap 'rm -rf "$scratch"' EXIT HUP INT TERM
asset="$scratch/$bundle.tar.gz"
url="https://github.com/csecurh/quota-pilot/releases/download/$tag/$bundle.tar.gz"
curl --proto '=https' --tlsv1.2 --fail --location --silent --show-error --max-time 180 --max-filesize 95000000 --output "$asset" "$url"
if command -v shasum >/dev/null; then actual="$(shasum -a 256 "$asset" | awk '{print $1}')"
elif command -v sha256sum >/dev/null; then actual="$(sha256sum "$asset" | awk '{print $1}')"
else echo 'No SHA-256 implementation' >&2; exit 2; fi
if [ "$actual" != "$digest" ]; then echo 'Digest mismatch' >&2; exit 1; fi
# Do not extract paths outside the expected top-level bundle.
tar -tzf "$asset" | while IFS= read -r entry; do
  case "$entry" in "$bundle"|"$bundle/"*) ;; *) echo 'Invalid archive path' >&2; exit 1;; esac
done
tar -xzf "$asset" -C "$scratch"
if [ ! -x "$scratch/$bundle/runtime/node" ] || [ ! -f "$scratch/$bundle/plugin.json" ]; then echo 'Incomplete bundle' >&2; exit 1; fi
if [ -n "$(find "$scratch/$bundle" -type l -print -quit)" ]; then echo 'Symlink in release' >&2; exit 1; fi
"$scratch/$bundle/runtime/node" --version >/dev/null
mv "$scratch/$bundle" "$dest"
printf 'INSTALLED %s\n' "$dest"
