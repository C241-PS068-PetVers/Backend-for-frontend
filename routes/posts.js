const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { upload } = require('../config/storageConfig');

router.post('/upload', authenticateJWT, upload.single('image'), createPost);
router.get('/', getPosts);

module.exports = router;
