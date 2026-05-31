const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.uploader.upload("E:\\AntiGravity\\WhatsApp Image 2026-05-31 at 1.17.57 PM.jpeg", {
  public_id: "layana_boutique_logo",
  folder: "layana_boutique",
  overwrite: true
}, function(error, result) {
  if (error) {
    console.error("Error uploading to Cloudinary:", error);
    process.exit(1);
  }
  console.log("UPLOADED_URL=" + result.secure_url);
});
