const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        require: true,
    } ,

    phone:{
        type: Number,
        require: true,
    },
    email : {
        type : String,
        require : true,
    } ,
    password : {
        type: String,
    },
    
    
});

module.exports  = mongoose.model("Users",UserSchema);