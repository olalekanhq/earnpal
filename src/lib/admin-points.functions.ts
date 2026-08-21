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
    
    // In TanStack Start v1, we can get the request from the global fetch context
    // if the framework exposes it, but since we are having trouble with getWebRequest,
    // let's try to access it via context or use a different pattern.
    
    // If we can't get the token, we can't verify the admin role in the server function.
    // However, the database function 'handle_admin_points_adjustment' ALREADY verifies the admin role
    // using the provided p_admin_id. We just need a way to securely identify the current user.
    
    // Attempt to get user from middleware injected context if available
    const userId = (context as any)?.userId;
    
    if (!userId) {
      throw new Error("Unauthorized: No user session found in context");
    }

    // Use the secure RPC for a safe, atomic adjustment
    const { error: rpcError } = await supabaseAdmin.rpc("handle_admin_points_adjustment" as any, {
      p_admin_id: userId,
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
