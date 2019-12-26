const db = require('./db');
const Posts = require('./post');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport'); 
const FacebookStrategy = require('passport-facebook').Strategy; //fb
const https = require('https');
const fs = require('fs');

// Make css & img folders public
app.use(express.static(path.join(__dirname + '/public/')));

// view engine setup
// tell the template engine where to find our (templated) html
app.set('views', path.join(__dirname, 'views'));
// use handlebars as the templating engine.
// Express can support most popular templating engines:
app.set('view engine', 'hbs');

// ******************** Initialize middlewares ********************
// body parser setup
// middleware that only parses urlencoded bodies
// only looks at requests (Content-Type header = type option)
app.use(bodyParser.urlencoded({extended: true}));
// middleware that only parses json
// only looks at requests (Content-Type header = type option)
app.use(bodyParser.json());


// ************************ SECOND DRAFT ************************
// enable sessions
const session = require('express-session');
const sessionOptions = {
  secret: 'secret cookie thang (store this elsewhere!)',
  resave: true,
  saveUninitialized: true,
};
app.use(session(sessionOptions));

app.use(passport.initialize()); // after express-session
app.use(passport.session());

// Identify the user of this session & count the number of views (pages) loaded
app.use(function(req, res, next) {
  // Identifying the user of this session
  res.locals.displayName = "";
  if (req.user) {
    res.locals.displayName = req.user.displayName;
  } 
  // Start counting the number of sessions
  if (!req.url.includes('.')) {
    if (req.session.timesAccessed === undefined) {
      req.session.timesAccessed = 1;
    } else {
      req.session.timesAccessed++;
    }
  }
  next();
});

// Passport authenticate - POST
// A redirect is commonly issued after authenticating a request.

app.get('/fb_login', passport.authenticate('facebook'));
app.get('/fb_callback',
  passport.authenticate('facebook', { 
    successRedirect: '/',
    failureRedirect: '/fb_login' 
  })
);
let cID = "451238865774797";
let cSecret = "3543deb1719a788500bfff1ac072ad34";
let cburl = "https://localhost:3000/fb_callback";
if (process.env.NODE_ENV === 'PRODUCTION') {
  cID = "471977113447857";
  cSecret = "3ea3c267109e1fdab14f1b2abd48ddda";
  cburl = "https://linserv1.cims.nyu.edu:27193/fb_callback";
}

passport.use(new FacebookStrategy({
    clientID: cID,
    clientSecret: cSecret,
    callbackURL: cburl
  },
  function(accessToken, refreshToken, profile, done) {
    if (!profile.id) {
      return done(null, false);
    } 
    return done(null, profile);
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));

// credentials used to authenticate a user will only be transmitted during the login request. 
// If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
// Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. 
// In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
passport.serializeUser(function(profile, done) {
  done(null, profile);
});
passport.deserializeUser(function(profile, done) {
  done(null, profile);
});

function changeCaseFirstLetter(params) {
  if(typeof params === 'string') {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }
  return null;
}
// Load my feed (everything OR search-specific)
app.get('/', (req, res) => {
  const queryObj = {};
  //postName not executed anymore.
  if (req.query.postNameQ) {
    queryObj.postName = query.postNameQ;
  }
  if (req.query.postTypeQ) {
    queryObj.postType = changeCaseFirstLetter(req.query.postTypeQ);
  }
  if (req.query.areaQ) {
    queryObj.area = changeCaseFirstLetter(req.query.areaQ);
  }
  Posts.find(queryObj, (err, found) => {
    res.render('home', {authenticated: req.user, found: found,
      timesAccessed: req.session.timesAccessed});
  });
});

function checkAuthenticated(req, res) {
  if (!req.user) {
    res.redirect('/fb_login');
    return false;
  }
  return true;
}

// Create a new post (used to be before .get crerate)
app.post('/create', (req, res) => {
  if (!checkAuthenticated(req, res)) {
    return;
  };
  req.body.user = req.user.id;
  Posts.create(req.body, (err, data) => {
    if (err) {
      res.send(err);
      return;
    }
    res.redirect('/');
  });
});

// Load 'create' page
app.get('/create', (req, res) => {
  if (!checkAuthenticated(req, res)) {
    return;
  };
  res.render('create', {timesAccessed: req.session.timesAccessed});
});

app.get('/mine', (req, res) => {
  if (!checkAuthenticated(req, res)) {
    return;
  };
  const queryObj = {};
  queryObj.user = req.user.id;
  if (req.query.postTypeQ) {
    queryObj.postType = changeCaseFirstLetter(req.query.postTypeQ);
  }
  if (req.query.areaQ) {
    queryObj.area = changeCaseFirstLetter(req.query.areaQ);
  }
  Posts.find(queryObj, (err, found, count) => {
    if (err) {
      // error handling?
    }
    res.render('mine',
        {found: found, timesAccessed: req.session.timesAccessed});
  });
});
// on mine page: delete
app.get('/delete/:postId', (req, res) => {
  if (!checkAuthenticated(req, res)) {
    return;
  };
  req.body.user = req.user.id;
  Posts.deleteOne({_id: req.params.postId}, function(err) {
    res.redirect('/');
  });
});

app.post('/comment', (req, res) => {
  if (!checkAuthenticated(req, res)) {
    return;
  };
  Posts.findOneAndUpdate({_id: req.body.idQ}, {"$push": {comments: req.body.commentQ}},
    function(err, found) {
      res.redirect('/');
  });
});

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(process.env.PORT || 3000);

// app.listen(process.env.PORT || 3000);
console.log('server started!');
