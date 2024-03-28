const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { DateTime } = require('luxon');

const MessageSchema = new Schema({
    date: { type: Date, default: Date.now },
    title: {type: String, required: true},
    text: {type: String, },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true}
})

MessageSchema.virtual('dateFormatted').get(function () {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

MessageSchema.virtual("url").get(function(){
    return `/messages/${this._id}`
})
module.exports = mongoose.model("Message", MessageSchema)