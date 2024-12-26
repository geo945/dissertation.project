const User = require("../models/user");
const { generateUsers } = require("../../../utils/index"); // Adjust path as necessary

const UserService = {
    insert: async (req, res) => {
        try {
            // Number of users to generate can be passed in request body or default to 1000
            const numberOfUsers = req.body?.numberOfUsers || 1000;

            // Generate users using the provided function
            const users = generateUsers(numberOfUsers);

            const start = performance.now()

            // Insert generated users into MongoDB
            await User.insertMany(users);

            const end = performance.now()
            console.log(`MongoDB Query Completed: users.insert - Duration: ${end-start}ms`);
            // Send the newly created users as the response
            res.status(201).json(`${numberOfUsers} Users inserted  successfully.`);
        } catch (err) {
            res.status(500).json({ message: 'Failed to insert users', error: err.message });
        }
    },
    fetchAll: async (req, res) => {
        try {
            // Fetch all users from the database
            const start = performance.now()

            // Complex filters
            const filters = {
                $and: [
                    { age: { $gte: 25, $lte: 50 } }, // Age between 25 and 50
                    { isMarried: false }, // Only unmarried users
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada'] }, // At least one address in USA or Canada
                                purchaseDate: {
                                    $gte: new Date('2020-01-01'), // Purchased after Jan 1, 2020
                                },
                            },
                        },
                    },
                ],
                $or: [
                    { firstName: /John/i }, // First name contains "John" (case-insensitive)
                    { lastName: /Doe/i }, // OR last name contains "Doe" (case-insensitive)
                ],
            };

            await User.find(filters)

            const end = performance.now()

            console.log(`MongoDB Query Completed: users.fetchAll - Duration: ${end-start}ms`);
            // Send the fetched users as the response
            res.status(200).json(`users fetched`);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch all users', error: err.message });
        }
    },
    deleteAll: async (req, res) => {
        try {
            // Fetch all users from the database
            const start = performance.now()

            // Complex filters
            const filters = {
                $and: [
                    { age: { $gte: 25, $lte: 50 } }, // Age between 25 and 50
                    { isMarried: false }, // Only unmarried users
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada'] }, // At least one address in USA or Canada
                                purchaseDate: {
                                    $gte: new Date('2020-01-01'), // Purchased after Jan 1, 2020
                                },
                            },
                        },
                    },
                ],
                $or: [
                    { firstName: /John/i }, // First name contains "John" (case-insensitive)
                    { lastName: /Doe/i }, // OR last name contains "Doe" (case-insensitive)
                ],
            };

            await User.deleteMany()

            const end = performance.now()

            console.log(`MongoDB Query Completed: users.deleteMany - Duration: ${end-start}ms`);
            // Send the fetched users as the response
            res.status(200).json('users deleted');
        } catch (err) {
            res.status(500).json({ message: 'Failed to delete users', error: err.message });
        }
    },
    UpdateMany: async (req, res) => {
        try {
            // Fetch all users from the database
            const start = performance.now()

            // Complex filters
            const filters = {
                $and: [
                    { age: { $gte: 25, $lte: 50 } }, // Age between 25 and 50
                    { isMarried: false }, // Only unmarried users
                ],
                $or: [
                    { firstName: /First/i }, // First name contains "John" (case-insensitive)
                    { lastName: /Last/i }, // OR last name contains "Doe" (case-insensitive)
                ],
            };

            const result = await User.updateMany(filters, { $set: { isMarried: true } });
            console.log(result)
            const end = performance.now()

            console.log(`MongoDB Query Completed: users.updateMany - Duration: ${end-start}ms`);
            // Send the fetched users as the response
            res.status(200).json('users updated');
        } catch (err) {
            res.status(500).json({ message: 'Failed to update users', error: err.message });
        }
    }
};

module.exports = {
    UserService
};
