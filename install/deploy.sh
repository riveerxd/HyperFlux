#!/bin/bash

# Exit on error
set -e

# Configuration
APP_DIR="/opt/file-sharing"
SERVICE_NAME="file-sharing"
SYSTEM_USER="fileshare"
UPLOAD_DIR="/var/lib/file-sharing/uploads"
NODE_VERSION="20"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

echo -e "${GREEN}Starting deployment...${NC}"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

# Install MySQL if not present
if ! command -v mysql &> /dev/null; then
    echo "Installing MySQL..."
    apt-get update
    apt-get install -y mysql-server
    systemctl enable mysql
    systemctl start mysql
fi

# Create system user if not exists
if ! id "$SYSTEM_USER" &>/dev/null; then
    useradd -r -s /bin/false $SYSTEM_USER
fi

# Create necessary directories
mkdir -p $APP_DIR
mkdir -p $UPLOAD_DIR

# Set permissions
chown -R $SYSTEM_USER:$SYSTEM_USER $APP_DIR
chown -R $SYSTEM_USER:$SYSTEM_USER $UPLOAD_DIR
chmod 755 $UPLOAD_DIR

# Copy application files
echo "Copying application files..."
cp -r ./* $APP_DIR/

# Install dependencies
echo "Installing dependencies..."
cd $APP_DIR
npm install
npm run build

# Setup environment file if not exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Creating .env file..."
    cat > $APP_DIR/.env << EOL
DATABASE_URL="mysql://file_user:your_secure_password@localhost:3306/file_share"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="${UPLOAD_DIR}"
EOL
fi

# Setup database
echo "Setting up database..."
mysql -e "CREATE DATABASE IF NOT EXISTS file_share;"
mysql -e "CREATE USER IF NOT EXISTS 'file_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
mysql -e "GRANT ALL PRIVILEGES ON file_share.* TO 'file_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Install and enable systemd service
echo "Setting up systemd service..."
cp file-sharing.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "The application should now be running at http://localhost:3000" 