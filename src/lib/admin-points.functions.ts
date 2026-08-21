import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adjustUserPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    userId: z.string().uuid(),
    amount: z.number().int(),
    reason: z.string().min(1),
    actionType: z.enum(["credit", "debit"])
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // requireSupabaseAuth middleware provides userId and supabase (authenticated client) in context
    const adminId = context.userId;
    
    if (!adminId) {
      throw new Error("Unauthorized: No user session found");
    }

    // Use the secure RPC for a safe, atomic adjustment.
    // The RPC verifies that adminId actually has the 'admin' role.
    const { error: rpcError } = await supabaseAdmin.rpc("handle_admin_points_adjustment" as any, {
      p_admin_id: adminId,
      p_target_user_id: data.userId,
      p_amount: data.amount,
      p_action_type: data.actionType,
      p_reason: data.reason
    });

    if (rpcError) {
      console.error("Admin adjustment RPC error:", rpcError);
      throw new Error(rpcError.message || "Failed to adjust points");
    }

    return { success: true };
  });
