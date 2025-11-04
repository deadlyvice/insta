ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS author_id integer;

-- 2. Create the foreign-key constraint
ALTER TABLE public.posts
    ADD CONSTRAINT posts_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES public.users (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE;   -- or CASCADE / RESTRICT, choose what you need