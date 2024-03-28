const User = require("../models/user")
const express = require('express');
const router = express.Router();
const Message = require("../models/message")
const asyncHandler = require("express-async-handler")
const { body, param, validationResult } = require("express-validator")
const isAuthenticated = require("../middleware/authMiddleware")

//require controller modules
const message_controller = require("../controllers/messageController")


//MESSAGE ROUTE//
//Message Form GET
router.get("/form", isAuthenticated, message_controller.message_form_get)

//Message Form POST
router.post("/form", message_controller.message_form_post)

//Message Get for Basic
router.get("/", message_controller.message_basic_get)

//Message Get for Pro
router.get("/pro", message_controller.message_pro_get)

//Message Get for Admin
router.get ("/admin", message_controller.message_admin_get)

//Message Delete for Admin GET
router.get("/:id/delete", message_controller.message_delete_get)

//Message Delete for Admin POST
router.post("/:id/delete", message_controller.message_delete_post)

module.exports = router; 