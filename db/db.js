// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');
import sqlite3 from 'sqlite3'
import path from 'path'
const __dirname = path.resolve()

const DB_PATH = path.join(__dirname, 'mydatabase.db'); //  Replace 'mydatabase.db' with your desired database file name
const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount FlOAT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS session_payment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_count Integer NOT NULL,
    user_id INTEGER,
    vote TEXT,
    amount FLOAT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id INTEGER NOT NULL,
    user_id Integer NOT NULL,
    vote TEXT,
    amount FLOAT,
    FOREIGN KEY (session_id) REFERENCES session_payment(id)
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`



function initializeDatabase() {
    let db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
        console.log('Connected to the SQLite database.');

        db.exec(TABLES_SQL, (err) => {
            if (err) {
                console.error('Error creating tables:', err.message);
            } else {
                console.log('Tables created or already exist.');
            }
            // db.close((err) => {
            //     if (err) {
            //         console.error('Error closing database connection:', err.message);
            //     } else {
            //         console.log('Database connection closed.');
            //     }
            // });
        });
    });

    return db
}

const db = initializeDatabase();

export default db