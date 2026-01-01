# Coolify Deployment Guide for Better Chatbot

This guide explains how to deploy the Better Chatbot to Coolify with full file support.

## Prerequisites

1. **Coolify Instance**: Access to a Coolify installation (self-hosted or cloud)
2. **GitHub Repository**: Your better-chatbot repository must be connected to Coolify
3. **Domain**: A domain pointing to your Coolify instance

## Quick Deployment Steps

### 1. Repository Setup

Ensure your repository has the following files:
- `docker-compose.yml` (with file storage volumes)
- `docker/Dockerfile` (with uploads directory setup)
- `.coolify.yaml` (Coolify configuration)
- `.env.docker` (Docker environment variables)

### 2. Coolify Configuration

The `.coolify.yaml` file is already configured:

```yaml
version: 1
projectName: better-chatbot
type: docker-compose
composefile: docker-compose.yml
proxy: caddy
domain: chat.nexus-agency.net
environment:
  - NODE_ENV=production
  - NO_HTTPS=1
  - PORT=3000
  - POSTGRES_HOST=postgres
  - POSTGRES_PORT=5432
  - POSTGRES_DB=better_chatbot
  - POSTGRES_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/better_chatbot
  - UPLOAD_STORAGE_PATH=/app/uploads
  - MAX_FILE_SIZE=104857600
  - ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.jpg,.png,.gif,.md,.csv,.json,.yaml,.yml
  - BETTER_AUTH_URL=https://chat.nexus-agency.net
envFiles:
  - ./.env.docker
healthCheck:
  path: /api/health
  port: 3000
volumes:
  - uploads_data:/app/uploads
  - postgres_data:/var/lib/postgresql/data
```

### 3. Environment Variables Setup

In Coolify, go to your project → Environment Variables and add:

#### Required Variables:
```
BETTER_AUTH_SECRET=your-generated-secret-key
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
```

#### Optional Variables (API Keys):
```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
EXA_API_KEY=your-exa-key
```

#### OAuth Providers (Optional):
```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### 4. Deployment Process

#### Method 1: Automatic via Git
1. Connect your GitHub repository to Coolify
2. Enable "Auto Deploy" or trigger manual deployment
3. Coolify will automatically:
   - Build the Docker image
   - Create the uploads volume
   - Start the database service
   - Deploy the application

#### Method 2: Manual via Docker Compose
1. In Coolify, create a new "Docker Compose" project
2. Upload your `docker-compose.yml` file
3. Configure environment variables
4. Deploy

### 5. Post-Deployment Verification

#### Check Services:
```bash
# View logs
docker-compose logs -f better-chatbot

# Check database
docker-compose exec postgres psql -U postgres -d better_chatbot

# Verify uploads volume
docker volume ls | grep uploads
```

#### Test Health Check:
```bash
curl https://chat.nexus-agency.net/api/health
```

#### Test File Upload:
```bash
# Create a test file
echo "test" > test.txt

# Upload via API (once the app is running)
curl -X POST -F "file=@test.txt" https://chat.nexus-agency.net/api/upload
```

## File Storage Configuration

### Volume Management
- **Uploads Volume**: `uploads_data` → `/app/uploads`
- **Database Volume**: `postgres_data` → `/var/lib/postgresql/data`

### Storage Limits
- Default file size: 100MB (configurable via `MAX_FILE_SIZE`)
- Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, MD, CSV, JSON, YAML

### Backup Strategy
Coolify automatically backs up volumes. For additional safety:

1. **Manual Backup**:
   ```bash
   docker run --rm -v uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz /data
   ```

2. **Automated Backups**: Configure in Coolify dashboard

## Troubleshooting

### 1. Deployment Fails
- Check Coolify logs for build errors
- Verify Dockerfile syntax
- Ensure all required environment variables are set

### 2. Database Connection Issues
- Verify `POSTGRES_URL` format
- Check database service is running
- Ensure credentials match in environment variables

### 3. File Upload Errors
- Verify uploads volume exists: `docker volume ls`
- Check permissions: `docker-compose exec better-chatbot ls -la /app/uploads`
- Ensure `MAX_FILE_SIZE` is appropriate for your needs

### 4. Domain/SSL Issues
- Verify domain points to Coolify
- Check Caddy proxy configuration
- Ensure `BETTER_AUTH_URL` matches your domain

### 5. Permission Issues
```bash
# Fix uploads directory permissions
docker-compose exec better-chatbot chown -R nextjs:nextjs /app/uploads
```

## Scaling Considerations

### Horizontal Scaling
- Coolify supports multiple instances
- Use shared storage for uploads if scaling horizontally
- Consider external database for production

### Resource Limits
- Set CPU/Memory limits in Coolify dashboard
- Monitor resource usage via Coolify metrics

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **File Validation**: Implement file type and size validation
3. **Access Control**: Use proper authentication for file access
4. **Regular Updates**: Keep Coolify and containers updated
5. **SSL/TLS**: Ensure HTTPS is enabled

## Monitoring & Logs

### Coolify Dashboard
- Real-time logs
- Resource usage metrics
- Deployment history
- Health status

### Application Logs
```bash
# View all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f better-chatbot
docker-compose logs -f postgres
```

## Cost Optimization

### Storage Management
- Regular cleanup of old files
- Implement file retention policies
- Use compression for large files

### Resource Allocation
- Right-size containers based on usage
- Use auto-scaling if available
- Monitor and optimize database queries

## Migration from Local Docker

If migrating from local Docker to Coolify:

1. **Backup existing data**:
   ```bash
   docker run --rm -v uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz /data
   docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /data
   ```

2. **Transfer to Coolify**:
   - Upload backup files to Coolify
   - Restore volumes via Coolify volume management
   - Update environment variables

3. **Test thoroughly** before switching DNS

## Support

For issues:
1. Check Coolify documentation: https://coolify.io/docs
2. Review application logs in Coolify dashboard
3. Verify environment variables are correctly set
4. Check volume permissions and storage space

## Next Steps

After successful deployment:
1. Configure your domain DNS
2. Set up SSL certificates (automatic via Coolify)
3. Configure API keys for AI providers
4. Set up OAuth providers if needed
5. Monitor initial usage and scale as needed