const {
    Router,
    json
} = require("express");
const Joi = require("joi");
const dbClient = require("../db");
const {
    authenticate
} = require("../auth");
const ObjectId = require("mongodb").ObjectId;

const moment = require("moment");
const fs = require("fs");
const pdf = require("../pdfgen");
const {
    time
} = require("console");

const router = Router();

const dbname = "raffle-db"
const resp = {
    checkID: "",
    isWin: false,
    desc: ""
};

router.post("/check", authenticate, async (req, res) => {
    const rCode = req.body.rCode;
    if (!rCode || rCode == "") {
        resp.desc = "No code sent"
        return res.status(400).send(resp);
    }

    console.log(`checking for... ${rCode}`)

    dbClient.connect(async (err) => {
        if (err) {
            console.log(`Could not connect to db ${err}`);
            resp.desc = "DB error"
            return res.status(500).send(resp);
        }
    });

    try {

        const collection = dbClient.db(dbname).collection("rafflechecks");
        //check if the code had been checked earlier
        const checkdCode = await collection.findOne({
            code: rCode
        });
        if (checkdCode) {
            console.log(`the code[${rCode}] had been checked earlier`);
            if (checkdCode.customer == req.user.id) {
                if (checkdCode.cat) {
                    const priceDesc = `Congratulations, you have already won with this code!`
                    console.log(priceDesc);
                    resp.checkID = "";
                    resp.desc = priceDesc

                    console.log(resp);
                    return res.status(200).send(resp)
                } else {
                    const priceDesc = `You have already check this code before, it didn't win!`
                    console.log(priceDesc);
                    resp.checkID = "";
                    resp.desc = priceDesc

                    console.log(resp);
                    return res.status(401).send(resp)

                }
            } else {
                resp.desc = `Code [${rCode} has already been ${checkdCode.cat?"claimed":"checked"} by someone else, contact sales if you wish to make a claim]`;
                console.log(resp);
                return res.status(401).send(resp)
            }
        }


        //log check    
        const raffleCheck = {
            customer: req.user.id,
            code: rCode,
            checkTime: moment().format("YYYY-MM-DD hh:mm:ssss"),
        };
        const checkID = await collection.insertOne({
            ...raffleCheck,
            lastUpdate: new Date().getTime()
        });

        //count checks

        const kountQuery = {
            customer: req.user.id,
            checkTime: {
                $gt: moment().startOf('day').format("YYYY-MM-DD hh:mm:ssss")
            },
        };
        const kount = await collection.count(kountQuery);

        console.log(kountQuery)

        console.log(`User ${req.user.name} has checked ${kount} time(s) today`)


        console.log('velocity limit =', process.env.MAX_DAILY_CHECK)
        //if checks within bounds then
        if (kount > process.env.MAX_DAILY_CHECK) {
            console.log('velocity limit!')
            resp.desc = 'Too many check for today, try again tomorrow'
            return res
                .status(401)
                .send(resp);
        }

        //do check
        const hit = await dbClient.db(dbname).collection("rafflecodes").findOne({
            code: rCode,
            cat: {
                $ne: "0"
            },
        });

        if (!hit || hit == 0) {
            console.log('No winning code was found ', hit)
            resp.desc = "Not so lucky this time, try again later"
            return res
                .status(401)
                .send(resp);
        }

        console.log(`found ${hit} winning code!`)

        //check if userprofile is already present
        const dbUser = await dbClient.db(dbname).collection("customers").findOne({
            _id: ObjectId(req.user.id)
        });

        const rfl_update = {
            cat: hit.cat
        };

        if (
            dbUser.lastName && dbUser.lastName != '' &&
            dbUser.firstName && dbUser.firstName != '' &&
            dbUser.addressLine1 && dbUser.addressLine1 != '' &&
            dbUser.zipCode && dbUser.zipCode != ''
        ) {

            rfl_update['name'] = `${dbUser.lastName}, ${dbUser.firstName}`.trim();
            rfl_update['address'] = `${dbUser.addressLine1} \n ${dbUser.addressLine2}`.trim();
            rfl_update['zipCode'] = dbUser.zipCode.trim();
            rfl_update['lastUpdate'] = new Date().getTime();


        }

        //update rafflechecks collection
        var update = await collection.updateOne(raffleCheck, {
            $set: rfl_update
        });

        console.log(update);

        console.log('raffleCheck  updated')


        const priceDesc = `Congratulations, you have won! Details: Category[ ${hit.cat}]`
        console.log(priceDesc);

        console.log(checkID);

        resp.checkID = Object.keys(rfl_update).length > 1 ? "" : checkID.insertedId.toString();
        resp.desc = priceDesc

        console.log(resp);
        return res.status(200).send(resp)

    } catch (err) {
        console.log(err)
        resp.desc = "Error"
        return res.status(500).send(resp)
    } finally {}
});

