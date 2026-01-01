# File Support Setup for Better Chatbot

This document explains how to set up and use file support in the Better Chatbot Docker deployment.

## Overview

The Better Chatbot now includes file upload and storage support through Docker volumes. This allows users to upload documents, images, and other files that can be processed by the chatbot.

## Docker Configuration Updates

### 1. Docker Compose Changes

The `docker-compose.yml` has been updated with:

```yaml
services:
  better-chatbot:
    environment:
      - UPLOAD_STORAGE_PATH=/app/uploads
      - MAX_FILE_SIZE=104857600  # 100MB in bytes
    volumes:
      - uploads_data:/app/uploads

volumes:
  uploads_data:
```

### 2. Dockerfile Changes

The `docker/Dockerfile` now includes:

```dockerfile
# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nextjs /app/uploads
```

### 3. Environment Variables

Added to `.env.example`:

```bash
# === File Upload Configuration ===
# Maximum file size for uploads in bytes (default: 100MB)
MAX_FILE_SIZE=104857600

# Storage path for uploaded files (default: ./uploads)
UPLOAD_STORAGE_PATH=./uploads

# Allowed file types (comma-separated, default: common document/image types)
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.jpg,.png,.gif,.md,.csv,.json,.yaml,.yml

# Temporary storage path for file processing (default: /tmp)
TEMP_STORAGE_PATH=/tmp
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file to add your configuration
nano .env
```

### 2. Build and Start with Docker

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f better-chatbot

# Check status
docker-compose ps
```

### 3. Verify File Storage

```bash
# Check if uploads volume is created
docker volume ls | grep uploads

# Check volume details
docker volume inspect better-chatbot_uploads_data
```

## File Storage Structure

Files will be stored in the following structure:

```
/app/uploads/
├── user_{user_id}/
│   ├── {timestamp}_{filename}.{ext}
│   └── ...
└── temp/
    └── temporary_processing_files
```

## Security Considerations

### 1. File Size Limits
- Default: 100MB (104857600 bytes)
- Adjust `MAX_FILE_SIZE` in `.env` as needed

### 2. File Type Restrictions
- Only allowed file types can be uploaded
- Configure `ALLOWED_FILE_TYPES` in `.env`

### 3. File Scanning
- Consider implementing virus scanning for uploaded files
- Use tools like ClamAV or commercial solutions

### 4. Access Control
- Files are stored per user
- Implement proper authentication and authorization

## Troubleshooting

### 1. Permission Issues

If files can't be written:

```bash
# Fix permissions on uploads directory
docker-compose exec better-chatbot chown -R nextjs:nextjs /app/uploads

# Or recreate the volume
docker-compose down
docker volume rm better-chatbot_uploads_data
docker-compose up -d
```

### 2. Storage Space

Check available disk space:

```bash
# Check Docker disk usage
docker system df

# Clean up unused volumes
docker volume prune
```

### 3. File Upload Errors

Check logs for specific errors:

```bash
docker-compose logs -f better-chatbot | grep -i upload
```

## Development Notes

### Local Development

For local development without Docker:

1. Create local uploads directory:
   ```bash
   mkdir -p ./uploads
   ```

2. Set environment variables:
   ```bash
   export UPLOAD_STORAGE_PATH=./uploads
   export MAX_FILE_SIZE=104857600
   ```

### Testing File Uploads

Use curl to test file uploads:

```bash
# Test file upload
curl -X POST -F "file=@test.pdf" http://localhost:3000/api/upload
```

## Future Enhancements

The following features could be added:

1. **Cloud Storage Integration**
   - AWS S3 support
   - Google Cloud Storage
   - Azure Blob Storage

2. **File Processing**
   - OCR for documents
   - Image analysis
   - Text extraction

3. **File Management UI**
   - Upload interface
   - File browser
   - Delete functionality

4. **Advanced Security**
   - Virus scanning
   - File type validation
   - Size limits per user

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f better-chatbot`
2. Verify environment variables
3. Check volume permissions
4. Review the troubleshooting section above