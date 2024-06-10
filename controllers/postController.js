const admin = require('firebase-admin');
const db = admin.firestore();
const { bucket } = require('../config/storageConfig');

const createPost = async (req, res) => {
  const { description, category } = req.body;
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  if (!req.user || !req.user.username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const authorName = req.user.username;

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
      const postRef = db.collection('posts').doc();
      const postId = postRef.id;
      await db.collection('posts').doc().set({
        id : postId,
        description,
        imageUrl: publicUrl,
        authorName,
        category,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ message: 'Post created successfully', post: { id: postId, authorName, description, imageUrl: publicUrl, category } });
    });

    blobStream.end(file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createPost };


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

const searchPosts = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const postsRef = db.collection('posts');
    const usersRef = db.collection('users');
    
    const postsSnapshot = await postsRef.get();
    const usersSnapshot = await usersRef.get();

    const posts = [];
    const usersMap = {};

    // Create a map of usernames to user data
    usersSnapshot.forEach(doc => {
      usersMap[doc.data().username] = doc.data();
    });

    // Filter posts based on the query in description or username
    postsSnapshot.forEach(doc => {
      const post = doc.data();
      const user = usersMap[post.authorName];

      if (
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.authorName.toLowerCase().includes(query.toLowerCase())
      ) {
        posts.push({ id: doc.id, ...post, user });
      }
    });

    res.status(200).json({ message: 'Posts fetched successfully', posts });
  } catch (error) {
    console.error('Error fetching posts: ', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};


module.exports = { createPost, getPosts,searchPosts };
