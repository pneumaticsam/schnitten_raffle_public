const {
    Router
} = require("express");

const router = Router();
const syncReportFn = require("../reporting/reportSync");

router.post("/sync", async (req, res) => {
    //validation

    try {
        syncReportFn();

        res.status(201).send("done");
    } catch (er) {
        console.error(er);
        res.status(500).send(er.message);
    } finally {
        //await dbClient.close();
    }

});

//============Reporting===============================
module.exports = {
    router
};