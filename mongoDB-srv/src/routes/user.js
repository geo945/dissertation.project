const express = require('express')
const { UserService} = require('../services/user')

const router = express.Router();

router.post('/', UserService.insert)

router.get('/', UserService.fetchAll)

router.delete('/', UserService.deleteAll)

router.patch('/', UserService.updateMany)

router.get('/aggregate', UserService.aggregate)

module.exports = router;