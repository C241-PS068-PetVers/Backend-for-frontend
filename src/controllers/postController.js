const admin = require('firebase-admin');
const db = admin.firestore();
const { bucket } = require('../config/storageConfig');

const createPost = async (req, res) => {
  const { description, category, phoneNumber } = req.body;
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const email = req.user.email;

  if (!category || !['post', 'adoption'].includes(category)) {
    return res.status(400).json({ message: 'Valid category is required (post or adoption)' });
  }

  // Periksa nomor telepon jika kategori adalah "adoption"
  if (category === 'adoption' && !phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required for adoption posts' });
  }

  try {
    // Fetch the latest user profile
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userDoc.data();
    const username = user.username;
    const profilePicture = user.profilePicture;

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
      const postData = {
        description,
        imageUrl: publicUrl,
        email,
        username,
        profilePicture,
        category,
        likes: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Tambahkan nomor telepon hanya jika kategori adalah "adoption"
      if (category === 'adoption') {
        postData.phoneNumber = phoneNumber;
      }

      await postRef.set(postData);

      res.status(201).json({ message: 'Post created successfully', post: { postId, ...postData } });
    });

    blobStream.end(file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPosts = async (req, res) => {
  const { category, email } = req.query; // Ambil kategori dan username dari query parameter

  let query = db.collection('posts');

  if (email) {
    query = query.where('email', '==', email);
  }

  if (category && ['post', 'adoption'].includes(category)) {
    query = query.where('category', '==', category);
  }

  try {
    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No posts found' });
    }

    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts: ", err);
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

const getUserPostsByCategory = async (req, res) => {
  const email = req.user.email;
  const { category } = req.query; // Ambil kategori dari query parameter

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!category || !['post', 'adoption'].includes(category)) {
    return res.status(400).json({ message: 'Valid category is required (post or adoption)' });
  }

  try {
    const postsRef = db.collection('posts');
    const snapshot = await postsRef
      .where('email', '==', email)
      .where('category', '==', category)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No posts found for this user in the specified category' });
    }

    const userPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ message: 'User posts fetched successfully', posts: userPosts });
  } catch (err) {
    console.error('Error fetching user posts: ', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const searchPosts = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const postsRef = db.collection('posts');

    // Perform a full-text search on the posts' descriptions and authors' usernames
    const postsSnapshot = await postsRef.get();
    const posts = [];

    postsSnapshot.forEach(doc => {
      const post = doc.data();
      if (
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.username.toLowerCase().includes(query.toLowerCase())
      ) {
        posts.push({ id: doc.id, ...post });
      }
    });

    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found matching the query' });
    }

    res.status(200).json({ message: 'Posts fetched successfully', posts });
  } catch (error) {
    console.error('Error fetching posts: ', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { description, category } = req.body;
  const email = req.user.email;


  if (!id) {
    return res.status(400).json({ message: 'Post ID is required' });
  }

  if (!req.user || !email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (category && !['post', 'adoption'].includes(category)) {
    return res.status(400).json({ message: 'Valid category is required (post or adoption)' });
  }

  try {
    const postRef = db.collection('posts').doc(id);
    const postDoc = await postRef.get();
    console.log(postDoc.data())

    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    if (postData.email !== email) {
      return res.status(403).json({ message: 'You can only update your own posts' });
    }

    await postRef.update({
      description: description || postData.description,
      category: category || postData.category,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedPost = await postRef.get();
    res.status(200).json({ message: 'Post updated successfully', post: { id: updatedPost.id, ...updatedPost.data() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Post ID is required' });
  }

  console.log(`Received request to delete post with ID: ${id}`);

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const email = req.user.email;

  try {
    const postRef = db.collection('posts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log(`Post with ID: ${id} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    if (postData.email !== email) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    console.log(`Deleting post with ID: ${id}`);

    await postRef.delete();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const likePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Post ID is required' });
  }

  console.log(`Received request to like post with ID: ${id}`);

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  const email = req.user.email;

  try {
    const postRef = db.collection('posts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log(`Post with ID: ${id} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    if (postData.likes.includes(email)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    await postRef.update({
      likes: admin.firestore.FieldValue.arrayUnion(email)
    });

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const unlikePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Post ID is required' });
  }

  console.log(`Received request to unlike post with ID: ${id}`);

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  const email = req.user.email;

  try {
    const postRef = db.collection('posts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log(`Post with ID: ${id} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    if (!postData.likes.includes(email)) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }

    await postRef.update({
      likes: admin.firestore.FieldValue.arrayRemove(email)
    });

    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getUserLikedPosts = async (req, res) => {
  const email = req.user.email; // Ambil email pengguna dari token autentikasi

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.where('likes', 'array-contains', email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No liked posts found for this user' });
    }

    const likedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ message: 'Liked posts fetched successfully', posts: likedPosts });
  } catch (err) {
    console.error('Error fetching liked posts: ', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createPost, getPosts, searchPosts, updatePost, deletePost, likePost, unlikePost, getUserPostsByCategory, getUserLikedPosts };