//=======Admin Stuff=================================

router.get("/rafflecode", async (req, res) => {
    console.log(`${req.query.rCode}, ${req.query.serial}`);
    var filepath = await pdf(req.query.rCode, req.query.serial);

    return filepath ? res.sendFile(filepath) : res.sendStatus(500);
});

const rCodes = [];
router.post("/gencodes", async (req, res) => {
    const raffleCodes = JSON.parse(process.env.RAFFLE_CATEGORIES);
    const categories = raffleCodes;
    const cat_tot_qty = process.env.RAFFLE_CODE_TOTAL;

    const dupKount = 0;

    console.log(`Total raffle code qty is set @ ${cat_tot_qty}`);

    console.log(`generating codes...`);

    for (let kount = 0; kount < cat_tot_qty; kount++) {
        var startTime = moment();
        const rcode = makeid(process.env.RAFFLE_CODE_LENGTH);
        if (rCodes.find((e) => e.val && e.val.rcode == rcode)) {
            kount--;
            dupKount++;
            console.log(`duplicate found`);
        } else {
            rCodes.push({
                key: kount,
                val: {
                    code: rcode,
                    cat: 0
                }
            });
            console.log(
                `Done with item ${kount} in ${moment
          .duration(moment().diff(startTime))
          .asMilliseconds()}`
            );
        }
    }

    console.log(`Done generating! Total ${dupKount} duplicates encountered`);

    console.log(rCodes);

    for (const cat in categories) {
        if (Object.hasOwnProperty.call(categories, cat)) {
            const qty = categories[cat];
            console.log(`Cat ${cat}, Qty ${qty}`);
            for (let kount = 0; kount < qty; kount++) {
                rndIndex = Math.round(Math.random() * cat_tot_qty);
                winCandidate = rCodes.find((x) => x.key == rndIndex);
                if (!winCandidate) {
                    console.log(`Win candidate not found!!!`);
                    kount--;
                    continue;
                }
                if (winCandidate.val.cat == 0) {
                    winCandidate.val.cat = cat;
                } else {
                    kount--;
                    continue;
                }
            }
        }
    }

    var content = rCodes.map((x) => `\n'${x.val.code}', '${x.val.cat}'`);
    // writeFile function with filename, content and callback function
    fs.writeFile("raffle_codes.csv", content.toString(), function(err) {
        if (err) throw err;
        console.log("File is created successfully.");
    });
    console.log("...all done");
});

function makeid(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//=======Admin Stuff=================================

//============Reporting===============================

const dailyQuery = async function dailyQueryFn() {
    dbClient.connect(async (err) => {
        if (err) {
            console.log(`Could not connect to db ${err}`);
            resp.desc = "DB error"
            return res.status(500).send(resp);
        }
    });

    try {

        const collection = dbClient.db(dbname).collection("rafflechecks");

        //count checks

        const query = {
            cat: {
                $exists: true,
                $in: ['A', 'B', 'C', 'D']
            },
            name: {
                $exists: true
            },
            address: {
                $exists: true
            },
            checkTime: {
                $gte: Date(moment().add(-1, 'days').format('YYYY-MM-DD')),
                $lt: Date(moment().format('YYYY-MM-DD'))
            }
        };
        const results = await collection
            .find(query)
            .sort({
                checkTime: 1,
                cat: 1
            })
            .toArray();


        console.log(`${results.length} items found for daily reporting...`);
        console.log(results);
        return results;
    } catch (err) {
        console.error(err);
    }

}


//============Reporting===============================
module.exports = {
    router,
    dailyQuery
};