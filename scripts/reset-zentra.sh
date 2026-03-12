#!/bin/bash
# ============================================================
# Zentra Platform — Full Data Reset
# Clears all mock data, transactions, and user sessions
# Keeps: INTEREST-RATES.dat (config, not mock data)
#        docker containers (no rebuild needed)
#        nginx + SSL config
# Run on EC2: bash ~/zentra-platform/scripts/reset-zentra.sh
# ============================================================

set -e
PLATFORM_DIR=~/zentra-platform
DATA_INPUT=$PLATFORM_DIR/data/input
DATA_OUTPUT=$PLATFORM_DIR/data/output
DB_PATH=$DATA_INPUT/../zentra_portal.db

echo ""
echo "=============================================="
echo "  ZENTRA PLATFORM — DATA RESET"
echo "  $(date)"
echo "=============================================="
echo ""
echo "⚠️  This will permanently delete:"
echo "    • All accounts (ACCOUNTS-MASTER.dat)"
echo "    • All transactions (DAILY-TRANSACTIONS.dat)"
echo "    • All batch output files"
echo "    • All portal users and sessions (SQLite)"
echo ""
read -p "Type RESET to confirm: " CONFIRM

if [ "$CONFIRM" != "RESET" ]; then
    echo "Aborted. No changes made."
    exit 1
fi

echo ""
echo "→ Stopping containers..."
cd $PLATFORM_DIR
docker compose down

echo "→ Clearing ACCOUNTS-MASTER.dat..."
> $DATA_INPUT/ACCOUNTS-MASTER.dat

echo "→ Clearing DAILY-TRANSACTIONS.dat..."
> $DATA_INPUT/DAILY-TRANSACTIONS.dat

echo "→ Keeping INTEREST-RATES.dat (rate config, not mock data)..."
echo "   Contents:"
cat $DATA_INPUT/INTEREST-RATES.dat | sed 's/^/   /'

echo "→ Clearing batch output files..."
if [ -d "$DATA_OUTPUT" ]; then
    rm -f $DATA_OUTPUT/*.dat
    echo "   Cleared data/output/"
fi

echo "→ Clearing SQLite portal database..."
if [ -f "$DB_PATH" ]; then
    rm -f $DB_PATH
    echo "   Deleted zentra_portal.db"
else
    echo "   No DB found (already clean)"
fi

# Also check Docker volume path
DOCKER_DB=$(docker volume inspect zentra-platform_zentra-output 2>/dev/null | grep Mountpoint | awk -F'"' '{print $4}')
if [ -n "$DOCKER_DB" ]; then
    rm -f $DOCKER_DB/*.dat 2>/dev/null || true
    echo "   Cleared Docker volume output"
fi

echo ""
echo "→ Restarting containers..."
export FRONTEND_PORT=3000
docker compose up -d

echo ""
echo "→ Waiting for health check..."
sleep 8
curl -s http://localhost:8000/health | python3 -m json.tool

echo ""
echo "=============================================="
echo "  RESET COMPLETE ✓"
echo "  Platform is clean and ready for real users"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Register first real user at https://zentraplatform.com/portal"
echo "  2. Open a real account via the portal"
echo "  3. Run first batch: curl -X POST https://zentraplatform.com/api/batch/run"
echo ""
