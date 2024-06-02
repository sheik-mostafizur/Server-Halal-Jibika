require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.szoaovn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db("halalJobs");
  return cachedDb;
}

app.get("/jobs", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const jobCollection = db.collection("jobs");
    const jobs = await jobCollection.find().toArray();
    res.send(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/jobs", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const jobCollection = db.collection("jobs");
    const job = req.body;
    const result = await jobCollection.insertOne(job);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/jobs/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const jobCollection = db.collection("jobs");
    const id = req.params.id;
    const job = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedJob = {
      $set: {
        title: job.title,
        logo: job.logo,
        companyName: job.companyName,
        position: job.position,
        description: job.description,
      },
    };
    const result = await jobCollection.updateOne(filter, updatedJob, options);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/jobs/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const jobCollection = db.collection("jobs");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await jobCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
