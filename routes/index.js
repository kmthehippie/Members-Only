var express = require('express');
var router = express.Router();
const isAuthenticated = require("../middleware/authMiddleware")

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect(`/users/${req.user.id}`)
  }
  res.render('index', { title: 'Welcome' });
});

module.exports = router;
