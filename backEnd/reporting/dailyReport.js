// const {
//     dailyQuery: query
// } = require("../routes/raffle");

const dbClient = require("../db");

const dbname = "raffle-db"

const mailer = require('nodemailer');
const moment = require('moment');
const {
    google
} = require('googleapis');
const config = require('../mailer-config');
const SMTPTransport = require("nodemailer/lib/smtp-transport");

const OAuth2 = google.auth.OAuth2
const OAuth2_client = new OAuth2(config.clientID, config.clientSecret)

OAuth2_client.setCredentials({
    refresh_token: config.refreshToken
})



const dailyQuery = async function dailyQueryFn() {
    dbClient.connect(async (err) => {
        if (err) {
            console.log(`Could not connect to db ${err}`);
            resp.desc = "DB error"
            return res.status(500).send(resp);
            throw err;
        }
    });

    try {

        //get last reported date range
        const dateRange = {
            endDate: moment().format('YYYY-MM-DD')
        };
        const reportLog = dbClient.db(dbname).collection("reportLog");

        const reports = await reportLog.find({}).sort({
            endDate: -1
        }).limit(1).toArray();

        if (reports.length > 0) {
            dateRange.startDate = moment(reports[0].endDate).format('YYYY-MM-DD');
            dateRange.endDate = moment().format('YYYY-MM-DD');

            if (dateRange.startDate == dateRange.endDate) {
                //return null;
            }
        }

        const collection = dbClient.db(dbname).collection("rafflechecks");

        //count checks

        const query = {
            cat: {
                $exists: true,
                $in: ['A', 'B', 'C', 'D']
            },
            address: {
                $exists: true
            }
        }

        checkTime = {};

        if (dateRange.startDate) {
            checkTime["$gte"] = moment(dateRange.startDate).format('YYYY-MM-DD');
        }

        checkTime = {
            ...checkTime,
            $lt: moment(dateRange.endDate).format('YYYY-MM-DD')
        };

        query["checkTime"] = checkTime;

        const results = await collection
            .find(query)
            .sort({
                cat: 1,
                checkTime: 1
            })
            .toArray();

        console.log(query);
        console.log(`${results.length} items found for daily reporting...`);
        //console.log(results);
        return {
            results,
            dateRange
        };
    } catch (err) {
        console.error(err);
    }

}


const sendDailyReport = async function sendDailyReportFn() {
    const accessToken = OAuth2_client.getAccessToken()

    const transport = mailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: config.user,
            clientId: config.clientID,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken,
            accessToken: accessToken
        }
    })


    const {
        html,
        csv,
        dateRange,
        rowCount
    } = await getReport();
    //console.log(`Html is ${html} and ${csv}`);

    if (!html || html.length == 0) {
        return
    }

    var subject = `Schnitten Daily Report ${moment(dateRange.startDate).format('ddd, MMM DD, yyyy')}`

    if (dateRange.startDate) {
        const daysApart = (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysApart > 1) {
            subject = `Schnitten Daily Report From ${moment(dateRange.startDate).format('ddd, MMM DD, yyyy')} To ${moment(dateRange.endDate).format('ddd, MMM DD, yyyy')} `
        }
    }

    const mail_options = {
        from: config.user,
        to: config.recipient,
        subject: subject,
        html: html,
        attachments: [{
            filename: `${subject}.csv`,
            content: csv
        }]
    }

    try {
        const info = await transport.sendMail(mail_options);
        console.log("Message sent: %s", info.messageId);

        //log reportLog
        const reportLog = dbClient.db(dbname).collection("reportLog");

        var rec = dateRange.startDate ? {
            startDate: dateRange.startDate
        } : {};

        await reportLog.insertOne({
            ...rec,
            endDate: dateRange.endDate,
            rowCount: rowCount,
            logDate: new Date().toISOString()
        });

        console.log('reportLog inserted...');

    } finally {
        transport.close();
    }
    // , function(error, result) {
    //     if (error) {
    //         console.log('Error', error);
    //     } else {
    //         console.log('Success', result);
    //     }
    //     transport.close()
    // })





}


async function getReport() {

    const {
        results,
        dateRange
    } = await dailyQuery();

    if (!results || results.length == 0) {
        console.log('Nothing to report...');
        return {
            html: '',
            csv: '',
            dateRange: dateRange
        }
    }

    var cat = '';
    var count = 0;
    var sb = ''
    var sbCsv = ''
    results.forEach(e => {
        //console.log(e);
        if (cat !== e.cat) {
            //add header Row
            sb += `<div><h1>CATEGORY ${e.cat.toUpperCase()}</h1></div>`

            //then set cat
            cat = e.cat;
            count = 0;
        }
        //add row

        sb += `<div class="row">`

        sb += `<div class="sn" >${++count}</div>`
        sb += `<div class="code" >${e.code}</div>`
        sb += `<div class="name" >${e.lastname}, ${e.firstname}</div>`
        sb += `<div class="address" >${e.address}</div>`
        sb += `<div class="zipcode" >${e.zipCode}</div>`
        sb += `<div class="time" >${e.checkTime}</div>`

        sb += `</div>`

        sbCsv += `"${e.code}","${e.cat}","${e.lastname.replace('\"',"\'")} ${e.firstname.replace('\"',"\'")}","${e.address.replace('\"',"\'")}","${e.zipCode}","${e.checkTime}"\n`

    });

    //console.log(sb);
    //console.log(sbCsv);
    htmlformated = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Report</title>
    <style>
        body{
            display: flex;
            flex-direction: column;
            color: teal;
            font-family: sans-serif;
            font-weight: 700;
            padding: 50px;
        }
        div > h1 {
            color:cadetblue;
            text-align: center; 
            padding: 5px;
        }
        .row{
            display: flex;
    
            border: royalblue;
            border-style: solid;
            border-bottom: unset;
            padding: 5px;
        }
        .row:last-child{
            
            border-bottom:royalblue;
            border-style: solid;
        }
        
        .row > div{
            flex:2;
            padding: 5px;
        }
        .row > .address  {
            flex:4
        } 
           .row > .sn {
            flex:1
        }
      </style>
    </head>
    <body>   ${sb}</body></html>`;
    return {
        html: htmlformated,
        csv: sbCsv,
        dateRange: dateRange,
        rowCount: results.length
    }
}


module.exports = sendDailyReport;