require("dotenv").config();
const express = require("express");
const cors = require("cors");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let counter = 0;
const Schema = mongoose.Schema;
let urlSchema = new Schema({
  oldLink: { type: String, required: true, unique: true },
  newLink: { type: String, required: true, unique: true },
  counter: { type: Number, required: true, unique: true },
});

const Url = mongoose.model("Url", urlSchema);

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extend: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  res.json({ greeting: fullUrl });
});

app.post("/api/shorturl", function (req, res) {
  if (!/(https?:\/\/[^\s]+)/g.test(req.body.url)) {
    return res.json({ error: "invalid url" });
  }
  Url.findOne({ oldLink: req.body.url }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      if (data === null) {
        let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
        let newLink = `${fullUrl}/${counter}`;
        let newUrl = new Url({
          id: counter,
          oldLink: req.body.url,
          newLink: newLink,
          counter: counter,
        });

        newUrl.save(function (err, data) {
          if (err) {
            console.log(err);
          } else {
            //console.log(data);
            res.json({ original_url: data.oldLink, short_url: data.counter });
            counter++;
          }
        });
      } else {
        //console.log(data[0]);
        res.json({ original_url: data.oldLink, short_url: data.counter });
      }
    }
  });
});

app.get("/api/shorturl/:num?", function (req, res) {
  //res.json({ greeting: req.params.num });
  //console.log(req.params.num);
  Url.findOne({counter: req.params.num},
  function(err, data){
    if(err){
      console.log(err);
    }else{
      //console.log(data.oldLink);
      return res.writeHead(301, {
        Location: data.oldLink
      }).end();
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
