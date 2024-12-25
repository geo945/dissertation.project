const User = require("../../models/user");


const UserService = {
    insert: async (req, res) => {
        try {
            // Create a new user
            const user = new User({
                username: 'test33u3ser33',
                email: 'tes33333t3@example.com',
            });
            const savedUser = await user.save();

            // Send the newly created user as the response
            res.status(200).json(savedUser);
        } catch (err) {
            res.status(500).json({ message: 'Failed to insert user', error: err.message });
        }
    },
};

module.exports = {
    UserService
};