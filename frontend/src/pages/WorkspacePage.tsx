import type { Account, Page, User } from '../types'
import Sidebar from '../components/organisms/Sidebar'
import AccountsPanel from '../components/organisms/AccountsPanel'
import JournalPanel from '../components/organisms/JournalPanel'
import LedgerPanel from '../components/organisms/LedgerPanel'
import OverviewPage from './OverviewPage'
import Message from '../components/atoms/Message'

type Props = { user: User; companyId: string; page: Page; accounts: Account[]; message: string; onCompanyChange: (id: string) => void; onPageChange: (page: Page) => void; reload: () => Promise<void>; onError: (error: unknown) => void; notify: (message: string) => void }
const titles: Record<Page, [string, string, string]> = {
  overview: ['Vista general', 'Resumen', 'Un vistazo a la actividad contable de tu empresa.'],
  accounts: ['Catálogo', 'Cuentas', 'Administra las cuentas contables de tu empresa.'],
  journal: ['Registro contable', 'Nueva póliza', 'Registra una operación en el libro diario.'],
  ledger: ['Consulta contable', 'Mayor auxiliar', 'Consulta el detalle y saldo de una cuenta.']
}
export default function WorkspacePage({ user, companyId, page, accounts, message, onCompanyChange, onPageChange, reload, onError, notify }: Props) {
  const role = user.companies.find(company => company.company_id === companyId)?.role
  const canEdit = role === 'ADMIN' || role === 'ACCOUNTANT'
  const [eyebrow, title, description] = titles[page]
  return <section className="workspace"><Sidebar companies={user.companies} companyId={companyId} page={page} onCompanyChange={onCompanyChange} onPageChange={onPageChange}/><div className="content-area"><div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div><span className="date-chip">{new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date())}</span></div><div className="global-message"><Message text={message}/></div>
    {page === 'overview' && <OverviewPage accounts={accounts} navigate={onPageChange}/ >}
    {page === 'accounts' && <AccountsPanel key={companyId} companyId={companyId} accounts={accounts} canEdit={canEdit} reload={reload} onError={onError} notify={notify}/ >}
    {page === 'journal' && canEdit && <JournalPanel key={companyId} companyId={companyId} accounts={accounts} onSaved={() => onPageChange('overview')} onError={onError} notify={notify}/ >}
    {page === 'ledger' && <LedgerPanel key={companyId} companyId={companyId} accounts={accounts} onError={onError}/ >}
  </div></section>
}
