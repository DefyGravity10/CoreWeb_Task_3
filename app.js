var express = require('express');
//var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
//var urlencodeParser = bodyParser.urlencoded({extended: false});

var app = express();

var users=[];

app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}));

app.get('/',function(req,res){
    res.render('index.ejs',{ name: 'KSCK' });
});

app.get('/login', function(req,res){
    res.render('login.ejs');
});

app.get('/register', function(req,res){
    res.render('register.ejs');
});

app.post('/login', function(req,res){

});

app.post('/register', async (req, res) => {
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
  

app.listen(3000);
console.log('listening to 3000');