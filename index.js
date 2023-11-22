const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
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

const secretRouter = async (req, res, next) => {
  // console.log(req.cookies?.token)
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.SECRET_TK, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

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

  //   create jwt token
  app.post("/v1/jwt", async (req, res) => {
    try {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_TK, { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    } catch (error) {
      res.send(error);
    }
  });
  // logout
  app.post("/v1/logout", async (req, res) => {
    const user = req.body;
    res.clearCookie("token", {
      maxAge: 0,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
  });
  // user card section
  try {
    app.get("/v1/cards/:email", async (req, res) => {
      if (req.params.email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
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

  try {
    app.delete("/v1/cards/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await cardsCollection.deleteOne(filter);
      res.send(result);
    });
  } catch (error) {
    res.send(error);
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
