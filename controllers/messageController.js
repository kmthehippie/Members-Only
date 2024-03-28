const User = require("../models/user")
const Message = require("../models/message")
const asyncHandler = require("express-async-handler")
const { body, param, validationResult } = require("express-validator")
//Message form GET
exports.message_form_get = asyncHandler(async(req,res,next)=>{
    res.render("messages_form", { title: "Messages", errors: [], currentUser: req.user})
})
//Message form POST
exports.message_form_post = [
body("title")
    .trim()
    .escape(),
body("text")
    .trim()
    .escape(),
body("requser")
    .trim()
    .escape(),

asyncHandler(async(req,res,next)=>{
    const errors = validationResult(req)
    //Validation Errors Exist
    if(!errors.isEmpty()){
        return res.render("message_form", {
            title: "Create Message",
            errors: errors.array(),
            title: req.body.title,
            text: req.body.text,
            user: req.body.requser
        })
        
    } else {
        const { title, text, requser } = req.body
        const thisUser = await User.findById(requser).exec()
        const newMessage = new Message({
            date: Date.now(),
            title: title,
            text: text,
            user: thisUser
        })
        try {
        await newMessage.save();
        console.log(thisUser)
            // Redirect based on user's membership status
            if (thisUser.membership === "Admin") {
                res.redirect("/messages/admin");
            } else if (thisUser.membership === "Pro") {
                res.redirect("/messages/pro");
            } else {
                res.redirect("/messages");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error saving message."+ newMessage + thisUser);
        }
    }
})]

//Message basic GET
exports.message_basic_get = asyncHandler(async(req,res,next)=>{
    const messages = await Message.find({}, "title text date").exec()
    res.render("messages_basic", { title: "Messages", messages: messages })
})
//Message member GET
exports.message_pro_get = asyncHandler(async(req, res, next)=>{
    let messages = await Message.find({}, "title text user date").populate("user", "firstName lastName").exec()
    res.render("messages_pro", { title: "Messages", messages: messages })
})

//Message admin GET
exports.message_admin_get = asyncHandler(async(req,res,next)=>{
    let messages = await Message.find({}, "title text user date").populate("user", "firstName lastName").exec()
    if (req.user.membership) {
        res.render("messages_admin", { title: "Messages", messages: messages })
    } else {
        res.send("You do not have powers to be here.")
    }
})

//Message admin DELETE GET
exports.message_delete_get = asyncHandler(async(req,res,next)=>{
    const message = await Message.findById(req.params.id).exec()
    res.render("message_delete", {title: "Delete Message", message: message})
})

//Message admin DELETE POST
exports.message_delete_post = asyncHandler(async(req,res,next)=>{
    const msgId = req.body.message_id
    await Message.findByIdAndDelete(msgId)
    res.redirect("/messages/admin")
})

