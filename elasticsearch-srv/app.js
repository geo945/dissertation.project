require("dotenv").config();
const express = require('express');
const cors = require('cors')

const elasticSearchClient = require ('./elasticsearch/index')
const userRoutes = require('./routes/user')
const { createUserIndex } = require("./utils");

const PORT = process.env.PORT || 3000;
const app = express()

// Middlewares
app.use(express.json());
app.use(cors());

createUserIndex();

// Routes
app.get('/health', (req, res) => {
    elasticSearchClient.ping({}, (error) => {
            if (error) {
                console.error('Elasticsearch is down!', error);
            } else {
                console.log('Elasticsearch is up and running');
            }
        })
        .then(() => res.status(200).json({message: 'Connection to elasticsearch database has been established successfully. Server is up and running!'}))
        .catch((err) => res.status(500).json({error: {message: err.message}}))
});
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});
