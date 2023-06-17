const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");


// My routes 
const authRoutes = require("./routes/auth");
const journalRoutes= require("./routes/journal");


//Middlewares
app.use(bodyParser.json({ limit: '500mb' }));
app.use(cookieParser());
app.use(cors());


app.get("/", (req, res) =>
{
  return res.send("this is running");
});

//My Routes
app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);

//PORT
const port = 8000;

//Starting a server
app.listen(8000, () => {
  console.log(`app is running at ${port}`);
});
