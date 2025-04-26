#!/bin/bash

# This script generates various favicon formats from our SVG logo
# Requires: ImageMagick (convert command)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install it using your package manager."
    echo "For example: brew install imagemagick (macOS) or apt-get install imagemagick (Ubuntu)"
    exit 1
fi

# Path to our svg file
SVG_PATH="public/favicon.svg"
OUTPUT_DIR="public"

echo "Generating favicon files from $SVG_PATH..."

# Generate ICO file (multi-size)
convert -background none -density 384 "$SVG_PATH" -define icon:auto-resize=64,48,32,16 "$OUTPUT_DIR/favicon.ico"

# Generate PNG icons for different sizes
convert -background none -density 192 "$SVG_PATH" -resize 16x16 "$OUTPUT_DIR/favicon-16x16.png"
convert -background none -density 192 "$SVG_PATH" -resize 32x32 "$OUTPUT_DIR/favicon-32x32.png"
convert -background none -density 192 "$SVG_PATH" -resize 192x192 "$OUTPUT_DIR/android-chrome-192x192.png"
convert -background none -density 192 "$SVG_PATH" -resize 512x512 "$OUTPUT_DIR/android-chrome-512x512.png"

# Generate Apple Touch Icon (with background)
convert -background none -density 192 "$SVG_PATH" -resize 180x180 \
  -gravity center -background "#43A047" -extent 180x180 \
  -format png "$OUTPUT_DIR/apple-touch-icon.png"

echo "Favicon generation complete!"
echo "Generated files in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR"/favicon*
ls -la "$OUTPUT_DIR"/android-chrome*
ls -la "$OUTPUT_DIR"/apple-touch-icon.png 