import express from "express";
import { changePassword, emailVerification, forgetPassword, signin, signout, signup, tfaVerification } from "../controllers/user.controller.js";

const userrouter = express.Router();

userrouter.route("/signup").post(signup);
userrouter.route("/signin").post(signin);
userrouter.route("/signout").get(signout);
userrouter.route("/forget-password").post(forgetPassword);
userrouter.route("/change-password").post(changePassword);
userrouter.route("/verify/email").post(emailVerification);
userrouter.route("/verify/tfa").post(tfaVerification);

export default userrouter;