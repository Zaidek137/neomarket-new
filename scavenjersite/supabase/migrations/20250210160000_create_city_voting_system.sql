-- Create city_events table for proposed city events
CREATE TABLE city_events (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    votes_needed INTEGER NOT NULL DEFAULT 100,
    current_votes INTEGER NOT NULL DEFAULT 0,
    rewards JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_by VARCHAR(255),
    UNIQUE(city, country)
);

-- Create city_votes table to track user votes
CREATE TABLE city_votes (
    id SERIAL PRIMARY KEY,
    city_event_id INTEGER REFERENCES city_events(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_event_id, wallet_address)
);

-- Create function to increment vote count
CREATE OR REPLACE FUNCTION increment_city_vote(
    event_id INTEGER,
    wallet VARCHAR(255)
) RETURNS VOID AS $$
BEGIN
    -- Insert the vote (will fail if already voted due to unique constraint)
    INSERT INTO city_votes (city_event_id, wallet_address)
    VALUES (event_id, wallet);
    
    -- Increment the vote count
    UPDATE city_events 
    SET current_votes = current_votes + 1,
        updated_at = NOW()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user can vote (owns NFT and hasn't voted)
CREATE OR REPLACE FUNCTION can_vote_for_city(
    event_id INTEGER,
    wallet VARCHAR(255)
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has already voted for this city
    IF EXISTS (
        SELECT 1 FROM city_votes 
        WHERE city_event_id = event_id AND wallet_address = wallet
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE city_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for city_events (everyone can read, admin can write)
CREATE POLICY "Everyone can view city events" ON city_events FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Admin can manage city events" ON city_events FOR ALL TO PUBLIC USING (true);

-- RLS Policies for city_votes (users can read their own votes, authenticated users can vote)
CREATE POLICY "Users can view all votes" ON city_votes FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Authenticated users can vote" ON city_votes FOR INSERT TO PUBLIC WITH CHECK (true);

-- Insert some example city events
INSERT INTO city_events (city, country, description, image_url, votes_needed, rewards, created_by) VALUES
('Los Angeles', 'USA', 'Experience AR drops in the City of Angels with exclusive Hollywood-themed rewards and celebrity appearances.', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800', 150, '[
    {"type": "NFT", "value": "Exclusive LA Landmark Eko", "imageUrl": "https://images.unsplash.com/photo-1534259802394-5d3e6a04a4aa?w=400"},
    {"type": "Physical", "value": "$500 Cash Prize", "imageUrl": null},
    {"type": "Experience", "value": "VIP Movie Studio Tour", "imageUrl": "https://images.unsplash.com/photo-1489599546888-7f13f8b6b22d?w=400"}
]', 'admin'),

('Tokyo', 'Japan', 'Explore the neon-lit streets of Tokyo with tech-themed rewards and cutting-edge AR experiences.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 200, '[
    {"type": "NFT", "value": "Rare Cyber Samurai Eko", "imageUrl": "https://images.unsplash.com/photo-1523371683629-691e84b9dab5?w=400"},
    {"type": "Tech", "value": "Latest VR Headset", "imageUrl": "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400"},
    {"type": "Physical", "value": "$1000 Cash Prize", "imageUrl": null}
]', 'admin'),

('London', 'UK', 'Navigate through historic London with royal-themed rewards and exclusive access to premium locations.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 120, '[
    {"type": "NFT", "value": "Royal Guard Eko Collection", "imageUrl": "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400"},
    {"type": "Experience", "value": "Private Tower of London Tour", "imageUrl": "https://images.unsplash.com/photo-1534448350587-9a89c70ca7e3?w=400"},
    {"type": "Physical", "value": "£300 Prize", "imageUrl": null}
]', 'admin'); 