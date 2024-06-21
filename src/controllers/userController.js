const admin = require('firebase-admin');
const db = admin.firestore();
const { bucket, upload } = require('../config/storageConfig');

const getUserProfile = async (req, res) => {
  const email = req.user.email; // Ambil email pengguna dari token autentikasi

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    if (!userData.profilePicture) {
      userData.profilePicture = null; // Atau bisa diisi dengan URL gambar default
    }

    res.status(200).json({ message: 'User profile fetched successfully', user: userData });
  } catch (err) {
    console.error('Error fetching user profile: ', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const updateUserProfile = async (req, res) => {
  const email = req.user.email; // Get user email from authentication token
  const { name, username } = req.body;
  const file = req.file; // Get uploaded file from the request

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  if (!name && !username && !file) {
    return res.status(400).json({ message: 'Name, username, or profile picture is required' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (username) updates.username = username;

    if (file) {
      const blob = bucket.file(`profile_pictures/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
      });

      blobStream.on('error', err => {
        console.error(err);
        return res.status(500).json({ message: 'Failed to upload profile picture', error: err.message });
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        updates.profilePicture = publicUrl;

        await userRef.update(updates);

        // Update the username and profile picture in all posts if they are changed
        const postsRef = db.collection('posts');
        const snapshot = await postsRef.where('email', '==', email).get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          const postUpdates = {};
          if (username) postUpdates.username = username;
          if (publicUrl) postUpdates.profilePicture = publicUrl;
          batch.update(postsRef.doc(doc.id), postUpdates);
        });
        await batch.commit();

        const updatedUserDoc = await userRef.get();
        const updatedUserData = updatedUserDoc.data();

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUserData });
      });

      blobStream.end(file.buffer);
    } else {
      await userRef.update(updates);

      // Update the username and profile picture in all posts if they are changed
      const postsRef = db.collection('posts');
      const snapshot = await postsRef.where('email', '==', email).get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        const postUpdates = {};
        if (username) postUpdates.username = username;
        if (updates.profilePicture) postUpdates.profilePicture = updates.profilePicture;
        batch.update(postsRef.doc(doc.id), postUpdates);
      });
      await batch.commit();

      const updatedUserDoc = await userRef.get();
      const updatedUserData = updatedUserDoc.data();

      return res.status(200).json({ message: 'User profile updated successfully', user: updatedUserData });
    }
  } catch (err) {
    console.error('Error updating user profile: ', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const followUser = async (req, res) => {
  const userUsername = req.user.username;
  const { followUsername } = req.body;

  if (!followUsername) {
    return res.status(400).json({ message: 'Your username and follow username are required' });
  }

  try {
    const userRef = db.collection('users').doc(userUsername);
    const followRef = db.collection('users').doc(followUsername);

    // Check if the user to be followed exists
    const followDoc = await followRef.get();
    if (!followDoc.exists) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    // Add followUsername to the following list of the current user
    await userRef.update({
      following: admin.firestore.FieldValue.arrayUnion(followUsername)
    });

    // Add userUsername to the followers list of the followUsername user
    await followRef.update({
      followers: admin.firestore.FieldValue.arrayUnion(userUsername)
    });

    res.status(200).json({ message: `You are now following ${followUsername}` });
  } catch (err) {
    console.error('Error following user: ', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, upload, followUser };