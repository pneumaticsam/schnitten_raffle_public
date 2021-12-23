const { Router } = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;
const { authenticate } = require("../auth");
const jwt = require("jsonwebtoken");

const router = Router();

const userSchema = Joi.object({
  phone: Joi.string().min(10).required(),
  password: Joi.string().required().alphanum().min(8),
});
const verifySchema = Joi.object({
  otp: Joi.string().min(6).required(),
  id: Joi.string().required().alphanum().min(24),
});
const userProfileSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  addressLine1: Joi.string().min(10).required(),
  addressLine2: Joi.string(),
  zipCode: Joi.string().required().min(4),
});

const dbname= "raffle-db"

router.get("/", (req, res) => {
  dbClient.connect(async (err) => {
    if (err) return console.log(`Could not connect to db ${err}`);
    try {
      const collection = dbClient.db(dbname).collection("customers");
      // perform actions on the collection object
      const users = await collection.find().toArray();
      res.send(users);
    } catch (er) {
      console.error(er);
      res.status(500).send(er.message);
    } finally {
      await dbClient.close();
    }
  });
});

router.post("/register", async (req, res) => {
  //validation

  const { error } = userSchema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const user = {
    phone: req.body.phone,
    password: await bcrypt.hash(req.body.password, 10),
  };

  dbClient.connect(async (err) => {
    if (err) return console.log(`Could not connect to db ${err}`);
    try {

      //make sure that the user does not already exist
      var collection = dbClient.db(dbname).collection("customers");
      const dbUser = await collection.findOne({phone:user.phone});

      if(dbUser){
        const err= `User ${dbUser.phone} already exists!`
        console.log(err)
        return res.status(400).send(err);
      }

      collection = dbClient.db(dbname).collection("registration");

      //generate token for verification

      const token = Math.round(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");

      user.otp = token;

      console.log(user);
      // perform actions on the collection object
      const insertedUser = await collection.insertOne(user);

      res.status(201).send({ otp: token, id: insertedUser.insertedId });
    } catch (er) {
      console.error(er);
      res.status(500).send(er.message);
    } finally {
      await dbClient.close();
    }
  });
});

router.post("/verify", (req, res) => {
  //validation

  const { error } = verifySchema.validate(req.body);

  if (error) {
    console.log(error.details[0].message);
    console.log(req.body);
    return res.status(401).send("UnAuthoried");
  }
  dbClient.connect(async (err) => {
    if (err) return console.log(`Could not connect to db ${err}`);
    try {
      const registrations = dbClient.db(dbname).collection("registration");
      const searchParams = {
        otp: req.body.otp,
        _id: ObjectId(req.body.id),
      };
      console.log(searchParams);
      const user = await registrations.findOne(searchParams);
      console.log(user);
      if (!user) {
        return res.status(401).send("Unauthorised");
      }
      const collection = dbClient.db(dbname).collection("customers");
      // perform actions on the collection object
      const insertedUser = await collection.insertOne({
        phone: user.phone,
        password: user.password,
      });

      return res.status(201).send(insertedUser);
    } catch (er) {
      console.error(er);
      return res.status(500).send(er.message);
    } finally {
      await dbClient.close();
    }
  });
});

router.post("/updateprofile", authenticate, (req, res) => {
  //validation

  const { error } = userProfileSchema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  dbClient.connect(async (err) => {
    if (err) return console.log(`Could not connect to db ${err}`);
    try {
      collection = dbClient.db(dbname).collection("customers");
      // perform actions on the collection object
      //const userid = "61a560c35c11ae6e70e92170";
      const updatedUser = await collection.updateOne(
        { _id: ObjectId(req.user.id) },
        { $set: 
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            zipCode: req.body.zipCode
          }
        }
      );

      //update winning
      if(req.query.winingID){

      collection = dbClient.db(dbname).collection("rafflechecks");
      // perform actions on the collection object
      //const userid = "61a560c35c11ae6e70e92170";
      console.log(req);
      const updatedWining = await collection.updateOne(
        { _id: ObjectId(req.query.winingID) },
        { $set: 
          {
            name: `${req.body.lastName}, ${req.body.firstName}`,
            address:`${req.body.addressLine1} \n ${req.body.addressLine2}`.trim(),
            zipCode: req.body.zipCode
          }
        }
      );

      }




      res.status(200).send(updatedUser);
    } catch (er) {
      console.error(er);
      res.status(500).send(er.message);
    } finally {
      await dbClient.close();
    }
  });
});

module.exports = router;
