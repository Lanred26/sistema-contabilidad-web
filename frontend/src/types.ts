export type Role = 'ADMIN' | 'ACCOUNTANT' | 'VIEWER'
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
export interface CompanyMembership { company_id: string; role: Role }
export interface User { id: string; email: string; name: string; companies: CompanyMembership[] }
export interface Account { id: string; code: string; name: string; type: AccountType; subtype: string | null; active: boolean; created_at?: string; updated_at?: string }
export interface JournalLine { key: number; accountId: string; description: string; debit: string; credit: string }
export interface LedgerMovement { entry_id: string; entry_date: string; description: string | null; entry_description: string; debit: string; credit: string; balance: string }
export interface Ledger { account: Account; from: string; to: string; openingBalance: string; closingBalance: string; movements: LedgerMovement[] }
export type Page = 'overview' | 'accounts' | 'journal' | 'ledger'
export const accountTypes: Record<AccountType, string> = { ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Capital', REVENUE: 'Ingreso', EXPENSE: 'Gasto' }
export const roleNames: Record<Role, string> = { ADMIN: 'Administrador', ACCOUNTANT: 'Contabilidad', VIEWER: 'Solo lectura' }
export function localDate() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
export function decimalCents(value: string): bigint | null { if (!/^\d{1,13}(\.\d{1,2})?$/.test(value)) return null; const [whole, fraction = ''] = value.split('.'); return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')) }
export function money(value: string | bigint): string { const cents = typeof value === 'bigint' ? value : decimalCents(value.replace(/^-/, '')) ?? 0n; const sign = String(value).startsWith('-') || cents < 0n ? '-' : ''; const amount = cents < 0n ? -cents : cents; return `${sign}$${(amount / 100n).toLocaleString('es-MX')}.${String(amount % 100n).padStart(2, '0')}` }
