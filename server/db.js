const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// const pool = new Pool({
//     user: process.env.DATABASE_USER,
//     host: process.env.DATABASE_HOST,
//     database: process.env.DATABASE_NAME,
//     password: process.env.DATABASE_PASSWORD,
//     port: process.env.DATABASE_PORT
// })

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(
            path.join(__dirname, "ca.pem")
        ).toString()
    }
});

// pool.query("SELECT NOW()", (err, result) => {
//     if (err) {
//         console.error("DATABASE TEST FAILED:", err);
//     } else {
//         console.log("DATABASE TEST SUCCESS:", result.rows[0]);
//     }
// });

module.exports = pool;