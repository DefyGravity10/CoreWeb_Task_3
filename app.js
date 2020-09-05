var express = require('express');
//var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var passport = require('passport');
var flash = require('express-flash');
var session = require('express-session');
var methodOverride = require('method-override');

var initializePassport = require('./passport-config');
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);
//var urlencodeParser = bodyParser.urlencoded({extended: false});

var app = express();

var users=[];

app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: 'IamBatman',
    resave: false,                                                               //Dont want to resave session variables if nothing has changed
    saveUninitialized: false                                                     //Dont want to save empty values in sessions
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


app.get('/',checkAuthentication, function(req,res){
    res.render('index.ejs',{ name: req.user.name });
});

app.get('/login', checkNotAuthenticated, function(req,res){
    res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, function(req,res){
    res.render('register.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/register', checkNotAuthenticated, async (req, res) => {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      });
      res.redirect('/login');
      console.log(users);
});

app.delete('/logout', function(req, res)
{
    req.logOut();
    res.redirect('/login');
});
  

function checkAuthentication(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    return res.redirect('/login');
}

function checkNotAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        return res.redirect('/');
    }
    next();
}

app.listen(3000);
console.log('listening to 3000');