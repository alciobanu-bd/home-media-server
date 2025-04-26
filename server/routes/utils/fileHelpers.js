const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const exifParser = require('exif-parser');
const CryptoJS = require('crypto-js');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('./db');

// Define paths for uploads and thumbnails
const uploadDir = path.join(__dirname, '../../uploads');
const thumbnailsDir = path.join(__dirname, '../../thumbnails');

// Ensure directories exist
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(thumbnailsDir);

// Utility to extract EXIF data
const extractMetadata = async (filePath, fileType) => {
  try {
    if (fileType.startsWith('image/')) {
      const buffer = await fs.readFile(filePath);
      const parser = exifParser.create(buffer);
      const result = parser.parse();
      
      return {
        exif: result.tags,
        dimensions: {
          width: result.imageSize.width,
          height: result.imageSize.height,
        },
        createdAt: result.tags.DateTimeOriginal 
          ? new Date(result.tags.DateTimeOriginal * 1000) 
          : new Date()
      };
    }
    
    // For videos, just use file stats for now
    const stats = await fs.stat(filePath);
    return {
      createdAt: stats.mtime,
      type: fileType
    };
  } catch (err) {
    console.error('Error extracting metadata:', err);
    return { 
      createdAt: new Date(),
      type: fileType
    };
  }
};

// Generate thumbnail
const generateThumbnail = async (filePath, fileType, fileId) => {
  const thumbnailPath = path.join(thumbnailsDir, `${fileId}.jpg`);
  
  try {
    if (fileType.startsWith('image/')) {
      await sharp(filePath)
        .rotate() // apply orientation based on EXIF data
        .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);
    } else if (fileType.startsWith('video/')) {
      // For videos, use a default thumbnail
      // In a real implementation, you would generate a thumbnail from the video
      // using a library like ffmpeg, but that's beyond the scope here
      await fs.copyFile(path.join(__dirname, '../../assets', 'video-thumbnail.jpg'), thumbnailPath);
    }
    
    return true;
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    return false;
  }
};

// Calculate MD5 hash of a file
const calculateMD5 = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    const hash = CryptoJS.MD5(wordArray).toString();
    return hash;
  } catch (err) {
    console.error('Error calculating MD5:', err);
    throw err;
  }
};

// Check if a file with the same MD5 hash already exists
const findDuplicateFile = async (md5Hash) => {
  try {
    const db = getDb();
    const filesCollection = getCollection(db, 'files');
    const duplicateFile = await filesCollection.findOne({ md5Hash });
    return duplicateFile;
  } catch (err) {
    console.error('Error checking for duplicates:', err);
    return null;
  }
};

module.exports = {
  uploadDir,
  thumbnailsDir,
  extractMetadata,
  generateThumbnail,
  calculateMD5,
  findDuplicateFile
}; 