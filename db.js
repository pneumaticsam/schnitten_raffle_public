
//const {Cu} = require("chrome");
const { MongoClient } = require('mongodb');
const uri = process.env.CONNECTIONSTRING
console.log(`DB URI IS ${uri}`)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = client