
var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var app = express();
var mongoose = require('mongoose');

// mongoose.connect("mongodb://localhost:27017/google-sign",{ useNewUrlParser: true});
// mongoose.connect('mongodb://localhost:27017/google-signin', {useNewUrlParser: true});

// mongoose.connect('mongodb://kriti09:rachana123@ds019836.mlab.com:19836/google-signin');

var mongoDB = 'mongodb://kriti09:rachana123@ds019836.mlab.com:19836/google-signin';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var User = require( './models/user');

// User.create({username : "kriti"}, function(err, data){
//     if(err)
//         console.log(err);
//     else{
//         console.log(data);
//     }
// });

passport.use(new GoogleStrategy({
        clientID: "980216438288-svsa10eeuqsbm24s58ehff5ckgu45t6r.apps.googleusercontent.com",
        clientSecret: "C39odu04mENirBwfkSvChHIS",
        callbackURL: "https://google-sign.herokuapp.com/home"
    },
    function(accessToken, refreshToken, profile, cb) {
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     // return cb(err, user);

        // });
        process.nextTick(function(){
            User.findOne({ googleId: profile.id }, function(err, user){
                if(err){
                    return cb(err);
                }
                if(user){
                    return cb(null, user);
                }else{
                    var newUser = new User();

                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; 

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return cb(null, newUser);
                    });
                }
            })
        })
    }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});



// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
});

app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
        user : req.user // get the user out of session and pass to template
    });
});

app.get('/login',
  function(req, res){
    res.render('login');
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
 });

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/return', 
  passport.authenticate('google', { 
      successRedirect : '/',
      failureRedirect: '/login' 
    }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
app.get("/home", function(req, res){
    console.log(req.user);
    res.redirect('/profile');
});
// app.get('/profile',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('profile', { user: req.user });
//   });
// Midleware--------------------
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
};

app.listen(process.env['PORT'] || 3000, function(){
    console.log("server connected");
});