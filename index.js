const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
// middleware
// const corsOptions = {
//   // origin: ["http://localhost:5173", "http://localhost:5174"],
//   origin: [
//     "http://localhost:5173",
//     "https://house-trade.web.app/",
//     "house-trade.firebaseapp.com",
//     " https://house-trade-server.vercel.app/properties",
//   ],
//   credentials: true,
//   // optionSuccessStatus: 200,
// };
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://house-trade.web.app",
      "house-trade.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const propertiesCollection = client
      .db("propertiesDB")
      .collection("properties");

    // cart collection
    const wishlistCollection = client.db("propertiesDB").collection("wishlist");
    //reviews collection
    const reviewsCollection = client.db("propertiesDB").collection("reviews");
    //user collection
    const usersCollection = client.db("propertiesDB").collection("users");
    //user collection api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      console.log(query);
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });
    //get all user

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    //delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    //uset update user to admin role
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //post reviews collection
    app.post("/reviews", async (req, res) => {
      const item = req.body;
      const result = await reviewsCollection.insertOne(item);
      console.log(result);
      res.send(result);
    });

    //get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });
    //get reviews by sorting by email
    // app.get("/reviews", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const result = await reviewsCollection.find(query).toArray();
    //   // console.log(result);
    //   res.send(result);
    // });

    app.get("/reviews", async (req, res) => {
      const email = req.query.email;
      const query = email ? { email: email } : {};
      const result = await reviewsCollection
        .find(query)
        .sort({ email: 1 })
        .toArray();
      res.send(result);
    });

    //post wishlist collection
    app.post("/wishlist", async (req, res) => {
      const item = req.body;
      const result = await wishlistCollection.insertOne(item);
      console.log(result);
      res.send(result);
    });
    //get wishlist collection base by email
    app.get("/wishlist", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await wishlistCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    //get all properties
    app.get("/properties", async (req, res) => {
      const result = await propertiesCollection.find().toArray();
      res.send(result);
    });
    //get data by id
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const result = await propertiesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    //delete properties
    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const result = await wishlistCollection.deleteOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Hello from Home trade Server..");
});

app.listen(port, () => {
  console.log(`Home Trade is running on port ${port}`);
});
