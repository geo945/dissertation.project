const express = require('express')
const {UserService} = require('../services/user/user')

const router = express.Router();

router.post('/', UserService.insert)

module.exports = router;