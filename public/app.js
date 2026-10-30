const API = '/api/v1';
const TYPES = { ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Capital', REVENUE: 'Ingreso', EXPENSE: 'Gasto' };
const state = { user: null, companies: [], companyId: null, role: null, accounts: [], page: 'overview' };
const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));
const localDate = () => { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

// No conservar datos sensibles en la barra de direcciones.
if (window.location.search) window.history.replaceState(null, document.title, window.location.pathname + window.location.hash);

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const raw = await response.text();
  let result = null;
  try { result = raw ? JSON.parse(raw) : null; } catch { result = null; }
  if (!response.ok) {
    const error = new Error(result?.message || (response.status === 404 ? 'La función de prueba no está habilitada en el servidor.' : 'No se pudo completar la solicitud.'));
    error.status = response.status;
    throw error;
  }
  return result;
}

function showMessage(element, message = '', success = false) {
  element.textContent = message;
  element.classList.toggle('success', success);
}
function typeName(type) { return TYPES[type] || type || '—'; }
function addCell(row, value, className) {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = value ?? '—';
  row.append(cell);
  return cell;
}
function option(select, value, label) {
  const item = document.createElement('option'); item.value = value; item.textContent = label; select.append(item); return item;
}
function toast(message) {
  const element = $('#toast'); element.textContent = message; element.classList.add('show');
  window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => element.classList.remove('show'), 3000);
}
function selectedCompany() { return state.companies.find((company) => company.company_id === state.companyId); }

function enterWorkspace(user) {
  state.user = user;
  state.companies = user.companies || [];
  if (!state.companies.length) throw new Error('Tu usuario no tiene una empresa asignada.');
  state.companyId = state.companyId && state.companies.some((company) => company.company_id === state.companyId) ? state.companyId : state.companies[0].company_id;
  state.role = selectedCompany().role;
  $('#login-view').hidden = true;
  $('#workspace-view').hidden = false;
  $('#topbar-user').hidden = false;
  $('#user-name').textContent = user.name;
  $('#company-label').textContent = `Empresa ${state.companyId.slice(0, 8)}`;
  $('#role-label').textContent = roleLabel(selectedCompany().role);
  $('#today-chip').textContent = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date());
  const companySelect = $('#company-select'); companySelect.replaceChildren();
  state.companies.forEach((company) => option(companySelect, company.company_id, `Empresa ${company.company_id.slice(0, 8)}`));
  companySelect.value = state.companyId;
  companySelect.hidden = state.companies.length < 2;
  const canEdit = ['ADMIN', 'ACCOUNTANT'].includes(selectedCompany().role);
  $('#new-account-button').hidden = !canEdit;
  $('#submit-journal').hidden = !canEdit;
  $('#add-line-button').hidden = !canEdit;
  document.querySelector('[data-page="journal"]').hidden = !canEdit;
  showPage('overview');
  loadAccounts();
}
function roleLabel(role) { return ({ ADMIN: 'Administrador', ACCOUNTANT: 'Contabilidad', VIEWER: 'Solo lectura' })[role] || role; }

async function loadAccounts() {
  try {
    const result = await request(`/companies/${state.companyId}/accounts`);
    state.accounts = result.data || [];
    renderAccounts();
    renderJournalLines();
    populateLedgerAccounts();
    $('#stat-accounts').textContent = state.accounts.length;
    showMessage($('#global-message'));
  } catch (error) { showMessage($('#global-message'), error.message); }
}

function renderAccounts() {
  const table = $('#accounts-table'); table.replaceChildren();
  const overview = $('#overview-accounts'); overview.replaceChildren();
  const active = state.accounts.filter((account) => account.active);
  $('#accounts-empty').hidden = state.accounts.length > 0;
  $('#overview-empty').hidden = state.accounts.length > 0;
  for (const account of state.accounts) {
    const row = document.createElement('tr');
    addCell(row, account.code);
    addCell(row, account.name);
    const typeCell = addCell(row, typeName(account.type));
    typeCell.replaceChildren(); const pill = document.createElement('span'); pill.className = 'type-pill'; pill.textContent = typeName(account.type); typeCell.append(pill);
    addCell(row, account.subtype || '—');
    const stateCell = addCell(row, account.active ? 'Activa' : 'Inactiva');
    const statePill = document.createElement('span'); statePill.className = `state-pill${account.active ? '' : ' inactive'}`; statePill.textContent = account.active ? 'Activa' : 'Inactiva'; stateCell.replaceChildren(statePill);
    const actionCell = addCell(row, '');
    if (account.active && ['ADMIN', 'ACCOUNTANT'].includes(state.role)) {
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'text-button'; edit.textContent = 'Desactivar'; edit.addEventListener('click', () => deactivateAccount(account)); actionCell.append(edit);
    }
    table.append(row);
    if (active.indexOf(account) < 5) {
      const summaryRow = document.createElement('tr'); addCell(summaryRow, account.code); addCell(summaryRow, account.name); addCell(summaryRow, typeName(account.type));
      const summaryState = addCell(summaryRow, 'Activa'); summaryState.classList.add('success'); overview.append(summaryRow);
    }
  }
}

