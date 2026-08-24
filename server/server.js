require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

const argon2 = require("argon2");

const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.set("trust proxy", 1);

app.use(
    session({
        store: new pgSession({
            pool: pool
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            partitioned: true,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

app.get("/api/me", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, username
            FROM users
            WHERE id = $1`,
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "user not found"
            });
        }

        res.json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "server error"
        });
    }
})

app.get("/", (req, res) => {
    res.json({
        message: "Color Chat server is running!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, username, email FROM users");

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database connection failed."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT id, username, password_hash
            FROM users
            WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "invalid username or password"
            });
        }

        const user = result.rows[0];

        const validPassword = await argon2.verify(user.password_hash, password);

        if (!validPassword) {
            return res.status(401).json({ error: "invalid username or password" });
        }

        req.session.userId = user.id;

        req.session.save((err) => {
            if (err) {
                console.error("SESSION SAVE ERROR:", err);
                return res.status(500).json({
                    error: "could not save session"
                });
            }

            res.json({
                message: "login successful",
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "server error"
        });
    }
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT id, username
            FROM users
            WHERE username = $1`,
            [username]
        );

        if (result.rows.length !== 0) {
            return res.status(409).json({
                error: "username taken"
            });
        }

        const passwordHash = await argon2.hash(password);

        const registration = await pool.query(
            `INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username`,
            [username, passwordHash]
        );

        const user = registration.rows[0];
        req.session.userId = user.id;

        res.status(201).json({
            message: "registration successful",
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "server error"
        });
    }
});

app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                error: "could not log out"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "logged out"
        });
    });
});

app.delete("/api/account", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "not logged in"
        });
    }

    try {
        // delete all messages to or from this account
        await pool.query(
            `DELETE FROM messages
            WHERE (sender_id = $1 OR recipient_id = $1)`,
            [req.session.userId]
        )

        await pool.query(
            `DELETE FROM users
            WHERE id = $1`,
            [req.session.userId]
        );

        req.session.destroy((error) => {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    error: "account deleted but session logout failed"
                });
            }

            res.clearCookie("connect.sid");

            res.json({
                message: "account deleted"
            });
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "could not delete account"
        });
    }
});

app.post("/api/heartbeat", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "not logged in"
        });
    }

    try {
        await pool.query(
            `UPDATE users
            SET last_seen = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [req.session.userId]
        );

        res.sendStatus(204);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "could not update last seen"
        });
    }
});

app.get("/api/users", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: "not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT 
                id, 
                username, 
                last_seen, 
                last_seen > CURRENT_TIMESTAMP - INTERVAL '60 seconds' AS online
            FROM users
            WHERE id <> $1
            ORDER BY username`,
            [req.session.userId]
        );

        res.json({
            users: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "failed to get user list"
        });
    }
});

app.post("/api/messages", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "not logged in"
        });
    }

    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    const result = await pool.query(
        `SELECT id, username
            FROM users
            WHERE id = $1`,
        [req.body.recipientId]
    );

    if (result.rows.length === 0) {
        return res.status(401).json({
            error: "recipient id does not exist"
        });
    }

    if (!isValidHex(req.body.color)) {
        return res.status(401).json({
            error: "color does not exist"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO messages (sender_id, recipient_id, color, height)
            VALUES ($1, $2, $3, $4)
            RETURNING 
                msg_id, 
                sender_id, 
                recipient_id, 
                color, 
                height, 
                created_at,
                sender_id = $1 AS sent`,
            [
                req.session.userId,
                req.body.recipientId,
                req.body.color,
                req.body.height
            ]
        );

        res.status(201).json({
            message: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "could not send message"
        });
    }
});

app.get("/api/messages", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT 
                msg_id, 
                color, 
                height, 
                created_at,
                sender_id = $1 AS sent
            FROM messages
            WHERE
    (sender_id = $1 AND recipient_id = $2)
    OR
    (sender_id = $2 AND recipient_id = $1)
            ORDER BY created_at ASC, msg_id ASC`,
            [req.session.userId, req.query.userId]
        );

        res.json({
            messages: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "failed to get message list"
        });
    }
});