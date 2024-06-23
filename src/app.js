import express, { json } from 'express';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
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

// validação 
// const userSchema = joi.object({
//     username: joi.string().required();
//     avatar: joi.string().email().required();
//   });

// const tweetSchema = joi.object({
//     username: joi.string().required();
//     avatar: joi.string().required();
// })

app.post("/tweteroo", (req, res) => {
    db.collection("tweets").insertOne({
    }).then(tweets => res.sendStatus(201))
      .catch(err => console.log(err.message))
})

app.get("/tweteroo", (req, res) => {
    db.collection("tweets").find().toArray()
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err.message))
})


const port = process.env.PORT
app.listen(port, () => console.log(`port ${port}`));