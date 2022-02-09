//load env vars
require("dotenv").config();

//load modules
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth_router = require("./routes/auth");
const {
    router: raffle_router
} = require("./routes/raffle");
const {
    login
} = require("./auth");
const cron = require('node-cron');
const router = require("./routes/auth");
const dailyReportFn = require('./reporting/dailyReport');

const syncReportFn = require('./reporting/reportSync');

//const sync_router = require("./routes/reportSync");

const {
    router: test_router
} = require("./uat/integration_test");


app = express();

//ADD MIDDLEWARES
app.use(express.json());
app.use(cors());

//routing
app.use("/api/raffle", raffle_router);
//app.use("/api/report", sync_router);
app.use("/api/users", auth_router);
app.use("/api/tests", test_router);

app.post("/api/login", (req, res) => {
    return login(req, res);
});

//start the scheduler
console.log(`CRON SCHEDULE:[${process.env.CRON_DAILY_REPORT_SCHEDULE}]`);
cron.schedule(`${process.env.CRON_DAILY_REPORT_SCHEDULE}`, () => {
    console.log('running the daily report by 7am everyday');
    dailyReportFn();
});

console.log(`Sync CRON SCHEDULE:[${process.env.CRON_REPORT_SYNC_SCHEDULE}]`);
cron.schedule(`${process.env.CRON_REPORT_SYNC_SCHEDULE}`, () => {
    try {
        console.log('running the sync job every 5 mins');
        let kount = syncReportFn();
        console.log(`${kount} items synced!`);
    } catch (er) {
        console.log(er);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

//dailyReportFn()