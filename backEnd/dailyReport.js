const {
    dailyQuery: query,
    dailyQuery
} = require("./routes/raffle");
const mailer = require('nodemailer');
const moment = require('moment');
const {
    google
} = require('googleapis');
const config = require('./mailer-config')

const OAuth2 = google.auth.OAuth2
const OAuth2_client = new OAuth2(config.clientID, config.clientSecret)

OAuth2_client.setCredentials({
    refresh_token: config.refreshToken
})


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
        csv
    } = await getReport();
    console.log(`Html is ${html} and ${csv}`);

    if (!html || html.length == 0) {
        return
    }

    const subject = `Schnitten Daily Report ${moment().format('ddd, MMM DD, yyyy')}`
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

    transport.sendMail(mail_options, function(error, result) {
        if (error) {
            console.log('Error', error);
        } else {
            console.log('Success', result);
        }
        transport.close()
    })





}


async function getReport() {

    results = await query();

    if (!results || results.length == 0) {
        console.log('Nothing to report...');
        return {
            html: '',
            csv: ''
        }
    }

    var cat = '';
    var count = 0;
    var sb = ''
    var sbCsv = ''
    results.forEach(e => {
        console.log(e);
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

    console.log(sb);
    console.log(sbCsv);
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
        csv: sbCsv
    }
}


module.exports = sendDailyReport;