const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIRECTORY = path.join(__dirname, '../uploads');
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const VIDEO_MAX_SIZE = 100 * 1024 * 1024;

function ensureUploadsDirectoryExists() {
  if (!fs.existsSync(UPLOADS_DIRECTORY)) {
    fs.mkdirSync(UPLOADS_DIRECTORY, { recursive: true });
  }
}

const diskStorage = multer.diskStorage({
  destination: (request, file, callback) => {
    ensureUploadsDirectoryExists();
    callback(null, UPLOADS_DIRECTORY);
  },
  filename: (request, file, callback) => {
    const uniqueTimestamp = Date.now();
    callback(null, `${uniqueTimestamp}-${file.originalname}`);
  },
});

const IMAGE_EXTENSIONS = /jpeg|jpg|png|webp|gif/;
const VIDEO_EXTENSIONS = /mp4|mov|avi|webm|mkv/;

function createFileFilter(allowedPattern) {
  return (request, file, callback) => {
    const extensionMatches = allowedPattern.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeTypeMatches = allowedPattern.test(file.mimetype);

    if (extensionMatches && mimeTypeMatches) {
      callback(null, true);
    } else {
      callback(new Error('Only image files (JPEG, JPG, PNG, WebP, GIF) are allowed'), false);
    }
  };
}

const imageFileFilter = createFileFilter(IMAGE_EXTENSIONS);

const videoFileFilter = (request, file, callback) => {
  const extensionMatches = VIDEO_EXTENSIONS.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeTypeMatches = file.mimetype.startsWith('video/');

  if (extensionMatches && mimeTypeMatches) {
    callback(null, true);
  } else {
    callback(new Error('Only video files (MP4, MOV, AVI, WebM, MKV) are allowed'), false);
  }
};

const uploadImage = multer({
  storage: diskStorage,
  limits: { fileSize: IMAGE_MAX_SIZE },
  fileFilter: imageFileFilter,
});

const uploadVideo = multer({
  storage: diskStorage,
  limits: { fileSize: VIDEO_MAX_SIZE },
  fileFilter: videoFileFilter,
});

function uploadToCloudinary(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function uploadToCloudinaryVideo(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { ...options, resource_type: 'video' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
}

function deleteLocalFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Failed to clean up temporary file:', error.message);
  }
}

const PRODUCT_IMAGE_OPTIONS = {
  folder: 'ecommerce/products',
  width: 800,
  crop: 'scale',
  quality: 'auto',
  fetch_format: 'auto',
};

const AVATAR_UPLOAD_OPTIONS = {
  folder: 'ecommerce/avatars',
  width: 200,
  height: 200,
  crop: 'fill',
  gravity: 'face',
  quality: 'auto',
};

const VIDEO_UPLOAD_OPTIONS = {
  folder: 'ecommerce/videos',
  resource_type: 'video',
};

const uploadSingleImage = asyncHandler(async (request, response) => {
  if (!request.file) {
    response.status(400);
    throw new Error('No image file was provided for upload');
  }

  const result = await uploadToCloudinary(request.file.path, PRODUCT_IMAGE_OPTIONS);
  deleteLocalFile(request.file.path);

  response.json({
    success: true,
    public_id: result.public_id,
    url: result.secure_url,
  });
});

const uploadMultipleImages = asyncHandler(async (request, response) => {
  if (!request.files || request.files.length === 0) {
    response.status(400);
    throw new Error('No image files were provided for upload');
  }

  const uploadTasks = request.files.map(async (file) => {
    const result = await uploadToCloudinary(file.path, PRODUCT_IMAGE_OPTIONS);
    deleteLocalFile(file.path);
    return { public_id: result.public_id, url: result.secure_url };
  });

  const uploadedFiles = await Promise.all(uploadTasks);

  response.json({ success: true, images: uploadedFiles });
});

const uploadVideoFile = asyncHandler(async (request, response) => {
  if (!request.file) {
    response.status(400);
    throw new Error('No video file was provided for upload');
  }

  const result = await uploadToCloudinaryVideo(request.file.path, VIDEO_UPLOAD_OPTIONS);
  deleteLocalFile(request.file.path);

  const videoThumbnailUrl = cloudinary.url(result.public_id, {
    resource_type: 'video',
    transformation: [{ width: 400, crop: 'scale' }],
    format: 'jpg',
  });

  response.json({
    success: true,
    public_id: result.public_id,
    url: result.secure_url,
    duration: result.duration,
    format: result.format,
    thumbnail: videoThumbnailUrl,
  });
});

const uploadAvatar = asyncHandler(async (request, response) => {
  if (!request.file) {
    response.status(400);
    throw new Error('No avatar file was provided for upload');
  }

  const result = await uploadToCloudinary(request.file.path, AVATAR_UPLOAD_OPTIONS);
  deleteLocalFile(request.file.path);

  const User = require('../models/User');
  const currentUser = await User.findById(request.user._id);

  if (currentUser.avatar && currentUser.avatar.public_id) {
    try {
      await cloudinary.uploader.destroy(currentUser.avatar.public_id);
    } catch (cleanupError) {
      console.error('Failed to delete old avatar from Cloudinary:', cleanupError.message);
    }
  }

  currentUser.avatar = { public_id: result.public_id, url: result.secure_url };
  await currentUser.save();

  response.json({ success: true, avatar: currentUser.avatar });
});

const deleteFile = asyncHandler(async (request, response) => {
  const { public_id } = request.params;
  const resourceType = request.query.resource_type || 'image';

  const deletionResult = await cloudinary.uploader.destroy(public_id, {
    resource_type: resourceType,
  });

  if (deletionResult.result === 'not found') {
    response.status(404);
    throw new Error('The requested file was not found on Cloudinary');
  }

  response.json({ success: true, message: 'File deleted successfully' });
});

module.exports = {
  uploadImage,
  uploadVideo,
  uploadSingleImage,
  uploadMultipleImages,
  uploadVideoFile,
  uploadAvatar,
  deleteFile,
};
