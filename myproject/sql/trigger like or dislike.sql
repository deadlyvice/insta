CREATE OR REPLACE FUNCTION public.update_post_reactions()
RETURNS TRIGGER AS
$$
DECLARE
    delta_like    integer := 0;
    delta_dislike integer := 0;
BEGIN
    ----------------------------------------------------------------
    -- 1. Detect operation type and compute deltas
    ----------------------------------------------------------------
    IF TG_OP = 'DELETE' THEN
        IF OLD.reaction = true  THEN delta_like    := -1; END IF;
        IF OLD.reaction = false THEN delta_dislike := -1; END IF;

    ELSIF TG_OP = 'INSERT' THEN
        IF NEW.reaction = true  THEN delta_like    :=  1; END IF;
        IF NEW.reaction = false THEN delta_dislike :=  1; END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- if reaction actually changed
        IF NEW.reaction IS DISTINCT FROM OLD.reaction THEN
            -- remove old reaction
            IF OLD.reaction = true  THEN delta_like    := delta_like    - 1; END IF;
            IF OLD.reaction = false THEN delta_dislike := delta_dislike - 1; END IF;
            -- add new reaction
            IF NEW.reaction = true  THEN delta_like    := delta_like    + 1; END IF;
            IF NEW.reaction = false THEN delta_dislike := delta_dislike + 1; END IF;

            -- update reaction_date timestamp
            NEW.reaction_date := now();
        END IF;
    END IF;

    ----------------------------------------------------------------
    -- 2. Apply deltas to posts table
    ----------------------------------------------------------------
    IF delta_like <> 0 OR delta_dislike <> 0 THEN
        UPDATE public.posts
           SET like_count    = like_count    + delta_like,
               dislike_count = dislike_count + delta_dislike
         WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;

    ----------------------------------------------------------------
    -- 3. Return proper record for the trigger type
    ----------------------------------------------------------------
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- ===========================================================
-- Trigger: call function after insert/update/delete
-- ===========================================================
DROP TRIGGER IF EXISTS trg_update_post_reactions ON public.reactions;

CREATE TRIGGER trg_update_post_reactions
AFTER INSERT OR UPDATE OR DELETE
ON public.reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_post_reactions();
