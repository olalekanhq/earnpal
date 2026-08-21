import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const adjustUserPoints = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    userId: z.string().uuid(),
    amount: z.number().int(),
    reason: z.string().min(1),
    actionType: z.enum(["credit", "debit"])
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getWebRequest } = await import("@tanstack/react-start/server");
    
    const request = getWebRequest();
    if (!request) {
      throw new Error("Request context missing");
    }

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      throw new Error("Unauthorized: Missing token");
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized: Invalid session");
    }

    // Use the secure RPC for a safe, atomic adjustment
    const { error: rpcError } = await supabaseAdmin.rpc("handle_admin_points_adjustment" as any, {
      p_admin_id: user.id,
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
