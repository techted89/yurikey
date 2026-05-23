#!/system/bin/sh

# Define important paths and file names
HMA_DIR="/data/user/0/org.frknkrc44.hma_oss/files"
HMA_FILE="$HMA_DIR/config.json"
REMOTE_URL="https://raw.githubusercontent.com/YurikeyDev/yurikey/refs/heads/main/config.json"
ORG_PATH="$PATH"

log_message() {
    echo "$(date +%Y-%m-%d\ %H:%M:%S) [HMA_OSS] $1"
}

download() {
    PATH=/data/adb/magisk:/data/data/com.termux/files/usr/bin:$PATH
    if command -v curl >/dev/null 2>&1; then
        curl --connect-timeout 10 -Ls "$1"
    else
        busybox wget -T 10 --no-check-certificate -qO- "$1"
    fi
    PATH="$ORG_PATH"
}

if pm list packages org.frknkrc44.hma_oss | grep -q org.frknkrc44.hma_oss; then
  mkdir -p "$HMA_DIR"
  TMP_HMA_FILE="${HMA_FILE}.tmp"
  if ! download "$REMOTE_URL" > "$TMP_HMA_FILE"; then
    log_message "Error: HMA-oss configs download failed, please download and add it manually!"
    rm -f "$TMP_HMA_FILE"
    exit 1
  fi
  if [ ! -s "$TMP_HMA_FILE" ]; then
    log_message "Error: Downloaded config is empty"
    rm -f "$TMP_HMA_FILE"
    exit 1
  fi
  mv -f "$TMP_HMA_FILE" "$HMA_FILE"
elif pm list packages com.tsng.hidemyapplist | grep -q com.tsng.hidemyapplist; then
  log_message "HMA is deprecated and not supported, please use latest HMA-oss to get latest configs"
  exit 1
else
  log_message "Error: HMA-oss not found, please install latest HMA-oss"
  exit 1
fi

chmod 777 "$HMA_FILE"
chown u0_a0:u0_a0 "$HMA_FILE"
