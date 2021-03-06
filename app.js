const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const dotenv = require("dotenv");

const errorController = require("./controllers/error");
const User = require("./models/user");

dotenv.config();
const MONGO_DB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@node-training-7n0n7.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDbStore({
  uri: MONGO_DB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "this_is_node_traning_session_secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  if (req.session && req.session.user) {
    let user;
    try {
      user = await User.findById(req.session.user);
      if (user) {
        req.user = user;
        next();
      } else {
        next(new Error("Could not restore User from Session."));
      }
    } catch (err) {
      next(new Error(err));
    }
  } else {
    next();
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose
  .connect(MONGO_DB_URI)
  .then(async () => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
