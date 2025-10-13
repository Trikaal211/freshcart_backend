import mongoose from "mongoose";
mongoose
.connect("mongodb://127.0.0.1:27017/test")
.then(()=>console.log("hlw db"))
.catch((error)=>console.error("db disconnected",error))

