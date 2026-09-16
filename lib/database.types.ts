export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          item_name_snapshot: string
          quantity: number
          rental_item_id: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          item_name_snapshot: string
          quantity?: number
          rental_item_id: string
          subtotal?: number
          unit_price?: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          item_name_snapshot?: string
          quantity?: number
          rental_item_id?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_rental_item_id_fkey"
            columns: ["rental_item_id"]
            isOneToOne: false
            referencedRelation: "rental_items"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_due: number
          amount_paid: number
          booking_number: string
          business_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          deposit_total: number
          end_at: string
          id: string
          notes: string | null
          rental_total: number
          start_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          booking_number: string
          business_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          deposit_total?: number
          end_at: string
          id?: string
          notes?: string | null
          rental_total?: number
          start_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          booking_number?: string
          business_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          deposit_total?: number
          end_at?: string
          id?: string
          notes?: string | null
          rental_total?: number
          start_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          operating_hours: string | null
          owner_id: string | null
          phone: string | null
          slug: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          operating_hours?: string | null
          owner_id?: string | null
          phone?: string | null
          slug?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          operating_hours?: string | null
          owner_id?: string | null
          phone?: string | null
          slug?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          created_at: string
          error_message: string | null
          gross_amount: number | null
          id: string
          order_id: string | null
          processed: boolean
          raw_payload: Json
          signature_valid: boolean | null
          transaction_id: string | null
          transaction_status: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          gross_amount?: number | null
          id?: string
          order_id?: string | null
          processed?: boolean
          raw_payload: Json
          signature_valid?: boolean | null
          transaction_id?: string | null
          transaction_status?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          gross_amount?: number | null
          id?: string
          order_id?: string | null
          processed?: boolean
          raw_payload?: Json
          signature_valid?: boolean | null
          transaction_id?: string | null
          transaction_status?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          business_id: string
          created_at: string
          created_by: string | null
          currency: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          booking_id: string
          business_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          booking_id?: string
          business_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          code: string
          created_at: string
          duration_days: number | null
          features: Json
          id: number
          is_active: boolean
          max_bookings_per_month: number
          max_customers: number
          max_items: number
          max_staff: number
          name: string
          price: number
          product_id: number
        }
        Insert: {
          code: string
          created_at?: string
          duration_days?: number | null
          features?: Json
          id?: number
          is_active?: boolean
          max_bookings_per_month?: number
          max_customers?: number
          max_items?: number
          max_staff?: number
          name: string
          price?: number
          product_id: number
        }
        Update: {
          code?: string
          created_at?: string
          duration_days?: number | null
          features?: Json
          id?: number
          is_active?: boolean
          max_bookings_per_month?: number
          max_customers?: number
          max_items?: number
          max_staff?: number
          name?: string
          price?: number
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_app_url: string
          code: string
          created_at: string
          description: string | null
          icon_url: string | null
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          base_app_url: string
          code: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          is_active?: boolean
          name: string
        }
        Update: {
          base_app_url?: string
          code?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      rental_items: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string
          deposit_amount: number
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          price_unit: string
          sku: string | null
          status: string
          total_quantity: number
          updated_at: string
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string
          deposit_amount?: number
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          price_unit?: string
          sku?: string | null
          status?: string
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string
          deposit_amount?: number
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          price_unit?: string
          sku?: string | null
          status?: string
          total_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          business_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_lifetime: boolean
          last_payment_status: string | null
          midtrans_order_id: string | null
          midtrans_transaction_id: string | null
          plan_id: number
          plan_type: string
          product_id: number
          started_at: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_lifetime?: boolean
          last_payment_status?: string | null
          midtrans_order_id?: string | null
          midtrans_transaction_id?: string | null
          plan_id: number
          plan_type: string
          product_id: number
          started_at?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_lifetime?: boolean
          last_payment_status?: string | null
          midtrans_order_id?: string | null
          midtrans_transaction_id?: string | null
          plan_id?: number
          plan_type?: string
          product_id?: number
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          business_id: string
          period_month: string
          product_id: number
          total_bookings_this_month: number
          total_customers: number
          total_items: number
          updated_at: string
        }
        Insert: {
          business_id: string
          period_month?: string
          product_id: number
          total_bookings_this_month?: number
          total_customers?: number
          total_items?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          period_month?: string
          product_id?: number
          total_bookings_this_month?: number
          total_customers?: number
          total_items?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_counters_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          onboarding_completed: boolean
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          email: string
          id: string
          name?: string
          onboarding_completed?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          onboarding_completed?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_onboarding: {
        Args: { p_address?: string; p_business_name: string; p_phone?: string }
        Returns: string
      }
      current_business_id: { Args: never; Returns: string }
      get_auth_business_id: { Args: never; Returns: string }
      get_available_quantity: {
        Args: {
          p_end_at: string
          p_exclude_booking_id?: string
          p_rental_item_id: string
          p_start_at: string
        }
        Returns: number
      }
    }
    Enums: {
      booking_status:
        | "PENDING"
        | "CONFIRMED"
        | "ONGOING"
        | "COMPLETED"
        | "CANCELLED"
        | "OVERDUE"
      payment_method:
        | "CASH"
        | "TRANSFER"
        | "QRIS"
        | "EWALLET"
        | "CARD"
        | "OTHER"
      payment_status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "PENDING",
        "CONFIRMED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "OVERDUE",
      ],
      payment_method: ["CASH", "TRANSFER", "QRIS", "EWALLET", "CARD", "OTHER"],
      payment_status: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    },
  },
} as const
