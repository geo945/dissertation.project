const elasticSearchClient = require('../elasticsearch/index')

const UserService = {
    insert: async (req, res) => {
        try {
            const username = 'test'
            const email = 'test5@gmail.com'

            // Create a new user in Elasticsearch
            const start = Date.now();
            const createdUser = await elasticSearchClient.index({
                index: 'users',
                body: {
                    username,
                    email,
                },
            });
            const duration = Date.now() - start;
            console.log(`Elasticsearch Query Completed: users.insert - Duration: ${duration}ms`);

            res.status(201).json({
                id: createdUser._id,
                username,
                email,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user', error });
        }
    },
};

module.exports = {
    UserService
};