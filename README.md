# Home Media Server

A responsive web application for managing and viewing photos and videos, with features including:

- Responsive gallery layout
- Media upload with progress tracking
- Image viewer with zoom and pan controls
- Video playback
- Metadata display
- Batch selection and deletion

## Prerequisites

- Node.js (v14 or later)
- MongoDB (v4 or later)

## Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/home-media-server.git
   cd home-media-server
   ```

2. Install MongoDB (if not already installed)
   
   **macOS (using Homebrew):**
   ```
   brew tap mongodb/brew
   brew install mongodb-community@6.0
   brew services start mongodb-community@6.0
   ```
   
   **Ubuntu:**
   ```
   sudo apt update
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```
   
   **Windows:**
   Download the MongoDB Community Server from https://www.mongodb.com/try/download/community
   and follow the installation instructions.

3. Install dependencies
   ```
   npm run install:all
   ```

## Configuration

By default, the server connects to MongoDB at `mongodb://localhost:27017/homeMediaServer`. If you need to change this, update the connection string in `server/index.js`.

## Running the Application

1. Make sure MongoDB is running

2. Start both client and server
   ```
   npm run dev
   ```

   This will start:
   - Backend server at http://localhost:3000
   - Frontend client at http://localhost:8080 (or 8081 if 8080 is in use)

## Project Structure

- `/client` - Vue.js frontend
- `/server` - Fastify backend
  - `/server/uploads` - Uploaded media files
  - `/server/thumbnails` - Generated thumbnails
  - `/server/assets` - Static assets like default thumbnails

## Features

- **Gallery View**: Responsive grid layout for media items, grouped by date
- **Upload**: Drag & drop or file selection with progress tracking
- **Media View**: 
  - Image viewer with zoom/pan controls
  - Video player
  - EXIF metadata display
- **Management**:
  - Individual or batch deletion
  - Select mode for multiple operations
- **Upload Task Management**:
  - Progress tracking
  - Pause/resume/cancel operations
  - Persistence across page refreshes

## API Endpoints

- `GET /api/media` - Get paginated media items
- `GET /api/media/:filename` - Get media file
- `GET /api/thumbnails/:file_id` - Get thumbnail
- `GET /api/metadata/:file_id` - Get file metadata
- `POST /api/upload` - Upload media file
- `DELETE /api/:file_id` - Delete media item

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is installed and running
- Check if MongoDB is running on the default port (27017)
- If using a custom MongoDB configuration, update the connection string in `server/index.js`

### ESLint Errors
If you encounter ESLint errors when running the client, you may need to create an ESLint configuration file:
```
touch client/.eslintrc.js
```
And add the following content:
```js
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  }
}
``` 