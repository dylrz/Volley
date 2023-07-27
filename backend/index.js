//mongodb database!
import express from "express"
import bodyParser from "body-parser"

// http://127.0.0.1:5501/frontend/index.html <= this is the local server

const app = express();
const port = 5500;

// Replace the following connection string with your actual MongoDB connection string
const URI = `mongodb+srv://dylrz:ballsack@testbase.s2vjnbh.mongodb.net/?retryWrites=true&w=majority`;

// Middleware to parse JSON data from the request body
app.use(bodyParser.json());

// Route to handle user registration and save data to MongoDB
app.post("/frontend/registration/registerpage.html", async (req, res) => {
  const userData = req.body;

  try {
    // Create a new MongoClient
    const client = new MongoClient(URI, {
      useUnifiedTopology: true,
    });

    // Connect to the MongoDB server
    await client.connect();

    // Get the database and collection
    const db = client.db("VolleyTracker");
    const collection = db.collection("userdata");

    // Insert the user data into the collection
    const result = await collection.insertOne(userData);

    res.status(200).json({ message: "User data saved successfully!", insertedId: result.insertedId });
  } catch (err) {
    console.error("Error saving user data:", err);
    res.status(500).json({ error: "Failed to save user data." });
  } finally {
    // Close the connection when done
    client.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
