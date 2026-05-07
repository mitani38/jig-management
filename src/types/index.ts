export type UserRole = 'admin' | 'staff'

export interface Profile {
  id: string
  email: string
  name: string | null
  role: UserRole
  created_at: string
}

export interface Jig {
  id: string
  jig_id: string
  no: number | null
  customer: string | null
  project_name: string | null
  drawing_number: string | null
  work_order_number: string | null
  customer_order_number: string | null
  product_name: string | null
  storage_location: string | null
  storage_area: string | null
  status: string | null
  notes: string | null
  category: string | null
  disposal_return_date: string | null
  disposal_return_reason: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface JigHistory {
  id: string
  jig_id: string
  action: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  changed_by: string | null
  changed_at: string
  profiles?: { name: string | null; email: string }
}

export const JIG_STATUS_OPTIONS = [
  '保管（客先資産）',
  '使用中',
  '廃棄済',
  '返却済',
  'その他',
] as const

export const JIG_CATEGORY_OPTIONS = ['コイル', '鉄心', 'その他'] as const
