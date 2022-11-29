var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/user_db');
const { text } = require('body-parser');
const { response } = require('express');
var alert = require('alert');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "My secret Key" }));

app.set('view engine', 'pug');
app.set('views', './views');

var userSchema = mongoose.Schema({
    id: String,
    password: String
});

var User = mongoose.model("User", userSchema);

app.get('/signup', function (req, res) {
    res.render('signup');
});

app.post('/signup', function (req, res) {
    var userInfo = req.body;
    if (!req.body.id || !req.body.password) {
        res.render('signup', { message: "Please provide all the information" });
    }
    else {
        console.log(req.body.id);
        User.findOne({ "id": req.body.id }, { _id: 0, id: 1 }, function (err, response) {
            if (err)
                throw err
            else {
                console.log(response);
                if (response == null) {
                    // res.render('login',{message: "Thank you for signing up, please login now"});
                    var pass = userInfo.password;
                    var buff = new Buffer.from(pass);
                    var base64pass = buff.toString('base64');
                    var newUser = new User({
                        id: userInfo.id,
                        password: base64pass
                    });

                    newUser.save(function (err, User) {
                        if (err) {
                            res.render('signup', { message: "Database Error" });
                        }
                        else {
                            alert("Thank you for signing up, please login now");
                            res.redirect('login');
                            //res.render('login',{message: "Thank you for signing up, please login now"});
                        }
                    });
                }
                else
                    res.render('signup', { message: "User already exists, please try with new user id" });
            }
        });
    }
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    var loginUserInfo = req.body;
    if (!req.body.id || !req.body.password) {
        res.render('login', { message: "Please enter all the required information" });
    }
    else {
        User.findOne({ "id": req.body.id }, function (err, response) {
            if (err)
                throw err;
            else {
                if (response == null) {
                    alert("The User is not matching with our database, please singup if you dont have an account")
                    res.render('login');
                }
                else {
                    var passDecode = response.password;
                    var buffDecode = new Buffer.from(passDecode, 'base64');
                    var base64Decode = buffDecode.toString('ASCII');
                    if (req.body.password == base64Decode) {
                        req.session.userId = req.body.id;
                        //console.log(req.session.userId);
                        res.redirect('landing_page');
                    }
                    else {
                        alert("The password is wrong and please enter the correct password");
                        res.render('login');
                    }
                }
            }
        })
    }
});

app.get('/landing_page', function (req, res) {
    if (req.session.userId == undefined) {
        alert("Please login before you access this page");
        res.redirect('login');
    }
    else
        res.render('landing_page', { message: "Hey " + req.session.userId + ", Welcome to the landing page" });
});

app.post('/landing_page', function (req, res) {
    console.log("Landing page post");
});

app.get('/updatepass', function (req, res) {
    if (req.session.userId == undefined) {
        alert("Please login before you access this page");
        res.redirect('login');
    }
    else
        res.render('updatepass');
});

app.post('/updatepass', function (req, res) {
    if (!req.body.currentpass || !req.body.newpass || !req.body.repeatpass) {
        res.redirect('updatepass');
    }
    else {
        if (req.body.newpass != req.body.repeatpass) {
            alert("The new password and repeat password does not match, please type it correctly");
            res.redirect('updatepass');
        } else {
            if (req.body.currentpass == req.body.newpass) {
                alert("The old password cannot be the new password, please choose differently");
                res.redirect('updatepass');
            } else {
                var pass = req.body.currentpass;
                var buff = new Buffer.from(pass);
                var base64pass = buff.toString('base64');
                var passNewPass = req.body.newpass;
                var buffNewPass = new Buffer.from(passNewPass);
                var base64NewPass = buffNewPass.toString('base64');
                User.find({ "id": req.session.userId, "password": base64pass }, function (err, response) {
                    if (err)
                        throw err
                    else {
                        //console.log(response[0]);
                        if (response[0] == undefined) {
                            alert("The current password does not match with our database");
                            res.redirect('updatepass');
                        }
                        else {
                            User.findOneAndUpdate({ "id": req.session.userId, "password": base64pass }, { "password": base64NewPass }, function (err, response1) {
                                if (err)
                                    throw err
                                else {
                                    alert("The password has been changed successfully");
                                    res.redirect('landing_page');
                                }
                            });
                        }
                    }
                });
            }
        }
    }
});

app.post('/logout', function (req, res) {
    req.session.destroy(function () {
        console.log("User session destroyed");
    });
    alert("Logged off Successfully");
    res.redirect('login');
});

app.listen(3000);