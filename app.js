var express = require('express');
var bcrypt = require('bcrypt');
var passport = require('passport');
var flash = require('express-flash');
var session = require('express-session');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
const LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
const  {check, validationResult} = require('express-validator');

mongoose.connect('mongodb+srv://DefyGravity10:Batsy@cluster0.zmrms.gcp.mongodb.net/Storage_01?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);



var User = require('./models/user');
var item = require('./models/items');

var app = express();
var currentUser;


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
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride('_method'));

app.get('/',checkAuthentication, async function(req,res){
    currentUser = req.user;
    var itemList = [];
    itemList = await item.find({owner: currentUser.username});
    res.render('index.ejs',{ user: currentUser, items: itemList });
});

app.get('/login', checkNotAuthenticated, function(req,res){
    res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, function(req,res){
    res.render('register.ejs');
});

app.get('/addItem', checkAuthentication, function(req, res){
    res.render('items_add.ejs');
});

app.get('/updateItem', checkAuthentication, function(req, res){
    res.render('items_update.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/register', [
    check('password').isLength({min: 5}),
    check('password').isAlphanumeric()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

      var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        userType: req.body.type
      });
      User.register(newUser, req.body.password, function(err, user){
        if(err)
        {
            console.log(err);
            res.redirect('/register');
        }
        passport.authenticate('local')(req, res, function(){
            user.save();
            res.redirect('/login');
        });
      });
});

app.post('/addItem', checkAuthentication, function(req,res){
    var itemAdd = item({
        product: req.body.productName,
        price: req.body.price,
        category: req.body.productCategory,
        stock: req.body.stock,
        owner: currentUser.username
    }).save();
    console.log('Added successfully');
    res.redirect('/');
});

app.post('/updateItem', checkAuthentication, async function(req, res){
    var updateItem = await item.findOneAndUpdate({product: req.body.productName, category: req.body.category}, {product: req.body.newProductName, category: req.body.newCategory, price: req.body.newCost, stock: req.body.newQuantity}, {returnOriginal:false});
    console.log('updated successfully');
    console.log(updateItem);
    res.redirect('/');
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