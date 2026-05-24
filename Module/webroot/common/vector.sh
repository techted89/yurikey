#!/system/bin/sh
set -e

# Vector (formerly LSPosed) Detection Fix
# Addressing dex2oat hook traces and other detection vectors

echo "Clearing dex2oat base.odex traces..."
find /data/app -type f -name base.odex -delete

# Additional cleanup for known Vector/LSPosed detection vectors
echo "Clearing dalvik-cache artifacts..."
rm -rf /data/dalvik-cache/*

echo "Resetting security contexts..."
restorecon -R /data/adb/lspd 2>/dev/null

echo "Vector optimization and detection fix complete."
