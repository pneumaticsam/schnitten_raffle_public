//load env vars
require("dotenv").config();

//load modules
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth_router = require("./routes/auth");
const {router:raffle_router} = require("./routes/raffle");
const { login } = require("./auth");
const cron = require('node-cron');
const router = require("./routes/auth");
const dailyReportFn = require('./dailyReport')

app = express();

//ADD MIDDLEWARES
app.use(express.json());
app.use(cors());

//routing
app.use("/api/raffle", raffle_router);
app.use("/api/users", auth_router);

app.post("/api/login", (req, res) => {
  return login(req, res);
});

//start the scheduler

console.log(`CRON SCHEDULE:[${process.env.CRON_SCHEDULE}]`);
cron.schedule(`${process.env.CRON_SCHEDULE}`, () => {
  console.log('running the daily report by 7am everyday');
  dailyReportFn()
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

//dailyReportFn()