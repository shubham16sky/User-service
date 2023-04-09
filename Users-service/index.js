const express = require('express');
const app = express();
const User = require("./Users")
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require('dotenv').config();

//
const PORT = process.env.PORT;
const secret = process.env.SECRET;
const atlas_uri = process.env.DB_URL;

app.use(express.json());
app.use(cors({
    origin: '*'
}));


app.use(cookieParser());

//connecting to mongodb
const connectDb = async () => {
    await mongoose.connect(atlas_uri).then(
      () => {
          console.log(`USER SERVICE DATABASE CONNECTED`) 
      },
      error => {
          console.error(`Connection error: ${error.stack}`)
          process.exit(1)
      }
  )
  }
  connectDb().catch(error => console.error(error))





//middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
      return res.sendStatus(401);
    }
  
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
  
      req.email = decoded.email;
      next();
    });
  };



//Register 

app.post("/user/signup",async(req,res)=>{
    //const{name,phone,email,password} = req.body;

    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const password = req.body.password;



    const userExists = await User.findOne({email});
    if (userExists){
        return res.status(409).send({"message":"User already exists"});
    }else{
        const newUser = new User({
            name,phone,email,password
        });
        newUser.save()
        return res.status(201).send({"message":"User created successfully"});
    }

})


//Login 

app.post("/user/login",async(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;

    //const{email,password} = req.body;

    const user = await User.findOne({email});
    if(!user){
        res.status(404).send({"msg":"User not found"});
    }else{
        if(password!=user.password){
            return res.status(401).send({"msg":"Incorrect password"});
        }

        //creating payload for jwt
        const payload= {
            email,
            name: user.name
        };

        //signing jwt token

        jwt.sign(payload,secret,(err,token)=>{
            if(err){
                console.log(err);
            }
            else{
                res.cookie('token', token, { httpOnly: true });
                return res.status(200).send({"msg":"Login Successfull"});
            }
        });
    }

});


//logout

app.get("/user/logout/",verifyToken,(req,res)=>{
    console.log("logout service")
    
    return res.status(200).cookie('token','',{maxAge:1,httpOnly:true}).json({"msg":"Logged out successfully"})
    
    
    //res.send("Logged out successfully")
})



//get a single user 
app.get("/user/fetch/",verifyToken,async(req,res)=>{
    let email = req.query.email;

    console.log(req.query.email)
    // res.send(_email)
    const user = await User.findOne({email});
    
    

    if(!user){
        res.status(404).send({"msg":"User not found"});
    }else{
        res.status(200).send({"data":user});
    }
})



//List all users (protected endpoint)


app.get("/user/list",verifyToken,async(req,res)=>{
    const user_list = await User.find();
    return res.status(200).send({"users":user_list});
})






app.get("/",(req,res)=>{
    res.send("SERVICE UP AND RUNNING")
})





app.listen(PORT,()=>{

    console.log(`SERVICE IS RUNNING ON PORT - ${PORT}`)
})










