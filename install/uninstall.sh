#!/bin/bash

# Exit on error
set -e

# Configuration
APP_DIR="/opt/file-sharing"
SERVICE_NAME="file-sharing"
SYSTEM_USER="fileshare"
UPLOAD_DIR="/var/lib/file-sharing/uploads"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

echo "Starting uninstallation..."

# Stop and disable service
systemctl stop $SERVICE_NAME || true
systemctl disable $SERVICE_NAME || true
rm -f /etc/systemd/system/file-sharing.service
systemctl daemon-reload

# Remove application files
rm -rf $APP_DIR
rm -rf $UPLOAD_DIR

# Remove system user
userdel -r $SYSTEM_USER || true

# Remove database
mysql -e "DROP DATABASE IF EXISTS file_share;"
mysql -e "DROP USER IF EXISTS 'file_user'@'localhost';"

echo "Uninstallation completed successfully!" 