// src/controllers/postController.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

exports.createPost = async (req, res) => {
    try {
        const { description } = req.body;
        const { email } = req.user;
        const file = req.file;

        if (!description || !file) {
            return res.status(400).send('Missing required fields');
        }

        const postId = uuidv4();
        const filePath = path.join('uploads/images', file.filename);

        const newPostRef = db.collection('posts').doc(postId);
        await newPostRef.set({
            id: postId,
            description,
            imageUrl: filePath,
            author: email,
            createdAt: new Date().toISOString(),
        });

        res.status(201).send('Post created successfully');
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPosts = async (req, res) => {
    try {
        const postsSnapshot = await db.collection('posts').get();
        const posts = postsSnapshot.docs.map(doc => doc.data());
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPostById = async (req, res) => {
    try {
        const postId = req.params.postId;
        const postDoc = await db.collection('posts').doc(postId).get();

        if (!postDoc.exists) {
            return res.status(404).send('Post not found');
        }

        res.status(200).json(postDoc.data());
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { description } = req.body;
        const file = req.file;

        if (!description) {
            return res.status(400).send('Missing required fields');
        }

        const postRef = db.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).send('Post not found');
        }

        const updatedData = { description };

        if (file) {
            const filePath = path.join('uploads/images', file.filename);
            updatedData.imageUrl = filePath;
        }

        await postRef.update(updatedData);
        res.status(200).send('Post updated successfully');
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;

        const postRef = db.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).send('Post not found');
        }

        const postData = postDoc.data();
        const filePath = postData.imageUrl;

        if (filePath) {
            fs.unlinkSync(filePath);  // Delete the image file from the filesystem
        }

        await postRef.delete();
        res.status(200).send('Post deleted successfully');
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
};
