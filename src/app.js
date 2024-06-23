import express, { json } from 'express';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(json());

// mongoDb setup
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
    .then(() => {
        console.log("teste");
        db = mongoClient.db();
    })
    .catch((err) => console.log(err.message))

// Logon
app.post("/sign-up", (req, res) => {
    const user = req.body;
    // validação
    const userSchema = Joi.object({
    username: Joi.string().required(),
    avatar: Joi.string().required()
    });

    const validation = userSchema.validate(user, {abortEarly: false});
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    // post
    db.collection("users").insertOne({
        user
    }).then(users => res.sendStatus(201))
    .catch(err => console.log(err.message))
})

app.get("/sign-up", (req, res) => {
    db.collection("users").find().toArray()
    .then(data => res.send(data))
    .catch(err => res.status(500).send(err.message))
})

// Tweets
app.post("/tweets", (req, res) => {
    const tweet = req.body;
    
    // validação
    const tweetSchema = Joi.object({
    username: Joi.string().required(),
    tweet: Joi.string().required()
    })

    const validation = tweetSchema.validate(tweet, {abortEarly: false});
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    // post
    db.collection("tweets").insertOne({
        tweet
    }).then(tweets => res.sendStatus(201))
      .catch(err => console.log(err.message))
})

app.get("/tweets", (req, res) => {
    db.collection("tweets").find().toArray()
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err.message))
})


const port = process.env.PORT
app.listen(port, () => console.log(`port ${port}`));