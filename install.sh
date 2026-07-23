#!/bin/sh
# oh-my-devin inline installer.
#
# Installs the omd CLI user-locally, provisioning a Node runtime when none at
# the supported floor is present. Fetch and run in one line:
#
#   curl -fsSL https://raw.githubusercontent.com/adrianmjim/oh-my-devin/main/install.sh | sh
#
# It installs the CLI only. Run `omd setup` yourself in the project where you
# want the in-session layer.

set -eu

PACKAGE="oh-my-devin"
MIN_MAJOR=22
MIN_MINOR=14

OMD_HOME="${OMD_HOME:-${XDG_DATA_HOME:-${HOME}/.local/share}/oh-my-devin}"
NODE_MIRROR="${OMD_NODE_MIRROR:-https://nodejs.org/dist}"
NODE_VERSION="${OMD_NODE_VERSION:-v22.14.0}"

npm_cmd=""

info() {
  echo "omd install: $1"
}

fail() {
  echo "omd install: $1" >&2
  exit 1
}

download() {
  # download <url> <destination>
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$1" -o "$2"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$2" "$1"
  else
    fail "need curl or wget to download $1"
  fi
}

compute_sha256() {
  # compute_sha256 <file> -> prints the hex digest
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{ print $1 }'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{ print $1 }'
  else
    return 1
  fi
}

node_meets_floor() {
  # node_meets_floor <x.y.z>
  version="$1"
  major=$(printf '%s' "$version" | cut -d. -f1)
  minor=$(printf '%s' "$version" | cut -d. -f2)
  case "$major" in '' | *[!0-9]*) return 1 ;; esac
  case "$minor" in '' | *[!0-9]*) return 1 ;; esac
  if [ "$major" -gt "$MIN_MAJOR" ]; then
    return 0
  fi
  if [ "$major" -eq "$MIN_MAJOR" ] && [ "$minor" -ge "$MIN_MINOR" ]; then
    return 0
  fi
  return 1
}

detect_platform() {
  os=$(uname -s)
  arch=$(uname -m)
  case "$os" in
    Linux) plat_os="linux" ;;
    Darwin) plat_os="darwin" ;;
    *) fail "unsupported operating system: ${os} (omd supports Linux and macOS)" ;;
  esac
  case "$arch" in
    x86_64 | amd64) plat_arch="x64" ;;
    arm64 | aarch64) plat_arch="arm64" ;;
    *) fail "unsupported architecture: ${arch} (omd supports x64 and arm64)" ;;
  esac
}

provision_node() {
  info "provisioning a user-local Node ${NODE_VERSION} under ${OMD_HOME}"
  tarball="node-${NODE_VERSION}-${plat_os}-${plat_arch}.tar.gz"
  url="${NODE_MIRROR}/${NODE_VERSION}/${tarball}"
  sums_url="${NODE_MIRROR}/${NODE_VERSION}/SHASUMS256.txt"
  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT
  download "$url" "${tmp}/${tarball}" ||
    fail "failed to download Node runtime from ${url}"
  download "$sums_url" "${tmp}/SHASUMS256.txt" ||
    fail "failed to download Node checksums from ${sums_url}"
  expected=$(awk -v f="$tarball" '$2 == f { print $1 }' "${tmp}/SHASUMS256.txt")
  [ -n "$expected" ] || fail "no checksum listed for ${tarball}"
  actual=$(compute_sha256 "${tmp}/${tarball}") ||
    fail "no SHA-256 tool available (need sha256sum or shasum)"
  [ "$expected" = "$actual" ] ||
    fail "integrity check failed for ${tarball}"
  node_dir="${OMD_HOME}/node"
  rm -rf "$node_dir"
  mkdir -p "$node_dir"
  tar -xzf "${tmp}/${tarball}" -C "$node_dir" --strip-components=1 ||
    fail "failed to unpack the Node runtime"
  rm -rf "$tmp"
  trap - EXIT
  npm_cmd="${node_dir}/bin/npm"
  PATH="${node_dir}/bin:${PATH}"
  export PATH
  [ -x "$npm_cmd" ] || fail "the provisioned Node runtime is missing npm"
}

resolve_runtime() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    present=$(node --version 2>/dev/null | sed 's/^v//')
    if node_meets_floor "$present"; then
      npm_cmd="npm"
      info "using the Node runtime already on PATH (v${present})"
    fi
  fi
  if [ -z "$npm_cmd" ]; then
    provision_node
  fi
}

main() {
  if [ -n "${SUDO_USER:-}" ] || [ -n "${SUDO_UID:-}" ]; then
    fail "do not run under sudo — omd installs user-locally under ${OMD_HOME}"
  fi

  detect_platform
  resolve_runtime

  info "installing ${PACKAGE}"
  "$npm_cmd" install -g --prefix "$OMD_HOME" "$PACKAGE" >/dev/null 2>&1 ||
    fail "npm failed to install ${PACKAGE}"

  omd_bin="${OMD_HOME}/bin/omd"
  [ -x "$omd_bin" ] ||
    fail "install completed but omd was not found at ${omd_bin}"

  version=$("$omd_bin" --version 2>/dev/null) ||
    fail "the installed omd could not report its version"
  info "installed omd ${version}"

  case ":${PATH}:" in
    *":${OMD_HOME}/bin:"*) : ;;
    *) info "add omd to your PATH: export PATH=\"${OMD_HOME}/bin:\$PATH\"" ;;
  esac

  info "next step: run 'omd setup' in the project where you want the in-session layer."
}

main
