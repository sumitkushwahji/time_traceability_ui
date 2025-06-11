#!/bin/bash

# Ensure script exits on error
set -e

# Step 1: Navigate to the project directory (if needed)
# cd /path/to/your/angular/project

# Step 2: Build the Angular app
echo "Building Angular app..."
npm run build -- --configuration=production


echo "Transferring UI build files to the remote server..."
scp -r dist/time_traceability_ui/* npl@192.168.251.111:/home/npl/code/nginx-data/time_traceability_ui/

# # Step 3: Build the Docker image with the dynamically generated version
# echo "Building Docker image with version $VERSION..."
# docker build -t $IMAGE_NAME:$VERSION ./deployment/dev

# rm -rf deployment/dev/dist

# # Step 4: Remove any old container (if it exists) with the same name
# echo "Removing old container if it exists..."
# docker rm -f $IMAGE_NAME || true

# # Step 5: Remove any old images (if they exist) with the same name but different tags
# # We are removing images that are not tagged with the current version, so the old images are cleaned up.
# echo "Removing old Docker images if they exist..."
# docker images | grep $IMAGE_NAME | grep -v $VERSION | awk '{print $3}' | xargs -I {} docker rmi {}

# # Step 6: Run the new Docker container with the dynamically generated version
# echo "Deploying Docker container with version $VERSION..."
# docker run -d --restart always --network host --name $IMAGE_NAME $IMAGE_NAME:$VERSION

# echo "Deployment complete!"
