const dbClient = require("../db");

const {
    https
} = require('follow-redirects');

const ObjectId = require("mongodb").ObjectId;

const dbname = "raffle-db"

const fs = require("fs");

const syncReport = function doSync(opt) {


    dbClient.connect(async (err) => {
        if (err) return console.log(`Could not connect to db ${err}`);
        try {

            var collection = dbClient.db(dbname).collection("rafflechecks");

            const darray = await collection.find({
                $or: [{
                        finalSyncTime: {
                            $exists: false
                        }
                    },
                    {
                        $where: "this.finalSyncTime <= this.lastUpdate"
                    }
                ]
            }).limit(50).toArray();

            let kount = 0;

            console.log(`${darray.length} items found`);

            if (darray.length == 0) {

                //res.status(200).send("zero items");
                return 0;
            }

            var sb = "";
            for (const doc of darray) {
                let op = "I";
                if (doc["finalSyncTime"] && doc["lastUpdate"] >= doc["finalSyncTime"]) {
                    op = "U";
                }
                if (doc["lastname"]) {
                    sb += `\n"${++kount}-${op}" : "${doc["_id"]},${doc["customer"]??""},${doc["phone"]??""},${doc["code"]??""},${getDate(doc["checkTime"])??""},${doc["cat"]??""},${doc["lastname"]??""},${doc["firstname"]??""},${(doc["address"]??"").replace(/\n/g, '')},${doc["zipCode"]??""}",`;
                } else {
                    sb += `\n"${++kount}-${op}" : "${doc["_id"]},${doc["customer"]??""},${doc["phone"]??""},${doc["code"]??""},${getDate(doc["checkTime"])??""},${doc["cat"]??""}",`;
                }

            }

            sb = `{
        "sheetName": "raffleChecks",
        "headers": "obj_id,customer_id,phone,raffle_code,check_time,cat,lastname,firstname, address, zipcode",
        "data": { \n ${sb.substr(0,sb.length-1)}
      }
    }`;

            if (opt && opt.useSimulatedDates) {
                setDate();
            }
            await dbClient.close();
            //send data
            console.log(`about to send data [${sb}]`);

            (sb);
            //var url = "https://script.google.com/macros/s/AKfycbwvaoW-65k0g9TvZHnXTYb-flvkxHiWP9Jxo-jhBEe_SVyXYGjYzq9mQ2Aamng4UEG4/exec";
            doPost(sb);

            console.log("done");
            return darray.length;
        } catch (er) {
            console.error(er);
            // res.status(500).send(er.message);
        } finally {
            //await dbClient.close();
        }
        return 0;
    });


}

currentSimDate = null;


function setDate() {
    if (currentSimDate) {
        fs.writeFileSync("./dateOffset.txt", currentSimDate.toISOString());
        currentSimDate = null;
    }
}

function getDate(_oldDate) {
    if (!opt || !opt.useSimulatedDates) {
        return new Date(_oldDate.replace(/-/g, '/').split(' ')[0]).toISOString();
    }
    if (!currentSimDate) {
        try {
            _dateOffset = fs.readFileSync("./dateOffset.txt").toString();
            dateOffset = new Date(_dateOffset);
        } catch (err) {
            //_olddate = _olddate ? _oldDate : new Date().toISOString();
            console.log(`OLD DATE IS ${_oldDate.replace(/-/g,'/')}`);
            oldDate = new Date(_oldDate.replace(/-/g, '/').split(' ')[0]);
            console.log(`OLD DATE IS ${oldDate}`);
            day = new Date(oldDate.getFullYear(), oldDate.getMonth() - 6, oldDate.getDate() + 1);
            dateOffset = day;
            console.log(`DATEOFFSET IS ${day}`);
            fs.writeFileSync("./dateOffset.txt", dateOffset.toISOString());
        }
        currentSimDate = dateOffset;
    }
    var addMins = Math.floor(Math.random() * 1170);
    currentSimDate = new Date(currentSimDate.getTime() + addMins * 6000);
    return currentSimDate.toISOString();
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
            var inserted_ids = JSON.parse(str).inserted;
            var updated_ids = JSON.parse(str).updated;


            dbClient.connect(async (err) => {
                if (err) {
                    console.log(`Could not connect to db ${err}`);
                    resp.desc = "DB error"
                    return res.status(500).send(resp);
                }
            });

            var collection = dbClient.db(dbname).collection("rafflechecks");

            var i_ids = [];
            var u_ids = [];
            for (const key in inserted_ids) {
                if (Object.hasOwnProperty.call(inserted_ids, key)) {
                    // console.log(`key is ${key} and index is...`);
                    // console.log(jsonResp[key]);
                    i_ids.push(ObjectId(inserted_ids[key].id));

                }
            }

            for (const key in updated_ids) {
                if (Object.hasOwnProperty.call(updated_ids, key)) {
                    // console.log(`key is ${key} and index is...`);
                    // console.log(jsonResp[key]);
                    u_ids.push(ObjectId(updated_ids[key].id));

                }
            }
            console.log(i_ids);

            console.log(u_ids);

            var queryResp = await collection.updateMany({
                _id: {
                    $in: i_ids
                }
            }, {
                $set: {
                    initialSyncTime: new Date().getTime(),
                    finalSyncTime: new Date().getTime()
                }
            });
            console.log(queryResp);

            queryResp = await collection.updateMany({
                _id: {
                    $in: u_ids
                }
            }, {
                $set: {
                    finalSyncTime: new Date().getTime()
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
module.exports = syncReport;