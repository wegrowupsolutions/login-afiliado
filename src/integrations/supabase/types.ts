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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      afiliados_perfis: {
        Row: {
          codigo_afiliado: string
          created_at: string
          data_cadastro: string
          email: string
          id: string
          nome_completo: string
          senha: string
          status: Database["public"]["Enums"]["afiliado_status"]
          telefone: string | null
          total_cadastros: number | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          codigo_afiliado: string
          created_at?: string
          data_cadastro?: string
          email: string
          id?: string
          nome_completo: string
          senha?: string
          status?: Database["public"]["Enums"]["afiliado_status"]
          telefone?: string | null
          total_cadastros?: number | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          codigo_afiliado?: string
          created_at?: string
          data_cadastro?: string
          email?: string
          id?: string
          nome_completo?: string
          senha?: string
          status?: Database["public"]["Enums"]["afiliado_status"]
          telefone?: string | null
          total_cadastros?: number | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cadastros_afiliados: {
        Row: {
          afiliado_id: string | null
          checkout_01: string
          checkout_02: string | null
          checkout_03: string | null
          checkout_04: string | null
          checkout_05: string | null
          created_at: string
          descricao_produto: string
          documentos_complementares: string[] | null
          id: string
          imagens_produto: string[] | null
          imagens_prova_social: string[] | null
          link_instagram: string | null
          link_pagina_vendas: string
          nome_agente: string
          nome_produto: string
          updated_at: string
          videos_depoimento: string[] | null
          whatsapp: string
        }
        Insert: {
          afiliado_id?: string | null
          checkout_01: string
          checkout_02?: string | null
          checkout_03?: string | null
          checkout_04?: string | null
          checkout_05?: string | null
          created_at?: string
          descricao_produto: string
          documentos_complementares?: string[] | null
          id?: string
          imagens_produto?: string[] | null
          imagens_prova_social?: string[] | null
          link_instagram?: string | null
          link_pagina_vendas: string
          nome_agente: string
          nome_produto: string
          updated_at?: string
          videos_depoimento?: string[] | null
          whatsapp: string
        }
        Update: {
          afiliado_id?: string | null
          checkout_01?: string
          checkout_02?: string | null
          checkout_03?: string | null
          checkout_04?: string | null
          checkout_05?: string | null
          created_at?: string
          descricao_produto?: string
          documentos_complementares?: string[] | null
          id?: string
          imagens_produto?: string[] | null
          imagens_prova_social?: string[] | null
          link_instagram?: string | null
          link_pagina_vendas?: string
          nome_agente?: string
          nome_produto?: string
          updated_at?: string
          videos_depoimento?: string[] | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadastros_afiliados_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados_perfis"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_codigo_afiliado: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      afiliado_status: "ativo" | "inativo" | "pendente"
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
      afiliado_status: ["ativo", "inativo", "pendente"],
    },
  },
} as const
