const elasticSearchClient = require("../elasticsearch");

const createUserIndex = async () => {
    try {
        const exists = await elasticSearchClient.indices.exists({ index: 'users' });

        if (!exists) {
            await elasticSearchClient.indices.create({
                index: 'users',
                body: {
                    mappings: {
                        properties: {
                            username: { type: 'text' },
                            firstName: { type: 'text' },
                            lastName: { type: 'text' },
                            email: { type: 'keyword' },
                            age: { type: 'integer' },
                            dateOfBirth: { type: 'date' },
                            isMarried: { type: 'boolean' },
                            addresses: {
                                type: 'nested',
                                properties: {
                                    street: { type: 'text' },
                                    city: { type: 'text' },
                                    country: { type: 'keyword' },
                                    purchaseDate: { type: 'date' },
                                },
                            },
                        },
                    },
                },
            });
            console.log('Index "users" created!');
        } else {
            console.log('Users index already exists. Server started.');
        }
    } catch (error) {
        console.error(`Error while trying to create users index: ${error}`);
    }
};

module.exports = {
    createUserIndex
}