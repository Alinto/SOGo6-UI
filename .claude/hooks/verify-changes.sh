#!/usr/bin/env bash
# Stop hook: before Claude ends its turn, check the files changed under src/ (vs HEAD, plus untracked):
#   1. TypeScript errors located in those files (the repo has pre-existing errors elsewhere, so we filter)
#   2. Jest tests related to those files
#   3. Missing translation keys used by those files
# On failure, exit 2 sends the report back to Claude, which has to fix it before stopping.
# If it is already retrying (stop_hook_active), we stop blocking and warn the user instead, to avoid loops.
set -u

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

input=$(cat)
retrying=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')

mapfile -t changed < <(
  { git diff --name-only HEAD -- src; git ls-files --others --exclude-standard -- src; } |
    sort -u | while read -r f; do [ -f "$f" ] && echo "$f"; done
)
[ ${#changed[@]} -eq 0 ] && exit 0

# Skip when the changes are identical to the last run that passed.
cache_dir=$(git rev-parse --git-path claude-verify)
mkdir -p "$cache_dir"
hash=$(
  {
    git diff HEAD -- src
    for f in "${changed[@]}"; do
      git ls-files --error-unmatch "$f" >/dev/null 2>&1 || { echo "$f"; cat "$f"; }
    done
  } | sha1sum | cut -d' ' -f1
)
if [ -f "$cache_dir/passed" ] && [ "$(cat "$cache_dir/passed")" = "$hash" ]; then
  exit 0
fi

code_files=()
for f in "${changed[@]}"; do
  case "$f" in *.ts | *.tsx | *.js | *.jsx) code_files+=("$f") ;; esac
done
[ ${#code_files[@]} -eq 0 ] && { echo "$hash" >"$cache_dir/passed"; exit 0; }

report=""

# 1. TypeScript, filtered on the changed files
tsc_out=$(npx --no-install tsc --noEmit -p . 2>&1)
patterns=$(printf '%s(\n' "${code_files[@]}")
tsc_errors=$(printf '%s\n' "$tsc_out" | grep -F -f <(printf '%s\n' "$patterns") || true)
if [ -n "$tsc_errors" ]; then
  report+=$'\n## TypeScript errors in changed files\n'"$tsc_errors"$'\n'
fi

# 2. Related Jest tests
if ! jest_out=$(npx --no-install jest --findRelatedTests --coverage=false --passWithNoTests --silent "${code_files[@]}" 2>&1); then
  report+=$'\n## Failing Jest tests (related to changed files)\n'"$(printf '%s\n' "$jest_out" | tail -n 60)"$'\n'
fi

# 3. Missing translation keys, per changed component
for f in "${code_files[@]}"; do
  case "$f" in *__tests__* | src/app/fakeApi/*) continue ;; esac
  if ! tr_out=$(node scripts/check-translation-keys.js --only-missing --quiet --file "$f" 2>&1); then
    report+=$'\n## Missing translation keys in '"$f"$' (add them to src/messages/en/*.json)\n'"$(printf '%s\n' "$tr_out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '•|→')"$'\n'
  fi
done

if [ -z "$report" ]; then
  echo "$hash" >"$cache_dir/passed"
  exit 0
fi

if [ "$retrying" = "true" ]; then
  msg="Checks still failing on changed files (type-check, related tests or translations). See .claude/hooks/verify-changes.sh."
  jq -n --arg m "$msg" '{systemMessage: $m}'
  exit 0
fi

{
  echo "Checks failed on the files you changed. Fix them before ending your turn:"
  printf '%s\n' "$report"
} >&2
exit 2
