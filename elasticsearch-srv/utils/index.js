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
                            username: { type: 'text' }, // Allows full-text search
                            firstName: { type: 'text' }, // Allows full-text search
                            lastName: { type: 'text' }, // Allows full-text search
                            email: { type: 'keyword' }, // Exact matches, ideal for unique fields
                            age: { type: 'integer' }, // Number field for integer values
                            dateOfBirth: { type: 'date' }, // Date field
                            isMarried: { type: 'boolean' }, // Boolean field
                            addresses: {
                                type: 'nested', // For objects within arrays
                                properties: {
                                    street: { type: 'text' }, // Allows full-text search
                                    city: { type: 'text' }, // Allows full-text search
                                    country: { type: 'keyword' }, // Exact matches
                                    purchaseDate: { type: 'date' }, // Date field
                                },
                            },
                        },
                    },
                },
            });
            console.log('Index "users" created!');
        } else {
            console.log('Users index already exists. Server starting now.');
        }
    } catch (error) {
        console.error(`Error while trying to create users index: ${error}`);
    }
};

module.exports = {
    createUserIndex
}