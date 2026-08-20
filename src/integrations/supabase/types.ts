export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          points_balance: number | null
          referral_code: string | null
          referred_by: string | null
          referral_clicks: number | null
          has_claimed_welcome_bonus: boolean | null
          welcome_banner_dismissed: boolean | null
          email: string | null
          last_activity_at: string | null
          created_at: string
          phone_number: string | null
          current_streak: number | null
          longest_streak: number | null
          email_notifications: boolean | null
          push_notifications: boolean | null
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      points_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean | null
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      rewards: {
        Row: {
          id: string
          title: string
          description: string | null
          cost_points: number
          stock_count: number | null
          image_url: string | null
          category: string | null
          is_active: boolean | null
          is_featured: boolean | null
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          status: string
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          points: number
          type: string
          is_active: boolean | null
          is_featured: boolean | null
          link_url: string | null
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          status: string
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      task_submissions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          status: string
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      admin_audit_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_id: string | null
          details: Json
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_at: string | null
          last_claim_at: string | null
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: any[]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          points_balance: number | null
          rank: number | null
        }
        Relationships: any[]
      }
    }
    Functions: {
      admin_adjust_points: {
        Args: {
          _user_id: string
          _amount: number
          _type: string
          _description: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: string
        }
        Returns: boolean
      }
      claim_daily_reward: {
        Args: {
          _user_id: string
        }
        Returns: Json
      }
      claim_welcome_bonus: {
        Args: {
          _user_id: string
        }
        Returns: Json
      }
      submit_task: {
        Args: {
          _user_id: string
          _task_id: string
        }
        Returns: Json
      }
      redeem_reward: {
        Args: {
          _reward_id: string
        }
        Returns: Json
      }
      check_referral_code: {
        Args: {
          _code: string
          _user_id: string | null
        }
        Returns: {
          is_valid: boolean
          username: string | null
        }
      }
      lookup_login_email: {
        Args: {
          _identifier: string
          _username?: string
        }
        Returns: string
      }
      increment_referral_clicks: {
        Args: {
            target_referral_code: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
