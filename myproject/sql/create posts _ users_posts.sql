-- Таблица постов
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    img_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    reaction VARCHAR(7) CHECK (reaction IN ('like', 'dislike', NULL)),
    
    reaction_date TIMESTAMPTZ,
    
    comment TEXT,
    comment_date TIMESTAMPTZ,
    
    -- one user/one post unique
    PRIMARY KEY (user_id, post_id),
    -- auto generate dates
    CONSTRAINT reaction_date_check 
        CHECK (reaction IS NULL OR reaction_date IS NOT NULL),
    CONSTRAINT comment_date_check 
        CHECK (comment IS NULL OR comment_date IS NOT NULL)
);

CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_reaction ON reactions(reaction);
CREATE INDEX idx_reactions_reaction_date ON reactions(reaction_date);