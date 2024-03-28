const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcryptjs")

const minLength = 3
const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {
        type: String, 
        required: true,
        lowercase: true, 
        unique: true, 
        validate: {
            validator: function(value){
                return  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            },
            message: props => `${props.value} is not a valid email address`
        }},
    password: {type: String, required: true},
    membership: {
        type: String, 
        required: true,
        enum: ["Basic", "Admin", "Pro"],
        default: "Basic"
    }   
})

UserSchema.virtual("fullname").get(function(){
    return `${this.firstName} ${this.lastName}`
})


UserSchema.virtual("url").get(function(){
    return `/users/${this._id}`
})


module.exports = mongoose.model("User", UserSchema)