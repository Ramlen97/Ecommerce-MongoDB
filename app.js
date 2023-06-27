require('dotenv').config();
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User=require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('649ad22d71355a461857e7f5')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.e8alx0d.mongodb.net/shop?retryWrites=true&w=majority`)
  .then((result) => {
    console.log('Connected!');
    User.findOne().then(user=>{
      if(!user){
        const user= new User({
          name:'Ram',
          email:'r@gmail.com',
          cart:{
            items:[]
          }
        })
        user.save()
      }
    })    
    app.listen(3000)
  })
  .catch(err => console.log(err));