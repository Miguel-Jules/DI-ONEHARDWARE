// ===== DI-One Hardware Management System - Core JS =====

// ---- DATA STORE (localStorage-backed) ----
const Store = {
  get(key, def = []) {
    try { return JSON.parse(localStorage.getItem('diOne_' + key)) ?? def; }
    catch { return def; }
  },
  set(key, val) {
    localStorage.setItem('diOne_' + key, JSON.stringify(val));
  },
  // Seed initial data if empty
  seed() {
    if (!localStorage.getItem('diOne_seeded')) {
      Store.set('users', [
        { id: 1, name: 'Dionee Francia', username: 'owner', password: 'owner123', role: 'owner', active: true },
        { id: 2, name: 'Miguel Aldrich', username: 'miguel', password: 'staff123', role: 'staff', active: true },
        { id: 3, name: 'Christian De Vera', username: 'christian', password: 'staff123', role: 'staff', active: true },
        { id: 4, name: 'Rhodel Aries Rivera', username: 'rhodel', password: 'staff123', role: 'staff', active: true },
      ]);
      Store.set('products', [
        { id: 1,  name: 'Portland Cement (40kg)', category: 'Cement',     price: 285, cost: 220, stock: 150, unit: 'bag',   icon: 'images/cement.jpg' },
        { id: 2,  name: 'Deformed Bar 10mm x 6m', category: 'Steel',      price: 220, cost: 180, stock: 200, unit: 'pc',    icon: 'images/rebar.jpg' },
        { id: 3,  name: 'Hollow Block 4"',         category: 'Blocks',    price: 18,  cost: 12,  stock: 500, unit: 'pc',    icon: 'images/hollow-block.jpg' },
        { id: 4,  name: 'Sand (per sack)',          category: 'Aggregates',price: 55,  cost: 40,  stock: 300, unit: 'sack',  icon: 'images/sand.jpg' },
        { id: 5,  name: 'Gravel (per sack)',        category: 'Aggregates',price: 60,  cost: 45,  stock: 280, unit: 'sack',  icon: 'images/gravel.jpg' },
        { id: 6,  name: 'Plywood 1/4" (4x8)',       category: 'Wood',      price: 380, cost: 300, stock: 80,  unit: 'sheet', icon: 'images/plywood.jpg' },
        { id: 7,  name: 'PVC Pipe 3/4" x 3m',      category: 'Plumbing',  price: 95,  cost: 70,  stock: 120, unit: 'pc',    icon: 'images/pvc.jpg' },
        { id: 8,  name: 'GI Wire #16',              category: 'Hardware',  price: 75,  cost: 55,  stock: 90,  unit: 'kg',    icon: 'images/gi-wire.jpg' },
        { id: 9,  name: 'Paint (White, 1 gal)',     category: 'Paint',     price: 480, cost: 380, stock: 60,  unit: 'can',   icon: 'images/paint.jpg' },
        { id: 10, name: 'Roofing Nail (1kg)',        category: 'Hardware',  price: 65,  cost: 45,  stock: 200, unit: 'kg',    icon: 'images/roofing-nail.jpg' },
      ]);
      Store.set('sales', []);
      Store.set('stockLogs', []);
      Store.set('estimates', []);
      localStorage.setItem('diOne_seeded', '1');
    }
  }
};

// ---- AUTH ----
const Auth = {
  login(username, password) {
    const users = Store.get('users', []);
    const user = users.find(u => u.username === username && u.password === password && u.active);
    if (user) {
      sessionStorage.setItem('diOne_session', JSON.stringify({ id: user.id, name: user.name, role: user.role, username: user.username }));
      return user;
    }
    return null;
  },
  logout() {
    sessionStorage.removeItem('diOne_session');
    window.location.href = 'index.html';
  },
  current() {
    try { return JSON.parse(sessionStorage.getItem('diOne_session')); }
    catch { return null; }
  },
  require(role) {
    const user = this.current();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (role && user.role !== role) { window.location.href = 'index.html'; return null; }
    return user;
  },
  requireAny() {
    const user = this.current();
    if (!user) { window.location.href = 'index.html'; return null; }
    return user;
  }
};

