import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.js";

console.log("🟢 Initializing multer...");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("📸 File details inside multer:", file.originalname);
    return {
      folder: "products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // ✅ added webp
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    };
  },
});

const upload = multer({ storage });

console.log("✅ Multer ready");

export { upload };
