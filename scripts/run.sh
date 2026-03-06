#!/bin/bash
# ─────────────────────────────────────────
#  Zentra Bank — Compile & Run a single COBOL program
#  Usage: bash scripts/run.sh src/cobol/core/PROGRAM.cbl
# ─────────────────────────────────────────

if [ -z "$1" ]; then
  echo "Usage: bash scripts/run.sh <path-to-cobol-file>"
  exit 1
fi

FILE=$1
BASENAME=$(basename "$FILE" .cbl)
OUTPUT="data/output/$BASENAME"

mkdir -p data/output

echo "─────────────────────────────────────"
echo "  Compiling: $FILE"
echo "─────────────────────────────────────"

# -I flag includes copybooks from src/cobol/utils/
cobc -x -I src/cobol/utils -o "$OUTPUT" "$FILE"

if [ $? -eq 0 ]; then
  echo "✅ Compiled → $OUTPUT"
  echo ""
  echo "─────────────────────────────────────"
  echo "  Output:"
  echo "─────────────────────────────────────"
  "$OUTPUT"
else
  echo "❌ Compilation failed."
fi
