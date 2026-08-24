-- schema.sql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMPTZ
);

CREATE TABLE messages (
    msg_id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id),
    recipient_id INT NOT NULL REFERENCES users(id),
    color VARCHAR(7) NOT NULL,
    height INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX "IDX_session_expire"
ON session (expire);