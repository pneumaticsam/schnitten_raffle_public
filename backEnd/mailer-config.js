//load env vars
require("dotenv").config();

module.exports = {
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken:  process.env.GOOGLE_REFRESH_TOKEN,
    user: process.env.MAIlER_USER, 
    recipient: process.env.MAIlER_RECIPIENT,
}