async function deactivateAccount(account) {
  if (!window.confirm(`¿Desactivar la cuenta ${account.code} · ${account.name}?`)) return;
  try {
    await request(`/companies/${state.companyId}/accounts/${account.id}`, { method: 'PATCH', body: JSON.stringify({ active: false }) });
    toast('Cuenta desactivada'); await loadAccounts();
  } catch (error) { showMessage($('#global-message'), error.message); }
}

function showPage(page) {
  const titles = { overview: ['Vista general', 'Resumen', 'Un vistazo a la actividad contable de tu empresa.'], accounts: ['Catálogo', 'Cuentas', 'Administra las cuentas contables de tu empresa.'], journal: ['Registro contable', 'Nueva póliza', 'Registra una operación en el libro diario.'], ledger: ['Consulta contable', 'Mayor auxiliar', 'Consulta el detalle y saldo de una cuenta.'] };
  state.page = page;
  document.querySelectorAll('.page-panel').forEach((panel) => { panel.hidden = panel.id !== `page-${page}`; });
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
  $('#page-eyebrow').textContent = titles[page][0]; $('#page-title').textContent = titles[page][1]; $('#page-description').textContent = titles[page][2];
  showMessage($('#global-message'));
  if (page === 'journal' && !$('#journal-date').value) $('#journal-date').value = localDate();
}

function buildAccountOptions(select, includeBlank = false) {
  select.replaceChildren();
  if (includeBlank) option(select, '', 'Selecciona una cuenta');
  state.accounts.filter((account) => account.active).forEach((account) => option(select, account.id, `${account.code} · ${account.name}`));
}

function renderJournalLines() {
  const tbody = $('#journal-lines'); tbody.replaceChildren();
  addJournalLine(); addJournalLine(); updateTotals();
}
function addJournalLine() {
  const tbody = $('#journal-lines'); const row = document.createElement('tr');
  const accountCell = document.createElement('td'); const account = document.createElement('select'); account.setAttribute('aria-label', 'Cuenta contable'); account.required = true; buildAccountOptions(account, true); account.addEventListener('change', updateTotals); accountCell.append(account); row.append(accountCell);
  const descriptionCell = document.createElement('td'); const description = document.createElement('input'); description.maxLength = 240; description.placeholder = 'Detalle'; description.setAttribute('aria-label', 'Descripción de línea'); descriptionCell.append(description); row.append(descriptionCell);
  for (const side of ['debit', 'credit']) {
    const cell = document.createElement('td'); const amount = document.createElement('input'); amount.type = 'number'; amount.min = '0'; amount.step = '0.01'; amount.inputMode = 'decimal'; amount.placeholder = '0.00'; amount.className = 'amount-input'; amount.dataset.side = side; amount.setAttribute('aria-label', side === 'debit' ? 'Debe' : 'Haber'); amount.addEventListener('input', () => { const other = row.querySelector(`[data-side="${side === 'debit' ? 'credit' : 'debit'}"]`); if (Number(amount.value) > 0) other.value = ''; updateTotals(); }); cell.append(amount); row.append(cell);
  }
  const removeCell = document.createElement('td'); const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-line'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Quitar línea'); remove.addEventListener('click', () => { if (tbody.children.length > 2) { row.remove(); updateTotals(); } }); removeCell.append(remove); row.append(removeCell);
  tbody.append(row);
}
function updateTotals() {
  const lines = [...$('#journal-lines').querySelectorAll('tr')];
  const cents = (value) => Math.round((Number(value) + Number.EPSILON) * 100);
  const debit = lines.reduce((sum, row) => sum + cents(row.querySelector('[data-side="debit"]').value || 0), 0);
  const credit = lines.reduce((sum, row) => sum + cents(row.querySelector('[data-side="credit"]').value || 0), 0);
  const allComplete = lines.length >= 2 && lines.every((row) => row.querySelector('select').value && ((Number(row.querySelector('[data-side="debit"]').value) > 0) !== (Number(row.querySelector('[data-side="credit"]').value) > 0)));
  $('#total-debit').textContent = money(debit / 100); $('#total-credit').textContent = money(credit / 100); $('#total-difference').textContent = money(Math.abs(debit - credit) / 100);
  const balanced = allComplete && debit > 0 && debit === credit;
  $('#balance-badge').textContent = balanced ? 'Póliza balanceada' : 'Sin balancear'; $('#balance-badge').classList.toggle('balanced', balanced);
  $('#submit-journal').disabled = !balanced;
  return balanced;
}
function populateLedgerAccounts() {
  const select = $('#ledger-account'); const previous = select.value; buildAccountOptions(select, true); if (state.accounts.some((account) => account.id === previous && account.active)) select.value = previous;
}

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage($('#login-message'));
  const form = new FormData(event.currentTarget);
  try { const result = await request('/auth/sessions', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); enterWorkspace(result.user); }
  catch (error) { showMessage($('#login-message'), error.message); }
});

