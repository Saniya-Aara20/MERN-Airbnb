if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const ejsMate = require("ejs-mate");

const expressLayouts = require('express-ejs-layouts');
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");


const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const localStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

app.use(expressLayouts);

app.set('layout', 'layouts/boilerplate'); // Default layout



const dbUrl = process.env.ATLASDB_URL;


async function main() {
    await mongoose.connect(dbUrl);
};

main().then(() => console.log("connected to db")).catch((err) => console.log(err));


const path = require("path");
const methodOverride = require("method-override");
const req = require("express/lib/request.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const passport = require('passport');
const session = require('express-session');



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },

    touchAfter: 24 * 3600,
});

store.on("error", () => { console.log("mongo session store", err); });

const sessionOptions = {

    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());   //store user info in session
passport.deserializeUser(User.deserializeUser()); //remove user info from session

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    //console.log(req.user);
    res.locals.currUser = req.user || null;  // Fallback to null if no user


    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
//     const registeredUser = await User.register(fakeUser, "helloworld"); //register is a static method and 2nd is password
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
//matches all  incoming reqs
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;

    //res.status(statusCode).send(message);

    res.status(statusCode).render("error.ejs", { err });
})

app.listen(8040, () => {
    console.log("Server is listening to port 8040");
});

