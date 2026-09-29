import express from "express"
import { User } from "./models.js";

export async function getUserByToken(token:String){
    if(!token){
        return null;
    }
    const user = await User.findOne({token: token}).exec()
}

export function authRoutes(app:express.Express){
    app.get("/api/status", async (req, res) => {

    })

    app.post("/api/log-in", async (req, res) => {
    
    })

    app.post("/api/log-out", async (req, res) => {
    
    })

}