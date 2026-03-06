#!/bin/bash
# Usage: bash scripts/run.sh src/cobol/core/PROGRAM.cbl
# Compiles and runs a COBOL program

if [ -z "$1" ]; then
  echo "Usage: bash scripts/run.sh <path-to-cobol-file>"
  exit 1
fi

FILE=$1
BASENAME=$(basename "$FILE" .cbl)
OUTPUT="data/output/$BASENAME"

echo "─────────────────────────────────────"
echo "  Compiling: $FILE"
echo "─────────────────────────────────────"

cobc -x -o "$OUTPUT" "$FILE"

if [ $? -eq 0 ]; then
  echo "✅ Compiled successfully → $OUTPUT"
  echo ""
  echo "─────────────────────────────────────"
  echo "  Output:"
  echo "─────────────────────────────────────"
  "$OUTPUT"
else
  echo "❌ Compilation failed. Check errors above."
fi
