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

// Add route to generate signed URL
router.get("/get_signed_url/:bucketName/:conceptName", async (req, res) => {
  try {
    const bucketName = req.params.bucketName;
    const conceptName = req.params.conceptName;

    // Validate inputs
    if (!conceptName || conceptName === "null" || conceptName === "undefined") {
      return res.status(400).json({
        error: "Invalid concept name provided",
        providedValue: conceptName,
      });
    }

    // You might need to adjust this based on your actual file structure
    const blobName = `${conceptName}.mp4`; // or whatever your file extension is
    // OR if files are in folders:
    // const blobName = `videos/${conceptName}.mp4`;

    const jsonKey = await getSecret();
    const storage = new Storage({ credentials: jsonKey });

    // Check if file exists first
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(blobName);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({
        error: "File not found",
        bucket: bucketName,
        blob: blobName,
      });
    }

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 3600 * 1000, // 1 hour
    };

    const [url] = await file.getSignedUrl(options);
    res.json({ signedUrl: url });
  } catch (error) {
    console.error("Error generating signed URL:", {
      error: error.message,
      stack: error.stack,
      bucketName: req.params.bucketName,
      conceptName: req.params.conceptName,
    });

    res.status(500).json({
      error: "Error generating signed URL",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
