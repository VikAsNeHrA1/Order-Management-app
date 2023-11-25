// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Set the port from environment variable or default to 5500
const port = process.env.PORT || 5500;

// MongoDB client setup
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

// Set EJS as the view engine for rendering views
app.set('view engine', 'ejs');

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Serve static files from the "static" directory
app.use(express.static('static'));

// Session management middleware configuration
app.use(session({
  secret: 'f3eGj9k5sD8j1M3cQ0zN6jV4bT7yL2xZ', // Secret key for session hashing
  resave: false, // Don't resave session if not modified
  saveUninitialized: false // Don't create session until something is stored
}));

// Connect to MongoDB using the URI from the environment variable
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to MongoDB and handle connection errors
client.connect().then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});

// Route for the home page
app.get('/', (req, res) => {
  res.render('login'); // Render the login page
});

// Route for getting orders, with access control for warehouse users
app.get('/orders', checkUserType('warehouse'), async (req, res) => {
  try {
    // Access orders from MongoDB and display them
    const collection = client.db("warehouse").collection("orders");
    let orders = await collection.find().toArray();
    res.render('warehouse', { orders });
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

// Route for adding new orders
app.post('/orders/add', async (req, res) => {
  try {
    // Insert a new order into the MongoDB collection
    const collection = client.db("warehouse").collection("orders");
    await collection.insertOne({ storeName: req.body.storeName, orderList: req.body.orderList });
    
    console.log(req.body);
    
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: "Error adding order" });
  }
});

// Route for displaying order success page
app.get('/order-success', (req, res) => {
  res.render('order-success');
});

// Route for updating an order by its ID
app.post('/orders/update/:id', async (req, res) => {
  try {
    // Update an existing order in the MongoDB collection
    const collection = client.db("warehouse").collection("orders");
    const updateObject = { orderList: req.body.orderList };

    // Include status in update if provided
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

// Route for deleting an order by its ID
app.post('/orders/delete/:id', async (req, res) => {
  try {
    // Delete an order from the MongoDB collection
    const collection = client.db("warehouse").collection("orders");
    await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });
    res.redirect('/orders');
  } catch (err) {
    res.status(500).send("Error deleting order");
  }
});

// Routes for login functionality
app.get('/login', (req, res) => {
  res.render('login'); // Render the login page
});

app.post('/login', async (req, res) => {
  const collection = client.db("warehouse").collection("users");
  const user = await collection.findOne({ username: req.body.username });

  // Authenticate user and set session variables
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.userType = user.userType;
    req.session.username = user.username;

    // Redirect based on user type
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

// Routes for user registration
app.get('/signup', (req, res) => {
  res.render('signup'); // Render the signup page
});

app.post('/signup', async (req, res) => {
  // Hash password and store new user
  const { username, password, userType } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const collection = client.db("warehouse").collection("users");
    await collection.insertOne({ username, password: hashedPassword, userType });
    req.session.userType = userType;
    res.redirect('/login');
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

// Route for logging out
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Error during logout');
    }
    res.redirect('/'); // Redirect to login page on successful logout
  });
});

// Middleware for checking user type
function checkUserType(requiredType) {
  return (req, res, next) => {
    if (req.session && req.session.userType === requiredType) {
      next();
    } else {
      res.status(403).send('Access denied');
    }
  }
}

// Static routes for additional pages
app.get('/contact', (req, res) => {
  res.render('contactUs');
});

app.get('/home', (req, res) => {
  res.render('login'); 
});

app.get('/store-owner', (req, res) => {
  const username = req.session.username;
  res.render('store-owner', { username });
});

app.get('/about', (req, res) => {
  res.render('aboutUs'); 
});

app.get('/gallery', (req, res) => {
  res.render('ourGallery'); 
});


// new addition iss34

app.get('/warehouse', async (req, res) => {
  try {
      const collection = client.db("warehouse").collection("orders");
      let orders = await collection.find().toArray();
      res.render('warehouse', { orders });  
  } catch (err) {
      res.status(500).send("Error fetching orders");
  }
});


app.listen(port, () => console.log(`Server is running on port ${port}`));


// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));


