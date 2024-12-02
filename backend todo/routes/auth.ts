import jwt from "jsonwebtoken"
import express from "express"
import { authenticateJwt, SECRET } from "../middleware";
import { User } from "../db";
import { Router } from "express";
import {z} from "zod";

const userSchema = z.object({
  username: z.string()
    .email("Invalid email address. Please provide a valid email."), 
  password: z.string()
    .min(8, "Password must be at least 8 characters long.")
});


const router = Router();

  router.post('/signup', async (req, res) => {

    const success = userSchema.safeParse(req.body)
    
    if(!success.success){

      const errorMessage = success?.error?.errors.map(err => err.message).join(", ") || "Something went wrong";
      res.status(500).json({ error: errorMessage });

    }
      

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      res.status(403).json({ message: 'User already exists' });
    } else {
      const newUser = new User({ username, password });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'User created successfully', token });
    }
  });
  
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'Logged in successfully', token });
    } else {
      res.status(403).json({ message: 'Invalid username or password' });
    }
  });

    router.get('/me', authenticateJwt, async (req, res) => {
      const userId = req.headers["userId"];
      const user = await User.findOne({ _id: userId });
      if (user) {
        res.json({ username: user.username });
      } else {
        res.status(403).json({ message: 'User not logged in' });
      }
    });


export default router