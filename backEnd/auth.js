const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//const Joi = require("joi");
const dbClient = require("./db");

const authenticate = function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) res.sendStatus(403);

    req.user = data;
    next();
  });
};

const login = function login(req, res) {
  //validation

  dbClient.connect(async (err) => {
    if (err) return console.log(`Could not connect to db ${err}`);
    try {
      const collection = dbClient.db("raffle").collection("customers");
      // perform actions on the collection object
      //const userid = ObjectId("61a5e17d2d76d9824c001d11");
      console.log({ phone: req.body.phone })
       console.log(req.body)
     const user = await collection.findOne({ phone: req.body.phone });
      console.log(user)
      if (!user) return res.sendStatus(401);
      if (!bcrypt.compareSync(user.password, user.password))
        return res.sendStatus(401);

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
