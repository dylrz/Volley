const express = require("express");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Set up Google Cloud Storage client
const serviceKeyPath = path.join(__dirname, "key.json");
const storage = new Storage({ keyFilename: serviceKeyPath });

const app = express();
const PORT = process.env.PORT || 3000;

const bucketName = "wp_clips";
const blobName = "HS_WP30/9x17/HS_WP30_B1_Concept_P03_S29_9x16_V5.mp4";

app.get("/get_signed_url", async (req, res) => {
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
    console.log("Generated Signed URL:", url);
    res.json({ signedUrl: url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Error generating signed URL" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
