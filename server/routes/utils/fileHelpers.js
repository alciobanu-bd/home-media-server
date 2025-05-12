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
                    height: result.imageSize.height
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

// Calculate MD5 hash
const calculateMD5 = async (filePath) => {
    try {
        const buffer = await fs.readFile(filePath);
        return CryptoJS.MD5(CryptoJS.lib.WordArray.create(buffer)).toString();
    } catch (err) {
        console.error('Error calculating MD5:', err);
        return null;
    }
};

// Check for duplicate files
const findDuplicateFile = async (md5Hash, userId) => {
    if (!md5Hash) return null;
  
    try {
        const db = getDb();
        const filesCollection = getCollection(db, 'files');
        
        // Look for files with the same hash that belong to this user
        const file = await filesCollection.findOne({
            md5Hash: md5Hash,
            userId: userId
        });
    
        return file;
    } catch (err) {
        console.error('Error checking for duplicates:', err);
        return null;
    }
};

/**
 * Process media file according to subscription tier quality settings
 * @param {string} sourcePath - Path to the source file
 * @param {string} destPath - Path where the processed file should be saved
 * @param {string} fileType - MIME type of the file
 * @param {Object} qualitySettings - Quality settings from the subscription tier
 * @returns {Promise<boolean>} - Whether processing was successful
 * 
 * NOTE: As Lumia is a limited resources project, compression levels are optimized
 * to balance quality with server storage and processing constraints. Higher compression
 * (lower values) reduces storage requirements and speeds up file delivery.
 */
const processMediaForStorage = async (sourcePath, destPath, fileType, qualitySettings) => {
    try {
        // If it's an image file
        if (fileType.startsWith('image/')) {
            // Extract metadata to get dimensions
            const metadata = await extractMetadata(sourcePath, fileType);
            const { width, height } = metadata.dimensions || { width: null, height: null };
            
            // Process image according to subscription tier limits
            if (qualitySettings.maxResolution === null || 
               (width === null || height === null || 
               (width <= qualitySettings.maxResolution && height <= qualitySettings.maxResolution))) {
                // No processing needed, just copy the file if we're not compressing
                if (qualitySettings.compressionLevel === 100) {
                    await fs.copy(sourcePath, destPath);
                    console.log('Image copied without processing');
                    return true;
                }
            }
            
            // Initialize sharp with the source image and preserve metadata
            let sharpInstance = sharp(sourcePath)
                .rotate()
                .withMetadata();
            
            // Resize if needed
            if (qualitySettings.maxResolution !== null && 
                (width > qualitySettings.maxResolution || height > qualitySettings.maxResolution)) {
                sharpInstance = sharpInstance.resize(qualitySettings.maxResolution, qualitySettings.maxResolution, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
                console.log(`Resizing image to max dimension ${qualitySettings.maxResolution}px`);
            }
            
            // Use the compressionLevel directly as the quality setting
            // Ensure it's a valid value between 1-100
            const quality = Math.min(Math.max(qualitySettings.compressionLevel, 1), 100);
            
            // Set output format based on input
            if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
                await sharpInstance.jpeg({ quality }).toFile(destPath);
            } else if (fileType === 'image/png') {
                await sharpInstance.png({ quality }).toFile(destPath);
            } else if (fileType === 'image/webp') {
                await sharpInstance.webp({ quality }).toFile(destPath);
            } else {
                // For other formats, convert to jpeg
                await sharpInstance.jpeg({ quality }).toFile(destPath);
            }
            
            console.log(`Image processed with quality ${quality}`);
            return true;
        } 
        // If it's a video file
        else if (fileType.startsWith('video/')) {
            // For this implementation, we'll just copy the video file
            // In a real-world implementation, you would use ffmpeg to transcode the video
            // according to the tier settings (resolution, framerate)
            await fs.copy(sourcePath, destPath);
            console.log('Video copied without processing - would normally use ffmpeg for proper transcoding');
            
            // Note: In a real implementation, you would do something like:
            // - Check if video needs processing based on tier settings
            // - Use ffmpeg to transcode with appropriate settings:
            //   - Resolution: qualitySettings.maxResolution
            //   - Framerate: qualitySettings.maxFPS
            //   - Maintain original framerate: qualitySettings.maintainOriginalFramerate
            
            return true;
        } 
        // For other file types, just copy the file
        else {
            await fs.copy(sourcePath, destPath);
            return true;
        }
    } catch (err) {
        console.error('Error processing media file:', err);
        // If processing fails, just copy the original file
        try {
            await fs.copy(sourcePath, destPath);
            console.log('Fell back to copying original file due to processing error');
            return true;
        } catch (copyErr) {
            console.error('Error copying original file as fallback:', copyErr);
            return false;
        }
    } finally {
        // Clean up the temp file
        try {
            await fs.remove(sourcePath);
        } catch (err) {
            console.error('Error removing temp file:', err);
        }
    }
};

module.exports = {
    uploadDir,
    thumbnailsDir,
    extractMetadata,
    generateThumbnail,
    calculateMD5,
    findDuplicateFile,
    processMediaForStorage
}; 