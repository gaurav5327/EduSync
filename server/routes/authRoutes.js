import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "An admin account already exists" });
    }

    const user = new User({ name, email, username, password, role: "admin" });
    await user.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      if (error.keyPattern.username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }
    res.status(400).json({ message: error.message });
  }
});

router.post("/register", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const { name, email, username, password, role } = req.body;

    const user = new User({ name, email, username, password, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      if (error.keyPattern.username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/user", auth, (req, res) => {
  res.json(req.user);
});

export default router;
