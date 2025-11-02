import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "freshcart_uploads", // ✅ Folder name
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: file.originalname.split(".")[0], // optional
  }),
});

const upload = multer({ storage });

export default upload;
