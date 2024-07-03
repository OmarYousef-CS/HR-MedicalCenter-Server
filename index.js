const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./mongodb/connect.js');
const passport = require('./auth/passport-config.js')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('express-flash');

// Routes 
const authRoutes = require('./auth/authRouter.js');
const classRouteRoutes = require('./routes/class.route.js');
const classResponsibleRoutes = require('./routes/classResponsible.route.js');
const workerRouteRoutes = require('./routes/workers.route')

// Middleware
const { isAdmin, isAuthenticated } = require('./auth/middleware.js');

// Configurations
require('dotenv').config();
const app = express();

// Variables
const PORT = process.env.PORT || 5000;
const mongoDbUrl = process.env.MONGODB_URL || '';
const MAX_AGE = 1000 * 60 * 60 * 12;

// mongo db session
const mongoDBstore = new MongoDBStore({
  uri: mongoDbUrl,
  collection: 'sessions',
  expires: MAX_AGE,
  ttl: MAX_AGE/1000, // convert milliseconds to seconds
  autoRemove: 'interval',
  autoRemoveInterval: 60 // remove expired sessions every 60 seconds
})

app.use(session({ 
  secret: 'your-secret-code', 
  resave: false, 
  saveUninitialized: false,
  store: mongoDBstore,
  proxy: true,
  cookie: {
    maxAge: MAX_AGE,
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  },
  credentials: true,
}));
app.set('trust proxy', 1); 
app.use(passport.initialize());
app.use(passport.session());


app.use(cors({ credentials: true, origin: "https://hfhrm.netlify.app" }));
app.use(bodyParser.json());
app.use(flash());

// Routers
app.get('/', (req, res) => {
  console.log(req.session)
  res.send('Hello World')
})

// app.use for routess
app.use('/auth', authRoutes);
app.use('/classRoute', isAdmin, classRouteRoutes)
app.use('/classResponsible', isAuthenticated, classResponsibleRoutes)
app.use('/workerRoute', isAuthenticated, workerRouteRoutes)

app.listen(PORT, () => {
  try {
    connectDB(mongoDbUrl);
    console.log(`Server listening on port ${PORT}.`);
  } catch(error) {
    console.log(error.message)
  }
});