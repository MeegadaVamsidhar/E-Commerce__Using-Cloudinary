const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadImage,
  uploadVideo,
  uploadSingleImage,
  uploadMultipleImages,
  uploadVideoFile,
  uploadAvatar,
  deleteFile,
} = require('../controllers/uploadController');

// Single image upload — any authenticated user
router.post('/', protect, uploadImage.single('image'), uploadSingleImage);

// Multiple images upload — any authenticated user
router.post('/multiple', protect, uploadImage.array('images', 5), uploadMultipleImages);

// Video upload — any authenticated user
router.post('/video', protect, uploadVideo.single('video'), uploadVideoFile);

// Avatar upload — any authenticated user
router.post('/avatar', protect, uploadImage.single('avatar'), uploadAvatar);

// Delete file — admin only
router.delete('/:public_id', protect, authorize('admin'), deleteFile);

module.exports = router;
