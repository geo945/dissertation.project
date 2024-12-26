require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.json());

// Routes
const userRoutes = require("./src/routes/user");
app.use("/user", userRoutes);

mongoose.set('debug', (collectionName, method, query, doc, options) => {
    const start = Date.now();
    console.log(`Mongoose Query Started: ${collectionName}.${method} - Query:`, query, options || '');

    // Track execution time when the query finishes
    return Promise.resolve().then(() => {
        const duration = Date.now() - start;
        console.log(`Mongoose Query Completed: ${collectionName}.${method} - Duration: ${duration}ms`);
    });
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connection to mongoDB database has been established successfully. Server is up and running!"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

app.get('/health', (req, res) => {
    mongoose
        .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
