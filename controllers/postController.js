const admin = require('firebase-admin');
const db = admin.firestore();
const { bucket } = require('../config/storageConfig');

const createPost = async (req, res) => {
  const { description, category } = req.body;
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: 'User Email is required' });
  }

  if (!category || !['post', 'adoption'].includes(category)) {
    return res.status(400).json({ message: 'Valid category is required (post or adoption)' });
  }

  try {
    const blob = bucket.file(`posts/${Date.now()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    blobStream.on('error', err => {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload image', error: err.message });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      await db.collection('posts').doc().set({
        description,
        imageUrl: publicUrl,
        authorName: req.user.username,
        category,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ message: 'Post created successfully', post: { description, imageUrl: publicUrl, category } });
    });

    blobStream.end(file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPosts = async (req, res) => {
  const { category } = req.query;

  let query = db.collection('posts');

  if (category && ['post', 'adoption'].includes(category)) {
    query = query.where('category', '==', category);
  }

  try {
    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts: ", err);
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

module.exports = { createPost, getPosts };
