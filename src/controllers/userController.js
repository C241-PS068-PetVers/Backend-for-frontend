// src/controllers/userController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

exports.registerUser = async (req, res) => {
    try {
        const { full_name, username, email, password } = req.body;

        if (!full_name || !username || !email || !password) {
            return res.status(400).send('Missing required fields');
        }

        const userQuerySnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userQuerySnapshot.empty) {
            return res.status(400).send('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUserRef = db.collection('users').doc();
        await newUserRef.set({ full_name, username, email, password: hashedPassword });

        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Missing required fields');
        }

        const userQuerySnapshot = await db.collection('users').where('email', '==', email).get();
        if (userQuerySnapshot.empty) {
            return res.status(400).send('Invalid email or password');
        }

        const userDoc = userQuerySnapshot.docs[0];
        const userData = userDoc.data();

        const validPassword = await bcrypt.compare(password, userData.password);
        if (!validPassword) {
            return res.status(400).send('Invalid email or password');
        }

        const token = jwt.sign({ userId: userDoc.id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.logoutUser = (req, res) => {
    // Since we're not maintaining sessions, we'll just send a success message
    res.status(200).send('User logged out successfully');
};
