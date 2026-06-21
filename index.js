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

    // **** The All cars collection ****
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
      const allCars = await carsCollection.findOne({ _id });
      res.send(allCars);
    });

    // **** Featured cars collection ****
    app.get("/featured-cars", async (req, res) => {
      const allCars = await carsCollection.find().limit(4).toArray();
      res.send(allCars);
    });

    // **** My added cars collection ****
    app.get("/my-added-cars", async (req, res) => {
      const userId = req.query.userId;

      const allCars = await carsCollection.find({ owner: userId }).toArray();
      res.send(allCars);
    });

    // ------------------------- CRUD Api ---------------------------------

    // **** Add Cars to the Form ****
    app.post("/add-cars", async (req, res) => {
      const receivedData = await req.body;
      console.log(receivedData);

      const result = await carsCollection.insertOne(receivedData);
      res.send(result);
    });

    // **** Modify the user added Cars ****
    app.patch("/edit-car/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;

      const result = await carsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data },
      );

      res.send(result);
    });

    // **** Delete the user added Cars ****
    app.delete("/delete-car/:id", async (req, res) => {
      const { id } = req.params;

      const deleteResult = await carsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(deleteResult);
    });

    // ------------------------- End of Api ---------------------------------
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}/`);
});
