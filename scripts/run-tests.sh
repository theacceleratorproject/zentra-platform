#!/bin/bash
# ─────────────────────────────────────────────────────────
#  Zentra Bank — Test Suite Runner
#  Compiles and runs all test programs, reports pass/fail
# ─────────────────────────────────────────────────────────

PASS=0
FAIL=0
mkdir -p data/output

run_test() {
  FILE=$1
  NAME=$(basename "$FILE" .cbl)
  OUT="data/output/$NAME"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🧪  $NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cobc -x -I src/cobol/utils -o "$OUT" "$FILE" 2>&1
  if [ $? -ne 0 ]; then
    echo "  ❌ COMPILE ERROR — skipping"
    FAIL=$((FAIL+1))
    return
  fi

  "$OUT"
  if [ $? -eq 0 ]; then
    PASS=$((PASS+1))
  else
    echo "  ❌ TEST RUNTIME ERROR"
    FAIL=$((FAIL+1))
  fi
}

echo "============================================="
echo "  ZENTRA BANK — Test Suite"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================="

run_test "src/cobol/tests/TEST-COPYBOOKS.cbl"
run_test "src/cobol/tests/TEST-VALIDATION.cbl"
run_test "src/cobol/tests/TEST-PROCESSING.cbl"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST SUITE COMPLETE: $PASS passed  |  $FAIL failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL -eq 0 ]; then
  echo "  ✅ ALL TESTS PASSED"
  exit 0
else
  echo "  ❌ $FAIL TEST(S) FAILED"
  exit 1
fi
