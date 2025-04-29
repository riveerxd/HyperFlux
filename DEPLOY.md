# Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)
- Node.js 20.x or later (for local development only)

## Initial Setup

1. Clone the repository:
git clone <repository-url>
cd <repository-name>

2. Copy the example env file:
cp .env.example .env.local

## Storage Configuration

You have two options for file storage:

### Option 1: Docker Volume (Default)
If you don't set `HOST_UPLOAD_PATH` in your `.env.local`, the app will use a Docker volume for storage.
- Pros: Simple setup, managed by Docker
- Cons: May be harder to backup or manage externally

### Option 2: Custom Storage Location
To use a custom storage location (e.g., RAID array, NAS, etc.):

1. Create the upload directory:

sudo mkdir -p /your/custom/path
sudo chown -R 1000:1000 /your/custom/path # 1000 is typically the node user in container
sudo chmod 755 /your/custom/path

2. Set in your `.env.local`:
HOST_UPLOAD_PATH=/your/custom/path

## Environment Configuration

Edit `.env.local` with your settings:

Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=file_share
MYSQL_USER=file_user
MYSQL_PASSWORD=your_secure_user_password
DATABASE_URL="mysql://file_user:your_secure_user_password@db:3306/file_share"
Next Auth
NEXTAUTH_SECRET="your-very-secure-secret"
NEXTAUTH_URL="https://your-domain.com" # Or http://localhost:3000 for local testing
Upload Directory
UPLOAD_DIR="/app/uploads" # Don't change this
HOST_UPLOAD_PATH=/your/custom/path # Optional: Comment out to use Docker volume

## Deployment Steps

1. Build the containers:

docker-compose build
docker-compose up -d
3. Initialize the database (first time only):
docker-compose exec app npx prisma migrate deploy
4. Create the first admin user:
docker-compose exec app npx prisma studio
## SSL/HTTPS Setup

If you're deploying to production, you should set up HTTPS. We recommend using a reverse proxy like Nginx with Let's Encrypt.

Example Nginx configuration:
nginx
server {
listen 80;
server_name your-domain.com;
return 301 https://$server_name$request_uri;
}
server {
listen 443 ssl;
server_name your-domain.com;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
location / {
proxy_pass http://localhost:3000;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
}
}

## Maintenance

### Monitoring

1. View logs:
docker-compose logs -f
2. Check container status:
docker-compose ps

3. Monitor disk space:

### Backups

1. Database backup:
docker-compose exec db mariadb-dump -u root -p file_share > backup_$(date +%Y%m%d).sql
rsync -av /your/custom/path /backup/location

### Updates

1. Pull latest changes:
git pull origin main
2. Rebuild and restart:
docker-compose down
docker-compose build
docker-compose up -d
## Troubleshooting

### Permission Issues

If you encounter permission issues with the uploads directory:

1. Check the user ID in the container:
docker-compose exec app id
docker-compose ps db
2. Check database logs:
docker-compose logs db
### File Upload Issues

1. Check upload directory permissions:
ls -la /your/custom/path
2. Verify storage space:
df -h /your/custom/path

## Security Considerations

1. Always use strong passwords in `.env.local`
2. Keep the system and Docker updated
3. Use HTTPS in production
4. Regularly backup your data
5. Monitor system logs for suspicious activity
6. Consider implementing rate limiting
7. Set up proper firewall rules

## Support

For issues and support:
1. Check the troubleshooting section above
2. Review the application logs
3. Open an issue on the project repository
4. Contact the system administrator

## License

[Your License Information Here]