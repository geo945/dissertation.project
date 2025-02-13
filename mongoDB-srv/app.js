require("dotenv").config();
const express = require("express");
const cors = require('cors')
const mongoose = require("mongoose");

const userRoutes = require("./src/routes/user");

const PORT = process.env.PORT || 3000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// mongoose.set('debug', (collectionName, method, query, doc, options) => {
//     const start = Date.now();
//     console.log(`Mongoose Query Started: ${collectionName}.${method} - Query:`, query, options || '');
//
//     // Track execution time when the query finishes
//     return Promise.resolve().then(() => {
//         const duration = Date.now() - start;
//         console.log(`Mongoose Query Completed: ${collectionName}.${method} - Duration: ${duration}ms`);
//     });
// });

// Routes
app.get('/health', (req, res) => {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            return res.status(200).json({
                message: 'Connection to mongoDB database has been established successfully. Server is up and running!',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: {
                    message: err.message,
                },
            });
        });
});
app.use("/user", userRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connection to mongoDB database has been established successfully. Server is up and running!'))
    .catch((err) => console.error(err.message));

// Start the Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
