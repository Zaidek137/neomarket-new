-- Add contact fields to drop_requests table
ALTER TABLE drop_requests 
ADD COLUMN email TEXT NOT NULL DEFAULT '',
ADD COLUMN phone TEXT,
ADD COLUMN discord_username TEXT,
ADD COLUMN social_username TEXT;

-- Remove the default constraint from email after adding the column
ALTER TABLE drop_requests ALTER COLUMN email DROP DEFAULT;

-- Add a constraint to ensure email is not empty
ALTER TABLE drop_requests ADD CONSTRAINT email_not_empty CHECK (email != '');

-- Create index for email for faster lookups
CREATE INDEX idx_drop_requests_email ON drop_requests(email); 