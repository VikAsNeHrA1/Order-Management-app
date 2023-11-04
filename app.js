require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');
const port = process.env.PORT || 5500;
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize session management middleware first
app.use(session({
  secret: 'f3eGj9k5sD8j1M3cQ0zN6jV4bT7yL2xZ',
  resave: false,
  saveUninitialized: false
}));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect().then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/orders', checkUserType('warehouse'), async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    let orders = await collection.find().toArray();
    res.render('warehouse', { orders });  
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

app.post('/orders/add', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    await collection.insertOne({ storeName: req.body.storeName, orderList: req.body.orderList });
    
    console.log(req.body);
    
    res.json({ success: true });
  } catch (err) {
    
    res.json({ success: false, message: "Error adding order" });
  }
});

app.get('/order-success', (req, res) => {
  res.render('order-success');
});

app.post('/orders/update/:id', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    const updateObject = { orderList: req.body.orderList };

    // Check if status is provided in the request
    if (req.body.status) {
        updateObject.status = req.body.status;
    }

    await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateObject }
    );
    res.json({ success: true });
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


// For login

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const collection = client.db("warehouse").collection("users");
  const user = await collection.findOne({ username: req.body.username });
  
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    // Setting userType in the session to be used for authorization
    req.session.userType = user.userType;
    
    if (user.userType === 'store') {
      res.redirect('/store-owner');
    } else if (user.userType === 'warehouse') {
      res.redirect('/orders');
    } else {
      res.status(400).send("Invalid user type");
    }
  } else {
    res.status(401).send('Incorrect username or password');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password, userType } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const collection = client.db("warehouse").collection("users");
    await collection.insertOne({ username, password: hashedPassword, userType });
    req.session.userType = userType;
    res.redirect('/login');
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Error registering user");
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      res.status(500).send('Error during logout');
    }
    res.redirect('/'); // redirect to login
  });
});

function checkUserType(requiredType) {
  return (req, res, next) => {
    if (req.session && req.session.userType === requiredType) {
      next();
    } else {
      res.status(403).send('Access denied');
    }
  }
}


app.get('/store-owner', (req, res) => {
  
  res.render('store-owner'); 
});

app.listen(port, () => console.log(`Server is running on port ${port}`));