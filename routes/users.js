const express = require('express');
const router = express.Router();

//require controller modules
const user_controller = require("../controllers/userController")


//USER ROUTES// 
//GET login page
router.get ("/login", user_controller.login_form_get)

//POST request for login
router.post ("/login", user_controller.login_form_post)

// get request for logout
router.get ("/logout", user_controller.logout)

//GET register page
router.get ("/register", user_controller.register_form_get)

//POST request for register page. Redirect to login.
router.post ("/register", user_controller.register_form_post)

//GET User page to update and change details
router.get("/:id", user_controller.user_detail)

//GET User detail update page
router.get("/:id/update", user_controller.user_detail_update_get)

//GET User detail update page
router.post("/:id/update", user_controller.user_detail_update_post)

module.exports = router;
