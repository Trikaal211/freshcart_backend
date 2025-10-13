import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from "../constants/env.constants.js";



const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number
  }],
     refreshToken: {
        type: String,
    }
}, { timestamps: true });
userSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
    }
    next();
});

userSchema.methods.verifyPassword = async function(userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword, this.password);
}

userSchema.methods.generateAccessToken = async function() {
    return await JWT.sign(
        {
            _id: this._id,
            email: this.email
        },
        JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    )
}

userSchema.methods.generateRefreshToken = async function() {
    return await JWT.sign(
        {
            _id: this._id,
            email: this.email
        },
        JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    )
}
const User = mongoose.model("user", userSchema);
export default User;
