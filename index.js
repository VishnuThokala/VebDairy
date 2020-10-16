var express = require('express')
var passport = require('passport')
const request = require('request');
var passportLocalStrategy = require('passport-local').Strategy;
 var ejs = require('ejs');
var User = require('./models/user');
var Dairy = require('./models/dairySchema')
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
var bcrypt = require('bcrypt')
const port = process.env.PORT || 3000;


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        //giving the mail details through which the mail should be sent agfter signed up
        user: 'yourwebdairy@gmail.com',
        pass: 'Vebdairy1428'
    }
});var app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
app.use(express.static(__dirname + '/public/images'));


 
//&useNewUrlParser=true&useUnifiedTopology=false


mongoose.connect('mongodb+srv://vishnu:vishnu@cluster0-fswia.gcp.mongodb.net/test?retryWrites=true&w=majority', 
{ useNewUrlParser: true , useUnifiedTopology:true ,useCreateIndex:true,}).then(() => { console.log("successful db connection") }).catch((err) => { console.log(err) });
mongoose.set('useFindAndModify', false);
app.set("view engine", 'ejs');
app.use(require('express-session')({
    secret: "salt",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new passportLocalStrategy((username, password, done) => {
        User.findUser(username, (err, docs) => {
            if (err) {
                throw err;
            } else if (docs) {
                User.comparePassword(password, docs.password, (err, isMatch) => {
                    if (isMatch) {
                        return done(null, docs);
                    } else {
                        return done(null, false, {
                            message: "Invalid Password",
                        });
                    }
                });
            } else {
                return done(null, false, {
                    message: "User not found",
                });
            }
        });
    })
);
passport.serializeUser((user, done) => {
    done(null, user.id); // check
});
passport.deserializeUser((id, done) => {
    User.findUserById(id, (err, docs) => {
        done(err, docs);
    });
});



app.get('/' ,(req,res)=>{
res.render('login',{data:{view :false }})
})

app.get("/signup?", (req, res)=> {
  res.render("register", { data: { view: false } });
});
app.get('/login', isLoggedIn, function (req, res) {
    res.render('dairy',{ data: { view: false } })
})
app.get('/home', (req, res) => {
    res.render('dairy', { data: { view: false } })

})
app.post("/signup", function (req, res) {

    User.createUser({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        
    }
        , function (err) {
            if (err) {
                res.render('register', { data: { view: true, msg: err } })//if error msg will print
            } else {
                res.render('login', { data: { view: false } });//if correct render to login page
                //sending email after successfully signedup
                const mailOptions = {
                    from: 'yourwebdairy@gmail.com', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Account Created at VebDairy ', // Subject line
                    text: 'Dear '+ req.body.username + ' your account at VebDairy is successfully created ! \n' +
                          ' A Complete Online Dairy making solution for you \n\n' +
                          'Life is like a blank page; it is built up as you go along \n\n' +
                          '    \n\n          '+
                          'ThankYou'
                                 // plain text body
                };
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err)
                        console.log(err)
                    else
                        console.log(info);
                });

            }

        });


});
app.post("/login", function (req, res) {
    
  if (!req.body.username) {
      res.render('login', { data: { view: true, msg1: "Username was not given" } })
  } else {
      if (!req.body.password) {
          res.render('login', { data: { view: true, msg: "Password was not given" } })
      } else {
          passport.authenticate('local', function (err, user, info) {
              if (err) {
                  console.log(err)

                  res.render('login', { data: { view: true, msg: err } })
              } else {
                  if (!user) {
                      res.render('login', { data: { view: true, msg: "Username or password incorrect " } })
                  } else {
                      req.login(user, function (err) {
                          if (err) {
                              console.log(err)
                              res.render('login', { data: { view: true, msg: err } })
                          } else {
                            request('https://favqs.com/api/qotd', { json: true }, (err, result, body) => {
                              if (err) { return console.log(err); }
                              res.render('dairy' ,{data:{view : true ,quote : body.quote.body}});
                            });
                            
                            
                          }
                      })
                  }
              }
          })(req, res);
      }
  }
}
)

