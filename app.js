require("dotenv").config();
var express =require("express");
var app = express();
var bodyParser = require("body-parser");
var User = require("./models/user.js");
var Territory = require("./models/territory.js");
var Sword = require("./models/sword.js");
var mongoose = require("mongoose");
var passport    = require("passport");
var LocalStrategy = require("passport-local");
var Admin = require("./models/admin.js");
var flash  = require("connect-flash");

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
mongoose.connect(process.env.DATABASEURL);

//Passport Config
app.use(require("express-session")({
    secret: "Play well",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


//Admin
function adminCreate(){
    var admin = new Admin({
        username: process.env.USERNAME,
        isAdmin: true,
        name: "Administrator"
    });
    Admin.deleteMany({isAdmin: true}, function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Admin deleted.....");
            Admin.register(admin, process.env.PASSWORD,function(err, admin){
               if(err || !admin){
                   console.log(err);
               } else{
                   console.log("Admin created....");
               }
            });
        }
    });
}
adminCreate();

var levels = [{maxcount: 8, count: 0},{maxcount:4, count: 0},{maxcount: 2, count: 0}];
var house = ['stark','bolton','mormont','arryn','baelish','targaryen','crakehall','greyjoy','tully','lannister','baratheon','tyrell','swyft','clegane','tarly','martell'];
//var opponent = ['bolton','stark','arryn','mormont','targaryen','baelish','greyjoy','crakehall','lannister','tully','tyrell','baratheon','clegane','swyft','martell','tarly'];
var opponent = ['baelish','mormont','bolton','lannister','stark','baratheon','greyjoy','crakehall','swyft','arryn','targaryen','clegane','tully','tyrell','martell','tarly'];
function seedDB(){
    User.deleteMany({}, function(err){
        if (err){
            console.log("I couldn't delete...");
            
        }else{
            console.log("Cool..deleted");
            house.forEach(function(h, i){
                var newHouse = new User({
                    name: h,
                    opponent: {
                        name: opponent[i]
                    }
                });
                User.create(newHouse, function(err, newlyCreated){
                    if(err){
                        console.log(err);
                    }
                    else{
                        
                        var newTerritory = new Territory({
                           tnum: i,
                           king: {
                               name: newlyCreated.name
                           }
                        });
                        Territory.deleteMany({tnum: i},function(err){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("Deleted territories...");
                                Territory.create(newTerritory, function(err, newTerritory){
                                    if(err || !newTerritory){
                                        console.log(err);
                                    }else{
                                        newlyCreated.territory.push(newTerritory); 
                                        newlyCreated.save();
                                        console.log(h + " created\n");
                                        console.log(newlyCreated);
                                        console.log(newTerritory);
                                    }
                                });
                            }
                        });
                        
                        
                    }
                });
            });
        }
    });
}
seedDB();

app.get("/:house/:level/:task/levelcomplete", levelCheck,function(req, res){
    User.findOne({name: req.params.house}, function(err, h) {
        if(err || !h){
            console.log(err);
            res.json({fail: "Error Occured"});
        }else{
            if(h.ingame){
               ++h.count;
               ++h.level;
               h.task = ++req.params.task;
                User.findOne({name: h.opponent.name}, function(err, opp){
                    if(err || !opp){
                        console.log(err);
                        res.json({fail: "Error Occured"});
                    }else{
                        opp.ingame=false;
                        opp.save();
                        opp.territory.forEach(function(t, i){
                            t.king.name= h.name;
                            Territory.findOne({tnum: t.tnum}, function(err, ter){
                               if(err || !ter){
                                   console.log(err);
                               } else{
                                   ter.king.name=h.name;
                                   ter.save();
                                   console.log(ter);
                               }
                            });
                           h.territory.push(t); 
                        });
                        h.save();
                        console.log(h);
                        res.json({success: "Congratulations level " + req.params.level + " complete"});
                        
                    }
                }); 
            }else{
                res.json({fail: "You are no more present in the game......"});
            }
            
        }
    });
});

