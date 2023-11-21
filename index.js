const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.SECRET_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const menusCollection = client.db("bistro-boss").collection("menus");
  const usersCollection = client.db("bistro-boss").collection("users");
  const cardsCollection = client.db("bistro-boss").collection("cards");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
  // user card section
  try {
    app.get("/v1/cards/:email", async (req, res) => {
      const email = req.params.email;
      const result = await cardsCollection.find({ email: email }).toArray();
      res.send(result);
    });
  } catch (error) {
    res.send(error);
  }
  try {
    app.post("/v1/cards", async (req, res) => {
      const card = req.body;
      const result = await cardsCollection.insertOne(card);
      res.send(result);
    });
  } catch (error) {
    res.send(error);
  }

  try{
    app.delete('/v1/cards/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result= await cardsCollection.deleteOne(filter)
      res.send(result)
    })
  }catch(error){
    res.send(error)
  }
  // post user
  try {
    app.post("/v1/users", async (req, res) => {
      const query = req.body;
      const result = await usersCollection.insertOne(query);
      res.send(result);
    });
  } catch (error) {
    res.send(error);
  }

  // get menus short by category
  try {
    app.get("/v1/menus/:category", async (req, res) => {
      const query = req.params.category;
      const filter = { category: query };
      const result = await menusCollection.find(filter).toArray();
      res.send(result);
    });
  } catch (error) {
    res.send(error);
  }

  //   get all menus
  try {
    app.get("/v1/menus", async (req, res) => {
      const result = await menusCollection.find().toArray();
      res.send(result);
    });
  } catch (error) {
    res.send(error);
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Bistro Boss is Running...");
});
app.listen(port, () => {
  console.log(`bistro boss running prot is ${port}`);
});
