import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const adjustUserPoints = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    userId: z.string().uuid(),
    amount: z.number().int(),
    reason: z.string().min(1),
    actionType: z.enum(["credit", "debit"])
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    if (!context?.request) {
      throw new Error("Request context missing");
    }

    // Check if the caller is an admin
    const authHeader = context.request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      throw new Error("Unauthorized: Missing token");
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized: Invalid session");
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

    // 1. Update user balance using the RPC
    const { error: updateError } = await supabaseAdmin.rpc("handle_points_transaction" as any, {
      p_user_id: data.userId,
      p_amount: adjustmentAmount,
      p_description: `Admin adjustment: ${data.reason}`,
      p_transaction_type: "adjustment"
    });

    if (updateError) throw updateError;

    // 2. Add to points audit log
    await supabaseAdmin.from("points_audit_logs").insert({
      user_id: data.userId,
      amount: adjustmentAmount,
      reason: `ADMIN_${data.actionType.toUpperCase()}: ${data.reason}`,
      trigger_name: "admin_manual_action"
    } as any);

    return { success: true };
  });
