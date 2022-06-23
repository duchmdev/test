import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import csrf from "csurf";
const helmet = require("helmet");
var cookieParser = require("cookie-parser");
var session = require("express-session");
import cors from "cors";

require("dotenv").config();

// setup route middlewares
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

let app = express();

//Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)
app.disable("x-powered-by");

// //X-Frame-Options
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));

// parse cookies
// we need this because "cookie" is true in csrfProtection
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.URL_REACT,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

/* Helmet - Secure HTTP Header*/
app.use(
  helmet({
    xssFilter: false,
  })
);

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  //X-Content-Type-Options Header Missing
  res.set("X-Content-Type-Options", "nosniff");

  // Pass to next layer of middleware
  next();
});

//config app
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

viewEngine(app);
initWebRoutes(app);

app.get("/api/auth/csrf-token", csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.status(200).json({ csrfToken: req.csrfToken() });
});

app.post("/process", parseForm, csrfProtection, function (req, res) {
  res.send("data is being processed");
});

connectDB();

let port = process.env.PORT || 8080;

app.listen(port, () => {
  //callback
  console.log("Backend Nodejs is running on the port : " + port);
});
