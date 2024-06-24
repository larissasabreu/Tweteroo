import express, { json } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import Joi from 'joi';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(json());
app.use(cors());


// mongoDb setup
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
mongoClient.connect()
    .then(() => {
        console.log("teste");
        db = mongoClient.db();
    })
    .catch((err) => console.log(err.message))


// schema para a validação dos tweets
const tweetSchema = Joi.object({
    username: Joi.string().required(),
    tweet: Joi.string().required()
    })

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
    db.collection("users").insertOne(
        user
    ).then(res.sendStatus(201))
    .catch(err => console.log(err.message))
})


// get usuário signupado
app.get("/sign-up", (req, res) => {
    const { id } = req.params;
  
    db.collection("users").findOne({ id })
          .then((data) => {
              return res.send(data);
          })
          .catch(() => {
              return res.status(500).send(err)
          })
})

// post Tweets
app.post("/tweets", (req, res) => {
    const tweet = req.body;

    // validação
    const validation = tweetSchema.validate(tweet, {abortEarly: false});
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    } else if (!tweet.username) {
        return res.sendStatus(401)
    }

    // post
    db.collection("tweets").insertOne(
        tweet
    ).then(res.sendStatus(201))
      .catch(err => console.log(err.message))
})



// get tweets
app.get("/tweets", async (req, res) => {

    try {
    const getter = await db.collection("tweets").find().toArray()
    
    res.send(getter)

    } catch (err) {
        return res.send(err)
    }
})

// edit
app.put("/tweets/:id", async (req, res) => {
    const { id } = req.params;
    const tweet = req.body;

    // validação
    const validation = tweetSchema.validate(tweet, {abortEarly: false});
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const result = await db.collection("tweets").updateOne({ _id: new ObjectId(id) },
        {$set: tweet});
        if (result.matchedCount === 0) return res.sendStatus(404);
		res.status(204).send("Tweet editado com sucesso!");
    } catch (error) {
        res.status(404).send(error);
       }
}) 

// delete
app.delete("/tweets/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
		const result = await db.collection("tweets").deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) return res.sendStatus(404);
		res.status(204).send("Tweet deletado com sucesso!");
	} catch (error) {
	  res.status(404).send(error);
	}
  })


const port = process.env.PORT
app.listen(port, () => console.log(`port ${port}`));