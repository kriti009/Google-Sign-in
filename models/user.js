var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: String,
   password: String,
   email: String,
   google : {
       id: String,
       token: String,
       name: String,
       email: String
   }
});
userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);
module.exports = User;