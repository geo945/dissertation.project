const User = require("../models/user");
const { generateUsers } = require("../../../utils/index"); // Adjust path as necessary

const UserService = {
    insert: async (req, res) => {
        try {
            const numberOfUsers = req.body?.numberOfUsers || 1000;
            const users = generateUsers(numberOfUsers, 1);
            const CHUNK_SIZE = 200000;
            let totalQueriesTime = 0;

            for (let i = 0; i < users.length; i += CHUNK_SIZE) {
                const chunk = users.slice(i, i + CHUNK_SIZE);

                const startUserQueryTime = performance.now();

                await User.insertMany(chunk);

                const endUserQueryTime = performance.now();

                totalQueriesTime += endUserQueryTime - startUserQueryTime;
            }

            console.log(`MongoDB Query Completed: users.insert - Duration: ${totalQueriesTime}ms.`);

            res.status(201).json({
                message: `${numberOfUsers} users successfully inserted.`,
                totalQueryTime: `${totalQueriesTime}ms`,
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to insert users', error: err.message });
        }
    },

    fetchAll: async (req, res) => {
        try {
            const filters = {
                $and: [
                    {
                        $or: [
                            { age: { $gte: 30, $lte: 45 } },
                            { age: { $gte: 60 } }
                        ]
                    },
                    {
                        $or: [
                            { dateOfBirth: { $lte: new Date('1980-01-01') } },
                            { dateOfBirth: { $gte: new Date('1990-01-01') } }
                        ]
                    },
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'] },
                                purchaseDate: {
                                    $gte: new Date('2018-01-01')
                                },
                            }
                        }
                    },
                ],
            };

            const startUserQueryTime = performance.now();

            const users = await User.find(filters);

            const endUserQueryTime = performance.now();

            console.log(`MongoDB Query Completed: users.fetchAll - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json({
                message: `Fetched ${users.length} users.`,
                totalQueryTime: `${endUserQueryTime - startUserQueryTime}ms`,
                count: users.length,
                values: users.slice(0, 1000)
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch all users', error: err.message });
        }
    },

    deleteAll: async (req, res) => {
        try {
            const filters = {
                $and: [
                    {
                        $or: [
                            { age: { $gte: 30, $lte: 45 } },
                            { age: { $gte: 60 } }
                        ]
                    },
                    {
                        $or: [
                            { dateOfBirth: { $lte: new Date('1980-01-01') } },
                            { dateOfBirth: { $gte: new Date('1990-01-01') } }
                        ]
                    },
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'] },
                                purchaseDate: {
                                    $gte: new Date('2018-01-01')
                                },
                            }
                        }
                    },
                ],
            };

            const startUserQueryTime = performance.now();

            const result = await User.deleteMany(filters);

            const endUserQueryTime = performance.now();

            console.log(`MongoDB Query Completed: users.deleteAll - Duration: ${endUserQueryTime-startUserQueryTime}ms.`);

            res.status(200).json({
                message: `Deleted ${result.deletedCount} users.`,
                totalQueryTime: `${endUserQueryTime-startUserQueryTime}ms`
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to delete users', error: err.message });
        }
    },

    updateMany: async (req, res) => {
        try {
            const filters = {
                $and: [
                    {
                        $or: [
                            { age: { $gte: 30, $lte: 45 } },
                            { age: { $gte: 60 } }
                        ]
                    },
                    {
                        $or: [
                            { dateOfBirth: { $lte: new Date('1980-01-01') } },
                            { dateOfBirth: { $gte: new Date('1990-01-01') } }
                        ]
                    },
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'] },
                                purchaseDate: {
                                    $gte: new Date('2018-01-01')
                                },
                            }
                        }
                    },
                ],
            };

            const startUserQueryTime = performance.now();

            const result = await User.updateMany(filters, { $set: { isMarried: true } });

            const endUserQueryTime = performance.now();

            console.log(`MongoDB Query Completed: users.updateMany - Duration: ${endUserQueryTime-startUserQueryTime}ms.`);

            res.status(200).json({
                message: `Updated ${result.modifiedCount} users.`,
                totalQueryTime: `${endUserQueryTime-startUserQueryTime}ms`
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to update users', error: err.message });
        }
    },

    aggregate: async (req, res) => {
        try {
            const startUserQueryTime = performance.now();

            const usersByCountry = await User.aggregate([
                { $unwind: "$addresses" },
                { $group: {
                        _id: "$addresses.country",
                        averageAge: { $avg: "$age" },
                        totalUsers: { $sum: 1 }
                    }},
                { $sort: { totalUsers: -1 } }
            ]);

            const endUserQueryTime = performance.now();

            console.log(`MongoDB Query Completed: users.aggregate - Duration: ${endUserQueryTime-startUserQueryTime}ms.`);

            res.status(200).json({
                totalQueryTime: `${endUserQueryTime-startUserQueryTime}ms`,
                data: usersByCountry
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to update users', error: err.message });
        }
    }
};

module.exports = {
    UserService
};
