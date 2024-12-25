const sequelize = require('../../sequelize/sequelize');
const User = require('../../models/User');

const UserService = {
    insert: async (req, res) => {
        try {
            // Sync all models
            await sequelize.sync({ force: true });
            console.log('Database synced successfully.');

            // Create a sample user
            const newUser = await User.create({
                username: 'testuser',
                email: 'test@example.com',
            });

            res.status(200).send(newUser.toJSON())
        } catch (err) {
            res.status(500).send('Failed to insert user')
            console.error('Error syncing the database:', err);
        } finally {
            await sequelize.close();
        }
    }
}

module.exports = {
    UserService
}