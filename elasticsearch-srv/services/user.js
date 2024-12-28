const elasticSearchClient = require('../elasticsearch/index');
const { generateUsers } = require("../../utils/index");

const UserService = {
    insert: async (req, res) => {
        try {
            const numberOfUsers = req.body?.numberOfUsers || 1000;
            let totalQueriesTime = 0;

            const users = generateUsers(numberOfUsers);

            const chunkSize = 200000;
            for (let i = 0; i < users.length; i += chunkSize) {
                const chunk = users.slice(i, i + chunkSize);

                const bulkOperations = chunk.flatMap(user => [
                    { index: { _index: 'users', _id: user.id } },
                    user,
                ]);

                const startUserQueryTime = performance.now();

                await elasticSearchClient.bulk({ refresh: true, body: bulkOperations });

                const endUserQueryTime = performance.now();

                totalQueriesTime += endUserQueryTime - startUserQueryTime

                console.log(`Inserted ${i + chunk.length}/${users.length} users. Chunk ${i} Elasticsearch Query Completed: users.insert - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);
            }

            console.log(`Elasticsearch Total Query Completed: users.insert - Total Insert Duration: ${totalQueriesTime}ms.`);

            res.status(201).json({
                message: `${numberOfUsers} users successfully inserted.`,
                totalQueryTime: `${totalQueriesTime}ms`
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to insert users', error: err.message });
        }
    },

    fetchAllWithFilters: async (req, res) => {
        try {
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

            const startUserQueryTime = performance.now();

            const { hits } = await elasticSearchClient.search({
                index: 'users',
                query: filters,
                size: 10000
            });

            const endUserQueryTime = performance.now();

            console.log(`Elasticsearch Query Completed: users.fetchAllWithFilters - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json({
                message: `Fetched ${hits?.hits.length} users.`,
                totalQueryTime: `${endUserQueryTime - startUserQueryTime}ms`,
                count: hits.hits.length,
                values: hits.hits
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetchAllWithFilters users', error: err.message });
        }
    },

    fetchAll: async (req, res) => {
        try {
            const scrollSize = 10000;
            const results = [];
            let totalQueriesTime = 0;

            const startUserQueryTime = performance.now();

            let response = await elasticSearchClient.search({
                index: 'users',
                scroll: '1m',
                size: scrollSize,
                query: {
                    match_all: {}
                },
            });

            const endUserQueryTime = performance.now();

            totalQueriesTime += endUserQueryTime - startUserQueryTime

            let scrollId = response._scroll_id;

            results.push(...response.hits.hits);

            const startUserScrollQueryTime = performance.now();

            while (response.hits.hits.length > 0) {
                response = await elasticSearchClient.scroll({
                    scroll_id: scrollId,
                    scroll: '1m',
                });

                scrollId = response._scroll_id;
                results.push(...response.hits.hits);
            }

            const endUserScrollQueryTime = performance.now();

            totalQueriesTime += endUserScrollQueryTime - startUserScrollQueryTime

            console.log(`Elasticsearch Total Query Completed: users.fetchAll - Total FetchAll Duration: ${totalQueriesTime}ms.`);

            res.status(200).json({
                message: `Fetched ${results.length} users.`,
                totalQueryTime: `${totalQueriesTime}ms`,
                count: results.length,
                values: results.slice(0, 1000)
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch all users', error: err.message });
        }
    },

    deleteAll: async (req, res) => {
        try {
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

            const startUserQueryTime = performance.now();

            const result = await elasticSearchClient.deleteByQuery({
                index: 'users',
                query: filters,
                // delete all
                // query: {
                //     match_all: {}
                // },
            });

            const endUserQueryTime = performance.now();

            console.log(`Elasticsearch Query Completed: users.deleteAll - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            res.status(200).json({
                message: `Deleted ${result.deleted} users.`,
                totalQueryTime: `${endUserQueryTime - startUserQueryTime}ms`
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to delete users', error: err.message });
        }
    },

    updateMany: async (req, res) => {
        try {
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

            const batchSize = 10000;
            let totalUpdated = 0;
            let totalQueriesTime = 0;

            const startUserQueryTime = performance.now();

            const searchResponse = await elasticSearchClient.search({
                index: 'users',
                scroll: '5m',
                size: batchSize,
                query: filters,
                // query: {
                //     match_all: {} // Matches all documents
                // }
            });

            const endUserQueryTime = performance.now();

            totalQueriesTime += endUserQueryTime - startUserQueryTime

            let scrollId = searchResponse._scroll_id;
            let hits = searchResponse.hits.hits;

            while (hits.length > 0) {
                const bulkBody = hits.flatMap(doc => [
                    { update: { _id: doc._id, _index: 'users' } },
                    { script: { source: "ctx._source.isMarried = true" } }
                ]);

                const startUserBulkQueryTime = performance.now();

                const bulkResponse = await elasticSearchClient.bulk({ body: bulkBody });

                const endUserBulkQueryTime = performance.now();

                totalQueriesTime += endUserBulkQueryTime - startUserBulkQueryTime;

                if (bulkResponse.errors) {
                    console.error("Bulk update errors:", bulkResponse.items.filter(item => item.update.error));
                }

                totalUpdated += hits.length;

                const scrollResponse = await elasticSearchClient.scroll({
                    scroll_id: scrollId,
                    scroll: '5m'
                });

                scrollId = scrollResponse._scroll_id;
                hits = scrollResponse.hits.hits;

                console.log(`Processed batch. Total updated so far: ${totalUpdated}`);
            }

            await elasticSearchClient.clearScroll({ scroll_id: scrollId });

            console.log(`Elasticsearch Query Completed: users.updateMany - Duration: ${totalQueriesTime}ms.`);

            res.status(200).json({
                message: `Updated ${totalUpdated} users.`,
                totalQueryTime: `${totalQueriesTime}ms`
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to update users', error: err.message });
        }
    },

    aggregate: async (req, res) => {
        try {
            const startUserQueryTime = performance.now();

            const resp = await elasticSearchClient.search({
                index: 'users',
                aggs: {
                    users_by_country: {
                        nested: {
                            path: "addresses"
                        },
                        aggs: {
                            countries: {
                                terms: {
                                    field: "addresses.country",
                                    size: 10000
                                },
                                aggs: {
                                    totalUsers: {
                                        value_count: { field: "addresses.country" }
                                    },
                                    averageAge: {
                                        reverse_nested: {},
                                        aggs: {
                                            avgAge: {
                                                avg: { field: "age" }
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

            const endUserQueryTime = performance.now();

            console.log(`Elasticsearch Query Completed: users.aggregate - Duration: ${endUserQueryTime - startUserQueryTime}ms.`);

            const result = resp.aggregations.users_by_country.countries.buckets.map(bucket => ({
                country: bucket.key,
                totalUsers: bucket.totalUsers.value,
                averageAge: bucket.averageAge.avgAge.value
            }));

            res.status(200).json({
                totalQueryTime: `${endUserQueryTime - startUserQueryTime}ms`,
                data: result
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to aggregate users by country', error: err.message });
        }
    }
}

module.exports = {
    UserService
};
