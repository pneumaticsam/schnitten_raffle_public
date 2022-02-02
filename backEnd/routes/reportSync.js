const {
    Router,
    json
} = require("express");
const dbClient = require("../db");

const {
    https
} = require('follow-redirects');

const ObjectId = require("mongodb").ObjectId;

const router = Router();

const dbname = "raffle-db"


router.post("/sync", async (req, res) => {
    //validation

    dbClient.connect(async (err) => {
        if (err) return console.log(`Could not connect to db ${err}`);
        try {

            var collection = dbClient.db(dbname).collection("rafflechecks");

            const darray = await collection.find({
                syncTime: {
                    $exists: false
                }
            }).toArray();

            let kount = 0;

            console.log(`${darray.length} items found`);

            if (darray.length == 0) {

                res.status(200).send("zero items");
                return;
            }

            var sb = "";
            for (const doc of darray) {
                if (doc["lastname"]) {
                    sb += `\n"${++kount}" : "${doc["_id"]}, ${doc["customer"]??""}, ${doc["code"]??""}, ${doc["checkTime"]??""}, ${doc["cat"]??""}, ${doc["lastname"]??""}, ${doc["firstname"]??""}, ${doc["phone"]??""}, ${(doc["address"]??"").replace(/\n/g, '')}, ${doc["zipCode"]??""}", `;
                } else {
                    sb += `\n"${++kount}" : "${doc["_id"]}, ${doc["customer"]??""}, ${doc["code"]??""}, ${doc["checkTime"]??""}, ${doc["cat"]??""}", `;
                }

            }

            sb = `{
        "sheetName": "raffleChecks",
        "headers": "obj_id,customer_id,raffle_code,check_time,cat,lastname,firstname,phone, address, zipcode",
        "data": { \n ${sb.substr(0,sb.length-2)}
      }
    }`;

            await dbClient.close();
            //send data
            console.log(`about to send data [${sb}]`);

            (sb);
            //var url = "https://script.google.com/macros/s/AKfycbwvaoW-65k0g9TvZHnXTYb-flvkxHiWP9Jxo-jhBEe_SVyXYGjYzq9mQ2Aamng4UEG4/exec";
            doPost(sb);

            res.status(201).send("done");
        } catch (er) {
            console.error(er);
            res.status(500).send(er.message);
        } finally {
            //await dbClient.close();
        }
    });
});


// Example POST method implementation:
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'no-cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

function doPost(data) {

    var options = {
        host: 'script.google.com',
        path: '/macros/s/AKfycbwvaoW-65k0g9TvZHnXTYb-flvkxHiWP9Jxo-jhBEe_SVyXYGjYzq9mQ2Aamng4UEG4/exec',
        method: 'POST'
    };

    callback = function(response) {
        var str = ''
        response.on('data', function(chunk) {
            str += chunk;
            //console.log('chunk:' + chunk);
        });

        response.on('end', async function() {
            console.log("Done getting response!");
            console.log(str);
            var jsonResp = JSON.parse(str).inserted;


            dbClient.connect(async (err) => {
                if (err) {
                    console.log(`Could not connect to db ${err}`);
                    resp.desc = "DB error"
                    return res.status(500).send(resp);
                }
            });

            var collection = dbClient.db(dbname).collection("rafflechecks");

            var _ids = [];
            for (const key in jsonResp) {
                if (Object.hasOwnProperty.call(jsonResp, key)) {
                    // console.log(`key is ${key} and index is...`);
                    // console.log(jsonResp[key]);
                    _ids.push(ObjectId(jsonResp[key].id));

                }
            }

            console.log(_ids);

            var queryResp = await collection.updateMany({
                _id: {
                    $in: _ids
                }
            }, {
                $set: {
                    syncTime: new Date().getTime()
                }
            });
            console.log(queryResp);
        });
    }

    var req = https.request(options, callback);
    req.write(data);
    req.end();

}

//============Reporting===============================
module.exports = {
    router
};