#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): run ESLint --fix and Prettier on the file Claude just edited.
# Exit code 2 sends the remaining ESLint errors back to Claude so it fixes them right away.
set -u

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

file=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -z "$file" ] && exit 0

rel=${file#"$PWD/"}
case "$rel" in
  src/*.ts | src/*.tsx | src/*.js | src/*.jsx) ;;
  *) exit 0 ;;
esac
[ -f "$rel" ] || exit 0

eslint_out=$(npx --no-install eslint --fix "$rel" 2>&1)
eslint_rc=$?
npx --no-install prettier --write --log-level warn "$rel" >/dev/null 2>&1

if [ "$eslint_rc" -ne 0 ]; then
  {
    echo "ESLint errors remain in $rel after --fix. Fix them before moving on:"
    echo "$eslint_out"
  } >&2
  exit 2
fi

# Warnings (react/jsx-no-literals, unused vars, hooks deps...) do not block, but Claude gets them as context.
if printf '%s' "$eslint_out" | grep -q 'warning'; then
  jq -n --arg ctx "ESLint warnings in $rel (fix the ones your change introduced, e.g. hardcoded strings must go through next-intl):
$eslint_out" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
fi
exit 0
