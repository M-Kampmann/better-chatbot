# Local File Storage Setup

This guide explains how to use local filesystem storage for file uploads instead of Vercel Blob or S3.

## Overview

Local file storage is the **default option for non-Vercel deployments** such as:
- Coolify
- Docker/Docker Compose
- Self-hosted deployments
- Development environments

## Configuration

### Environment Variables

Add these to your `.env` file or deployment configuration:

```ini
# Use local filesystem storage
FILE_STORAGE_TYPE=local

# Optional: Subdirectory prefix for organizing files
FILE_STORAGE_PREFIX=uploads

# Storage path (default: ./uploads)
UPLOAD_STORAGE_PATH=/app/uploads

# Maximum file size in bytes (default: 100MB)
MAX_FILE_SIZE=104857600
```

### Docker/Coolify Setup

For persistent storage in Docker deployments, ensure you have a volume mounted:

**docker-compose.yml:**
```yaml
services:
  app:
    volumes:
      - uploads_data:/app/uploads
    environment:
      - FILE_STORAGE_TYPE=local
      - UPLOAD_STORAGE_PATH=/app/uploads

volumes:
  uploads_data:
```

**Coolify (.coolify.yaml):**
```yaml
environment:
  - FILE_STORAGE_TYPE=local
  - UPLOAD_STORAGE_PATH=/app/uploads
volumes:
  - uploads_data:/app/uploads
```

## How It Works

1. **File Upload**: Files are uploaded via `/api/storage/upload` endpoint
2. **Storage**: Files are saved to the local filesystem at `UPLOAD_STORAGE_PATH`
3. **Access**: Files are served via `/api/storage/files/[...path]` route
4. **Naming**: Files are automatically renamed with UUID to prevent collisions

### File URL Structure

When a file is uploaded, it gets a public URL like:
```
https://your-domain.com/api/storage/files/uploads/abc123-filename.pdf
```

## Features

- ✅ **No External Dependencies**: Works without cloud storage services
- ✅ **Persistent Storage**: Files survive container restarts with Docker volumes
- ✅ **Public Access**: Files are publicly accessible via URL
- ✅ **Authentication**: Users must be logged in to upload
- ✅ **Collision Prevention**: UUID-based file naming
- ✅ **Type Safety**: Full TypeScript support

## Limitations

- ❌ **No CDN**: Files are served directly from your server (no global distribution)
- ❌ **No Presigned URLs**: Client-side direct uploads not supported (files go through server)
- ⚠️ **Scaling**: Not ideal for multi-server deployments without shared storage

## Migration from Vercel Blob

If you're migrating from Vercel Blob to local storage:

1. Update environment variables:
   ```ini
   # Remove or comment out
   # FILE_STORAGE_TYPE=vercel-blob
   # BLOB_READ_WRITE_TOKEN=xxx
   
   # Add
   FILE_STORAGE_TYPE=local
   UPLOAD_STORAGE_PATH=/app/uploads
   ```

2. Ensure Docker volume is configured (see above)

3. Redeploy your application

4. Existing Vercel Blob files will remain accessible at their original URLs, but new uploads will use local storage

## Troubleshooting

### Permission Errors

If you see permission errors, ensure the uploads directory is writable:

```bash
# In Dockerfile (already configured)
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
```

### Files Not Persisting

Ensure you have a Docker volume mounted:
- Check `docker-compose.yml` or `.coolify.yaml`
- Verify volume is listed in `volumes:` section
- Confirm volume is mounted to `/app/uploads`

### 404 Errors When Accessing Files

1. Check that `FILE_STORAGE_TYPE=local` is set
2. Verify the file exists in the uploads directory
3. Check application logs for errors

## Comparison with Other Storage Options

| Feature              | Local Storage | Vercel Blob | S3           |
| -------------------- | ------------- | ----------- | ------------ |
| Setup Complexity     | Minimal       | Minimal     | Moderate     |
| Cost                 | Free          | Pay-as-go   | Pay-as-go    |
| CDN                  | ❌ No         | ✅ Yes      | Optional     |
| Multi-server         | ⚠️ Limited    | ✅ Yes      | ✅ Yes       |
| Direct Upload        | ❌ No         | ✅ Yes      | ✅ Yes       |
| Best For             | Self-hosted   | Vercel      | AWS/Cloud    |

## Advanced: Shared Storage for Multi-Server

For multi-server deployments, consider:

1. **NFS/Network Storage**: Mount a shared network volume
2. **S3-Compatible Storage**: Use MinIO or similar
3. **Cloud Storage**: Switch to S3 or Vercel Blob

Example with MinIO (S3-compatible):
```ini
FILE_STORAGE_TYPE=s3
FILE_STORAGE_S3_BUCKET=uploads
FILE_STORAGE_S3_REGION=us-east-1
FILE_STORAGE_S3_ENDPOINT=http://minio:9000
FILE_STORAGE_S3_FORCE_PATH_STYLE=1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```
