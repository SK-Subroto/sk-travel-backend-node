const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.e3jxy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('sk-travel');
        const eventsCollection = database.collection('events');
        const bookedEventsCollection = database.collection('booked-events');

        // GET API
        app.get('/events', async (req, res) => {
            const cursor = eventsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let events = [];
            const count = await cursor.count();
            if (page) {
                events = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                events = await cursor.toArray();
            }
            res.send({
                count,
                events
            });
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const event = await eventsCollection.findOne(query);
            res.send(event);
        })
        // POST API
        app.post('/events', async (req, res) => {
            const newEvent = req.body;
            const result = await eventsCollection.insertOne(newEvent);
            res.json(result);
        })


        // POST ORDER API
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await bookedEventsCollection.insertOne(newOrder);
            res.json(result);
        })

        // GET ORDER API
        app.get('/orders', async (req, res) => {
            const cursor = bookedEventsCollection.find({});
            orders = await cursor.toArray();
            res.send(orders);
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const event = await bookedEventsCollection.findOne(query);
            res.send(event);
        })

        // DELETE ORDER API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedEventsCollection.deleteOne(query);
            res.json(result);
        })

        // UPDATE ORDER API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                },
            }
            const result = await bookedEventsCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })
        // DELETE ORDER API
        app.delete('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await eventsCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('This is home');
});

app.get('/test', (req, res) => {
    res.send('This is test');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})