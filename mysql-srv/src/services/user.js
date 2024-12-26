const { Op, Sequelize } = require("sequelize");

const User = require("../models/User");
const Address = require("../models/Address");
const { generateUsers } = require("../../../utils/index");
const sequelize = require('../sequelize/sequelize');

const UserService = {
    insert: async (req, res) => {
        try {
            const numberOfUsers = req.body?.numberOfUsers || 1000;
            const batchSize = 100000;
            const totalBatches = Math.ceil(numberOfUsers / batchSize);
            const usersData = generateUsers(numberOfUsers);
            let totalQueriesTime = 0;

            let currentUserIndex = 0;

            // Loop through each batch and insert users in chunks
            for (let batch = 0; batch < totalBatches; batch++) {
                // Get the current batch of users
                const batchUsers = usersData.slice(currentUserIndex, currentUserIndex + batchSize);

                const users = batchUsers.map(user => ({
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    age: user.age,
                    dateOfBirth: user.dateOfBirth,
                    isMarried: user.isMarried,
                }));

                const transaction = await sequelize.transaction();

                try {
                    const startUserQueryTime = performance.now();

                    const createdUsers = await User.bulkCreate(users, { transaction });

                    const endUserQueryTime = performance.now();

                    totalQueriesTime += endUserQueryTime - startUserQueryTime;

                    console.log(`Batch ${batch}. MySQL Query Completed: users.insert - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

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

                    const startUserAddressQueryTime = performance.now();

                    await Address.bulkCreate(addresses, { transaction });

                    const endUserAddressQueryTime = performance.now();

                    totalQueriesTime += endUserAddressQueryTime - startUserAddressQueryTime;

                    console.log(`Batch ${batch}. MySQL Query Completed: users.address.insert - Duration: ${endUserAddressQueryTime - startUserAddressQueryTime}ms.`);

                    await transaction.commit();

                    currentUserIndex += batchSize;
                } catch (err) {
                    await transaction.rollback();
                    console.error(`Error in batch ${batch + 1}:`, err.message);
                    res.status(500).json({ message: "Failed to insert users", error: err.message });
                    return;
                }
            }

            console.log(`MySQL Total Query Completed: users.insert - Total Insert Duration: ${totalQueriesTime}ms.`);

            res.status(201).json(`${numberOfUsers} users successfully inserted.`);
        } catch (err) {
            res.status(500).json({ message: "Failed to insert users", error: err.message });
        }
    },

    fetchAll: async (req, res) => {
        try {
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
                    as: "addresses",
                    required: true,
                },
            };

            const startUserQueryTime = performance.now();

            const users = await User.findAll({
                include: {
                    model: Address,
                    as: "addresses",
                },
                ...filters
            });

            const endUserQueryTime = performance.now();

            console.log(`MySQL Query Completed: users.fetchAll - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json({
                message: `Fetched ${users.length} users.`,
                count: users.length,
                values: users.slice(0, 10000)
            });
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch all users", error: err.message });
        }
    },

    deleteAll: async (req, res) => {
        try {
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
                    required: true,
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

            const startUserQueryTime = performance.now();

            const result = await User.destroy({
                include: {
                    model: Address,
                    as: 'addresses'
                },
                where: {},
                ...filters
            });

            const endUserQueryTime = performance.now();

            console.log(`MySQL Query Completed: users.deleteAll - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: "Failed to delete users", error: err.message });
        }
    },

    updateMany: async (req, res) => {
        try {
            const filters = {
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
                    model: Address,
                    as: "addresses",
                    where: {
                        country: {
                            [Op.in]: ['USA', 'Canada', 'London', 'Romania', 'Hungary', 'Greece'],
                        },
                        purchaseDate: {
                            [Op.gte]: new Date('2018-01-01'),
                        }
                    },
                    required: true,
                }
            }

            const startUserQueryTime = performance.now();

            const result = await User.update(
                { isMarried: true },
                {
                    where: {},
                    ...filters
                }
            );

            const endUserQueryTime = performance.now();

            console.log(`MySQL Query Completed: users.UpdateMany - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: "Failed to update users", error: err.message });
        }
    },

    aggregate: async (req, res) => {
        try {
            const startUserQueryTime = performance.now();

            const usersByCountry = await Address.findAll({
                attributes: [
                    "country",
                    [Sequelize.fn("AVG", Sequelize.col("user.age")), "averageAge"],
                    [Sequelize.fn("COUNT", Sequelize.col("user.id")), "totalUsers"],
                ],
                include: {
                    model: User,
                    as: "user",
                    attributes: [], // Exclude user details for this query
                },
                group: ["Address.country"],
                order: [[Sequelize.literal("totalUsers"), "DESC"]],
            });

            const endUserQueryTime = performance.now();

            console.log(`MySQL Query Completed: users.Aggregate - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json(usersByCountry);
        } catch (err) {
            res.status(500).json({ message: "Failed to aggregate users", error: err.message });
        }
    },
};

module.exports = {
    UserService,
};
