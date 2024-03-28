const User = require("../models/user")
const passport = require("passport")
const Message = require("../models/message")
const asyncHandler = require("express-async-handler")
const { body, param, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")

//Login GET
exports.login_form_get = asyncHandler(async(req,res,next)=>{
    res.render("login_form", {
        title: "Log In",
        errors: []
    })
})

// LOGIN POST
exports.login_form_post = asyncHandler(async(req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (user) {
            // User is authenticated, redirect if logged in
            req.login(user, async (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect("/users/" + user.id);
            });
        } else {
            // Authentication failed, redirect to login page
            res.redirect("/users/login");
        }
    })(req, res, next);
});



// Logout route handler with a callback function
exports.logout =  asyncHandler (async(req, res, next) => {
    req.logout((err) => {
        if (err) {
            // Handle error, if any
            console.error("Error occurred during logout:", err);
            return next(err);
        }
        // Redirect or respond as needed after logout
        res.redirect("/"); // Redirect to home page after logout
    });
})


//Register GET
exports.register_form_get = asyncHandler(async(req,res,next)=>{
    res.render("register_form", {
        title: "Register",
        errors: []
    })
})

//Custom validation to check if email is unique
const isUnique = async function(email) {
    const existingUser = await User.findOne({email})
    if (existingUser) {
        return Promise.reject("Email Already Exists")
    }
}
const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
//Register POST. Redirect to home or messages
exports.register_form_post = [
//validate and sanitize fields
body("username")
    .trim()
    .isEmail().withMessage("Invalid Email Address")
    .customSanitizer(val => val.toLowerCase())
    .escape()
    .custom(isUnique),
body("firstname")
    .trim()
    .escape(),
body("lastname")
    .trim()
    .escape(),
body("password")
    .trim()
    .isLength({min:8}).withMessage("Password needs to be 8 chars")
    .matches(pwPattern).withMessage("Password has to be minimum eight characters, at least one letter and one number:"),
body("confirm_password")
    .trim()
    .custom((val, {req})=>{
        if(val !== req.body.password){
            throw new Error("Passwords do NOT match")
        }
        return true;
    }),
body("secret")
    .trim()
    .optional({checkFalsy: true}),

//Async handling for registration logic
asyncHandler(async(req,res,next)=>{
    const errors = validationResult(req)

    //Validation Errors exist
    if(!errors.isEmpty()){
        res.render("register_form", {
            title: "Register",
            errors: errors.array(),
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            secret: req.body.secret,
        })
    //Validation Errors don't exist
    }else{
    let member = "";
    const memberType = async function(answer){
        if (answer === "human" || answer === "man"){
            member = "Pro"
        } else if (answer === "admin"){
            member = "Admin"
        } else {
            member = "Basic"
        }
    }
    const {username, firstname, lastname, password, secret} = req.body
    await memberType(secret)
    const hashedPw = await bcrypt.hash(password, 10)
    const newUser = new User({
        email: username,
        firstName: firstname,
        lastName: lastname,
        password: hashedPw,
        membership: member,
    })
    await newUser.save()
    res.redirect("/users/login")
    }
   
})
]

//User Detail GET
exports.user_detail = asyncHandler(async(req,res,next)=>{
    const userId = await req.session.passport.user
    const user = await User.findById(userId).exec()

    res.render("user_detail", {
        title: "Your Info",
        user: user,
    })
})

//USER Detail UPDATE GET
exports.user_detail_update_get = asyncHandler(async(req,res,next)=>{
    const thisUser = await User.findById(req.user.id)
    res.render("register_form", {
        title: "Update Details",
        errors: [],
        user: thisUser
    })
})

//USER Detail UPDATE POST
exports.user_detail_update_post = [
    body("username")
    .trim()
    .isEmail().withMessage("Invalid Email Address")
    .customSanitizer(val => val.toLowerCase())
    .escape()
    .custom(async (val, {req})=>{
        if(val !== req.user.email){
            await isUnique(val)
        }
    }),
    body("firstname")
    .trim()
    .escape(),
    body("lastname")
    .trim()
    .escape(),
    body("secret")
    .trim()
    .optional({checkFalsy: true}),
    body('requser')
    .trim()
    .escape(),
    asyncHandler(async(req,res,next)=>{
        const errors = validationResult(req)

        //Validation Errors exist
        if(!errors.isEmpty()){
            res.render("register_form", {
                title: "Update",
                errors: errors.array(),
                username: req.body.username,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                secret: req.body.secret,
            })
        //Validation Errors don't exist
        }else{
        let member = "";
        const memberType = async function(answer){
            if (answer === "human" || answer === "man"){
                member = "Pro"
            } else if (answer === "admin"){
                member = "Admin"
            } else {
                member = "Basic"
            }
        }
        const {username, firstname, lastname, secret} = req.body
        const existingUser = await User.findById(req.body.requser)
        if(secret){
            await memberType(secret)
        } 
   
        const updatedUser = {
            firstName: firstname,
            lastName: lastname,
            email: username,
            password: existingUser.password,
            membership: member || existingUser.membership,
        }


        const user = await User.findByIdAndUpdate(req.body.requser, updatedUser, { new: true })
        user.save()
        res.redirect(user.url)
        }
})]
