const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');

const fs = require('fs');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const config = require('./config');
const routes = require('./routes');
const models = require('./models');

// database
mongoose.Promise = global.Promise;
const options = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.set('debug', config.IS_PRODUCTION);
mongoose.connection
  .on('error', error => console.log(error))
  .on('close', () => console.log('Database connection closed.'))
  .once('open', async () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  });

mongoose.connect(config.MONGO_URL, options);

// express
const app = express();

// sessions
app.use(
  session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    },
  })
);

// sets and uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/', routes.page_routes);

app.use('/api/auth', routes.auth);
app.use('/api/savedata', routes.savedata);
app.use('/api/finddata', routes.finddata);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: !config.IS_PRODUCTION ? error : {}
  });
});

app.listen(config.PORT, () =>
  console.log(`Example app listening on port ${config.PORT}!`)
);