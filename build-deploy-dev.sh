#!/bin/bash

# Ensure script exits on error
SOURCE_DIR="dist/time_traceability_ui"
TARGET_DIR="/home/time-tracebility/time_traceability_rrsl/docker-compose-nginx/nginx-data/time_traceability_ui"

set -e

# Step 2: Build the Angular app
echo "Building Angular app..."
npm run build

echo "Removing existing target directory if it exists..."
rm -rf $TARGET_DIR

# Now move the source directory to the target
echo "Moving $SOURCE_DIR to $TARGET_DIR..."
mv $SOURCE_DIR $TARGET_DIR
