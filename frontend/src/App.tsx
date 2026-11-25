import { useEffect, useRef, useState } from 'react'
import type { Account, Page, User } from './types'
import { ApiError, request } from './api/client'
import AuthPanel from './components/organisms/AuthPanel'
import WorkspacePage from './pages/WorkspacePage'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [companyId, setCompanyId] = useState('')
  const [page, setPage] = useState<Page>('overview')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')
  const accountRequest = useRef(0)
  useEffect(() => { if (window.location.search) window.history.replaceState(null, document.title, window.location.pathname + window.location.hash) }, [])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3000); return () => window.clearTimeout(timer) }, [toast])
  function handleError(error: unknown) { if (error instanceof ApiError && error.status === 401) { accountRequest.current++; setUser(null); setCompanyId(''); setAccounts([]); setPage('overview') } else { setMessage(error instanceof Error ? error.message : 'Ocurrió un error inesperado.') } }
  async function loadAccounts(id: string) { const requestId = ++accountRequest.current; try { const result = await request<{ data: Account[] }>(`/companies/${id}/accounts`); if (requestId !== accountRequest.current) return; setAccounts(result.data); setMessage('') } catch (error) { if (requestId === accountRequest.current) handleError(error) } }
  function enter(userData: User) { if (!userData.companies?.length) throw new Error('Tu usuario no tiene una empresa asignada.'); const id = userData.companies[0].company_id; setUser(userData); setCompanyId(id); setPage('overview'); setAccounts([]); void loadAccounts(id) }
  function switchCompany(id: string) { setCompanyId(id); setPage('overview'); setAccounts([]); setMessage(''); void loadAccounts(id) }
  async function logout() { accountRequest.current++; try { await request('/auth/sessions/current', { method: 'DELETE' }) } catch { /* The local view still returns to login if the session expired. */ } setUser(null); setCompanyId(''); setAccounts([]); setPage('overview'); setMessage('') }
  return <div className="app-shell"><header className="topbar"><a className="brand" href="/" aria-label="Kontara, inicio" onClick={event => { if (user) { event.preventDefault(); setPage('overview') } }}><span><strong>Kontara</strong><small>contabilidad sencilla</small></span></a>{user && <div className="topbar-user"><span className="user-name">{user.name}</span><button className="button button-quiet button-small" type="button" onClick={logout}>Cerrar sesión</button></div>}</header><main>{user ? <WorkspacePage user={user} companyId={companyId} page={page} accounts={accounts} message={message} onCompanyChange={switchCompany} onPageChange={next => { setPage(next); setMessage('') }} reload={() => loadAccounts(companyId)} onError={handleError} notify={setToast}/ > : <AuthPanel onLogin={enter}/>}</main><footer className="site-footer"><span>Kontara</span><span>Gestión contable para tu empresa</span></footer><div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div></div>
}
