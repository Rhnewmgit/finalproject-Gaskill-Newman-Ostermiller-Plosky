import express from "express"
import { User } from "./models.js";
import { compare, hash } from "bcryptjs"

export async function getUserByToken(token:string){
    if(!token){
        return null;
    }
    const user = await User.findOne({token}).exec()

    // checking if token expired
    if(user && user.tokenExpiry > Date.now()){
        return user;
    }
    return null;
}

export function authRoutes(app:express.Express){
    app.get("/api/status", async (req, res) => {
        const user = await getUserByToken(req.session?.token);
        //if user exists and token is still valid, is logged in
        if(user){
            //if so send the user
            return res.json({success : true, loginStatus : true, user:user._id.toString()})
        }
        else{
            return res.json({success : true, loginStatus : false, user:null})
        }
    })

    app.post("/api/sign-up", async (req, res) => {
        const signedInUser = await getUserByToken(req.session?.token)  
        //if user is logged in can't sign up
        if(signedInUser){
           res.status(400).json({
                success : false,
                error : "Can't sign up when logged in already"
            })
        }
        const username : string = req.body.username
        const password : string = req.body.password
        //if username already exists
        const existingUser =  await User.findOne({username}).exec()
        if(existingUser){
            res.status(403).json({
                success : false,
                error : `User with username ${username} already exists!`
            })
            return
        }
        if (!req.body.password2 || req.body.password2!== password){ 
            res.status(400).json({
                success : false,
                error : "Passwords do not match"
            })
            return
        }
        //otherwise create new user
        //token given expiration of 1 day from sign in/up
        //token is random mix of lowercase letters and number
        const newUser = new User({
            username: username,
            password: await hash(password, 10),
            token: (Math.random()).toString(36).slice(2),
            tokenExpiry: Date.now() + 86400000
        })
        try{
            //check if username and password match what's allowed in schema
            await newUser.validate()
        }
        catch{
             res.status(403).json({
                success : false,
                error : "Invalid username or password"
            })
            return
        }
        await newUser.save()
        if(req.session) req.session.token = newUser.token
        res.status(200).json({
            success : true,
            user : newUser._id
        })
    })

    app.post("/api/log-in", async (req, res) => {
        const alreadyLoggedInUser = await getUserByToken(req.session?.token)  
        //check if someone is already logged in
        if (alreadyLoggedInUser){
            res.status(400).json({
                success : false,
                error : "Already logged in"
            })
        }
        const username = req.body.username
        const password = req.body.password
        const user = await User.findOne({username : username})
        if(!user){
            res.status(404).json({
                success : false,
                error : "No user found with that username"
            })
        }
        //check if password is correct
        else if (!(await compare(password, user.password))){
            res.status(404).json({
                success : false,
                error : "Incorrect password"
            })
        }
        //set new token
        else{
            user.token = (Math.random()).toString(32).slice(2)
            user.tokenExpiry = Date.now() + 86400000
            await user.save()
            if(req.session){
                req.session.token = user.token;
            }
            res.status(200).json({
                success : true,
                user : user._id.toString()
            })
        }
    })

    app.post("/api/log-out", async (req, res) => {
        const user = await getUserByToken(req.session?.token)
        if(user){
            user.tokenExpiry = 0;
            await user.save();
            if(req.session?.token !== undefined){
                req.session.token = null;
            }
            res.status(200).json({success : true})
        }else{
            res.status(401).json({
                error : "Error: no user was signed in"
            })
        }
    })

}