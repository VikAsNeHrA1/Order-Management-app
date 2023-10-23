require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5500;
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
// trying to set up OAuth
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

// more OAuth stuff

app.use(require('express-session')({ secret: 'some random secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5500/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile); // Here you would typically look up the GitHub user in your database
  }
));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// Make sure you're logged in middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

// Usage example
app.get('/private', ensureAuthenticated, (req, res) => {
  res.send('This is a private route, only visible if logged in through GitHub!');
});

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
    res.render('warehouse', { orders });  
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

app.post('/orders/add', async (req, res) => {
  try {
    const collection = client.db("warehouse").collection("orders");
    await collection.insertOne({ storeName: req.body.storeName, orderList: req.body.orderList });
    
    // Return a JSON response instead of redirecting
    res.json({ success: true });
  } catch (err) {
    // Send an error message in the response
    res.json({ success: false, message: "Error adding order" });
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
  
  const userType = req.body.userType;

  if (userType === 'store') {
      
      res.redirect('/store-owner'); 
  } else if (userType === 'warehouse') {
      
      res.redirect('/orders');  // Changed to /orders to render warehouse.ejs
  } else {
      res.status(400).send("Invalid user type");
  }
});

app.get('/store-owner', (req, res) => {
  
  res.render('store-owner'); 
});


app.listen(port, () => console.log(`Server is running on port ${port}`));
