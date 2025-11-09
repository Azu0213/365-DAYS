// ==============================
// 365 Days Flooring - Complete Site
// Homepage + Catalog functionality
// ==============================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on what page we're on
    if (document.getElementById('material-grid')) {
        // We're on catalog page
        initializeCatalog();
    } else {
        // We're on homepage
        initializeHomepage();
    }
    setupFooter();
});

// ==============================
// HOMEPAGE FUNCTIONALITY
// ==============================

function initializeHomepage() {
    initializeSplash();
    initializeSparks();
}

function initializeSplash() {
    const splash = document.querySelector('.splash');
    const siteHeader = document.querySelector('.site-header');
    const site = document.querySelector('.site');
    if (!splash) return;

    setTimeout(() => {
        splash.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        splash.style.opacity = '0';
        splash.style.transform = 'translateY(-8px) scale(0.98)';
        splash.style.pointerEvents = 'none';
        document.body.classList.add('enter');
        if (siteHeader) {
            siteHeader.style.transition = 'opacity 0.6s ease 0.2s, transform 0.7s ease 0.2s';
            siteHeader.style.opacity = '1';
            siteHeader.style.transform = 'translateY(0)';
        }
        if (site) {
            site.style.transition = 'opacity 0.6s ease 0.3s, transform 0.7s ease 0.3s';
            site.style.opacity = '1';
            site.style.transform = 'translateY(0)';
        }
        setTimeout(() => { splash.style.display = 'none'; }, 1000);
    }, 1500);
}

function initializeSparks() {
    const canvas = document.getElementById('dust');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.life = Math.random() * 300 + 100;
            this.age = 0;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.age++;
            this.opacity = Math.max(0, 1 - (this.age / this.life));
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
            return this.opacity > 0;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#DAA520';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#DAA520';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function createParticles() { for (let i = 0; i < 50; i++) particles.push(new Particle()); }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => { p.update(); p.draw(); return p.opacity > 0; });
        if (Math.random() < 0.1 && particles.length < 60) particles.push(new Particle());
        animationId = requestAnimationFrame(animate);
    }
    createParticles(); animate();
    setTimeout(() => { if (animationId) cancelAnimationFrame(animationId); }, 4000);
}

// ==============================
// CATALOG FUNCTIONALITY
// ==============================

function initializeCatalog() {
    loadCatalog();
    initializeSearch();
}

function setupFooter() {
    const yearElement = document.getElementById("year");
    if (yearElement) yearElement.textContent = new Date().getFullYear();
}

async function loadCatalog() {
    try {
        const response = await fetch('data/materials.json?v=' + Date.now());
        if (!response.ok) throw new Error(`Failed to load materials: ${response.status}`);
        const materials = await response.json();
        if (!materials.length) return showEmptyState();
        renderCatalog(materials);
    } catch (error) {
        console.error('Error loading catalog:', error);
        showErrorState(error.message);
    }
}

