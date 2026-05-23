#!/system/bin/sh
# Copy FixWidevineL1/* directory to /data/local/tmp
SCRDIR=$(cd "$(dirname "$0")" && pwd)
cp -r "$SCRDIR/FixWidevineL1/"* /data/local/tmp/

# Set correct permissions
chmod 777 /data/local/tmp/FixWidevineL1.sh
chmod 777 /data/local/tmp/attestation

# Set owner and group to root:root
chown root:root /data/local/tmp/FixWidevineL1.sh
chown root:root /data/local/tmp/attestation

# Execute the script
su -c sh /data/local/tmp/FixWidevineL1.sh
