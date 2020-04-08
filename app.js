const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("5e8cae08b46d33fc05f33094");
    req.user = user;
    user && next();
  } catch (err) {
    console.log(err);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose
  .connect(
    "mongodb+srv://Arturito:xXUKZ5SKPt6_gQ9@node-training-7n0n7.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then(async () => {
    // const user = new User({
    //   email: "kosorz.artur@gmail.com",
    //   name: "Artur Kosorz",
    //   cart: {
    //     items: [],
    //   },
    // });
    // const saved = await user.save();
    app.listen(3000);
  })
  .catch((err) => console.log(err));
