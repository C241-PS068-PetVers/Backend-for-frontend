const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const { getUserProfile, updateUserProfile, updateUserProfilePicture, followUser } = require('../controllers/userController');
const { upload } = require('../config/storageConfig');

router.get('/profile', authenticateJWT, getUserProfile);
router.put('/profile', authenticateJWT, upload.single('profilePicture'), updateUserProfile);
// router.post('/profile/profilePict', authenticateJWT, upload.single('file'), updateUserProfilePicture);
router.post('/follow', authenticateJWT, followUser);

module.exports = router;