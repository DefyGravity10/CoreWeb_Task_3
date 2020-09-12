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
var Purchase = require('./models/purchase');
const { transformAuthInfo } = require('passport');

var app = express();
var currentUser;
var tempItem;
var cart = [];
var CODE = 0;
var truth;

app.set('view-engine','ejs');
app.use(express.static(__dirname + '/public'));
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
    cart = currentUser.cart;
    var itemList = [], itemsInMarket = [];
    await item.find({owner: currentUser.username}, function(err, obj){
        itemList.push(obj);
    });
    await item.find({}, function(err, obj2){
        itemsInMarket.push(obj2);
    });
    res.render('index.ejs',{ user: currentUser, items: itemList, market: itemsInMarket });
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

app.get('/purchase', checkAuthentication, function(req, res){
    res.render('purchase.ejs');
});

app.get('/purchase/confirm', checkAuthentication, function(req, res){
    res.render('purchase_confirm.ejs', {itemConfirmed: tempItem, quantityRequested: tempQuantity});
});

app.get('/cart', checkAuthentication, function(req, res){
    res.render('cart.ejs', {cart: tempCart});
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
        owner: currentUser.username,
        ownerEmail: currentUser.email,
        code: CODE
    }).save(function(err){
        if(err)
            console.log(err);

        CODE++;
    });
    console.log('Added successfully');
    res.redirect('/');
});

app.post('/updateItem', checkAuthentication, async function(req, res){
    var updateItem = await item.findOneAndUpdate({product: req.body.productName, category: req.body.category}, {product: req.body.newProductName, category: req.body.newCategory, price: req.body.newCost, stock: req.body.newQuantity}, {returnOriginal:false});
    console.log('updated successfully');
    console.log(updateItem);
    res.redirect('/');
});

var tempQuantity, tempCode;

app.post('/purchase', checkAuthentication, async function(req, res){
    var checkStock;
    tempItem = await item.find({code: req.body.code}, function(err, obj){
        checkStock = obj.stock;
        itemId = obj.id;
    });
    tempCode = req.body.code;
    tempQuantity = req.body.quantity;
    if(checkStock==0 || checkStock-req.body.quantity<0)
    {
        res.send('Not Enough Stock Available');
    }
    else{
        res.redirect('/purchase/confirm');
    }
});

app.post('/purchase/confirm', checkAuthentication, async function(req, res){
    var today = new Date();
    var tempStock, tempSeller, tempSellerEmail;
    tempItem = await item.findOne({code: tempCode},function(err, obj){
        tempStock = obj.stock;
        tempSeller = obj.owner;
        tempSellerEmail = obj.ownerEmail;
        console.log(obj);
    });
    var addPurchase = Purchase({
        buyer: currentUser.username,
        buyerEmail: currentUser.email,
        sellerEmail: tempSellerEmail,
        seller: tempSeller,
        quantity: tempQuantity,
        purchaseDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
    }).save();
    var dif = tempStock - tempQuantity;
    var updateQuantity = await item.findOneAndUpdate({code: tempCode}, {stock: dif});
    console.log(tempSeller+''+tempStock);
    res.redirect('/');
});

var tempCart = [];

app.post('/purchase/cart', checkAuthentication, async function(req, res){
    var cartList = [];
    if(truthValue())
    {
        cart.push(tempCode);
        var addToCart = await User.findOneAndUpdate({username: currentUser.username}, {cart: cart});
    }
    console.log(addToCart);
    cart.forEach(async function(entry)
    {
        await item.findOne({code: entry}, function(err, obj){
            cartList.push(obj);
        });
    });
    tempCart = cartList;
    res.redirect('/cart');
});

app.post('/cart', checkAuthentication, async function(req, res){
    var cartList_2 = [];
    for(var i=0;i<cart.length;i++)
    {
        if(cart[i]==req.body.code)
        {
            cart[i]=cart[i+1];
            cart.pop();
        }
    }
    console.log(cart);
    var p = await User.findOneAndUpdate({username: currentUser.username},{cart: cart});
    console.log(p);
    cart.forEach(async function(entry)
    {
        await item.findOne({code: entry}, function(err, obj){
            cartList_2.push(obj);
        });
    });
    tempCart = cartList_2;
    res.redirect('/cart');
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

function truthValue()
{
    for(var i=0;i<cart.length;i++)
    {
        if(cart[i]==tempCode)
            return false;
    }
    return true;
}

app.listen(3000);
console.log('listening to 3000');