# EcoTrack - Smart Waste Management System

A web app where citizens report waste problems and request pickups, and administrators track and resolve them from one dashboard.

## Problem
Overflowing bins, missed collection, illegal dumping and garbage on roads are hard to report and track. Administrators have no central view of complaints or hotspots.

## Features
**Citizen**
- Register, login, logout, edit profile
- Report waste issues with category, description, photo and location
- Unique complaint ID and visual status timeline
- Search and filter own complaints
- Waste pickup requests with unique pickup ID (cancel while pending)
- Waste awareness guide and rule-based Waste Assistant

**Admin**
- Dashboard cards and charts (status and issue types)
- Hotspot analysis (locations with most complaints)
- Search and filter all complaints, update status, add remarks
- Manage pickup requests and view users
- Recent activity list

## Tech stack
Node.js, Express, SQLite, HTML/CSS/JavaScript, Chart.js, Multer, bcryptjs, express-session

## Security
- Passwords hashed with bcrypt
- Parameterised SQL queries
- Role-based access (Citizen / Admin)
- Image type and size limits

## How to run
1. Install Node.js (LTS)
2. Clone the repository and open the folder
3. Install packages: `npm install`
4. (Optional) Add demo data: `node seed.js`
5. Start: `npm start`
6. Open http://localhost:3000

## Demo logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@ecotrack.com | Admin@123 |
| Citizen | demo@ecotrack.com | Demo@123 |

## Team
Your Name - BCA