
var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var app = express();


  passport.use(new GoogleStrategy({
        clientID: "980216438288-svsa10eeuqsbm24s58ehff5ckgu45t6r.apps.googleusercontent.com",
        clientSecret: "C39odu04mENirBwfkSvChHIS",
        callbackURL: "https://google-sign.herokuapp.com/home"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
        });
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

app.get('/login',
  function(req, res){
    res.render('login');
});
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
 });
app.get('/login/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
app.get("/home", function(req, res){
    res.render("home");
});
// app.get('/profile',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('profile', { user: req.user });
//   });

app.listen(process.env['PORT'] || 3000, function(){
    console.log("server connected");
});