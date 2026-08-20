export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        }
        Insert: any
        Update: any
        Relationships: []
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
        Insert: any
        Update: any
        Relationships: []
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
        Insert: any
        Update: any
        Relationships: []
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
        Insert: any
        Update: any
        Relationships: []
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          status: string
          created_at: string
        }
        Insert: any
        Update: any
        Relationships: []
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
        Insert: any
        Update: any
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
        }
        Insert: any
        Update: any
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          status: string
          created_at: string
        }
        Insert: any
        Update: any
        Relationships: []
      }
      task_submissions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          status: string
          created_at: string
        }
        Insert: any
        Update: any
        Relationships: []
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
        Insert: any
        Update: any
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: any
        Update: any
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          username: string | null
          points_balance: number | null
          rank: number | null
        }
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
          _user_id: string
        }
        Returns: Json
      }
      lookup_login_email: {
        Args: {
          _identifier: string
        }
        Returns: Json
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
