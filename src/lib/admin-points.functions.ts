import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const adjustUserPoints = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    userId: z.string().uuid(),
    amount: z.number().int(),
    reason: z.string().min(1),
    actionType: z.enum(["credit", "debit"])
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Check if the caller is an admin
    const { data: { user }, error: authError } = await (await import("@/integrations/supabase/client.server")).supabaseAdmin.auth.getUser(
      context.request.headers.get("Authorization")?.split(" ")[1] || ""
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Forbidden: Admin access required");
    }

    const adjustmentAmount = data.actionType === "credit" ? Math.abs(data.amount) : -Math.abs(data.amount);

    // 1. Update user balance
    const { error: updateError } = await supabaseAdmin.rpc("handle_points_transaction", {
      p_user_id: data.userId,
      p_amount: adjustmentAmount,
      p_description: `Admin adjustment: ${data.reason}`,
      p_transaction_type: "adjustment"
    });

    if (updateError) throw updateError;

    // 2. Record admin action
    await supabaseAdmin.from("admin_point_actions").insert({
      admin_id: user.id,
      target_user_id: data.userId,
      amount: adjustmentAmount,
      action_type: data.actionType,
      reason: data.reason
    });

    // 3. Add to points audit log
    await supabaseAdmin.from("points_audit_logs").insert({
      user_id: data.userId,
      amount: adjustmentAmount,
      reason: `ADMIN_${data.actionType.toUpperCase()}: ${data.reason}`,
      trigger_name: "admin_manual_action"
    });

    return { success: true };
  });
