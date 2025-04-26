# Favicon Generation

This project uses a custom SVG logo as the favicon. The SVG file is located at `public/favicon.svg`.

## Generating Favicon Files

To generate all the necessary favicon files from the SVG source, follow these steps:

1. Make sure you have ImageMagick installed on your system:
   - macOS: `brew install imagemagick`
   - Ubuntu/Debian: `sudo apt-get install imagemagick`
   - Windows: Download from https://imagemagick.org/script/download.php

2. Run the favicon generation script:
   ```bash
   cd client
   ./generate-favicons.sh
   ```

This will generate the following files in the `public` directory:
- `favicon.ico` - Traditional favicon file with multiple sizes (16x16, 32x32, 48x48, 64x64)
- `favicon-16x16.png` - Small PNG favicon
- `favicon-32x32.png` - Standard PNG favicon
- `android-chrome-192x192.png` - Android Chrome icon
- `android-chrome-512x512.png` - Large Android Chrome icon
- `apple-touch-icon.png` - iOS home screen icon

## Manual Alternative

If you don't have ImageMagick installed, you can use an online favicon generator:

1. Upload the `public/favicon.svg` file to a service like:
   - https://realfavicongenerator.net/
   - https://favicon.io/

2. Download the generated files and place them in the `public` directory.

## Implementation

The favicons are implemented in `public/index.html` with the following tags:

```html
<link rel="icon" href="<%= BASE_URL %>favicon.ico" sizes="any">
<link rel="icon" href="<%= BASE_URL %>favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="<%= BASE_URL %>apple-touch-icon.png">
<link rel="manifest" href="<%= BASE_URL %>manifest.json">
```

This ensures compatibility with all modern browsers and devices. 