const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('ecotrack.db');

const usersTable =
  'CREATE TABLE IF NOT EXISTS users (' +
  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
  'name TEXT NOT NULL, ' +
  'email TEXT UNIQUE NOT NULL, ' +
  'password TEXT NOT NULL, ' +
  'phone TEXT, ' +
  'address TEXT, ' +
  "role TEXT DEFAULT 'CITIZEN', " +
  'created_at DATETIME DEFAULT CURRENT_TIMESTAMP)';

const complaintsTable =
  'CREATE TABLE IF NOT EXISTS complaints (' +
  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
  'complaint_id TEXT UNIQUE NOT NULL, ' +
  'user_id INTEGER NOT NULL, ' +
  'category TEXT NOT NULL, ' +
  'description TEXT NOT NULL, ' +
  'image TEXT, ' +
  'location TEXT NOT NULL, ' +
  'latitude REAL, ' +
  'longitude REAL, ' +
  "status TEXT DEFAULT 'Pending', " +
  'admin_remarks TEXT, ' +
  'created_at DATETIME DEFAULT CURRENT_TIMESTAMP, ' +
  'updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)';

const pickupsTable =
  'CREATE TABLE IF NOT EXISTS pickups (' +
  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
  'pickup_id TEXT UNIQUE NOT NULL, ' +
  'user_id INTEGER NOT NULL, ' +
  'waste_type TEXT NOT NULL, ' +
  'address TEXT NOT NULL, ' +
  'pickup_date TEXT NOT NULL, ' +
  'pickup_time TEXT NOT NULL, ' +
  'description TEXT, ' +
  'image TEXT, ' +
  'contact TEXT NOT NULL, ' +
  "status TEXT DEFAULT 'Pending', " +
  'created_at DATETIME DEFAULT CURRENT_TIMESTAMP)';

db.serialize(() => {
  db.run(usersTable);
  db.run(complaintsTable);
  db.run(pickupsTable);

  db.get("SELECT id FROM users WHERE email = 'admin@ecotrack.com'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('Admin@123', 10);
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'ADMIN')",
        ['Admin', 'admin@ecotrack.com', hash]
      );
      console.log('Default admin created: admin@ecotrack.com / Admin@123');
    }
  });
});

module.exports = db;