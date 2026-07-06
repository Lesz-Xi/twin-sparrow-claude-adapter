#!/usr/bin/env bash
set -euo pipefail

# Stable Claude Desktop launcher for the third-party claude-skills MCP server.
# Claude Desktop runs MCP commands with a GUI-app environment, so keep the
# runtime boundary explicit instead of relying on an interactive shell PATH.

HOME_DIR="${HOME:-/Users/lesz}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADAPTER_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
UVX_BIN="${TWIN_CLAUDE_SKILLS_UVX:-${HOME_DIR}/.local/bin/uvx}"
UV_BIN_DIR="$(dirname "${UVX_BIN}")"
CONFIG_PATH="${TWIN_CLAUDE_SKILLS_CONFIG:-${ADAPTER_ROOT}/config/claude-skills-mcp.json}"

if [[ ! -x "${UVX_BIN}" ]]; then
  echo "[twin-sparrow] claude-skills MCP launcher could not find executable uvx at: ${UVX_BIN}" >&2
  echo "[twin-sparrow] Install uv or set TWIN_CLAUDE_SKILLS_UVX to the absolute uvx path." >&2
  exit 127
fi

if [[ ! -f "${CONFIG_PATH}" ]]; then
  echo "[twin-sparrow] claude-skills MCP launcher could not find config at: ${CONFIG_PATH}" >&2
  echo "[twin-sparrow] Set TWIN_CLAUDE_SKILLS_CONFIG to an absolute config path." >&2
  exit 66
fi

export PATH="${UV_BIN_DIR}:${HOME_DIR}/.local/bin:${HOME_DIR}/.cargo/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"
export PYTHONUNBUFFERED=1

# Keep Python stable for sentence-transformers/torch style dependencies. uv can
# use an already-installed interpreter or provision it if needed.
export UV_PYTHON="${UV_PYTHON:-3.12}"

has_explicit_config=0
for arg in "$@"; do
  if [[ "${arg}" == "--config" || "${arg}" == --config=* ]]; then
    has_explicit_config=1
  fi
done

if [[ "${has_explicit_config}" == "1" ]]; then
  if [[ "${TWIN_CLAUDE_SKILLS_VERBOSE:-0}" == "1" ]]; then
    exec "${UVX_BIN}" --from claude-skills-mcp claude-skills-mcp --verbose "$@"
  fi
  exec "${UVX_BIN}" --from claude-skills-mcp claude-skills-mcp "$@"
fi

if [[ "${TWIN_CLAUDE_SKILLS_VERBOSE:-0}" == "1" ]]; then
  exec "${UVX_BIN}" --from claude-skills-mcp claude-skills-mcp --config "${CONFIG_PATH}" --verbose "$@"
fi

exec "${UVX_BIN}" --from claude-skills-mcp claude-skills-mcp --config "${CONFIG_PATH}" "$@"
