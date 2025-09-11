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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          entity: string
          entity_id: string
          id: string
          ip_address: string | null
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          budget_monthly: number | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          budget_monthly?: number | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          budget_monthly?: number | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_gross: number
          amount_net: number
          approved_at: string | null
          approver_id: string | null
          category_id: string
          created_at: string
          currency: string
          employee_id: string
          expense_date: string
          hash_dedupe: string
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          project_code_id: string | null
          receipt_file_id: string | null
          rejection_reason: string | null
          source: Database["public"]["Enums"]["expense_source"]
          status: Database["public"]["Enums"]["expense_status"]
          tax_vat: number | null
          updated_at: string
          vendor: string
        }
        Insert: {
          amount_gross: number
          amount_net: number
          approved_at?: string | null
          approver_id?: string | null
          category_id: string
          created_at?: string
          currency?: string
          employee_id: string
          expense_date: string
          hash_dedupe: string
          id?: string
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          project_code_id?: string | null
          receipt_file_id?: string | null
          rejection_reason?: string | null
          source?: Database["public"]["Enums"]["expense_source"]
          status?: Database["public"]["Enums"]["expense_status"]
          tax_vat?: number | null
          updated_at?: string
          vendor: string
        }
        Update: {
          amount_gross?: number
          amount_net?: number
          approved_at?: string | null
          approver_id?: string | null
          category_id?: string
          created_at?: string
          currency?: string
          employee_id?: string
          expense_date?: string
          hash_dedupe?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          project_code_id?: string | null
          receipt_file_id?: string | null
          rejection_reason?: string | null
          source?: Database["public"]["Enums"]["expense_source"]
          status?: Database["public"]["Enums"]["expense_status"]
          tax_vat?: number | null
          updated_at?: string
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_code_id_fkey"
            columns: ["project_code_id"]
            isOneToOne: false
            referencedRelation: "project_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_receipt_file_id_fkey"
            columns: ["receipt_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          checksum_sha256: string
          created_at: string
          id: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_key: string
          uploaded_by: string
        }
        Insert: {
          checksum_sha256: string
          created_at?: string
          id?: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_key: string
          uploaded_by: string
        }
        Update: {
          checksum_sha256?: string
          created_at?: string
          id?: string
          mime_type?: string
          original_name?: string
          size_bytes?: number
          storage_key?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          organization_id: string | null
          region: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          organization_id?: string | null
          region?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string | null
          region?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["category_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["category_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["category_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ADMIN" | "EMPLOYEE"
      category_status: "ACTIVE" | "INACTIVE"
      expense_source: "MANUAL" | "AI_EXTRACTED"
      expense_status: "PENDING" | "APPROVED" | "REJECTED"
      payment_method: "CARD" | "CASH" | "TRANSFER" | "OTHER"
      user_status: "ACTIVE" | "INACTIVE"
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
    Enums: {
      app_role: ["ADMIN", "EMPLOYEE"],
      category_status: ["ACTIVE", "INACTIVE"],
      expense_source: ["MANUAL", "AI_EXTRACTED"],
      expense_status: ["PENDING", "APPROVED", "REJECTED"],
      payment_method: ["CARD", "CASH", "TRANSFER", "OTHER"],
      user_status: ["ACTIVE", "INACTIVE"],
    },
  },
} as const
