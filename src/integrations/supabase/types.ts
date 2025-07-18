export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string
          esg_impact: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          esg_impact?: number | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          esg_impact?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      esg_metrics: {
        Row: {
          carbon_footprint: number | null
          created_at: string
          environmental_score: number | null
          governance_score: number | null
          id: string
          overall_score: number | null
          period_end: string
          period_start: string
          social_score: number | null
          sustainable_spending: number | null
          total_spending: number | null
          user_id: string
        }
        Insert: {
          carbon_footprint?: number | null
          created_at?: string
          environmental_score?: number | null
          governance_score?: number | null
          id?: string
          overall_score?: number | null
          period_end: string
          period_start: string
          social_score?: number | null
          sustainable_spending?: number | null
          total_spending?: number | null
          user_id: string
        }
        Update: {
          carbon_footprint?: number | null
          created_at?: string
          environmental_score?: number | null
          governance_score?: number | null
          id?: string
          overall_score?: number | null
          period_end?: string
          period_start?: string
          social_score?: number | null
          sustainable_spending?: number | null
          total_spending?: number | null
          user_id?: string
        }
        Relationships: []
      }
      esg_tags: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          score_weight: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          score_weight?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          score_weight?: number
        }
        Relationships: []
      }
      esg_transactions: {
        Row: {
          buyer_id: string
          environmental_points_earned: number
          governance_points_earned: number
          id: string
          is_synced: boolean
          merchant_id: string
          social_points_earned: number
          total_points_earned: number
          transaction_amount: number
          transaction_date: string
        }
        Insert: {
          buyer_id: string
          environmental_points_earned?: number
          governance_points_earned?: number
          id?: string
          is_synced?: boolean
          merchant_id: string
          social_points_earned?: number
          total_points_earned?: number
          transaction_amount: number
          transaction_date?: string
        }
        Update: {
          buyer_id?: string
          environmental_points_earned?: number
          governance_points_earned?: number
          id?: string
          is_synced?: boolean
          merchant_id?: string
          social_points_earned?: number
          total_points_earned?: number
          transaction_amount?: number
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_esg_tags: {
        Row: {
          assigned_at: string
          id: string
          is_auto_assigned: boolean
          merchant_id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          is_auto_assigned?: boolean
          merchant_id: string
          tag_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          is_auto_assigned?: boolean
          merchant_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_esg_tags_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_esg_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "esg_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_incentives: {
        Row: {
          created_at: string
          discount_rate: number
          has_esg_badge: boolean
          id: string
          is_featured: boolean
          merchant_id: string
          tier: string
          total_impact_transactions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_rate?: number
          has_esg_badge?: boolean
          id?: string
          is_featured?: boolean
          merchant_id: string
          tier?: string
          total_impact_transactions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_rate?: number
          has_esg_badge?: boolean
          id?: string
          is_featured?: boolean
          merchant_id?: string
          tier?: string
          total_impact_transactions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_incentives_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_profiles: {
        Row: {
          business_description: string | null
          business_name: string
          business_type: string
          created_at: string
          environmental_score: number | null
          esg_rating: string | null
          esg_reason: string | null
          esg_score: number | null
          facebook_url: string | null
          governance_score: number | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          social_score: number | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          business_description?: string | null
          business_name: string
          business_type: string
          created_at?: string
          environmental_score?: number | null
          esg_rating?: string | null
          esg_reason?: string | null
          esg_score?: number | null
          facebook_url?: string | null
          governance_score?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          social_score?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          business_description?: string | null
          business_name?: string
          business_type?: string
          created_at?: string
          environmental_score?: number | null
          esg_rating?: string | null
          esg_reason?: string | null
          esg_score?: number | null
          facebook_url?: string | null
          governance_score?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          social_score?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string
          digital_id: string | null
          email: string | null
          esg_level: string | null
          esg_score: number | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          total_spent: number | null
          total_transactions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          digital_id?: string | null
          email?: string | null
          esg_level?: string | null
          esg_score?: number | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          total_spent?: number | null
          total_transactions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          digital_id?: string | null
          email?: string | null
          esg_level?: string | null
          esg_score?: number | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          total_spent?: number | null
          total_transactions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          esg_score: number | null
          id: string
          location: string | null
          merchant_name: string | null
          status: string | null
          tags: string[] | null
          title: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          esg_score?: number | null
          id?: string
          location?: string | null
          merchant_name?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          esg_score?: number | null
          id?: string
          location?: string | null
          merchant_name?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_esg_points: {
        Row: {
          environmental_points: number
          governance_points: number
          id: string
          last_updated: string
          social_points: number
          total_points: number
          user_id: string
        }
        Insert: {
          environmental_points?: number
          governance_points?: number
          id?: string
          last_updated?: string
          social_points?: number
          total_points?: number
          user_id: string
        }
        Update: {
          environmental_points?: number
          governance_points?: number
          id?: string
          last_updated?: string
          social_points?: number
          total_points?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_p2p_transaction: {
        Args: {
          buyer_id: string
          seller_id: string
          amount: number
          title?: string
          description?: string
          merchant_name?: string
          location?: string
          tags?: string[]
          esg_score?: number
        }
        Returns: Json
      }
      increment_merchant_impact_transactions: {
        Args: { merchant_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
