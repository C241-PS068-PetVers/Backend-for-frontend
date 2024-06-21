const express = require('express');
const router = express.Router();
const { createPost, getPosts, updatePost, deletePost, likePost, unlikePost, getUserPostsByCategory, searchPosts, getUserLikedPosts } = require('../controllers/postController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { upload } = require('../config/storageConfig');

router.post('/upload', authenticateJWT, upload.single('image'), createPost);
router.get('/getPost', authenticateJWT, getPosts);
router.put('/updatePost/:id', authenticateJWT, updatePost);
router.delete('/deletePost', authenticateJWT, deletePost);
router.post('/likePost', authenticateJWT, likePost); 
router.post('/unlikePost', authenticateJWT, unlikePost);
router.get('/user', authenticateJWT, getUserPostsByCategory);
router.get('/search', authenticateJWT, searchPosts); 
router.get('/likedPost', authenticateJWT, getUserLikedPosts);

module.exports = router;
