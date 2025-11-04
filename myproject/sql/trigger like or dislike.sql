-- ==============================================================
-- 1. Add like_count / dislike_count to posts
-- ==============================================================
BEGIN;

ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS like_count    integer NOT NULL DEFAULT 0
        CHECK (like_count >= 0),
    ADD COLUMN IF NOT EXISTS dislike_count integer NOT NULL DEFAULT 0
        CHECK (dislike_count >= 0);

COMMIT;


-- ==============================================================
-- 2. Trigger function – keep counters in sync
-- ==============================================================
BEGIN;

-- Drop everything if it already exists (makes the script re-runnable)
DROP TRIGGER IF EXISTS trg_sync_reaction_counts ON public.users_posts;
DROP FUNCTION IF EXISTS public.sync_post_reaction_counts();

-- ----------------------------------------------------------------
-- Function: +1/-1 to the appropriate counter on the related post
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_post_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    delta_like    integer := 0;
    delta_dislike integer := 0;
BEGIN
    ----------------------------------------------------------------
    -- 1. What changed?
    ----------------------------------------------------------------
    IF TG_OP = 'DELETE' THEN
        IF OLD.reaction = 'like'    THEN delta_like    := -1; END IF;
        IF OLD.reaction = 'dislike' THEN delta_dislike := -1; END IF;
    ELSE
        -- INSERT or UPDATE
        IF NEW.reaction = 'like'    THEN delta_like    :=  1; END IF;
        IF NEW.reaction = 'dislike' THEN delta_dislike :=  1; END IF;

        IF TG_OP = 'UPDATE' THEN
            -- subtract old value
            IF OLD.reaction = 'like'    THEN delta_like    := delta_like    - 1; END IF;
            IF OLD.reaction = 'dislike' THEN delta_dislike := delta_dislike - 1; END IF;
        END IF;
    END IF;

    ----------------------------------------------------------------
    -- 2. Apply deltas (ignore if nothing changed)
    ----------------------------------------------------------------
    IF delta_like <> 0 OR delta_dislike <> 0 THEN
        UPDATE public.posts
           SET like_count    = like_count    + delta_like,
               dislike_count = dislike_count + delta_dislike
         WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;

    ----------------------------------------------------------------
    -- 3. Return appropriate row
    ----------------------------------------------------------------
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

-- ----------------------------------------------------------------
-- Trigger: fire after every change on users_posts
-- ----------------------------------------------------------------
CREATE TRIGGER trg_sync_reaction_counts
    AFTER INSERT OR UPDATE OR DELETE
    ON public.users_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_post_reaction_counts();

COMMIT;


-- ==============================================================
-- 3. Back-fill counters for data that already exists
-- ==============================================================
BEGIN;

WITH agg AS (
    SELECT
        post_id,
        COUNT(*) FILTER (WHERE reaction = 'like')    AS likes,
        COUNT(*) FILTER (WHERE reaction = 'dislike') AS dislikes
    FROM public.users_posts
    GROUP BY post_id
)
UPDATE public.posts p
   SET like_count    = COALESCE(agg.likes,    0),
       dislike_count = COALESCE(agg.dislikes, 0)
  FROM agg
 WHERE p.id = agg.post_id;

COMMIT;