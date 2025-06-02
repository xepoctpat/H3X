# H3X Docker Images Directory

This directory is for storing Docker image TAR files that you want to import into your H3X project.

## Structure

```
images/
├── h3x-frontend.tar          # Frontend application image
├── h3x-backend.tar           # Backend API server image  
├── h3x-websocket.tar         # WebSocket server image
├── h3x-frontend-prod.tar     # Production frontend
├── h3x-backend-prod.tar      # Production backend
├── h3x-websocket-prod.tar    # Production websocket
├── custom-mongodb.tar        # Custom database image
└── custom-nginx.tar          # Custom proxy configuration
```

## Usage

1. **Place your TAR files here**
2. **Run import command**:

   ```powershell
   .\docker-import-helper.ps1 -Operation import-custom
   ```

3. **Or use batch import**:

   ```powershell
   .\docker-manage.ps1 -Command batch-import -ConfigFile "docker-import-config.json"
   ```

## Creating TAR Files

To create TAR files from existing images:

```powershell
# Export existing image
docker save -o images/h3x-frontend.tar h3x-frontend:latest

# Export and compress
.\docker-manage.ps1 -Command export -ImageName "h3x-frontend:latest" -ImagePath "images/h3x-frontend.tar" -Compress
```

## Supported Formats

- `.tar` - Standard Docker image format
- `.tar.gz` - Compressed Docker images (automatically detected)

## Note

This directory is ignored by Git (see .gitignore) due to potentially large file sizes. Share TAR files through other means like:

- Private file shares
- Container registries
- Cloud storage
- Direct transfer
