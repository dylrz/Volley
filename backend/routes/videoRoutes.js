// routes/videoRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const { Storage } = require("@google-cloud/storage");

// Set up Google Cloud Storage client
const serviceKeyPath = path.join(__dirname, "../key.json");
const storage = new Storage({ keyFilename: serviceKeyPath });

// Define bucket name and blob name for signed URL
const bucketName = "wp_clips";
const blobName = "HS_WP30/9x17/HS_WP30_B1_Concept_P03_S29_9x16_V5.mp4";

// Add route to generate signed URL
router.get("/get_signed_url", async (req, res) => {
  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 3600 * 1000, // 1 hour
  };

  try {
    const [url] = await storage
      .bucket(bucketName)
      .file(blobName)
      .getSignedUrl(options);
    res.json({ signedUrl: url }); // Ensure the URL is correctly returned
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).send("Error generating signed URL");
  }
});

module.exports = router;