function showEmptyState() {
    const container = document.getElementById('material-grid');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <h3>No materials found</h3>
            <p>Please check back later or contact us for assistance.</p>
        </div>
    `;
}

function showErrorState(message) {
    const container = document.getElementById('material-grid');
    if (!container) return;
    container.innerHTML = `
        <div class="error-state">
            <h3>Error loading catalog</h3>
            <p>Unable to load materials: ${message}</p>
            <button onclick="loadCatalog()">Try Again</button>
        </div>
    `;
}

function renderCatalog(materials) {
    const container = document.getElementById('material-grid');
    if (!container) return;
    
    materialsData = materials;
    container.innerHTML = '';
    materials.forEach((material) => {
        const card = createMaterialCard(material);
        container.appendChild(card);
    });
    setupInitialFilterState();
    updateResultsCount(materials.length);
}

function setupInitialFilterState() {
    document.querySelectorAll('.quick-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.quick-filter[data-filter="all"]')?.classList.add('active');
    currentFilters = { search: '', quickFilter: 'all', materialType: '', collection: '', style: '', thickness: '' };
    const materialGrid = document.getElementById('material-grid');
    const noResultsEl = document.getElementById('no-results-message');
    if (materialGrid) materialGrid.style.display = 'grid';
    if (noResultsEl) noResultsEl.style.display = 'none';
}

function createMaterialCard(material) {
    const card = document.createElement('div');
    card.className = 'material-card';
    card.dataset.style = material.style || '';
    card.dataset.thickness = (material.specifications && material.specifications.thickness) || '';
    card.dataset.materialType = material.type || '';
    card.dataset.collection = material.collection || '';

    let featuresHTML = '';
    if (material.features && material.features.length) {
        featuresHTML = `
            <div class="material-features">
                ${material.features.map(feature => `<span class="feature-badge">${feature}</span>`).join('')}
            </div>`;
    }

    let specsHTML = '';
    if (material.specifications) {
        const s = material.specifications;
        specsHTML = `
            <div class="material-specs">
                <div class="spec-grid">
                    <div class="spec-item"><span class="spec-label">Thickness:</span><span class="spec-value">${s.thickness || 'N/A'}</span></div>
                    <div class="spec-item"><span class="spec-label">Wear Layer:</span><span class="spec-value">${s.wear_layer || 'N/A'}</span></div>
                    <div class="spec-item"><span class="spec-label">Core:</span><span class="spec-value">${s.core || 'N/A'}</span></div>
                    <div class="spec-item"><span class="spec-label">Warranty:</span><span class="spec-value">${s.warranty || 'N/A'}</span></div>
                    <div class="spec-item"><span class="spec-label">Waterproof:</span><span class="spec-value ${s.waterproof ? 'waterproof-yes' : 'waterproof-no'}">${s.waterproof ? '100% GUARANTEED' : 'No'}</span></div>
                    <div class="spec-item"><span class="spec-label">Installation:</span><span class="spec-value">${s.installation || 'N/A'}</span></div>
                </div>
            </div>`;
    }

    card.innerHTML = `
        <div class="material-image-container">
            <div class="waterproof-guarantee-badge">
                <span class="waterproof-icon">💧</span>
                <span class="waterproof-text">100% WATERPROOF GUARANTEED</span>
            </div>
            <img src="${material.images.sample}" alt="${material.name}" class="material-image" loading="lazy" onerror="this.src='${material.images.label}'">
        </div>
        <div class="material-info">
            <h3 class="material-name">${material.name}</h3>
            <p class="material-collection">${material.collection}</p>
            <p class="material-type">${material.type}</p>
            ${featuresHTML}
            ${specsHTML}
            <span class="material-id">${material.id}</span>
        </div>
    `;
    
    // Add click handler for material detail modal
    card.addEventListener('click', () => showMaterialDetail(material));
    card.style.cursor = 'pointer';
    
    return card;
}

function showMaterialDetail(material) {
    const modal = document.createElement('div');
    modal.className = 'material-modal';

    let modalImageHTML = '';
    if (material.images && material.images.label && material.images.sample) {
        modalImageHTML = `
            <div class="modal-images dual">
                <div class="modal-image-item">
                    <img src="${material.images.label}" alt="${material.name} - Label" class="modal-image">
                    <span class="modal-image-label">Label</span>
                </div>
                <div class="modal-image-item">
                    <img src="${material.images.sample}" alt="${material.name} - Sample" class="modal-image">
                    <span class="modal-image-label">Sample</span>
                </div>
            </div>`;
    } else {
        const imageUrl = (material.images && material.images.sample) || (material.images && material.images.label) || 'catalog/images/placeholder.jpg';
        modalImageHTML = `<img src="${imageUrl}" alt="${material.name}" class="modal-image">`;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${material.name}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${modalImageHTML}
                <div class="modal-info">
                    <div class="modal-waterproof-guarantee">
                        <div class="waterproof-guarantee-large">
                            <span class="waterproof-icon-large">💧</span>
                            <div class="waterproof-guarantee-text">
                                <h3>100% WATERPROOF GUARANTEE</h3>
                                <p>This flooring is completely waterproof and backed by our lifetime warranty</p>
                            </div>
                            <span class="waterproof-checkmark">✓</span>
                        </div>
                    </div>
                    <p><strong>ID:</strong> ${material.id}</p>
                    <p><strong>Collection:</strong> ${material.collection || 'N/A'}</p>
                    <p><strong>Type:</strong> ${material.type || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    const handleEsc = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', handleEsc); } };
    document.addEventListener('keydown', handleEsc);
}

// Enhanced Search & Filter System
let currentFilters = { search: '', quickFilter: 'all', materialType: '', collection: '', style: '', thickness: '' };

function updateResultsCount(count) {
    const el = document.getElementById('results-count');
    if (el) el.textContent = count;
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const filterToggle = document.getElementById('filter-toggle');
    const clearFilters = document.getElementById('clear-filters');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
    }
    document.querySelectorAll('.quick-filter').forEach(btn => btn.addEventListener('click', handleQuickFilter));
    document.getElementById('material-type')?.addEventListener('change', handleAdvancedFilter);
    document.getElementById('collection-filter')?.addEventListener('change', handleAdvancedFilter);
    document.getElementById('style-filter')?.addEventListener('change', handleAdvancedFilter);
    document.getElementById('thickness-filter')?.addEventListener('change', handleAdvancedFilter);
    filterToggle?.addEventListener('click', toggleAdvancedFilters);
    clearFilters?.addEventListener('click', clearAllFilters);
}

function handleSearch(e) { currentFilters.search = e.target.value.toLowerCase(); applyAllFilters(); updateSearchSuggestions(e.target.value); }
function handleQuickFilter(e) {
    document.querySelectorAll('.quick-filter').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active'); currentFilters.quickFilter = e.target.dataset.filter; applyAllFilters();
}
function handleAdvancedFilter(e) {
    const id = e.target.id, v = e.target.value;
    if (id === 'material-type') currentFilters.materialType = v;
    if (id === 'collection-filter') currentFilters.collection = v;
    if (id === 'style-filter') currentFilters.style = v;
    if (id === 'thickness-filter') currentFilters.thickness = v;
    applyAllFilters();
}

function applyAllFilters() {
    const cards = document.querySelectorAll('.material-card');
    let visible = 0;
    cards.forEach(card => {
        const m = extractMaterialData(card);
        let show = true;
        if (currentFilters.search) {
            const s = currentFilters.search;
            const match = m.name.includes(s) || m.id.includes(s) || m.type.includes(s) || m.collection.includes(s);
            if (!match) show = false;
        }
        if (currentFilters.quickFilter !== 'all') {
            const f = m.features;
            if (currentFilters.quickFilter === 'waterproof' && !f.includes('100% Waterproof')) show = false;
            if (currentFilters.quickFilter === 'lifetime' && !f.includes('Lifetime Warranty')) show = false;
            if (currentFilters.quickFilter === 'commercial' && !f.includes('Commercial Grade')) show = false;
        }
        if (currentFilters.materialType && !m.type.includes(currentFilters.materialType.toLowerCase())) show = false;
        if (currentFilters.collection && !m.collection.includes(currentFilters.collection.toLowerCase())) show = false;
        if (currentFilters.style && !m.style.includes(currentFilters.style.toLowerCase())) show = false;
        if (currentFilters.thickness && !m.thickness.includes(currentFilters.thickness.toLowerCase())) show = false;
        card.style.display = show ? 'flex' : 'none';
        if (show) visible++;
    });
    updateResultsCount(visible);
}

function extractMaterialData(card) {
    return {
        name: (card.querySelector('.material-name')?.textContent || '').toLowerCase(),
        id: (card.querySelector('.material-id')?.textContent || '').toLowerCase(),
        type: (card.querySelector('.material-type')?.textContent || '').toLowerCase(),
        collection: (card.querySelector('.material-collection')?.textContent || '').toLowerCase(),
        features: Array.from(card.querySelectorAll('.feature-badge')).map(badge => badge.textContent),
        style: (card.dataset.style || '').toLowerCase(),
        thickness: (card.dataset.thickness || '').toLowerCase()
    };
}

function updateSearchSuggestions(query) {
    if (!query || query.length < 2) return hideSearchSuggestions();
    const suggestions = [
        'Oak','Pine','Walnut','Maple','Cherry',
        'Luxury Vinyl Plank','Laminate','SPC Flooring',
        'Waterproof','Lifetime Warranty','Commercial Grade',
        'Premium','Classic','Modern','Signature'
    ].filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0,5);
    const box = document.getElementById('search-suggestions');
    if (!box) return;
    if (suggestions.length) {
        box.innerHTML = suggestions.map(s => `<div class="suggestion-item" onclick="selectSuggestion('${s}')">${s}</div>`).join('');
        box.style.display = 'block';
    } else {
        hideSearchSuggestions();
    }
}
function selectSuggestion(s) { const i = document.getElementById('search-input'); if (i) i.value = s; currentFilters.search = s.toLowerCase(); hideSearchSuggestions(); applyAllFilters(); }
function showSearchSuggestions() { const i = document.getElementById('search-input'); if (i?.value.length >= 2) updateSearchSuggestions(i.value); }
function hideSearchSuggestions() { setTimeout(()=>{ const b=document.getElementById('search-suggestions'); if (b) b.style.display='none'; },200); }
function toggleAdvancedFilters() { document.getElementById('advanced-filters')?.classList.toggle('show'); document.getElementById('filter-toggle')?.classList.toggle('active'); }
function clearAllFilters() {
    currentFilters = { search: '', quickFilter: 'all', materialType: '', collection: '', style: '', thickness: '' };
    const i = document.getElementById('search-input'); if (i) i.value = '';
    ['material-type','collection-filter','style-filter','thickness-filter'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.querySelectorAll('.quick-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.quick-filter[data-filter="all"]')?.classList.add('active');
    applyAllFilters();
}

// ==============================
// ESTIMATE CART + APPS SCRIPT SEND (per-item sqft, thank-you overlay, clear cart)
// ==============================

// Deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxr72BaXyoGYg1hFbeoQc7KVyG1Fj3OqFcJkUYfovBT82yqsA5XEkdn6J54C_72ns8j/exec";

// Helper function to convert relative image paths to absolute URLs
function getAbsoluteImageUrl(relativePath) {
  if (!relativePath) return "";
  
  // If it's already an absolute URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Convert relative path to absolute URL
  const baseUrl = window.location.origin;
  const cleanPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
  return baseUrl + cleanPath;
}

// Local storage key + state
const EST_KEY = "estimate.items.v1";
const EST_SENT_KEY = "estimate.sent.flag";
const estimateItems = new Map();

function loadEstimate() {
  try {
    // Check if an estimate was recently sent successfully
    const wasSent = localStorage.getItem(EST_SENT_KEY);
    if (wasSent) {
      // Clear everything if estimate was sent
      localStorage.removeItem(EST_KEY);
      localStorage.removeItem(EST_SENT_KEY);
      return;
    }
    
    const arr = JSON.parse(localStorage.getItem(EST_KEY) || "[]");
    arr.forEach(m => estimateItems.set(m.id || m.sku || m.name, m));
  } catch {}
}
function saveEstimate() {
  localStorage.setItem(EST_KEY, JSON.stringify(Array.from(estimateItems.values())));
  renderEstimateBar();
}
function renderEstimateBar() {
  const bar = document.getElementById("estimateBar");
  if (!bar) return;
  const n = estimateItems.size;
  bar.style.display = n ? "flex" : "none";
  const pill = document.getElementById("estimateCount");
  if (pill) pill.textContent = `${n} selected`;
}

function pickMaterialFromCard(cardEl) {
  return {
    id: (cardEl.querySelector(".material-id")?.textContent || "").trim(),
    sku: (cardEl.querySelector(".material-id")?.textContent || "").trim(),
    name: (cardEl.querySelector(".material-name")?.textContent || "").trim(),
    type: (cardEl.querySelector(".material-type")?.textContent || "").trim(),
    collection: (cardEl.querySelector(".material-collection")?.textContent || "").trim(),
    image: cardEl.querySelector(".material-image")?.getAttribute("src") || "",
    allocated_sqft: 0
  };
}

function addEstimateButtonsToCards() {
  document.querySelectorAll(".material-card").forEach(card => {
    if (card.querySelector(".add-estimate-btn")) return;

    const addBtn = document.createElement("button");
    addBtn.className = "btn add-estimate-btn";
    addBtn.type = "button";
    addBtn.textContent = "Add to Estimate";

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn remove-estimate-btn";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.style.display = "none";

    const info = card.querySelector(".material-info") || card;
    info.appendChild(addBtn);
    info.appendChild(removeBtn);

    const key = (card.querySelector(".material-id")?.textContent || "").trim();
    if (estimateItems.has(key)) {
      addBtn.disabled = true; addBtn.textContent = "Added"; removeBtn.style.display = "";
    }

    addBtn.addEventListener("click", () => {
      const m = pickMaterialFromCard(card);
      const k = m.id || m.sku || m.name;
      estimateItems.set(k, m);
      saveEstimate();
      addBtn.disabled = true; addBtn.textContent = "Added";
      removeBtn.style.display = "";
      window.dataLayer && dataLayer.push({event:"select_item", item_id:k, item_name:m.name});
    });

    removeBtn.addEventListener("click", () => {
      const m = pickMaterialFromCard(card);
      const k = m.id || m.sku || m.name;
      estimateItems.delete(k);
      saveEstimate();
      addBtn.disabled = false; addBtn.textContent = "Add to Estimate";
      removeBtn.style.display = "none";
    });
  });
}

// Build the per-item sqft rows in the modal
function buildEstimateItemsList() {
  const list = document.getElementById("estimateItemsList");
  if (!list) return;

  const items = Array.from(estimateItems.values());
  list.innerHTML = items.map(m => {
    const k = m.id || m.sku || m.name;
    const sub = [m.collection, m.type].filter(Boolean).join(" • ");
    const val = (m.allocated_sqft ?? '') === 0 ? '' : (m.allocated_sqft ?? '');
    return `
      <label class="qty-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);">
        <span style="flex:1;min-width:0;">
          <strong style="color:#f4f3ef;">${m.name || m.sku}</strong>${m.id ? ` <span style="opacity:.6;font-size:12px;">(${m.id})</span>`:''}
          ${sub ? `<span style="display:block;color:#c5bfae;font-size:12px;margin-top:2px;">${sub}</span>`:''}
        </span>
        <input type="number" min="0" step="1" inputmode="decimal"
          class="qty-input" data-k="${k}" placeholder="Enter sq ft"
          value="${val}" style="width:120px;background:#1a1a1a;border:1px solid rgba(212,175,55,.2);border-radius:8px;color:#f4f3ef;padding:10px 12px;text-align:right;font-weight:500;transition:border-color 0.2s ease;"
          onfocus="this.style.borderColor='rgba(212,175,55,.5)'" 
          onblur="this.style.borderColor='rgba(212,175,55,.2)'">
        <button type="button" class="delete-item-btn" data-k="${k}" 
          style="background:#dc3545;color:white;border:none;border-radius:6px;padding:8px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.2s ease;min-width:60px;"
          onmouseover="this.style.background='#c82333'" 
          onmouseout="this.style.background='#dc3545'">Remove</button>
      </label>`;
  }).join("") || "<div style='color:#aaa;text-align:center;padding:20px;'>(No items selected)</div>";

  // Single oninput handler (prevents duplicate listeners across opens)
  list.oninput = (e) => {
    const el = e.target;
    if (!el.classList.contains("qty-input")) return;
    const k = el.dataset.k;
    const m = estimateItems.get(k);
    if (!m) return;
    const v = parseFloat(el.value);
    m.allocated_sqft = Number.isFinite(v) && v >= 0 ? v : 0;
    estimateItems.set(k, m);
    saveEstimate();
  };

  // Add click handler for delete buttons
  list.onclick = (e) => {
    const el = e.target;
    if (!el.classList.contains("delete-item-btn")) return;
    const k = el.dataset.k;
    if (!k) return;
    
    // Remove from estimate
    estimateItems.delete(k);
    saveEstimate();
    
    // Rebuild the list
    buildEstimateItemsList();
    
    // Update the UI buttons in the catalog
    document.querySelectorAll(".material-card").forEach(card => {
      const cardKey = (card.querySelector(".material-id")?.textContent || "").trim();
      if (cardKey === k) {
        const addBtn = card.querySelector(".add-estimate-btn");
        const removeBtn = card.querySelector(".remove-estimate-btn");
        if (addBtn) {
          addBtn.disabled = false;
          addBtn.textContent = "Add to Estimate";
        }
        if (removeBtn) {
          removeBtn.style.display = "none";
        }
      }
    });
  };
}

function openEstimateModal() {
  buildEstimateItemsList();
  const bd = document.getElementById("estimateModalBackdrop");
  if (bd) { bd.style.display = "flex"; bd.setAttribute("aria-hidden","false"); }
}
function closeEstimateModal() {
  const bd = document.getElementById("estimateModalBackdrop");
  if (bd) { bd.style.display = "none"; bd.setAttribute("aria-hidden","true"); }
}

// Gold "Thank you" overlay then redirect
function showThankYouThenRedirect() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(8px);';
  overlay.innerHTML = `
    <div style="text-align:center;transform:translateY(-20px);animation:thankYouFade 1.5s ease-out;">
      <div style="font-family:'Cinzel',serif;font-weight:900;font-size:clamp(36px,5vw,56px);color:#d4af37;letter-spacing:1px;text-shadow:0 0 20px rgba(212,175,55,.3);margin-bottom:12px;">Thank You!</div>
      <div style="font-family:'Inter',system-ui;font-weight:600;font-size:clamp(16px,2.5vw,20px);color:#f7d774;letter-spacing:0.5px;">We'll be in touch soon.</div>
    </div>`;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes thankYouFade {
      0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
      50% { opacity: 1; transform: translateY(-20px) scale(1.05); }
      100% { opacity: 1; transform: translateY(-20px) scale(1); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  
  setTimeout(()=>{ 
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    setTimeout(() => window.location.href = "index.html", 500);
  }, 2000);
}

// Send to Google Apps Script (no ZIP, includes per-item sqft)
async function sendEstimate() {
  if (!estimateItems.size) { alert("No items selected."); return; }

  const payload = {
    timestamp: new Date().toISOString(),
    customer: {
      name: document.getElementById("custName")?.value.trim() || "",
      email: document.getElementById("custEmail")?.value.trim() || "",
      phone: document.getElementById("custPhone")?.value.trim() || "",
      notes: document.getElementById("custNotes")?.value.trim() || ""
    },
    measurementMode: "totalsqft",
    rooms: [],
    usage: "",
    wastePercent: 0,
    areaBeforeWaste_sqft: 0,
    totalWithWaste_sqft: 0,
    materials: Array.from(estimateItems.values()).map(m => ({
      name: m.name,
      type: m.type,
      tone: "",
      allocated_sqft: Number(m.allocated_sqft || 0),
      id: m.id || "",
      sku: m.sku || "",
      collection: m.collection || "",
      image: getAbsoluteImageUrl(m.image)
    }))
  };

  let ok = false;
  try {
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    ok = resp.ok;
  } catch (_) {}

  if (!ok) {
    try {
      await fetch(APPS_SCRIPT_URL, { method:"POST", mode:"no-cors", body: JSON.stringify(payload) });
      ok = true;
    } catch (e) { console.error(e); }
  }

  if (ok) {
    // Mark estimate as sent successfully
    localStorage.setItem(EST_SENT_KEY, "true");
    
    closeEstimateModal();
    clearEstimate();            // clear cart + reset UI
    showThankYouThenRedirect(); // gold overlay then go home
    window.dataLayer && dataLayer.push({event:"generate_lead"});
  } else {
    alert("Couldn’t send estimate. Please call 818.800.1358 or email us.");
  }
}

function clearEstimate() {
  estimateItems.clear();
  localStorage.removeItem(EST_KEY); // Explicitly remove from localStorage
  saveEstimate();
  
  // Update all UI elements
  document.querySelectorAll(".add-estimate-btn").forEach(b => { 
    b.disabled = false; 
    b.textContent = "Add to Estimate"; 
  });
  document.querySelectorAll(".remove-estimate-btn").forEach(b => b.style.display = "none");
  
  // Clear the modal if it's open
  const list = document.getElementById("estimateItemsList");
  if (list) {
    list.innerHTML = "<div style='color:#aaa;text-align:center;padding:20px;'>(No items selected)</div>";
  }
  
  // Update estimate bar
  renderEstimateBar();
}

// Manual clear function for testing - call window.manualClearEstimate() in console
window.manualClearEstimate = function() {
  localStorage.removeItem(EST_KEY);
  localStorage.removeItem(EST_SENT_KEY);
  location.reload();
};

// Hook into catalog render
(function wireEstimateUIOnce() {
  function attach() {
    if (typeof window.renderCatalog !== "function") { setTimeout(attach, 50); return; }
    const original = window.renderCatalog;
    window.renderCatalog = function(materials){
      original.call(this, materials);
      loadEstimate();
      addEstimateButtonsToCards();
      renderEstimateBar();
      document.getElementById("viewEstimateBtn")?.addEventListener("click", openEstimateModal);
      document.getElementById("requestEstimateBtn")?.addEventListener("click", openEstimateModal);
      document.getElementById("closeEstimateModalBtn")?.addEventListener("click", closeEstimateModal);
      document.getElementById("emailEstimateBtn")?.addEventListener("click", sendEstimate);
      document.getElementById("clearEstimateBtn")?.addEventListener("click", clearEstimate);
    };
  }
  attach();
})();

// Globals used by catalog
let materialsData = [];
