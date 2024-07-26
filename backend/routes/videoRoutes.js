const express = require("express");
const router = express.Router();
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { Storage } = require("@google-cloud/storage");

// Initialize the Secret Manager client
const client = new SecretManagerServiceClient();

async function getSecret() {
  const [version] = await client.accessSecretVersion({
    name: "projects/original-crow-429716-u3/secrets/KEY/versions/latest",
  });

  const payload = version.payload.data.toString("utf8");
  return JSON.parse(payload);
}

// Define bucket name and blob name for signed URL
const bucketName = "wp_clips";
const blobName = "HS_WP30/9x17/HS_WP30_B1_Concept_P03_S29_9x16_V5.mp4";

// Add route to generate signed URL
router.get("/get_signed_url", async (req, res) => {
  try {
    const jsonKey = await getSecret();
    const storage = new Storage({ credentials: jsonKey });

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 3600 * 1000, // 1 hour
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(blobName)
      .getSignedUrl(options);
    res.json({ signedUrl: url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).send("Error generating signed URL");
  }
});

module.exports = router;
