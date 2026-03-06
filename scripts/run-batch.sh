#!/bin/bash
# ─────────────────────────────────────────────────────────
#  Zentra Bank — Full Daily Batch Cycle
#  Compiles all programs and runs them in dependency order
# ─────────────────────────────────────────────────────────

PASS=0
FAIL=0
mkdir -p data/output

compile_and_stage() {
  FILE=$1
  NAME=$(basename "$FILE" .cbl)
  OUT="data/output/$NAME"
  cobc -x -I src/cobol/utils -o "$OUT" "$FILE" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "  ❌ COMPILE FAILED: $NAME"
    FAIL=$((FAIL+1))
    return 1
  fi
  return 0
}

run_step() {
  NAME=$1
  BIN="data/output/$NAME"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ▶  $NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  "$BIN"
  if [ $? -eq 0 ]; then
    PASS=$((PASS+1))
  else
    echo "  ❌ RUNTIME ERROR: $NAME"
    FAIL=$((FAIL+1))
  fi
}

echo "============================================="
echo "  ZENTRA BANK — Daily Batch Cycle"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================="
echo ""
echo "→ Compiling all programs..."

PROGRAMS=(
  "src/cobol/core/FEE-ENGINE.cbl"
  "src/cobol/core/TXN-VALIDATOR.cbl"
  "src/cobol/core/TXN-PROCESSOR.cbl"
  "src/cobol/core/INTEREST-CALC.cbl"
  "src/cobol/reports/EOD-REPORT.cbl"
)

ALL_COMPILED=1
for PROG in "${PROGRAMS[@]}"; do
  compile_and_stage "$PROG" || ALL_COMPILED=0
done

if [ $ALL_COMPILED -eq 0 ]; then
  echo "❌ Compilation errors — fix before running batch."
  exit 1
fi

echo "✅ All programs compiled."

run_step "FEE-ENGINE"
run_step "TXN-VALIDATOR"
run_step "TXN-PROCESSOR"
run_step "INTEREST-CALC"
run_step "EOD-REPORT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BATCH COMPLETE: $PASS passed  |  $FAIL failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Output files:"
ls -lh data/output/*.dat 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