app.post('/save', isLoggedIn, (req, res) => {
 
       
    
    if(!req.body.title){
        console.log("title null")
        res.render('dairy',{data:{e1 : "please enter a title for your day "}});
    }
    else if(!req.body.date){
        console.log("date null")
        res.render('dairy',{data:{e2 : "please enter a todays date "}});

    }
    else if(!req.body.main){
        console.log("date null")
        res.render('dairy',{data:{e3 : "NO NO ! COMPLETE YOUR DAY "}});

    }
    else{

        var d = Date(Date.now()); 
        a = d.toString() 
    var myDairy =new Dairy({
        
        title: req.body.title,
        date :req.body.date,
        main : req.body.main,
        writtenby :{
            id:req.user._id,
            username:req.user.username,
        },
        img: req.body.url,
    });
    
            myDairy.save((err)=>{
               
                if(err){
               console.log(err)
                }
                else{
                    console.log("saved successfully");
                    req.user.dairies.push(myDairy);
                    req.user.save();
                    res.render('dairy',{data:{view:false}});
                }
            });
            
        }
    
}) 

app.get('/get' , isLoggedIn ,(req,res)=>{
    res.render('alldairies' ,{data:{view :false }})
})
app.post('/getone',isLoggedIn,(req,res)=>{
    
    User.findById(req.user.id).populate({
        path : 'dairies',
        match : {date:req.body.date},
}).exec(function (err, user) {
        if (err) {
            console.log(err);
        } else {

            res.render('alldairies', { data: { view: true, result: user.dairies } })
        }
    })
    

})
app.get('/getall' ,isLoggedIn,(req,res)=>{
    User.findById(req.user.id).populate(
        {
        path:"dairies", 
        options: { sort:{ 'date': -1 }}}).exec(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            res.render('alldairies',{data:{view:true , result:user.dairies }})
        }
    })
    

})
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  } else {
      res.redirect('/');
  }

}
app.get("/logout", function (req, res) {
    req.logout();
    res.render('login', { data: { view: false } });
});

//forgot password
app.get("/forgotpassword", function (req, res) {
    res.render('forgotPassword', { data: { view: false } });
})
app.post("/newPassword", function (req, res) {
    User.findOne({
        email
            : req.body.email
    }, (err, user) => {
        if (err) {
            console.log(err);
            res.render('forgotPassword', { data: { view: true, msg: err } });

        }
        else {
            if (user) {

                var token = randomstring.generate();

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function (err) {
                    if (err) {
                        console.log(err)
                    }
                });

                //sending email after successfully signedup
                const mailOptions = {
                    from: 'yourwebdairy@gmail.com', // sender address
                    to: user.email, // list of receivers
                    subject: 'Password Reset link has been shared to you !', // Subject line
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
                        'A Complete Online Dairy making solution for you \n\n' +
                        'Life is like a blank page; it is built up as you go along \n\n' +
                        '    \n\n  '+
                        'ThankYou'
                                   
                                   
                };
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err)
                        console.log(err)
                    else
                        console.log(info);
                });
                res.render('forgotPassword', { data: { view: true, msg: "mail has been sent to " + user.email } });
            }
            else {

                res.render('forgotPassword', { data: { view: true, msg: "user not found" } });
            }
        }
    })
})
app.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {

            return res.redirect('/forgot');
        }
        res.render('newPassword', {
            user: user
        });
    });
})
app.post('/updatePassword/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        console.log(user);
        if (!user) {
            throw err
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        bcrypt.genSalt(10, function (err, salt) {
            if (err)
                console.log(err)
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash;
                user.save(function (err) {
                    if (err) {
                        console.log(err)

                    }
                    else {
                        const mailOptions = {
                            from: 'yourwebdairy@gmail.com', // sender address
                            to: user.email, // list of receivers
                            subject: 'Password Updataion', // Subject line
                            text: 'Your Password for the account ' + user.username +' has been sucessfully updated \n\n'+
                                 'A Complete Online Dairy making solution for you \n\n' +
                                 'Life is like a blank page; it is built up as you go along \n\n' +
                                 '     \n\n    '+
                                 'ThankYou'
                        };
                        transporter.sendMail(mailOptions, function (err, info) {
                            if (err)
                                console.log(err)
                            else
                                console.log(info);
                        });
                        res.render('login', { data: { view: false } });
                    }
                });

            });
        });
    });
});
app.listen(port, () => { console.log(" server running") })


