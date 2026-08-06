CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_email_address_idx ON users (email_address);
