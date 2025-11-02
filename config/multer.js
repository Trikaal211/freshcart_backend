import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("📸 Uploading file to Cloudinary:", file.originalname);
    return {
      folder: "freshcart_uploads",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      resource_type: "auto",
    };
  },
});

const upload = multer({ storage });

export default upload;
