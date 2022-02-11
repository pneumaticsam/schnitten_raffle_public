const e = require("express");
const {
    Router,
    json
} = require("express");

const {
    http
} = require('follow-redirects');
const fs = require('fs');
const router = Router();



router.get("/smth", async (req, res) => {

    let resp = sequencise([
        'X-Powered-By',
        'Express',
        'Access-Control-Allow-Origin',
        '*',
        'Content-Type',
        'application/json; charset=utf-8',
        'Content-Length',
        '48',
        'ETag',
        'W/"30-qMrcrhQJRwNH5KqNyXU7m99VL9I"',
        'Date',
        'Thu, 03 Feb 2022 16:46:08 GMT',
        'Connection',
        'close'
    ]);

    //console.log(resp);

});


function getData(fname) {
    let rawdata = fs.readFileSync(`./uat/${fname}`).toString();
    return rawdata.split(',\n');
}

function getJSONData(fname) {
    let rawdata = fs.readFileSync(`./uat/${fname}`).toString();
    return JSON.parse(rawdata);
}

//entry point
router.get("/", async (req, res) => {

    console.log("In here for integration tests...");

    let phoneList = getData("phones.js");
    let addressList = getData("addresses.js");

    // use this for real-life simulation
    //let codeList = getData("codes.js");

    //use this to get more wins
    let codeList = getData("condensedCodes.js");

    let nameList = getJSONData("names.json");

    console.log(phoneList.length);
    //let student = JSON.parse(rawdata);

    let kounter = -1

    while (++kounter < 1000) {

        try {
            //register user
            console.log("Registration...");

            var user = {};
            user.phone = phoneList[kounter];
            user.password = "password";
            data = `{
                "phone": "${user.phone}",
                "password": "${user.password}"
            }`;
            res = await doPost({
                data: data
            });
            console.log("success!!");
            console.log(res.statusCode);

            if (res.statusCode != 201) {

                if (res.statusCode == 400) {
                    console.log("ALREADY EXISTS!!");
                } else {
                    console.log(res);
                    return; //
                }
            }

            if (res.statusCode != 400) {
                let userRegData = JSON.parse(res.body);

                try {
                    //complete registration
                    console.log("Verification...");

                    data = JSON.stringify({
                        "otp": userRegData.otp,
                        "id": userRegData.id
                    });
                    res = await doPost({
                        data: data,
                        options: {
                            path: '/api/users/verify'
                        }
                    });
                    console.log("success!!");
                    console.log(res.statusCode);

                    if (res.statusCode != 201) {
                        console.log(res);
                        return; //
                    }
                    let userVerificationData = JSON.parse(res.body);

                    user.id = userVerificationData.id;
                } catch (er) {
                    console.log(er);
                }
            }
            //login
            console.log("Login...");


            data = `{
                "phone": "${user.phone}",
                "password": "${user.password}"
            }`;
            res = await doPost({
                data: data,
                options: {
                    path: '/api/login'
                }
            });
            if (res.statusCode != 200) {
                console.log(res);
                return; //
            }
            user.accessToken = JSON.parse(res.body).accessToken;


            let doCount = -1,
                docap = Math.ceil(Math.random() * 3);
            //check 3 tickects
            while (++doCount < docap) {




                //     CHECK TICKETS


                console.log("Check codes...");
                let rnd = Math.floor(Math.random() * (codeList.length + 1));

                let e = {
                    code: codeList[rnd]
                };
                //now remove the code from the array
                codeList.splice(rnd, 1);

                data = `{ "rCode": "${e.code}"}`;
                let pd = {
                    data: data,
                    options: {
                        path: '/api/raffle/check',
                        headers: {
                            'Content-Type': 'application/json',
                            authorization: `bearer ${user.accessToken}`
                        }
                    }
                };

                console.log(pd);

                res = await doPost(pd);
                console.log(res);

                if (res.statusCode == 200) {

                    let checkResp = JSON.parse(res.body);

                    if (checkResp.checkID) {
                        //update profile

                        console.log("Update Profile...");

                        let addy = addressList[kounter].split(',');
                        //StreetAddress, SecondaryAddress(apartment, block), ZipCode, City, State, Country

                        let profileData = {
                            firstName: nameList[kounter].f,
                            lastName: nameList[kounter].l,
                            //addressLine1: `${addy[0]} ${addy[1]} ${addy[2]}`,
                            //addressLine2: `${addy[3]} ${addy[4]} ${addy[5]}`,
                            addressLine1: `${addy[3]} ${addy[4]}`,
                            addressLine2: `${addy[5]}`,
                            zipCode: addy[2]
                        };

                        //,
                        data = {
                            profile: profileData,
                            winingID: `${checkResp.checkID}`
                        };
                        let pd = {
                            data: JSON.stringify(data),
                            options: {
                                path: '/api/users/updateprofile',
                                headers: {
                                    'Content-Type': 'application/json',
                                    authorization: `bearer ${user.accessToken}`
                                }
                            }
                        };

                        console.log(pd);

                        res = await doPost(pd);
                        console.log(res);



                    }
                }


            }



        } catch (er) {
            console.error(er);
            res.status(500).send(er.message);
        } finally {
            //await dbClient.close();
        }

    }

    return;
});



// async function to make http request
async function doPost({
    data,
    options,
    callback
}) {
    try {
        console.log('inside doPost()');

        console.log(data);
        console.log(options);
        console.log('===========================');

        let http_promise = doPostAsync({
            data: data,
            options: options,
            callback: callback
        });
        let response_body = await http_promise;

        // holds response from server that is passed when Promise is resolved
        //console.log(response_body);
        return response_body;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}


function doPostAsync({
    data: data,
    options: options,
    callback: callback
}) {

    return new Promise((resolve, reject) => {

        var _options = Object.assign({
            host: 'localhost',
            port: 4200,
            path: '/api/users/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, options);

        console.log('FINAL VALUES:');

        console.log(_options);
        console.log("\n\n\n");


        console.log(data);

        _callback = callback ? callback : function(response) {
            let chunks_of_data = [];

            response.on('data', function(chunk) {
                chunks_of_data.push(chunk)
            });

            response.on('end', async function() {
                let response_body = Buffer.concat(chunks_of_data);

                res = getHttpResponse(response);
                res.body = response_body.toString();

                //console.log(res);
                resolve(res);
            });
        };

        var req = http.request(_options, _callback);

        //console.log(data);
        req.write(data);
        req.end();

    });
}


//plumbing

function getHttpResponse(resp) {
    var res = {};
    [
        "httpVersionMajor",
        "httpVersionMinor",
        "httpVersion",
        "complete",
        "aborted",
        "upgrade",
        "url",
        "method",
        "statusCode",
        "statusMessage"
    ].
    forEach(e => {
        res[e] = resp[e];
    });

    res.headers = sequencise(resp.rawHeaders);
    res.trailers = sequencise(resp.rawTrailers);
    return res;
}

function sequencise(array) {
    var res = [];
    var key = null;
    array.forEach(e => {
        if (key == null) {
            key = e;
        } else {
            let dt = {};
            dt[key] = e
            res.push(dt);
            key = null;
        }
    });
    return res;
}


//============Reporting===============================
module.exports = {
    router
};