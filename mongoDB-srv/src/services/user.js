const User = require("../models/user");
const { generateUsers } = require("../../../utils/index"); // Adjust path as necessary

const UserService = {
    insert: async (req, res) => {
        try {
            // Number of users to generate can be passed in request body or default to 1000
            const numberOfUsers = req.body?.numberOfUsers || 1000;

            // Generate users using the provided function
            const users = generateUsers(numberOfUsers, 900003);

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
            const start = performance.now();

            // Complex filters for age, country, and date of birth
            const filters = {
                $and: [
                    // Age filters: Users aged between 30 and 45, or users aged above 60
                    {
                        $or: [
                            { age: { $gte: 30, $lte: 45 } }, // Between 30 and 45 years
                            { age: { $gte: 60 } } // 60 years and above
                        ]
                    },

                    // Date of Birth filters: Users born before 1980 or after 1990
                    {
                        $or: [
                            { dateOfBirth: { $lte: new Date('1980-01-01') } }, // Born before 1980
                            { dateOfBirth: { $gte: new Date('1990-01-01') } } // Born after 1990
                        ]
                    },

                    // Complex country filter: Users with addresses in 'USA' or 'Canada', but exclude 'UK'
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'] }, // At least one address in 'USA' or 'Canada'
                                purchaseDate: {
                                    $gte: new Date('2018-01-01') // Purchased after January 1, 2018
                                },
                            }
                        }
                    },
                ],
            };

            // Perform the database query with the complex filters
            const users = await User.find(filters);

            const end = performance.now();

            console.log(`MongoDB Query Completed: users.fetchAll - Duration: ${end - start}ms`);

            // Send the fetched users as the response
            res.status(200).json(users);
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
                    // Age filters: Users aged between 30 and 45, or users aged above 60
                    {
                        $or: [
                            { age: { $gte: 30, $lte: 45 } }, // Between 30 and 45 years
                            { age: { $gte: 60 } } // 60 years and above
                        ]
                    },

                    // Date of Birth filters: Users born before 1980 or after 1990
                    {
                        $or: [
                            { dateOfBirth: { $lte: new Date('1980-01-01') } }, // Born before 1980
                            { dateOfBirth: { $gte: new Date('1990-01-01') } } // Born after 1990
                        ]
                    },

                    // Complex country filter: Users with addresses in 'USA' or 'Canada', but exclude 'UK'
                    {
                        addresses: {
                            $elemMatch: {
                                country: { $in: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'] }, // At least one address in 'USA' or 'Canada'
                                purchaseDate: {
                                    $gte: new Date('2018-01-01') // Purchased after January 1, 2018
                                },
                            }
                        }
                    },
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
    },
    Aggregate: async (req, res) => {
        try {
            // Fetch all users from the database
            const start = performance.now()

            const usersByCountry = await User.aggregate([
                { $unwind: "$addresses" },  // Unwind the addresses array to group by country
                { $group: {
                        _id: "$addresses.country",  // Group by country
                        averageAge: { $avg: "$age" }, // Calculate the average age
                        totalUsers: { $sum: 1 }  // Count the total number of users in that country
                    }},
                { $sort: { totalUsers: -1 } }  // Sort by totalUsers in descending order
            ]);
            const end = performance.now()

            console.log(`MongoDB Query Completed: users.aggregate - Duration: ${end-start}ms`);
            // Send the fetched users as the response
            res.status(200).json(usersByCountry);
        } catch (err) {
            res.status(500).json({ message: 'Failed to update users', error: err.message });
        }
    }
};

module.exports = {
    UserService
};
