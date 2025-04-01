const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool configuration
const pool = mysql.createPool({
    host: '0vk53.h.filess.io',
    port: 61002,
    user: 'FruitsDB_instrument',
    password: '07f6dc858a96820ac15b584b919158cf4f90df2d',
    database: 'FruitsDB_instrument'
});

// Endpoint to get all records
app.get('/records', (req, res) => {
    pool.query('SELECT * FROM letters_data', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

// Endpoint to add a record
app.post('/records', (req, res) => {
    const { record_time, number_of_letters, amount, comments } = req.body;
    pool.query(
        'INSERT INTO letters_data (record_time, number_of_letters, amount, comments) VALUES (?, ?, ?, ?)',
        [record_time, number_of_letters, amount, comments],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json({ message: 'Record inserted', id: results.insertId });
        }
    );
});

// Endpoint to delete all records
app.delete('/records', (req, res) => {
    pool.query('DELETE FROM letters_data', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'All records deleted' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
