import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import path from 'path'
const __dirname = path.resolve()

const DB_PATH = path.join(__dirname, 'mydatabase.db'); //  Replace 'mydatabase.db' with your desired database file name
const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
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
    PRIMARY KEY (session_id, user_id)
    FOREIGN KEY (session_id) REFERENCES session_payment(id)
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`

const inititializeDb = async() => {
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    })

    db.exec(TABLES_SQL, (err) => {
        if (err) {
            console.error('Error creating tables:', err.message);
        } else {
            console.log('Tables created or already exist.');
        }
    });

    return db
}

const db = await inititializeDb()

export default db