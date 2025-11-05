CREATE TABLE public.comments (
    id serial PRIMARY KEY,
    data text NOT NULL,
    user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id integer NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);