require('dotenv').config(); // Must be first
const knex = require('./db/db.js');
const express = require('express')
const path = require('path');
const app = express()
const port = 3001

app.use('/public', express.static(path.join(__dirname, 'public')));

const { authenticateToken, authorizeRole } = require('./middlewares/auth.js');

const errorHandler = require('./middlewares/errorHandler');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Run Migration
app.post('/run-migrations', async (req, res) => {
    try {
        await knex.migrate.latest();
        res.status(200).send('Migrations ran successfully.');
    } catch (error) {
        res.status(500).send(`Migration failed: ${error.message}`);
    }
});




app.use('/app/auth', require('./routers/app/auth.routes.js'));
app.use('/app', authenticateToken, require('./routers/app/app.routes.js'));


app.get('/', (req, res) => {
    res.send('Server Runing!')
})

app.use(errorHandler);


const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Set server timeouts
server.keepAliveTimeout = 600000; // 10 minutes
server.headersTimeout = 600000; // 10 minutes
