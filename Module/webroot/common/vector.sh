#!/system/bin/sh

# Vector (formerly LSPosed) Detection Fix
# Addressing dex2oat hook traces and other detection vectors

set -e

echo "Clearing dex2oat base.odex traces..."
if ! find /data/app -type f -name base.odex -delete; then
    echo "Error: Failed to delete base.odex files" >&2
    exit 1
fi

# Additional cleanup for known Vector/LSPosed detection vectors
echo "Clearing dalvik-cache artifacts..."
if ! rm -rf /data/dalvik-cache/*; then
    echo "Error: Failed to clear dalvik-cache" >&2
    exit 1
fi

echo "Resetting security contexts..."
if command -v restorecon >/dev/null 2>&1 && [ -d /data/adb/lspd ]; then
    if ! restorecon -R /data/adb/lspd 2>/dev/null; then
        echo "Warning: Failed to restore security contexts" >&2
    fi
fi

echo "Vector optimization and detection fix complete."
