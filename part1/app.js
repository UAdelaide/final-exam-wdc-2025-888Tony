const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());


// This function will execute an SQL script from a file.
const executeSqlScript = async (pool, filePath) => {
    try {
        const script = await fs.readFile(filePath, 'utf-8');
        // Split script into individual statements, ignoring empty ones.
        const statements = script.split(';').filter(statement => statement.trim() !== '');
        for (const statement of statements) {
            await pool.query(statement);
        }
        console.log(`Successfully executed SQL script: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`Error executing script ${path.basename(filePath)}:`, error);
        throw error;
    }
};

// This function sets up the database, creating it if it doesn't exist,
// and then populating it with the schema and initial data.
const setupDatabase = async () => {
    let pool;
    try {
        // Create a connection without specifying a database to create it
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '' // Enter your MySQL root password if you have one
        });
        await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
        await connection.end();
        console.log("Database 'DogWalkService' is ready.");

        // Now, create a connection pool for the newly created database
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '', // Enter your MySQL root password if you have one
            database: 'DogWalkService',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true // Allow multiple statements for script execution
        });


        // Execute the SQL scripts to define schema and insert data
        await executeSqlScript(pool, path.join(__dirname, 'dogwalks.sql'));
        await executeSqlScript(pool, path.join(__dirname, 'inserts.sql'));

        return pool;

    } catch (err) {
        console.error('An error occurred during database setup:', err);
        process.exit(1); // Exit if the database can't be set up
    }
};


// --- API Endpoints ---

// This function initializes the routes after the database is ready.
const initializeRoutes = (pool) => {
    // Route to get all dogs with their owner's username
    app.get('/api/dogs', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT d.name AS dog_name, d.size, u.username AS owner_username
                FROM Dogs d
                JOIN Users u ON d.owner_id = u.user_id
            `);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching dogs:', error);
            res.status(500).json({ error: 'Failed to retrieve dog data.' });
        }
    });

    // Route to get all open walk requests
    app.get('/api/walkrequests/open', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT
                    wr.request_id,
                    d.name AS dog_name,
                    wr.requested_time,
                    wr.duration_minutes,
                    wr.location,
                    u.username AS owner_username
                FROM WalkRequests wr
                JOIN Dogs d ON wr.dog_id = d.dog_id
                JOIN Users u ON d.owner_id = u.user_id
                WHERE wr.status = 'open'
            `);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching open walk requests:', error);
            res.status(500).json({ error: 'Failed to retrieve open walk requests.' });
        }
    });

    // Route to get a summary for each walker
    app.get('/api/walkers/summary', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT
                    u.username AS walker_username,
                    COUNT(DISTINCT wra.rating_id) AS total_ratings,
                    AVG(wra.rating) AS average_rating,
                    (SELECT COUNT(*)
                     FROM WalkRequests wr
                     JOIN WalkApplications wa ON wr.request_id = wa.request_id
                     WHERE wr.status = 'completed' AND wa.walker_id = u.user_id
                    ) AS completed_walks
                FROM Users u
                LEFT JOIN WalkRatings wra ON u.user_id = wra.walker_id
                WHERE u.role = 'walker'
                GROUP BY u.user_id, u.username
            `);

            // Clean up the data format
            const summary = rows.map(row => ({
                ...row,
                average_rating: row.average_rating ? parseFloat(parseFloat(row.average_rating).toFixed(1)) : null,
                completed_walks: parseInt(row.completed_walks)
            }));
            res.json(summary);
        } catch (error) {
            console.error('Error fetching walkers summary:', error);
            res.status(500).json({ error: 'Failed to retrieve walkers summary.' });
        }
    });
};

// --- Server Initialization ---

// This main function starts the application.
const main = async () => {
    const pool = await setupDatabase();
    initializeRoutes(pool);
    app.listen(port, () => {
        console.log(`Server is running and listening on http://localhost:${port}`);
        console.log('You can access the API endpoints:');
        console.log(`- http://localhost:${port}/api/dogs`);
        console.log(`- http://localhost:${port}/api/walkrequests/open`);
        console.log(`- http://localhost:${port}/api/walkers/summary`);
    });
};

main();