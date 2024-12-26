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
                            email: { type: 'keyword' }, // Email should be keyword for uniqueness
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
}

module.exports = {
    createUserIndex
}