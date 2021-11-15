const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const port = process.env.PORT || 5000;

// middlewere
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bstay.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('nishProducts');
        const productsCollection = database.collection('products');
        const bookingsCollection = database.collection('bookings');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');



        // GET PRODUCTS API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);


        })
        // GET single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        //post products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)

        });


        // delete products
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await productsCollection.deleteOne(query)
            res.json(result);
        })

        //  get booking api
        app.get('/bookings', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = bookingsCollection.find(query);
            const booking = await cursor.toArray();
            res.send(booking);
        })
        // get admin all bookings

        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);

        });


        // add bookings api
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            booking.createdAt = new Date();
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        })
        // delete/cancel bookings

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query)
            res.json(result);
        })


        //get admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })



        //  users post
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);

        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        // add review 

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            review.createdAt = new Date();
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        // get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);

        });



    }
    finally {
        //    await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello nish products')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})

