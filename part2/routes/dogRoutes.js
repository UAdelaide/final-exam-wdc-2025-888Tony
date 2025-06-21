const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all dogs with their owner ID
router.get('/', async (req, res) => {
    try {
        // Updated query to fetch columns as shown in the screenshot
        const [rows] = await db.query(`
            SELECT dog_id, name, size, owner_id FROM Dogs
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({ error: 'Failed to retrieve dog data.' });
    }
});

module.exports = router;