// ---- UTILITIES ----
const Util = {
  fmtMoney(n) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  fmtDateTime(d) {
    if (!d) return '';
    return new Date(d).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  genId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  },
  genRef(prefix) {
    return prefix + '-' + Date.now().toString().slice(-6);
  },
  toast(msg, type = 'success') {
    const existing = document.querySelector('.di-toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'di-toast';
    const colors = { success: '#16a34a', danger: '#dc2626', warning: '#d97706', info: '#2563a8' };
    t.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      background:${colors[type] || colors.success}; color:#fff;
      padding:12px 20px; border-radius:8px; font-size:0.88rem;
      box-shadow:0 4px 16px rgba(0,0,0,0.18); font-family:'Segoe UI',Arial,sans-serif;
      animation: fadeInUp 0.25s ease;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
  confirm(msg) {
    return window.confirm(msg);
  }
};

// ---- SIDEBAR BUILDER ----
function buildSidebar(role, activePage) {
  const user = Auth.current();
  if (!user) return;

  const ownerNav = `
    <div class="nav-section-label">Main</div>
    <a href="dashboard-owner.html" class="${activePage==='dashboard'?'active':''}"><span class="nav-icon">📊</span><span>Dashboard</span></a>
    <div class="nav-section-label">Operations</div>
    <a href="estimation.html" class="${activePage==='estimation'?'active':''}"><span class="nav-icon">📐</span><span>Material Estimation</span></a>
    <a href="pos.html" class="${activePage==='pos'?'active':''}"><span class="nav-icon">🛒</span><span>Point of Sale</span></a>
    <a href="inventory.html" class="${activePage==='inventory'?'active':''}"><span class="nav-icon">📦</span><span>Inventory</span></a>
    <a href="stock.html" class="${activePage==='stock'?'active':''}"><span class="nav-icon">🔄</span><span>Stock In/Out</span></a>
    <div class="nav-section-label">Management</div>
    <a href="products.html" class="${activePage==='products'?'active':''}"><span class="nav-icon">🏷️</span><span>Products</span></a>
    <a href="reports.html" class="${activePage==='reports'?'active':''}"><span class="nav-icon">📋</span><span>Reports</span></a>
    <a href="users.html" class="${activePage==='users'?'active':''}"><span class="nav-icon">👥</span><span>User Access</span></a>
  `;

  const staffNav = `
    <div class="nav-section-label">Main</div>
    <a href="dashboard-staff.html" class="${activePage==='dashboard'?'active':''}"><span class="nav-icon">📊</span><span>Dashboard</span></a>
    <div class="nav-section-label">Operations</div>
    <a href="estimation.html" class="${activePage==='estimation'?'active':''}"><span class="nav-icon">📐</span><span>Material Estimation</span></a>
    <a href="pos.html" class="${activePage==='pos'?'active':''}"><span class="nav-icon">🛒</span><span>Point of Sale</span></a>
    <a href="inventory.html" class="${activePage==='inventory'?'active':''}"><span class="nav-icon">📦</span><span>Inventory</span></a>
    <a href="stock.html" class="${activePage==='stock'?'active':''}"><span class="nav-icon">🔄</span><span>Stock In/Out</span></a>
  `;

  return `
    <div class="sidebar-logo">
      <h2><span>DI-ONE</span> Hardware</h2>
      <p>Management System</p>
    </div>
    <div class="sidebar-user">
      <div class="user-avatar">${user.name.charAt(0)}</div>
      <div class="user-info">
        <strong>${user.name.split(' ')[0]}</strong>
        <small>${user.role === 'owner' ? 'Owner/Manager' : 'Staff'}</small>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${role === 'owner' ? ownerNav : staffNav}
    </nav>
    <div class="sidebar-footer">
      <a href="#" onclick="Auth.logout()"><span class="nav-icon">🚪</span><span>Logout</span></a>
    </div>
  `;
}

// ---- ICON RENDERER ----
// Supports both emoji strings and image URLs/paths
const Icon = {
  /**
   * Returns an HTML string for an icon — either an <img> or a <span>.
   * @param {string} icon   - emoji char or URL/path (http, /, ./, or contains a dot extension)
   * @param {string} size   - CSS size string, e.g. '2rem' or '32px'
   */
  render(icon, size = '1.8rem') {
    if (!icon) return `<span style="font-size:${size};">📦</span>`;
    const isUrl = icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('./') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(icon);
    if (isUrl) {
      return `<img src="${icon}" alt="product" style="width:${size};height:${size};object-fit:cover;border-radius:4px;" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\'font-size:${size};\\'>📦</span>')" />`;
    }
    return `<span style="font-size:${size};">${icon}</span>`;
  }
};

// ---- MIGRATION: update all product icons for existing sessions ----
(function migrateIcons() {
  const products = Store.get('products', []);
  if (!products.length) return;
  let changed = false;

  const updates = {
    1:  'images/cement.jpg',
    2:  'images/rebar.jpg',
    3:  'images/hollow-block.jpg',
    4:  'images/sand.jpg',
    5:  'images/gravel.jpg',
    6:  'images/plywood.jpg',
    7:  'images/pvc.jpg',
    8:  'images/gi-wire.jpg',
    9:  'images/paint.jpg',
    10: 'images/roofing-nail.jpg',
  };

  products.forEach(p => {
    if (updates[p.id] && p.icon !== updates[p.id]) {
      p.icon = updates[p.id];
      changed = true;
    }
    if (p.id === 4 && p.name === 'River Sand (per sack)') {
      p.name = 'Sand (per sack)';
      changed = true;
    }
  });

  if (changed) Store.set('products', products);
})();

// Init
Store.seed();
