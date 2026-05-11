export type AppRole = 'teacher' | 'department_head' | 'school' | 'admin'

export function normalizeRole(input?: string | null): AppRole {
  const value = (input || '').toLowerCase().replace(/[-\s]/g, '_')

  if (value === 'admin' || value === 'administrator') return 'admin'
  if (value === 'department_head' || value === 'dept_head' || value === 'head')
    return 'department_head'
  if (
    value === 'school' ||
    value === 'school_leader' ||
    value === 'leader' ||
    value === 'principal'
  )
    return 'school'

  return 'teacher'
}

export function roleLabel(role: AppRole): string {
  if (role === 'department_head') return 'Department Head'
  if (role === 'school') return 'School'
  if (role === 'admin') return 'Admin'
  return 'Teacher'
}
