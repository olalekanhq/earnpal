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
          points_balance: number
          referral_code: string | null
          referred_by: string | null
          referral_clicks: number
          has_claimed_welcome_bonus: boolean
          welcome_banner_dismissed: boolean
          email: string | null
          last_activity_at: string | null
          created_at: string
          phone_number: string | null
        }
        Insert: any
        Update: any
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
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: any
        Update: any
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
          is_active: boolean
          is_featured: boolean
          created_at: string
        }
        Insert: any
        Update: any
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
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          points: number
          type: string
          is_active: boolean
          is_featured: boolean
          link_url: string | null
          created_at: string
        }
        Insert: any
        Update: any
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
        }
        Insert: any
        Update: any
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
      }
    }
    Views: {
      [key: string]: any
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
          _role: any
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
  }
}
