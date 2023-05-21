const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqk54.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toyshop").collection("toys");

    app.get("/toys", async (req, res) => {
      const { sort } = req?.query;
      console.log(Number(sort));
      if (sort) {
        const cursor = toyCollection.find().sort({ price: Number(sort) });
        const result = await cursor.toArray();
        return res.send(result);
      }
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      return res.send(result);
    });

    app.get("/alltoy", async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      return res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = req.body;

      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    // get single toys
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { price, quantity, description } = req.body;

      const updateDoc = {
        $set: {
          price: Number(price),
          quantity: Number(quantity),
          description,
        },
      };
      console.log(updateDoc);
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // delete toys
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB databse!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
