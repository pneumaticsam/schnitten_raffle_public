const { Router, json } = require("express");
const Joi = require("joi");
const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;

const moment = require("moment");
const fs = require("fs");
const pdf = require("../pdfgen");

const router = Router();

router.get("/check?rCode", async (req, res) => {
  const rCode = req.query.rCode;
  if (!rCode) {
    return res.status(401).send("No Code");
  }

  try {
    //log check
    collection = dbClient.connect("raffle").collection("rafflechecks");
    collection.insertOne({
      customer: user.id,
      checkTime: moment().format("YYYY-MM-DD hh:mm:ssss"),
    });
    //count checks

    const kount = await collection.count({
      customer: user.id,
      checkTime: { $gt: moment().day() },
    });

    //if checks within bounds then
    if (kount > process.env.MAX_DAILY_CHECK)
      return res
        .status(401)
        .send("Too many check for today, try again tomorrow");

    //do check
    collection = dbClient.connect("raffle").collection("rafflecodes");
    const hit = await collection.findOne({
      code: rCode,
      category: { $ne: "" },
    });

    const prizes = JSON.parse(process.env.RAFFLE_CATEGORIES);

    console.log(
      `Congratulations, you have won yourself a prize \n Details: ${
        prizes[hit.category]
      }`
    );
  } catch {
  } finally {
  }
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
      rCodes.push({ key: kount, val: { code: rcode, cat: 0 } });
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
  fs.writeFile("raffle_codes.csv", content.toString(), function (err) {
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

module.exports = router;
