import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { verifyGoogleToken } from "../utils/verifyGoogleToken";

const router = express.Router();

// google signin
router.post("/google-signin", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    console.log({ token });

    const payload = await verifyGoogleToken(token);

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    // Check if user exists in your database
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
      });
      await user.save();
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      message: "Loggedin successfully!!",
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during Google sign-in" });
  }
});

// Register route
router.route("/register").post(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    // Type-check the error before using it
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

// Login route
// router.route("/login").post(async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     const user: IUser | null = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET as string,
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.json({ token });
//   } catch (err) {
//     // Type-check the error before using it
//     if (err instanceof Error) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(500).json({ error: "An unknown error occurred" });
//     }
//   }
// });

export default router;
