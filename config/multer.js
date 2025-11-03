import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.js";

console.log("🟢 Initializing multer...");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    format: async (req, file) => "png", // ya file.mimetype se detect bhi kar sakte ho
    public_id: (req, file) => file.fieldname + "_" + Date.now(), // unique name
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
    use_filename: true,
    unique_filename: false,
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
});

console.log("✅ Multer ready");

export { upload };
