const db = require('./db');
const bcrypt = require('bcryptjs');

const DEMO_EMAIL = 'demo@ecotrack.com';
const DEMO_PASSWORD = 'Demo@123';

// [category, description, location, status, remarks, days ago]
const complaints = [
  ['Overflowing Bin', 'Dustbin has been full for 3 days', 'Civil Lines Market', 'Pending', null, 1],
  ['Overflowing Bin', 'Bin overflowing near the bus stop', 'Civil Lines Market', 'In Progress', 'Team assigned', 2],
  ['Garbage on Road', 'Garbage spread across the road', 'Civil Lines Market', 'Resolved', 'Cleaned on time', 6],
  ['Illegal Dumping', 'Construction waste dumped at night', 'Kakadeo Main Road', 'Pending', null, 1],
  ['Illegal Dumping', 'Waste dumped near the park', 'Kakadeo Main Road', 'In Progress', 'Inspection scheduled', 3],
  ['Missed Collection', 'Garbage van did not come this week', 'Swaroop Nagar', 'Pending', null, 2],
  ['Missed Collection', 'No collection for 4 days', 'Swaroop Nagar', 'Resolved', 'Collected today', 7],
  ['Improper Waste Segregation', 'Wet and dry waste mixed in the bin', 'Arya Nagar', 'Rejected', 'Not enough details', 5],
  ['Garbage on Road', 'Plastic waste blocking the drain', 'Arya Nagar', 'Resolved', 'Drain cleared', 9],
  ['Overflowing Bin', 'Bin outside school is full', 'Govind Nagar', 'Pending', null, 0],
  ['Garbage on Road', 'Garbage heap near the temple', 'Govind Nagar', 'In Progress', 'Sweeper sent', 1],
  ['Other', 'Dead animal on the roadside', 'Kidwai Nagar', 'Resolved', 'Removed by municipal team', 4],
  ['Illegal Dumping', 'Burning of waste in open plot', 'Kidwai Nagar', 'Pending', null, 2],
  ['Overflowing Bin', 'Bin broken and overflowing', 'Kakadeo Main Road', 'Resolved', 'Bin replaced', 8],
  ['Missed Collection', 'Society waste not collected', 'Civil Lines Market', 'Pending', null, 0]
];

const pickups = [
  ['Wet Waste', '12 Green Park Society', 'Scheduled'],
  ['E-Waste', '45 Model Town', 'Pending'],
  ['Plastic', '7 Swaroop Nagar', 'Picked Up']
];

function pad(n) { return String(n).padStart(4, '0'); }

setTimeout(() => {
  db.get('SELECT id FROM users WHERE email = ?', [DEMO_EMAIL], (err, row) => {
    if (row) return insertData(row.id);
    const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    db.run(
      "INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)",
      ['Demo Citizen', DEMO_EMAIL, hash, '9876543210', 'Kanpur'],
      function (e) {
        if (e) { console.log('Error creating demo user:', e.message); process.exit(1); }
        insertData(this.lastID);
      }
    );
  });
}, 1000);

function insertData(userId) {
  complaints.forEach((c, i) => {
    db.run(
      "INSERT OR IGNORE INTO complaints (complaint_id, user_id, category, description, location, status, admin_remarks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))",
      ['CMP-SEED-' + pad(i + 1), userId, c[0], c[1], c[2], c[3], c[4], '-' + c[5] + ' days', '-' + c[5] + ' days']
    );
  });

  pickups.forEach((p, i) => {
    db.run(
      "INSERT OR IGNORE INTO pickups (pickup_id, user_id, waste_type, address, pickup_date, pickup_time, contact, status) VALUES (?, ?, ?, ?, date('now', '+2 days'), '10:00', '9876543210', ?)",
      ['PKP-SEED-' + pad(i + 1), userId, p[0], p[1], p[2]]
    );
  });

  setTimeout(() => {
    console.log('Sample data added.');
    console.log('Demo citizen login: ' + DEMO_EMAIL + ' / ' + DEMO_PASSWORD);
    process.exit(0);
  }, 1500);
}