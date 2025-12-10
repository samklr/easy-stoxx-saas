# Google Cloud Storage Setup Guide

This guide explains how to configure Google Cloud Storage (GCS) for storing inventory item images in the Hotel SaaS MVP application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project created
3. Billing enabled on your GCP project

## Step 1: Create a GCS Bucket

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Storage** > **Buckets**
3. Click **CREATE BUCKET**
4. Configure your bucket:
   - **Name**: `hotel-saas-images` (or your preferred name)
   - **Location type**: Choose based on your needs (Multi-region recommended for global access)
   - **Storage class**: Standard
   - **Access control**: Fine-grained
   - **Public access**: Choose based on security requirements
     - For public images: Enable "Enforce public access prevention on this bucket" = OFF
     - For private images: Keep it ON and use signed URLs
5. Click **CREATE**

## Step 2: Set Bucket Permissions (For Public Access)

If you want images to be publicly accessible:

1. Select your bucket
2. Go to the **PERMISSIONS** tab
3. Click **GRANT ACCESS**
4. Add principal: `allUsers`
5. Select role: **Storage Object Viewer**
6. Click **SAVE**

**Note**: Only do this if you want all uploaded images to be publicly accessible. For production, consider using signed URLs for private access.

## Step 3: Create a Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **CREATE SERVICE ACCOUNT**
3. Configure:
   - **Name**: `hotel-saas-storage`
   - **Description**: "Service account for Hotel SaaS image storage"
4. Click **CREATE AND CONTINUE**
5. Grant role: **Storage Object Admin** (allows create, read, delete)
6. Click **CONTINUE** then **DONE**

## Step 4: Generate Service Account Key

1. Find your service account in the list
2. Click the three dots (⋮) > **Manage keys**
3. Click **ADD KEY** > **Create new key**
4. Choose **JSON** format
5. Click **CREATE**
6. Save the downloaded JSON file securely (e.g., `gcs-credentials.json`)

**⚠️ Security Warning**: Never commit this file to version control!

## Step 5: Configure the Application

### Option A: Using Service Account JSON File (Local Development)

1. Place the credentials file in a secure location (e.g., `backend/config/gcs-credentials.json`)
2. Add to `.gitignore`:
   ```
   **/gcs-credentials.json
   ```
3. Set environment variables:

```bash
export GCS_PROJECT_ID=your-project-id
export GCS_BUCKET_NAME=hotel-saas-images
export GCS_CREDENTIALS_PATH=/path/to/gcs-credentials.json
```

### Option B: Using Application Default Credentials (Production/Cloud Run)

For Google Cloud environments (Cloud Run, GKE, etc.):

1. Attach the service account to your Cloud Run service
2. Set only these environment variables:
   ```bash
   GCS_PROJECT_ID=your-project-id
   GCS_BUCKET_NAME=hotel-saas-images
   ```
3. Leave `GCS_CREDENTIALS_PATH` empty - it will use Application Default Credentials

### Docker Compose Configuration

Update `docker-compose.yml`:

```yaml
backend:
  environment:
    - GCS_PROJECT_ID=your-project-id
    - GCS_BUCKET_NAME=hotel-saas-images
    - GCS_CREDENTIALS_PATH=/app/config/gcs-credentials.json
  volumes:
    - ./backend/config/gcs-credentials.json:/app/config/gcs-credentials.json:ro
```

## Step 6: Test the Setup

1. Restart your backend service
2. Test the health endpoint:
   ```bash
   curl http://localhost:8080/api/images/health
   ```
3. Expected response:
   ```json
   {
     "status": "healthy",
     "message": "GCS bucket is accessible"
   }
   ```

## API Endpoints

### Upload Inventory Image
```bash
POST /api/images/upload/inventory
Content-Type: multipart/form-data

Form data:
- file: [image file]

Response:
{
  "url": "https://storage.googleapis.com/hotel-saas-images/inventory/uuid.jpg",
  "message": "Image uploaded successfully"
}
```

### Upload Profile Image
```bash
POST /api/images/upload/profile
Content-Type: multipart/form-data

Form data:
- file: [image file]

Response:
{
  "url": "https://storage.googleapis.com/hotel-saas-images/profiles/uuid.jpg",
  "message": "Profile image uploaded successfully"
}
```

### Delete Image
```bash
DELETE /api/images?url=https://storage.googleapis.com/hotel-saas-images/inventory/uuid.jpg

Response:
{
  "message": "Image deleted successfully"
}
```

### Health Check
```bash
GET /api/images/health

Response:
{
  "status": "healthy",
  "message": "GCS bucket is accessible"
}
```

## Frontend Integration

Update the frontend to use the upload endpoint instead of base64:

```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'http://localhost:8080/api/images/upload/inventory',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const imageUrl = response.data.url;
    setNewItem({ ...newItem, image: imageUrl });
  } catch (error) {
    console.error('Failed to upload image:', error);
  }
};
```

## Troubleshooting

### "Bucket not accessible" error
- Verify your GCS_PROJECT_ID is correct
- Check if the bucket exists
- Verify service account has Storage Object Admin role
- Check if credentials file path is correct

### "Permission denied" error
- Ensure service account has **Storage Object Admin** role
- For public access, ensure **allUsers** has **Storage Object Viewer** role

### Images not displaying
- Check if bucket has public access enabled
- Verify CORS settings if serving from different domain
- Check image URL format: `https://storage.googleapis.com/bucket-name/path/file.ext`

## Cost Considerations

- **Storage**: ~$0.020 per GB/month (Standard storage)
- **Operations**:
  - Class A (writes): $0.05 per 10,000 operations
  - Class B (reads): $0.004 per 10,000 operations
- **Network egress**:
  - First 1 GB free
  - Then varies by destination

For a small to medium app with ~1000 images (~100MB) and moderate traffic:
- Storage: ~$0.002/month
- Operations: ~$0.50/month
- **Total: ~$0.50-$2/month**

## Security Best Practices

1. **Never commit credentials**: Add `**/gcs-credentials.json` to `.gitignore`
2. **Use IAM roles**: Use least-privilege principle (Storage Object Admin only)
3. **Enable versioning**: Keep backups of accidentally deleted images
4. **Set lifecycle policies**: Auto-delete old/unused images
5. **Monitor usage**: Set up billing alerts
6. **Use signed URLs**: For sensitive images, use time-limited signed URLs instead of public access

## Production Deployment

For Google Cloud Run deployment:

1. **Don't include** `gcs-credentials.json` in the Docker image
2. **Attach** the service account to your Cloud Run service:
   ```bash
   gcloud run deploy hotel-saas-backend \
     --service-account=hotel-saas-storage@your-project.iam.gserviceaccount.com \
     --set-env-vars="GCS_PROJECT_ID=your-project-id,GCS_BUCKET_NAME=hotel-saas-images"
   ```
3. Application Default Credentials will work automatically

## Summary

✅ Google Cloud Storage dependency added to pom.xml
✅ GCS configuration class created
✅ ImageStorageService created (upload, delete, health check)
✅ ImageController created with REST endpoints
✅ InventoryItem model updated with imageUrl field
✅ Application properties configured with GCS settings
✅ Support for both local (JSON key) and cloud (ADC) authentication

Your backend is now ready to store images in Google Cloud Storage!
