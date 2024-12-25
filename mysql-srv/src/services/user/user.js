const User = require('../../models/User'); // User model which uses the Sequelize instance

const UserService = {
    insert: async (req, res) => {
        try {
            // Create a new user
            const newUser = await User.create({
                username: 'test33u3ser33',
                email: 'tes33333t3@example.com',
            });

            // Send the newly created user as the response
            res.status(200).json(newUser);
        } catch (err) {
            console.error('Error inserting user:', err);
            res.status(500).json({ message: 'Failed to insert user', error: err.message });
        }
    },
};

module.exports = {
    UserService,
};
