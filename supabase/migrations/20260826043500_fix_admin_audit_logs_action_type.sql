-- Drop restrictive action_type check constraint on admin_audit_logs if present
ALTER TABLE public.admin_audit_logs DROP CONSTRAINT IF EXISTS admin_audit_logs_action_type_check;

-- Update handle_admin_points_adjustment to log clean old/new data and use valid action_type
CREATE OR REPLACE FUNCTION public.handle_admin_points_adjustment(p_target_user_id uuid, p_amount integer, p_action_type text, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_admin_id uuid := auth.uid();
    v_transaction_id UUID;
    v_final_amount INTEGER;
    v_old_points INTEGER := 0;
    v_new_points INTEGER := 0;
BEGIN
    -- Security check: the actual caller must be an admin
    IF v_admin_id IS NULL OR NOT public.has_role(v_admin_id, 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can adjust points';
    END IF;

    -- Fetch current points balance
    SELECT COALESCE(points_balance, 0) INTO v_old_points
    FROM public.profiles
    WHERE id = p_target_user_id;

    IF p_action_type = 'credit' THEN
        v_final_amount := ABS(p_amount);
    ELSE
        v_final_amount := -ABS(p_amount);
    END IF;

    v_new_points := v_old_points + v_final_amount;

    -- Record in points_transactions
    INSERT INTO public.points_transactions (user_id, amount, type, description, status)
    VALUES (p_target_user_id, v_final_amount, 'adjustment', 'Admin adjustment: ' || p_reason, 'completed')
    RETURNING id INTO v_transaction_id;

    -- Update profile balance
    UPDATE public.profiles
    SET points_balance = v_new_points,
        updated_at = NOW()
    WHERE id = p_target_user_id;

    -- Audit log in points_audit_logs
    INSERT INTO public.points_audit_logs (user_id, amount, reason, trigger_name)
    VALUES (p_target_user_id, v_final_amount, 'Admin Adjustment: ' || p_reason, 'manual_admin_action');

    -- Audit log in admin_audit_logs
    INSERT INTO public.admin_audit_logs (admin_id, action_type, target_table, target_id, old_data, new_data)
    VALUES (
        v_admin_id, 
        'UPDATE', 
        'profiles', 
        p_target_user_id,
        jsonb_build_object('points_balance', v_old_points),
        jsonb_build_object('points_balance', v_new_points, 'adjustment', v_final_amount, 'reason', p_reason, 'transaction_id', v_transaction_id)
    );

    -- Send notification to target user
    INSERT INTO public.notifications (user_id, title, message, type, transaction_id)
    VALUES (p_target_user_id, 'Points Adjusted',
        'Your points balance has been adjusted by ' || v_final_amount || ' points. Reason: ' || p_reason,
        'points', v_transaction_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_admin_points_adjustment(uuid, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_admin_points_adjustment(uuid, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_admin_points_adjustment(uuid, integer, text, text) TO service_role;
