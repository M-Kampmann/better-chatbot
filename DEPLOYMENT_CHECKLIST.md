# 🚀 Coolify Deployment Checklist

Follow this checklist to deploy your better-chatbot to Coolify with file support.

## ✅ Pre-Deployment

- [ ] **Repository Setup**
  - [ ] All files committed to Git
  - [ ] Repository pushed to GitHub/GitLab
  - [ ] `.coolify.yaml` is present and configured
  - [ ] `docker-compose.yml` includes file storage volumes
  - [ ] `.env.docker` contains all required variables

- [ ] **Environment Variables** (Set in Coolify Dashboard)
  - [ ] `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
  - [ ] `POSTGRES_USER` - Default: `postgres`
  - [ ] `POSTGRES_PASSWORD` - Secure password
  - [ ] `POSTGRES_DB` - Default: `better_chatbot`

- [ ] **Optional Variables** (Add as needed)
  - [ ] `OPENAI_API_KEY` - For OpenAI models
  - [ ] `ANTHROPIC_API_KEY` - For Claude models
  - [ ] `GOOGLE_GENERATIVE_AI_API_KEY` - For Google models
  - [ ] `EXA_API_KEY` - For web search

## 🎯 Coolify Dashboard Steps

### 1. Create New Project
- [ ] Go to Coolify Dashboard
- [ ] Click "New Project"
- [ ] Select "Docker Compose" deployment type
- [ ] Connect your GitHub repository

### 2. Configure Deployment
- [ ] **Repository**: Select your better-chatbot repo
- [ ] **Branch**: `main` (or your preferred branch)
- [ ] **Configuration File**: `.coolify.yaml`
- [ ] **Root Directory**: `/` (default)

### 3. Environment Variables
- [ ] Add all required variables from above
- [ ] Add optional API keys if needed
- [ ] Save environment configuration

### 4. Deploy
- [ ] Click "Deploy" or "Trigger Deployment"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check deployment logs for errors

## 🔍 Post-Deployment Verification

### Health Check
```bash
# Replace with your actual domain
curl https://your-domain.com/api/health
```
- [ ] Returns 200 OK status

### File Upload Test
```bash
# Create test file
echo "test" > test.txt

# Upload via API (once app is running)
curl -X POST -F "file=@test.txt" https://your-domain.com/api/upload
```
- [ ] Upload succeeds
- [ ] File appears in uploads volume

### Database Connection
```bash
# Check if services are running
docker-compose ps
```
- [ ] All services show "Up"
- [ ] No error messages in logs

## 📊 Monitoring & Maintenance

### Coolify Dashboard
- [ ] Monitor resource usage
- [ ] Check deployment history
- [ ] Set up alerts if needed

### File Storage Management
- [ ] Monitor uploads volume size
- [ ] Implement file retention policies
- [ ] Set up regular backups

### Security
- [ ] Ensure HTTPS is enabled
- [ ] Verify file type restrictions
- [ ] Check user authentication

## 🆘 Troubleshooting

### Deployment Fails
- [ ] Check Coolify logs for specific errors
- [ ] Verify environment variables are set
- [ ] Ensure Dockerfile syntax is correct

### Database Issues
- [ ] Verify `POSTGRES_URL` format
- [ ] Check database service logs
- [ ] Ensure credentials match

### File Upload Errors
- [ ] Verify uploads volume exists
- [ ] Check file permissions
- [ ] Validate `MAX_FILE_SIZE` setting

### Domain/SSL Issues
- [ ] Verify domain points to Coolify
- [ ] Check Caddy proxy configuration
- [ ] Ensure `BETTER_AUTH_URL` matches domain

## 📝 Deployment Summary

Once deployed, you should have:
- ✅ Application running at your domain
- ✅ File upload functionality working
- ✅ Database connected and persistent
- ✅ SSL/HTTPS enabled
- ✅ Persistent storage for uploads

## 🎉 Success!

Your better-chatbot is now deployed with full file support!

**Next Steps:**
1. Test all features
2. Set up monitoring
3. Configure backups
4. Share with users!

**Need Help?**
- Check `COOLIFY_DEPLOYMENT.md` for detailed instructions
- Review `FILE_SUPPORT_SETUP.md` for file storage details
- Check Coolify documentation: https://coolify.io/docs