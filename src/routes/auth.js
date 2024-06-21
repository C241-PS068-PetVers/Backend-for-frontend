const express = require('express');
const router = express.Router();
const { register, login, fetchUser, logout } = require('../controllers/authController');

router.post("/register", register);
router.post("/login", login);
router.get("/fetch-user", fetchUser);
router.post('/logout', logout);

module.exports = router;
