const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')

const sequelize = require("./src/sequelize/sequelize");
const userRoutes = require('./src/routes/user')

const PORT = process.env.PORT || 3000;
const app = express();

dotenv.config();

// Middlewares
app.use(express.json());
app.use(cors())

// Routes
app.get('/health', (req, res) => {
    sequelize.authenticate()
        .then(() => {
            return res.status(200).json({
                message: 'Connection to MySQL database has been established successfully. Server is up and running!',
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
app.use('/user', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}.`);
});