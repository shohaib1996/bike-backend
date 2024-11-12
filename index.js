const express = require('express')
const app = express()
const port = 5000;
const cors = require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middle ware
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://bike-backend:fLYmp3l2EuYlTQAu@cluster0.lapzl7c.mongodb.net/bikeBackend?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db().collection("user")
    const productCollection = client.db().collection("products")
    const orderCollection = client.db().collection("orders")


    app.post("/signup", async (req, res) => {
      const { fullName, email, photo, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = {
        fullName,
        email,
        photo,
        password: hashedPassword,
      };
      const result = await userCollection.insertOne(newUser)
      res.send({
        data: result,
        status: 200,
        message: "user created successfully"
      })

    })

    app.post("/signin", async (req, res) => {
      const { email, password } = req.body
      const user = await userCollection.findOne({ email: email })
      if (!user) {
        return res.status(404).send({ status: 404, message: "User not found" });
      }
      const isPasswordMatched = await bcrypt.compare(password, user.password)
      if (isPasswordMatched) {
        res.send({
          data: user,
          status: 200,
          message: "User logged in successfully",
        });
      } else {
        res.status(401).send({ status: 401, message: "Invalid credentials" });
      }
    })

    app.post("/create-product", async (req, res) => {
      const newProduct = req.body
      const result = await productCollection.insertOne(newProduct)
      res.send({
        data: result,
        status: 200,
        message: "Product created successfully"
      })
    })

    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send({
        data: result,
        status: 200,
        message: "Products retrieve successfully"
      })
    })

    app.get("/products/:id", async (req, res) => {
      const { id } = req.params
      const result = await productCollection.findOne({ _id: new ObjectId(id) })
      res.send({
        data: result,
        status: 200,
        message: "Single Product retrieve successfully"
      })
    })

    app.post("/order", async (req, res) => {
      const newOrder = req.body
      const result = await orderCollection.insertOne(newOrder)
      res.send({
        data: result,
        status: 200,
        message: "Order created successfully"
      })
    })

    app.get("/cart-list", async (req, res) => {
      const { email } = req.body
      const result = await orderCollection.find({ email: email }).toArray()
      res.send({
        data: result,
        status: 200,
        message: "Order created successfully"
      })

    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})