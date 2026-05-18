const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

const port = process.env.SERVER_URI | 5000;

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
    const db = client.db("DriveFleet"); // --------- Main Database for the project ---------
    const carsCollection = db.collection("cars"); // ---------  Cars Collection ---------

    // Send a ping to confirm a successful connection
    db.command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    // ------------------------- API calls ---------------------------------

    // **** Root directory ****
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // **** All the cars collection ****
    app.get("/explore-cars", async (req, res) => {
      const { search, type } = req.query;

      const filter = {};
      if (search) filter.carName = { $regex: search, $options: "i" };
      if (type) filter.carType = { $regex: type, $options: "i" };

      const allCars = await carsCollection.find(filter).toArray();
      res.send(allCars);
    });

    // **** Details of a single car ****
    app.get("/explore-cars/:id", async (req, res) => {
      const { id } = req.params;
      const _id = new ObjectId(id);
      const allCars = await carsCollection.find({ _id }).toArray();
      res.send(allCars);
    });

    // **** Featured cars collection ****
    app.get("/featured-cars", async (req, res) => {
      const allCars = await carsCollection.find().limit(4).toArray();
      res.send(allCars);
    });

    //
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
