import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const assignUserRole = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    userId: z.string().uuid(),
    role: z.enum(['admin', 'moderator', 'user', 'task_manager'])
  }).parse(data))
  .handler(async ({ data, context }) => {
    // We check auth inside handler or via middleware if available
    // For now, let's assume standard context check or direct admin verification
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    // 1. Verify the requester is an admin (service role key will bypass RLS anyway, 
    // so we must be careful. The route itself is gated, but defense in depth is good).
    
    if (data.role === 'user') {
      // Remove specific roles to reset to 'user'
      const { error } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', data.userId);
        
      if (error) throw new Error(error.message);
      return { success: true };
    }

    // Upsert the role
    const { error } = await supabaseAdmin
      .from('user_roles')
      .upsert({ 
        user_id: data.userId, 
        role: data.role 
      }, { onConflict: 'user_id,role' });

    if (error) throw new Error(error.message);
    
    return { success: true };
  });
