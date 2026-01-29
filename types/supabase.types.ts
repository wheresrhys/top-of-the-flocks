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
      Birds: {
        Row: {
          id: number
          ring_no: string
          species_id: number
        }
        Insert: {
          id?: number
          ring_no: string
          species_id: number
        }
        Update: {
          id?: number
          ring_no?: string
          species_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "birds_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "Species"
            referencedColumns: ["id"]
          },
        ]
      }
      Encounters: {
        Row: {
          age_code: number
          bird_id: number
          breeding_condition: string | null
          capture_time: string
          extra_text: string | null
          id: number
          is_juv: boolean
          minimum_years: number
          moult_code: string | null
          old_greater_coverts: number | null
          record_type: string
          scheme: string
          session_id: number
          sex: string
          sexing_method: string | null
          weight: number | null
          wing_length: number | null
        }
        Insert: {
          age_code: number
          bird_id: number
          breeding_condition?: string | null
          capture_time: string
          extra_text?: string | null
          id?: number
          is_juv?: boolean
          minimum_years: number
          moult_code?: string | null
          old_greater_coverts?: number | null
          record_type: string
          scheme: string
          session_id: number
          sex: string
          sexing_method?: string | null
          weight?: number | null
          wing_length?: number | null
        }
        Update: {
          age_code?: number
          bird_id?: number
          breeding_condition?: string | null
          capture_time?: string
          extra_text?: string | null
          id?: number
          is_juv?: boolean
          minimum_years?: number
          moult_code?: string | null
          old_greater_coverts?: number | null
          record_type?: string
          scheme?: string
          session_id?: number
          sex?: string
          sexing_method?: string | null
          weight?: number | null
          wing_length?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "encounters_bird_id_fkey"
            columns: ["bird_id"]
            isOneToOne: false
            referencedRelation: "Birds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "Sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      Sessions: {
        Row: {
          id: number
          visit_date: string
        }
        Insert: {
          id?: number
          visit_date: string
        }
        Update: {
          id?: number
          visit_date?: string
        }
        Relationships: []
      }
      Species: {
        Row: {
          id: number
          species_name: string
        }
        Insert: {
          id?: number
          species_name: string
        }
        Update: {
          id?: number
          species_name?: string
        }
        Relationships: []
      }
      top_periods_result: {
        Row: {
          metric_value: number | null
          visit_date: string | null
        }
        Insert: {
          metric_value?: number | null
          visit_date?: string | null
        }
        Update: {
          metric_value?: number | null
          visit_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      species_league_table: {
        Row: {
          average_weight: number | null
          average_wing_length: number | null
          encounters: number | null
          heaviest: number | null
          individuals: number | null
          lightest: number | null
          longest_stay: number | null
          longest_winged: number | null
          session_count: number | null
          shortest_winged: number | null
          species_name: string | null
          total_weight: number | null
          unluckiest: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      top_periods_by_metric: {
        Args: {
          exact_months_filter?: string[]
          metric_name?: string
          month_filter?: number
          months_filter?: number[]
          result_limit?: number
          temporal_unit?: string
          year_filter?: number
        }
        Returns: {
          metric_value: number | null
          visit_date: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "top_periods_result"
          isOneToOne: false
          isSetofReturn: true
        }
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
