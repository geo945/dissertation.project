const elasticSearchClient = require('../elasticsearch/index');
const { generateUsers } = require("../../utils/index"); // Adjust path as necessary

const UserService = {
    insert: async (req, res) => {
        try {
            // Number of users to generate can be passed in request body or default to 1000
            const numberOfUsers = req.body?.numberOfUsers || 1000;

            // Generate users using the provided function
            const users = generateUsers(numberOfUsers);

            // Bulk insert users into Elasticsearch
            const chunkSize = 200000;
            for (let i = 0; i < users.length; i += chunkSize) {
                const chunk = users.slice(i, i + chunkSize);

                // Prepare bulk operations for the current chunk
                const bulkOperations = chunk.flatMap(user => [
                    { index: { _index: 'users', _id: user.id } },
                    user,
                ]);

                // Execute the bulk operation for the current chunk
                const start = performance.now();
                await elasticSearchClient.bulk({ refresh: true, body: bulkOperations });
                const end = performance.now();
                console.log(`Inserted ${i + chunk.length}/${users.length} users. Chunk ${i} Elasticsearch Query Completed: users.insert - Duration: ${end - start}ms`);
            }

            res.status(201).json(`${numberOfUsers} Users inserted successfully.`);
        } catch (err) {
            res.status(500).json({ message: 'Failed to insert users', error: err.message });
        }
    },

    fetchAllWithFilters: async (req, res) => {
        try {
            const start = performance.now();

            // Construct complex filters using Elasticsearch's query DSL
            const filters = {
                bool: {
                    must: [
                        {
                            bool: {
                                should: [
                                    { range: { age: { gte: 30, lte: 45 } } },
                                    { range: { age: { gte: 60 } } }
                                ]
                            }
                        },
                        {
                            bool: {
                                should: [
                                    { range: { dateOfBirth: { lte: '1980-01-01' } } },
                                    { range: { dateOfBirth: { gte: '1990-01-01' } } }
                                ]
                            }
                        },
                        {
                            nested: {
                                path: "addresses",
                                query: {
                                    bool: {
                                        must: [
                                            { terms: { "addresses.country": ["USA", "Canada", "London", "Romania", "Hungary", "Greece"] } },
                                            { range: { "addresses.purchaseDate": { gte: '2018-01-01' } } }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            // Perform the search query
            const { hits } = await elasticSearchClient.search({
                index: 'users',
                query: filters,
                size: 10000
            });

            const end = performance.now();
            console.log(`Elasticsearch Query Completed: users.fetchAll - Duration: ${end - start}ms`);

            res.status(200).json(`Fetched ${hits?.hits.length} users.`);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch all users', error: err.message });
        }
    },

    fetchAll: async (req, res) => {
        try {
            const start = performance.now();

            // Set up the initial search request
            const scrollSize = 10000; // Number of records per batch
            const results = [];

            let response = await elasticSearchClient.search({
                index: 'users',
                scroll: '1m', // Keep the scroll context alive for 1 minute
                size: scrollSize,
                query: {
                    match_all: {} // Matches all documents
                },
            });

            let scrollId = response._scroll_id;

            // Process initial batch
            results.push(...response.hits.hits);

            // Keep fetching batches while there are more results
            while (response.hits.hits.length > 0) {
                response = await elasticSearchClient.scroll({
                    scroll_id: scrollId,
                    scroll: '1m', // Extend the scroll timeout
                });

                scrollId = response._scroll_id; // Update scroll ID
                results.push(...response.hits.hits);
            }

            const end = performance.now();
            console.log(`Elasticsearch Query Completed: users.fetchAll - Duration: ${end - start}ms`);
            res.status(200).json(`Fetched ${results.length} users.`);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch all users', error: err.message });
        }
    },


    deleteAll: async (req, res) => {
        try {
            const start = performance.now();

            // Define complex filters for deletion
            const filters = {
                bool: {
                    must: [
                        {
                            bool: {
                                should: [
                                    { range: { age: { gte: 30, lte: 45 } } },
                                    { range: { age: { gte: 60 } } }
                                ]
                            }
                        },
                        {
                            bool: {
                                should: [
                                    { range: { dateOfBirth: { lte: '1980-01-01' } } },
                                    { range: { dateOfBirth: { gte: '1990-01-01' } } }
                                ]
                            }
                        },
                        {
                            nested: {
                                path: "addresses",
                                query: {
                                    bool: {
                                        must: [
                                            { terms: { "addresses.country": ["USA", "Canada", "London", "Romania", "Hungary", "Greece"] } },
                                            { range: { "addresses.purchaseDate": { gte: '2018-01-01' } } }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            // Delete by query
            await elasticSearchClient.deleteByQuery({
                index: 'users',
                // query: filters,
                //delete all
                query: {
                    match_all: {} // Matches all documents
                },
            });

            const end = performance.now();
            console.log(`Elasticsearch Query Completed: users.deleteAll - Duration: ${end - start}ms`);

            res.status(200).json('Users deleted');
        } catch (err) {
            res.status(500).json({ message: 'Failed to delete users', error: err.message });
        }
    },

    updateMany: async (req, res) => {
        try {
            const start = performance.now();

            // Define complex filters for update
            const filters = {
                bool: {
                    must: [
                        {
                            bool: {
                                should: [
                                    { range: { age: { gte: 30, lte: 45 } } },
                                    { range: { age: { gte: 60 } } }
                                ]
                            }
                        },
                        {
                            bool: {
                                should: [
                                    { range: { dateOfBirth: { lte: '1980-01-01' } } },
                                    { range: { dateOfBirth: { gte: '1990-01-01' } } }
                                ]
                            }
                        },
                        {
                            nested: {
                                path: "addresses",
                                query: {
                                    bool: {
                                        must: [
                                            { terms: { "addresses.country": ["USA", "Canada", "London", "Romania", "Hungary", "Greece"] } },
                                            { range: { "addresses.purchaseDate": { gte: '2018-01-01' } } }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            // Update by query
            const result = await elasticSearchClient.updateByQuery({
                index: 'users',
                script: {
                    source: "ctx._source.isMarried = true"
                },
                query: filters,
                // update all
                // query: {
                //     match_all: {} // Matches all documents
                // },
            });

            const end = performance.now();
            console.log(`Elasticsearch Query Completed: users.updateMany - Duration: ${end - start}ms`);

            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: 'Failed to update users', error: err.message });
        }
    },

    aggregate: async (req, res) => {
        try {
            const start = performance.now();

            // Perform aggregation to group users by country and count the number of users in each country
            const resp = await elasticSearchClient.search({
                index: 'users',
                aggs: {
                    users_by_country: {
                        nested: {
                            path: "addresses" // Specify the 'addresses' nested field
                        },
                        aggs: {
                            countries: {
                                terms: {
                                    field: "addresses.country", // Exact matching with .keyword
                                    size: 10000 // Adjust size if necessary
                                },
                                aggs: {
                                    totalUsers: {
                                        value_count: { field: "addresses.country" }
                                    },
                                    averageAge: {
                                        reverse_nested: {}, // Step out of the nested context
                                        aggs: {
                                            avgAge: {
                                                avg: { field: "age" } // Calculate average age for users in this country
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                size: 0,
            });

            const end = performance.now();
            console.log(`Elasticsearch Query Completed: users.aggregate - Duration: ${end - start}ms`);

            // Format the response as per your requirement
            const result = resp.aggregations.users_by_country.countries.buckets.map(bucket => ({
                country: bucket.key, // Country name
                totalUsers: bucket.totalUsers.value, // Total number of users in this country
                averageAge: bucket.averageAge.avgAge.value
            }));

            res.status(200).json(result);
        } catch (err) {
            console.error(`Aggregation Error: ${err.message}`);
            res.status(500).json({ message: 'Failed to aggregate users by country', error: err.message });
        }
    }


};

module.exports = {
    UserService
};
