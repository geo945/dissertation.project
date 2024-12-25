const express = require('express');
const {UserService} = require("./services/user/user");
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.send('Server is up and running!');
});

app.post('/user',() => (req, res) => UserService.insert(req, res))

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
