import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    format: async (req, file) => file.mimetype.split("/")[1], // auto detect format
    public_id: (req, file) => file.fieldname + "_" + Date.now(),
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export { upload };
