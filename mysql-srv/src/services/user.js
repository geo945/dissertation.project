const { Op, Sequelize } = require("sequelize");
const User = require("../models/User"); // Sequelize User model
const Address = require("../models/Address"); // Sequelize Address model
const { generateUsers } = require("../../../utils/index"); // Adjust path as necessary
const sequelize = require('../sequelize/sequelize');

const UserService = {
    insert: async (req, res) => {
        try {
            const numberOfUsers = req.body?.numberOfUsers || 1000;
            const batchSize = 100000; // Set the batch size to 100,000
            const totalBatches = Math.ceil(numberOfUsers / batchSize); // Calculate the number of batches
            const usersData = generateUsers(numberOfUsers, 1);

            const start = performance.now();
            let currentUserIndex = 0;

            // Loop through each batch and insert users in chunks
            for (let batch = 0; batch < totalBatches; batch++) {
                const batchUsers = usersData.slice(currentUserIndex, currentUserIndex + batchSize); // Get the current batch of users

                const users = batchUsers.map(user => ({
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    age: user.age,
                    dateOfBirth: user.dateOfBirth,
                    isMarried: user.isMarried,
                }));

                // Begin a new transaction for this batch
                const transaction = await sequelize.transaction();

                try {
                    // Bulk insert users for the current batch
                    const createdUsers = await User.bulkCreate(users, { transaction });

                    // Prepare address data for the users created in this batch
                    const addresses = [];
                    for (let i = 0; i < createdUsers.length; i++) {
                        const createdUser = createdUsers[i];
                        const userAddresses = batchUsers[i].addresses;

                        for (let j = 0; j < userAddresses.length; j++) {
                            const address = userAddresses[j];
                            addresses.push({
                                userId: createdUser.id, // Associate the address with the created user
                                street: address.street,
                                city: address.city,
                                country: address.country,
                                purchaseDate: address.purchaseDate,
                            });
                        }
                    }

                    // Bulk insert addresses for this batch
                    await Address.bulkCreate(addresses, { transaction });

                    // Commit the transaction for this batch
                    await transaction.commit();

                    // Move to the next batch
                    currentUserIndex += batchSize;

                    console.log(`Batch ${batch + 1} inserted successfully.`);
                } catch (err) {
                    console.log(err)
                    // If any error occurs, rollback the transaction for this batch
                    await transaction.rollback();
                    console.error(`Error in batch ${batch + 1}:`, err.message);
                    res.status(500).json({ message: "Failed to insert users", error: err.message });
                    return; // Exit early if an error occurs
                }
            }

            const end = performance.now();
            console.log(`MySQL Query Completed: users.insert - Duration: ${end - start}ms`);

            res.status(201).json(`${numberOfUsers} Users inserted successfully.`);
        } catch (err) {
            res.status(500).json({ message: "Failed to insert users", error: err.message });
        }
    },

    fetchAll: async (req, res) => {
        try {
            const start = performance.now();

            const filters = {
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { age: { [Op.gte]: 30, [Op.lte]: 45 } },
                                { age: { [Op.gte]: 60 } },
                            ],
                        },
                        {
                            [Op.or]: [
                                { dateOfBirth: { [Op.lte]: '1980-01-01' } },
                                { dateOfBirth: { [Op.gte]: '1990-01-01' } },
                            ],
                        },
                        {
                            // Corrected nested "addresses" filter using raw SQL
                            [Op.and]: [
                                sequelize.literal(
                                    "`addresses`.`country` IN ('USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece')"
                                ),
                                sequelize.literal(
                                    "`addresses`.`purchaseDate` >= '2018-01-01'"
                                ),
                            ],
                        },
                    ],
                },
                include: {
                    model: Address,
                    as: "addresses",  // Make sure this alias matches the alias in your associations
                    required: true,    // Ensures that the query will only return users with matching addresses
                },
            };


            const users = await User.findAll({
                include: {
                    model: Address,
                    as: "addresses",
                },
                ...filters
            });

            const end = performance.now();
            console.log(`MySQL Query Completed: users.fetchAll - Duration: ${end - start}ms`);

            res.status(200).json({
                message: `Fetched ${users.length} users.`,
                first_user: users[0]
            });
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch all users", error: err.message });
        }
    },

    deleteAll: async (req, res) => {
        try {
            const start = performance.now();

            // Build the filters for the main user table
            const filters = {
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { age: { [Op.gte]: 30, [Op.lte]: 45 } },
                                { age: { [Op.gte]: 60 } },
                            ],
                        },
                        {
                            [Op.or]: [
                                { dateOfBirth: { [Op.lte]: '1980-01-01' } },
                                { dateOfBirth: { [Op.gte]: '1990-01-01' } },
                            ],
                        },
                    ],
                },
                include: {
                    model: Address,
                    as: "addresses",
                    required: true,  // Ensures that the query only returns users who have addresses that match the conditions
                    where: {
                        country: {
                            [Op.in]: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece']
                        },
                        purchaseDate: {
                            [Op.gte]: new Date('2018-01-01'),
                        },
                    },
                },
            };

            // Perform the delete query
            const result = await User.destroy({
                include: {
                    model: Address,
                    as: 'addresses'
                },
                where: {}
                // ...filters
            });

            const end = performance.now();
            console.log(`MySQL Query Completed: users.deleteAll - Duration: ${end - start}ms`);

            res.status(200).json(`${result} Users deleted.`);
        } catch (err) {
            res.status(500).json({ message: "Failed to delete users", error: err.message });
        }
    },

    UpdateMany: async (req, res) => {
        try {
            const start = performance.now();

            const result = await User.update(
                { isMarried: true },
                {
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { age: { [Op.between]: [30, 45] } },
                                    { age: { [Op.gte]: 60 } },
                                ],
                            },
                            {
                                [Op.or]: [
                                    { dateOfBirth: { [Op.lte]: new Date("1980-01-01") } },
                                    { dateOfBirth: { [Op.gte]: new Date("1990-01-01") } },
                                ],
                            },
                        ],
                    },
                    include: {
                        model: Address, // The Address model
                        as: "addresses", // The alias used in your association
                        where: {
                            country: {
                                [Op.in]: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'],
                            },
                            purchaseDate: {
                                [Op.gte]: new Date('2018-01-01'),
                            }
                        },
                        required: true, // Ensures that the user has at least one address matching the condition
                    }
                }
            );

            const end = performance.now();
            console.log(`MySQL Query Completed: users.UpdateMany - Duration: ${end - start}ms`);

            res.status(200).json(`${result} Users updated.`);
        } catch (err) {
            res.status(500).json({ message: "Failed to update users", error: err.message });
        }
    },

    Aggregate: async (req, res) => {
        try {
            const start = performance.now();

            const usersByCountry = await Address.findAll({
                attributes: [
                    "country", // Address country attribute
                    [Sequelize.fn("AVG", Sequelize.col("user.age")), "averageAge"], // Average age of users
                    [Sequelize.fn("COUNT", Sequelize.col("user.id")), "totalUsers"], // Total number of users
                ],
                include: {
                    model: User,
                    as: "user", // Ensure the alias is correct for the association, adjust based on your actual association alias
                    attributes: [], // Exclude user details for this query, we don't need them
                },
                group: ["Address.country"], // Group by Address country
                order: [[Sequelize.literal("totalUsers"), "DESC"]], // Order by total users in descending order
            });

            const end = performance.now();
            console.log(`MySQL Query Completed: users.Aggregate - Duration: ${end - start}ms`);

            res.status(200).json(usersByCountry);
        } catch (err) {
            res.status(500).json({ message: "Failed to aggregate users", error: err.message });
        }
    },
};

module.exports = {
    UserService,
};
