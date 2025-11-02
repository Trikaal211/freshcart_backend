import mongoose from "mongoose";
import { MONGODB_URI } from "../constants/env.constants.js";  // import URI from config

mongoose.connect(MONGODB_URI)
.then(() => console.log("MongoDB Atlas connected"))
.catch((error) => console.error("DB disconnected", error));
