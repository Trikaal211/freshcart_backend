import express from "express";
import { changePassword, emailVerification, forgetPassword, signin, signout, signup, tfaVerification,  getUserProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";
import {upload} from "../../config/multer.js";


const userrouter = express.Router();

userrouter.post("/signup", upload.single("profileImage"), signup);
userrouter.route("/signin").post(signin);
userrouter.route("/signout").get(signout);
userrouter.route("/forget-password").post(forgetPassword);
userrouter.route("/change-password").post(changePassword);
userrouter.route("/verify/email").post(emailVerification);
userrouter.route("/verify/tfa").post(tfaVerification);
userrouter.get("/me",authMiddleware , getUserProfile);


export default userrouter;