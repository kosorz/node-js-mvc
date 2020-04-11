const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGO_DB_URI =
  "mongodb+srv://Arturito:xXUKZ5SKPt6_gQ9@node-training-7n0n7.mongodb.net/shop?retryWrites=true&w=majority";

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
      console.log(err);
    }
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose
  .connect(MONGO_DB_URI)
  .then(async () => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