app.get("/:house/:task/taskcomplete", function(req, res){
    User.findOne({name: req.params.house}, function(err, h) {
        if(err || !h){
            console.log(err);
        }else{
            h.task = ++req.params.task;
            h.save();
            console.log(h);
            res.json({success: "Task "+req.params.task+" complete"});
        }
    });
});

app.get("/:house/ingame", function(req, res){
    User.findOne({name: req.params.house}, function(err, h){
        if(err || !h){
            console.log(err);
            res.json({ingame: false});
        }else{
            res.json({ingame: h.ingame});
        }
    });
});

app.get("/:house/currentstat", function(req, res) {
    User.findOne({name: req.params.house}, function(err, h) {
       if(err || !h){
           console.log(err);
           res.json({fail: "Could not find user in db"});
       } else{
           res.json({success: "User found", task: h.task-1, level: h.level, ingame: h.ingame});
           console.log("Request recd "+ " {success: 'User found', task: "+ h.task-1 + ", level: "+ h.level+", ingame: "+h.ingame+"}");
       }
    });
});

app.get("/setopp", isLoggedIn, function(req, res) {
   User.find({ingame: true}, function(err, currentPlayers) {
       if(err || !(currentPlayers)){
           console.log(err);
           res.send("No more players or error in db");
       }else{
           res.render("setopp", {currentPlayers: currentPlayers});
       }
   }); 
});

app.post("/:id/setopp", function(req, res) {
   User.findById(req.params.id, function(err, h){
       if(err || !(h)){
           console.log(err);
           res.send("Could not set opponent\n"+err);
       }else{
           h.opponent.name=req.body.newopp;
           h.save();
           req.flash("success", "Opponent Set Successfully");
           res.redirect("/setopp");
           console.log(h);
       }
   }); 
});



// Web view for database
app.get("/", function(req, res) {
   res.render("login"); 
});

app.post("/login", function(req, res){
   Admin.findOne({username: req.body.username}, function(err, Admin){
        if(err || (!Admin)){
            console.log(err);
            return res.redirect("/");
        }else{
            passport.authenticate("local",
            {
                  successRedirect: "/db",
                  failureRedirect: "/incorrect"
                })(req, res);
        }
        }); 
});

app.get("/db", isLoggedIn,function(req, res) {
    User.find({ingame: true}, function(err, currentPlayers){
        if(err || !(currentPlayers)){
           console.log(err);
           res.send(err);
        }else{
            res.render("dashboard", {currentPlayers: currentPlayers, type: "Current"});
        }
    });
    
});

app.get("/db/kicked", isLoggedIn,function(req, res) {
    User.find({ingame: false}, function(err, kickedPlayers){
        if(err || !(kickedPlayers)){
           console.log(err);
           res.send(err);
        }else{
            res.render("dashboard", {currentPlayers: kickedPlayers, type: "Kicked"});
        }
    });
    
});

app.get("/db/territories", isLoggedIn, function(req, res) {
   Territory.find({}, function(err, territories){
      if(err || !(territories)){
          console.log(err);
          res.send(err);
      } 
   }); 
});

app.get("/resetdb",isLoggedIn, function(req, res) {
    seedDB();
    res.redirect("/db");
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});




//Middleware
//function to increment count of each level if vacant slot available. else send a fail message 
function levelCheck(req, res, next){
    User.findOne({name: req.params.house}, function(err, h) {
        if(err || !h){
            console.log(err);
            res.json({fail: "Error occured"});
        }else{
            if(h.ingame){
                if(levels[req.params.level-1].count<=levels[req.params.level-1].maxcount){
                    levels[req.params.level-1].count++;
                    next();
                }else{
                    h.ingame = false;
                    h.save();
                    res.json({fail: "You are late..."});
                }
            }
            else{
                res.json({fail: "You are no more present in the game......"});
            }
        }
    });
}

//Logged In check
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/");
    }
    
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("App has started");
});