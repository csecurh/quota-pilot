#!/bin/sh
# Local agent installer. No system Node/npm/Git. User/host must approve shell execution.
set -eu
case "${1:-}" in --dry-run) dry_run=1;; '') dry_run=0;; *) echo 'Unsupported option' >&2; exit 2;; esac
tag=v0.6.0-rc.1
case "$(uname -s):$(uname -m)" in
  Linux:x86_64) bundle=quota-pilot-linux-x64; digest=4282a51a1322157606b19dbd16ed59327eef7fcbc2045c675c1a41243658b500;;
  Darwin:x86_64) bundle=quota-pilot-darwin-x64; digest=fec19213de09c3e90b8d8c5884535f8eafaae42703c0cac34b12bd3886238063;;
  Darwin:arm64) bundle=quota-pilot-darwin-arm64; digest=f40a9cacf408fc2c954bfeec25620a24e5d83d27f2523dc30fd46490e0f24f7f;;
  *) echo 'Unsupported OS or architecture' >&2; exit 2;;
esac
if [ "$dry_run" -eq 1 ]; then printf 'PLAN %s %s %s\n' "$tag" "$bundle" "$digest"; exit 0; fi
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
