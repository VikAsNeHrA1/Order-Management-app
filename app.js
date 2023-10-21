require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5500;
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to MongoDB once at the start
client.connect().then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});


app.get('/', (req, res) => {
  res.render('login');
});


app.get('/orders', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    let orders = await collection.find().toArray();
    res.render('orders', { orders });
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

app.post('/orders/add', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    await collection.insertOne({ storeName: req.body.storeName, orderList: req.body.orderList });
    res.redirect('/orders');
  } catch (err) {
    res.status(500).send("Error adding order");
  }
});

app.post('/orders/update/:id', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { orderList: req.body.orderList } }
    );
    res.redirect('/orders');
  } catch (err) {
    res.status(500).send("Error updating order");
  }
});

app.post('/orders/delete/:id', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });
    res.redirect('/orders');
  } catch (err) {
    res.status(500).send("Error deleting order");
  }
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  // Dummy authentication, allowing any password to be valid
  const userType = req.body.userType;

  if (userType === 'store') {
      // Redirect to store owner page
      res.redirect('/store-owner'); // Assuming this is the store owner page route
  } else if (userType === 'warehouse') {
      // Redirect to warehouse manager page
      res.redirect('/'); // Using root '/' for warehouse manager as per your given code
  } else {
      res.status(400).send("Invalid user type");
  }
});

app.get('/store-owner', (req, res) => {
  // Render store owner page. You need to create its ejs template.
  res.render('store-owner'); 
});


app.listen(port, () => console.log(`Server is running on port ${port}`));
