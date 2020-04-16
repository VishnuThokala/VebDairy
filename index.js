var firebase = require("firebase/app");
const express = require("express");
const path = require('path')
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port =  process.env.PORT||3000;
require("firebase/auth");
require("firebase/firestore");
require("firebase/database");
// var uid = 1;
// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
  apiKey: "AIzaSyCidnoUvjND6LTd1EuuE1lanekGzEPpmJE",
  authDomain: "dairyweb-3dca5.firebaseapp.com",
  databaseURL: "https://dairyweb-3dca5.firebaseio.com/",
  storageBucket: "dairyweb-3dca5.appspot.com",
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

app.set('view engine', 'ejs');

app.post('/', (req, res) => {

  var email = String(req.body.email);
  var name = String(req.body.name);
  var password = String(req.body.password);
  var cpassword = String(req.body.cpassword)
if(password==cpassword){
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
    var ref = database.ref("users/" + firebase.auth().currentUser.uid);

    ref.set({
      name: name,
      email: email,
      uid: firebase.auth().currentUser.uid,
    })
    res.render('register' ,{err : {msg : 'successful' , view : true} })
    res.render('login' ,{err :{view : false}});
    
  }).
    catch(function (error) {

      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        res.render('register' ,{err : {msg:'The password is too weak ',view:true}});
      } else {
        res.render('register' ,{err : {msg:errorMessage,view : true}});
      }
     
    });
  }
  else{
    res.render('register' ,{err : {msg:'your password didn\'t match' ,view : true}})
  }

})


app.get('/', (req, res) => {
  res.render('login',{data :{view :false}});
})
app.post('/login', (req, res) => {

  var email = String(req.body.email);
  var password = String(req.body.password);
  if (email.length < 4) {
    res.render('login',{data :{view :true,msg1:'Please enter an email address.'}});
    return;
  }
  if (password.length < 4) {
    res.render('login',{data :{view :true,msg:'Please enter a valid password.'}});
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
    res.sendFile(path.join(__dirname, 'public/dairy.html'));
  }).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode === 'auth/wrong-password') {
      res.render('login',{data :{view :true,msg:'Wrong password.'}});
    } else {
      res.render('login',{data :{view :true,msg:errorMessage}});
    }
  })


})
app.get('/public/register.html', (req, res) => {
  res.render('register',{err :{view : false}});
})
app.post('/login/data', (req, res) => {
  var date = String(req.body.date);
  var title = String(req.body.title);
  var text = String(req.body.text);
  if(firebase.auth().currentUser){
  var ref = database.ref("texts/" + firebase.auth().currentUser.uid + "/" + date);

  ref.set({
    title: title,
    text: text,
  })
  res.sendFile(path.join(__dirname, 'public/dairy.html'))
  }
  else{
    res.render('login',{data :{view : false}})
   
  }
})

app.get('/login/logout', (req, res) => {
  firebase.auth().signOut().then(function () {
    res.render('login',{data :{view :false}});

  }).catch(function (error) {
    res.sendFile(path.join(__dirname, 'public/dairy.html')),
      res.send(error)

  });

})
//to get data of particular user  


app.get('/login/getall/', (req, res) => {
  if(firebase.auth().currentUser){
  var uid = String(firebase.auth().currentUser.uid);
  var query = firebase.database().ref("texts/" + uid + "/");

  query.once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        // console.log(childSnapshot.val());
        var title = childSnapshot.child("title").val();
        var text = childSnapshot.child("text").val();
        var date = "."
        res.render('alldairies', {
          data: {
            signin: true,
            date: date,
            title: title,
            text: text
          }
        });
        return true;
      });
    });
  }
  else{
    res.render('login',{data :{view : false}})
  }
})
//to navigate form dairy to alldairies
app.get('/login/', (req, res) => {
  res.render('alldairies', {
    data: {
      signin: false,
    }
  });
})
app.post('/login/getdata/', (req, res) => {
  var uid = String(firebase.auth().currentUser.uid);
  var date = String(req.body.date);
  var ref = firebase.database().ref("texts/" + uid + "/" + date);
  ref.once("value")
    .then(function (snapshot) {
      var title = snapshot.child("title").val();
      var text = snapshot.child("text").val();
      res.render('alldairies', {
        data: {
          signin: true,
          date: date,
          title: title,
          text: text
        }
      });
    });
})

app.listen(port, () => { console.log(" server running") })