$('#signup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage($('#signup-message'));
  const form = new FormData(event.currentTarget); const credentials = { email: form.get('email'), password: form.get('password') };
  try {
    await request('/auth/development-users', { method: 'POST', body: JSON.stringify({ ...credentials, name: form.get('name'), companyName: form.get('companyName') }) });
    const result = await request('/auth/sessions', { method: 'POST', body: JSON.stringify(credentials) });
    enterWorkspace(result.user);
  } catch (error) { showMessage($('#signup-message'), error.message); }
});

$('#logout-button').addEventListener('click', async () => {
  try { await request('/auth/sessions/current', { method: 'DELETE' }); } catch { /* The UI returns to login even if the session has expired. */ }
  state.user = null; state.accounts = []; $('#workspace-view').hidden = true; $('#topbar-user').hidden = true; $('#login-view').hidden = false; $('#login-form').reset(); showPage('overview');
});
$('#company-select').addEventListener('change', (event) => { state.companyId = event.target.value; state.role = selectedCompany().role; $('#company-label').textContent = `Empresa ${state.companyId.slice(0, 8)}`; $('#role-label').textContent = roleLabel(state.role); const canEdit = ['ADMIN', 'ACCOUNTANT'].includes(state.role); $('#new-account-button').hidden = !canEdit; $('#submit-journal').hidden = !canEdit; $('#add-line-button').hidden = !canEdit; document.querySelector('[data-page="journal"]').hidden = !canEdit; loadAccounts(); });
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => showPage(item.dataset.page)));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => showPage(button.dataset.go)));

$('#new-account-button').addEventListener('click', () => { $('#account-form').hidden = false; $('#account-code').focus(); });
function closeAccountForm() { $('#account-form').hidden = true; $('#account-form').reset(); showMessage($('#account-message')); }
$('#close-account-form').addEventListener('click', closeAccountForm); $('#cancel-account-form').addEventListener('click', closeAccountForm);
$('#account-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage($('#account-message'));
  try {
    await request(`/companies/${state.companyId}/accounts`, { method: 'POST', body: JSON.stringify({ code: $('#account-code').value.trim(), name: $('#account-name').value.trim(), type: $('#account-type').value, subtype: $('#account-subtype').value.trim() || null }) });
    closeAccountForm(); await loadAccounts(); toast('Cuenta agregada al catálogo');
  } catch (error) { showMessage($('#account-message'), error.message); }
});

$('#add-line-button').addEventListener('click', addJournalLine);
$('#journal-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  showMessage($('#journal-message'));
  if (!updateTotals()) return;
  const lines = [...$('#journal-lines').querySelectorAll('tr')].map((row) => {
    const debit = row.querySelector('[data-side="debit"]').value; const credit = row.querySelector('[data-side="credit"]').value;
    return { accountId: row.querySelector('select').value, description: row.querySelector('td:nth-child(2) input').value.trim() || undefined, ...(debit ? { debit: Number(debit).toFixed(2) } : { credit: Number(credit).toFixed(2) }) };
  });
  try {
    await request(`/companies/${state.companyId}/journal-entries`, { method: 'POST', body: JSON.stringify({ date: $('#journal-date').value, description: $('#journal-description').value.trim(), lines }) });
    form.reset(); $('#journal-date').value = localDate(); renderJournalLines(); toast('Póliza guardada correctamente'); showPage('overview');
  } catch (error) { showMessage($('#journal-message'), error.message); }
});

$('#ledger-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage($('#global-message')); $('#ledger-result').hidden = true;
  const accountId = $('#ledger-account').value; const from = $('#ledger-from').value; const to = $('#ledger-to').value;
  if (from > to) { showMessage($('#global-message'), 'La fecha inicial debe ser anterior o igual a la fecha final.'); return; }
  try {
    const result = await request(`/companies/${state.companyId}/accounts/${accountId}/ledger?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const ledger = result.data;
    $('#ledger-title').textContent = `${ledger.account.code} · ${ledger.account.name}`; $('#ledger-period').textContent = `${from} — ${to}`;
    $('#opening-balance').textContent = money(ledger.openingBalance); $('#closing-balance').textContent = money(ledger.closingBalance);
    const tbody = $('#ledger-table'); tbody.replaceChildren(); $('#ledger-empty').hidden = ledger.movements.length > 0;
    ledger.movements.forEach((movement) => {
      const row = document.createElement('tr'); addCell(row, String(movement.entry_date).slice(0, 10)); addCell(row, movement.description || movement.entry_description || '—'); addCell(row, money(movement.debit)); addCell(row, money(movement.credit)); addCell(row, money(movement.balance)); tbody.append(row);
    });
    $('#ledger-result').hidden = false;
  } catch (error) { showMessage($('#global-message'), error.message); }
});

$('#ledger-from').value = `${new Date().getFullYear()}-01-01`; $('#ledger-to').value = localDate();

