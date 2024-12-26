const { Client } = require('@elastic/elasticsearch');
require("dotenv").config();

const elasticSearchClient = new Client({
    node: process.env.ELASTIC_HOST,
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD
    }
});

elasticSearchClient.ping({}, (error) => {
    if (error) {
        console.error('Elasticsearch is down!', error);
    } else {
        console.log('Elasticsearch is up and running.');
    }
});

module.exports = elasticSearchClient