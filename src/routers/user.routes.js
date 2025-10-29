import express from "express";
import { changePassword, emailVerification, forgetPassword, signin, signout, signup, tfaVerification,  getUserProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";

const userrouter = express.Router();

userrouter.route("/signup").post(signup);
userrouter.route("/signin").post(signin);
userrouter.route("/signout").get(signout);
userrouter.route("/forget-password").post(forgetPassword);
userrouter.route("/change-password").post(changePassword);
userrouter.route("/verify/email").post(emailVerification);
userrouter.route("/verify/tfa").post(tfaVerification);
userrouter.get("/me",authMiddleware , getUserProfile);


export default userrouter;