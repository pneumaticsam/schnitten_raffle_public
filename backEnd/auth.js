const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//const Joi = require("joi");
const dbClient = require("./db");
const { compile } = require("joi");

const authenticate = function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  console.log(`AuthHeader = ${authHeader}`)

  const token = authHeader && authHeader.split(" ")[1];

  console.log(`JWT Token is ${token}`)

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err){
      console.log('Error verifying jwt:', err)
      return res.sendStatus(403);
    }
    console.log('JWT verified successfully, user:', data)
    req.user = data;
    next();
  }); 
};

const dbname = "raffle-db";

const login = function login(req, res) {
  //validation

  dbClient.connect(async (err) => {
    if (err) return console.log(`Could not connect to db ${err}`);
    try {
      const collection = dbClient.db(dbname).collection("customers");
      // perform actions on the collection object
      //const userid = ObjectId("61a5e17d2d76d9824c001d11");
      console.log({ phone: req.body.phone })
       console.log(req.body)
     const user = await collection.findOne({ phone: req.body.phone });
      console.log(user)
      if (!user) {
       console.log("User not found")
        return res.status(401).send('Phonenumber or password incorrect');

      }
      if (!bcrypt.compareSync(req.body.password, user.password))
      {
        console.log("Password mismatch")
        return res.status(401).send('Phonenumber or password incorrect');
      }

      const jwtUser = { name: user.phone, id: user._id };
      const jwtToken = jwt.sign(jwtUser, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).send({ accessToken: jwtToken });
    } catch (er) {
      console.error(er);
      res.status(500).send(er.message);
    } finally {
      await dbClient.close();
    }
  });
}

module.exports = {authenticate, login};
