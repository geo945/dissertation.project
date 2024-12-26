const { Client } = require('@elastic/elasticsearch');

// Connect to Elasticsearch
const elasticSearchClient = new Client({
    node: 'http://localhost:9200', // Elasticsearch URL (docker will expose this port)
    auth: {
        username: 'elastic',
        password: 'admin'
    }
});

elasticSearchClient.ping({}, (error) => {
    if (error) {
        console.error('Elasticsearch is down!', error);
    } else {
        console.log('Elasticsearch is up and running');
    }
});

module.exports = elasticSearchClient