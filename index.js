console.log("hello")
const express= require('express')
const app = express();
const cors = require('cors')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient;
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')
const url ="mongodb+srv://Kira:ryuk@1996@cluster0.ipr1k.mongodb.net/?retryWrites=true&w=majority";
const sendMail = require('./sendMail')
const UserModule = require('./userModule')
const {CLIENT_URL} = process.env
const PORT = process.env.PORT || 3000

mongoose.connect(url,{
    useNewUrlParser : true,
    useUnifiedTopology : true
},err => {
    if(err) throw err;
    console.log("connected to db")
})


app.use(cors({
    origin: "*"
  }))

app.use(express.json());

// app.post("/login",async function (req,res){
//     try{
//         //connect the database
//         let client= await mongoClient.connect(url);
//         //select the database
//         let db= client.db("drive_app")
//         //select  the collection and perform action
//         let data =await db.collection("accounts").insertOne(req.body)
//         console.log(data)
//         //close the database
//         client.close();

//         res.json(data)
//     }
//     catch{
//         res.status(500).json({
//             message : "something went wrong"
//         })
//     }
// })

function authenticate(req,res,next){
    try {
        // console.log(req.headers.authorization)
    //check if the token is present
    //if present=> check it is valid
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization, 'G,":4Qy:/^a)2zWd',function(error,decoded){            //add transporter
            if(error){
                console.log(error)
                res.status(500).json({
                    message : "Unauthorized"
                })
            }else{
                console.log(decoded)
                // get the data with respect to the user logged in
                req.userid=decoded.id
                next()
            }
        });
    }
        else{
            res.status(401).json({
                message : "token not present"
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "Internal server error"
        })
    }
}




app.post("/login" , async (req,res) =>{
    try {
        // //connect the database
        // let client= await mongoClient.connect(url);
        // //select the database
        // let db= client.db("drive_app")
        // //select  the collection and perform actiom => Find the email_id

        let user =await Users.findOne({userName:req.body.userName})
        if(user){
            // hash the incoming password and compare that password with user password=> then allow them
            let matchPassword = bcryptjs.compareSync(req.body.password, user.password);
            if(matchPassword){
                //Generate JWT token
                let token = jwt.sign({ id:user._id }, 'G,":4Qy:/^a)2zWd')
                console.log(token)
                res.json({
                    message : true,
                    token
                })
            }else{
                res.status(404).json({
                    message : "Username/Password doesn't match"
                })
            }
            
        }else{
            res.status(404).json({
                message : "Account not found"
            })
        }  
        //close the database
        // client.close();
        
        
    } catch (error) {
        res.status(500).json({
            message : "something went wrong"
        })
    }
}) 

app.post("/register" , async (req,res) =>{
    try {
        // //connect the database
        let client= await mongoClient.connect(url);
        // //select the database
        let db= client.db("drive_app")
        // //select  the collection and perform actiom => get the confirm password
        // // delete req.body.confirmPassword;
        // // hash the password
        let salt = bcryptjs.genSaltSync(10);
        let hash = bcryptjs.hashSync(req.body.password, salt);
        req.body.password=hash;
        console.log(salt)
        console.log(hash)
        let data =await db.collection("accounts").insertOne(req.body)
        // const newUser = {
        //     firstName,lastName ,userName, password: hash
        // }
        // const activation_token = createActivationToken(newUser)
        // const url = `${CLIENT_URL}/user/activate/${activation_token}`
        //     sendMail(userName, url, "Verify your email address")
        //close the database
        client.close();
        // res.json({msg: "Register Success! Please activate your email to start."})
        res.json({
            message : "Account created",
            id:data._id
        })
    } catch (error) {
        res.status(500).json({
            message : "something went wrong"
        })
    }
})

  app.get("/users",function(req,res){
    res.send("<h1>all are dead</h1>")
})
const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '5m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

  app.listen(process.env.PORT||3003,function(){
    console.log('The app is listening in port 3003')
})
