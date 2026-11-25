import type { CompanyMembership, Page } from '../../types'
import { roleNames } from '../../types'

type Props = { companies: CompanyMembership[]; companyId: string; page: Page; onCompanyChange: (id: string) => void; onPageChange: (page: Page) => void }
export default function Sidebar({ companies, companyId, page, onCompanyChange, onPageChange }: Props) {
  const selected = companies.find(company => company.company_id === companyId)
  const items: { page: Page; icon: string; label: string }[] = [
    { page: 'overview', icon: '▦', label: 'Resumen' },
    { page: 'accounts', icon: '▤', label: 'Cuentas' },
    { page: 'journal', icon: '＋', label: 'Nueva póliza' },
    { page: 'ledger', icon: '≋', label: 'Consultar mayor' }
  ]
  return <aside className="sidebar" aria-label="Navegación principal">
    <p className="eyebrow">Espacio de trabajo</p>
    <div className="company-switcher"><span className="company-icon" aria-hidden="true">⌂</span><span className="company-info"><strong>Empresa {companyId.slice(0, 8)}</strong><small>{selected ? roleNames[selected.role] : ''}</small></span></div>
    {companies.length > 1 && <select className="company-select" aria-label="Seleccionar empresa" value={companyId} onChange={event => onCompanyChange(event.target.value)}>{companies.map(company => <option key={company.company_id} value={company.company_id}>Empresa {company.company_id.slice(0, 8)}</option>)}</select>}
    <nav className="nav-list">{items.filter(item => item.page !== 'journal' || selected?.role !== 'VIEWER').map(item => <button key={item.page} className={`nav-item${page === item.page ? ' active' : ''}`} type="button" onClick={() => onPageChange(item.page)}><span aria-hidden="true">{item.icon}</span> {item.label}</button>)}</nav>
    <div className="sidebar-footer"><span className="status-dot"/> Sistema conectado</div>
  </aside>
}
