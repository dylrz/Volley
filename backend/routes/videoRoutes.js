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
    const blobName = `${conceptName}`;
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
