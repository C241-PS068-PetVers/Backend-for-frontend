const express = require('express');
const router = express.Router();
const { register, login, fetchUser } = require('../controllers/authController');

router.post("/register", register);
router.post("/login", login);
router.get("/fetch-user", fetchUser);

module.exports = router;
