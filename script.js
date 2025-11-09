// ==============================
// 365 Days Flooring - Complete Site
// Homepage + Catalog functionality
// ==============================

// ==============================
// PERFORMANCE OPTIMIZATIONS
// ==============================

// Intersection Observer for lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        }
    });
}, { rootMargin: '50px' });

// Enhanced loading states
function showLoadingState(element, text = 'Loading...') {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span class="loading-text">${text}</span>
        </div>
    `;
    element.style.position = 'relative';
    element.appendChild(loader);
    return loader;
}

function hideLoadingState(loader) {
    if (loader && loader.parentNode) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
}

// Preload critical images
function preloadCriticalImages() {
    const criticalImages = [
        'catalog/images/MAT001_sample.jpg',
        'catalog/images/MAT001_label.jpg',
        'catalog/images/MAT002_sample.jpg',
        'catalog/images/MAT002_label.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Service Worker registration for offline capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Performance optimizations
    preloadCriticalImages();
    
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
    initializeComparison();
    initializeRoomCalculator();
    initializeFavoritesAndRecent();
    initializeLeadCapture();
    initializeMobileEnhancements();
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
    updateMaterialCardButtons(); // Add comparison buttons
    updateMaterialCardFavoriteButtons(); // Add favorite buttons
    updateMaterialCardSampleButtons(); // Add sample request buttons
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
    card.dataset.thickness = material.specifications?.thickness || '';
    card.dataset.materialType = material.type || '';
    card.dataset.collection = material.collection || '';

    let featuresHTML = '';
    if (material.features?.length) {
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
            <img data-src="${material.image}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23f0f0f0'/%3E%3Ctext x='200' y='120' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3ELoading...%3C/text%3E%3C/svg%3E" alt="${material.name}" class="material-image lazy" loading="lazy">
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
    
    // Set up lazy loading for the image
    const img = card.querySelector('.material-image.lazy');
    if (img) {
        imageObserver.observe(img);
    }
    
    return card;
}

function showMaterialDetail(material) {
    // Track in recently viewed
    addToRecentlyViewed(material);
    
    const modal = document.createElement('div');
    modal.className = 'material-modal';

    let modalImageHTML = '';
    if (material.images?.label && material.images?.sample) {
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
        const imageUrl = material.image || 'catalog/placeholders/sample-tiny.jpg';
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
    updateMaterialCardButtons(); // Update comparison buttons after filtering
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
// MATERIAL COMPARISON TOOL
// ==============================

let comparisonList = [];
const MAX_COMPARISON = 3;

function initializeComparison() {
    // Load saved comparison from localStorage
    const saved = localStorage.getItem('comparisonList');
    if (saved) {
        comparisonList = JSON.parse(saved);
        updateComparisonBar();
    }
    
    // Event listeners
    document.getElementById('viewComparisonBtn')?.addEventListener('click', showComparisonModal);
    document.getElementById('clearComparisonBtn')?.addEventListener('click', clearComparison);
    document.getElementById('closeComparisonModalBtn')?.addEventListener('click', closeComparisonModal);
    document.getElementById('comparisonModalBackdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'comparisonModalBackdrop') closeComparisonModal();
    });
}

function addToComparison(material) {
    if (comparisonList.length >= MAX_COMPARISON) {
        alert(`You can compare up to ${MAX_COMPARISON} materials at once. Remove one to add another.`);
        return;
    }
    
    if (comparisonList.find(m => m.id === material.id)) {
        alert('This material is already in your comparison list.');
        return;
    }
    
    comparisonList.push(material);
    saveComparison();
    updateComparisonBar();
    updateMaterialCardButtons();
}

function removeFromComparison(materialId) {
    comparisonList = comparisonList.filter(m => m.id !== materialId);
    saveComparison();
    updateComparisonBar();
    updateMaterialCardButtons();
}

function clearComparison() {
    comparisonList = [];
    saveComparison();
    updateComparisonBar();
    updateMaterialCardButtons();
    closeComparisonModal();
}

function saveComparison() {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
}

function updateComparisonBar() {
    const bar = document.getElementById('comparisonBar');
    const count = document.getElementById('comparisonCount');
    
    if (!bar || !count) return;
    
    if (comparisonList.length > 0) {
        bar.style.display = 'block';
        count.textContent = `${comparisonList.length} material${comparisonList.length > 1 ? 's' : ''} to compare`;
    } else {
        bar.style.display = 'none';
    }
}

function updateMaterialCardButtons() {
    document.querySelectorAll('.material-card').forEach(card => {
        const id = card.querySelector('.material-id')?.textContent;
        const existingBtn = card.querySelector('.compare-btn');
        
        if (existingBtn) existingBtn.remove();
        
        if (id) {
            const isInComparison = comparisonList.find(m => m.id === id);
            const btn = document.createElement('button');
            btn.className = `compare-btn ${isInComparison ? 'in-comparison' : ''}`;
            btn.innerHTML = isInComparison ? '✓ In Comparison' : '+ Compare';
            btn.onclick = () => {
                if (isInComparison) {
                    removeFromComparison(id);
                } else {
                    const material = allMaterials.find(m => m.id === id);
                    if (material) addToComparison(material);
                }
            };
            
            const info = card.querySelector('.material-info');
            if (info) info.appendChild(btn);
        }
    });
}

function showComparisonModal() {
    if (comparisonList.length === 0) return;
    
    const modal = document.getElementById('comparisonModalBackdrop');
    const container = document.getElementById('comparisonTableContainer');
    
    if (!modal || !container) return;
    
    container.innerHTML = createComparisonTable();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeComparisonModal() {
    const modal = document.getElementById('comparisonModalBackdrop');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

function createComparisonTable() {
    if (comparisonList.length === 0) return '<p>No materials selected for comparison.</p>';
    
    return `
        <div class="comparison-table">
            <div class="comparison-row comparison-header-row">
                <div class="comparison-cell comparison-label"></div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell comparison-product">
                        <img src="${material.image}" alt="${material.name}" class="comparison-image">
                        <h4>${material.name}</h4>
                        <p class="comparison-id">${material.id}</p>
                        <button class="remove-from-comparison" onclick="removeFromComparison('${material.id}')">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Collection</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.collection || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Type</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.type || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Thickness</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.specifications?.thickness || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Wear Layer</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.specifications?.wear_layer || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Core</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.specifications?.core || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Waterproof</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">
                        <span class="spec-value ${material.specifications?.waterproof ? 'waterproof-yes' : 'waterproof-no'}">
                            ${material.specifications?.waterproof ? '💧 100% GUARANTEED' : 'No'}
                        </span>
                    </div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Warranty</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.specifications?.warranty || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Installation</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">${material.specifications?.installation || 'N/A'}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-cell comparison-label">Features</div>
                ${comparisonList.map(material => `
                    <div class="comparison-cell">
                        ${material.features ? material.features.map(f => `<span class="feature-tag">${f}</span>`).join(' ') : 'N/A'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==============================
// ROOM SQUARE FOOTAGE CALCULATOR
// ==============================

function initializeRoomCalculator() {
    const toggle = document.getElementById('calculator-toggle');
    const panel = document.getElementById('calculator-panel');
    const lengthInput = document.getElementById('room-length');
    const widthInput = document.getElementById('room-width');
    
    if (!toggle || !panel || !lengthInput || !widthInput) return;
    
    // Toggle calculator panel
    toggle.addEventListener('click', () => {
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
        toggle.classList.toggle('active', !isVisible);
    });
    
    // Calculate square footage
    function calculateSqft() {
        const length = parseFloat(lengthInput.value) || 0;
        const width = parseFloat(widthInput.value) || 0;
        const sqft = length * width;
        const result = document.getElementById('calculated-sqft');
        
        if (result) {
            if (sqft > 0) {
                const recommended = Math.ceil(sqft * 1.1); // Add 10% for waste
                result.innerHTML = `
                    <strong>${sqft.toFixed(1)} sq ft</strong><br>
                    <small style="color: var(--muted)">+ 10% waste: ${recommended} sq ft</small>
                `;
                
                // Store calculated value for estimate form
                sessionStorage.setItem('calculatedSqft', sqft.toString());
                
                // Show helpful message
                if (sqft > 1000) {
                    showCalculatorMessage('💡 Large project! Consider professional measurement and installation.', 'info');
                } else if (sqft < 50) {
                    showCalculatorMessage('💡 Small area - perfect for DIY installation!', 'success');
                }
            } else {
                result.textContent = '0 sq ft';
                sessionStorage.removeItem('calculatedSqft');
            }
        }
    }
    
    // Live calculation as user types
    lengthInput.addEventListener('input', calculateSqft);
    widthInput.addEventListener('input', calculateSqft);
    
    // Initialize with any stored values
    const storedLength = sessionStorage.getItem('roomLength');
    const storedWidth = sessionStorage.getItem('roomWidth');
    if (storedLength) lengthInput.value = storedLength;
    if (storedWidth) widthInput.value = storedWidth;
    calculateSqft();
    
    // Store values as user types
    lengthInput.addEventListener('input', () => {
        sessionStorage.setItem('roomLength', lengthInput.value);
    });
    widthInput.addEventListener('input', () => {
        sessionStorage.setItem('roomWidth', widthInput.value);
    });
}

function showCalculatorMessage(message, type = 'info') {
    const existing = document.querySelector('.calculator-message');
    if (existing) existing.remove();
    
    const msg = document.createElement('div');
    msg.className = `calculator-message ${type}`;
    msg.textContent = message;
    
    const panel = document.getElementById('calculator-panel');
    if (panel) {
        panel.appendChild(msg);
        setTimeout(() => msg.remove(), 4000);
    }
}

// Pre-fill estimate forms with calculated square footage
function prefillEstimateWithCalculation() {
    const calculatedSqft = sessionStorage.getItem('calculatedSqft');
    if (calculatedSqft) {
        // When estimate modal opens, suggest the calculated square footage
        const estimateInputs = document.querySelectorAll('input[placeholder*="sq ft"]');
        estimateInputs.forEach(input => {
            if (!input.value) {
                input.placeholder = `e.g., ${Math.ceil(parseFloat(calculatedSqft))} (from calculator)`;
            }
        });
    }
}

// ==============================
// FAVORITES & RECENTLY VIEWED
// ==============================

let favoritesList = [];
let recentlyViewedList = [];
const MAX_RECENT = 10;

function initializeFavoritesAndRecent() {
    // Load saved data
    const savedFavorites = localStorage.getItem('favoritesList');
    const savedRecent = localStorage.getItem('recentlyViewedList');
    
    if (savedFavorites) favoritesList = JSON.parse(savedFavorites);
    if (savedRecent) recentlyViewedList = JSON.parse(savedRecent);
    
    // Add favorites panel if not exists
    addFavoritesPanel();
    updateFavoritesPanel();
}

function addFavoritesPanel() {
    // Check if panel already exists
    if (document.getElementById('favorites-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'favorites-panel';
    panel.className = 'favorites-panel';
    panel.innerHTML = `
        <button class="favorites-toggle" id="favorites-toggle">
            ❤️ My Favorites (<span id="favorites-count">0</span>)
        </button>
        <div class="favorites-content" id="favorites-content" style="display: none;">
            <div class="favorites-tabs">
                <button class="tab-btn active" data-tab="favorites">❤️ Favorites</button>
                <button class="tab-btn" data-tab="recent">⏰ Recently Viewed</button>
            </div>
            <div class="favorites-list" id="favorites-tab-content">
                <p class="empty-message">No favorites yet. Click the heart on any material to save it!</p>
            </div>
            <div class="recent-list" id="recent-tab-content" style="display: none;">
                <p class="empty-message">No recently viewed materials.</p>
            </div>
        </div>
    `;
    
    // Insert after search section
    const searchContainer = document.querySelector('.search-filter-container');
    if (searchContainer) {
        searchContainer.parentNode.insertBefore(panel, searchContainer.nextSibling);
    }
    
    // Event listeners
    document.getElementById('favorites-toggle').addEventListener('click', toggleFavoritesPanel);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchFavoritesTab(tab);
        });
    });
}

function toggleFavoritesPanel() {
    const content = document.getElementById('favorites-content');
    const toggle = document.getElementById('favorites-toggle');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.classList.add('active');
        updateFavoritesPanel();
    } else {
        content.style.display = 'none';
        toggle.classList.remove('active');
    }
}

function switchFavoritesTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Show/hide content
    document.getElementById('favorites-tab-content').style.display = tab === 'favorites' ? 'block' : 'none';
    document.getElementById('recent-tab-content').style.display = tab === 'recent' ? 'block' : 'none';
    
    // Update content
    if (tab === 'favorites') {
        updateFavoritesList();
    } else {
        updateRecentlyViewedList();
    }
}

function addToFavorites(material) {
    if (favoritesList.find(m => m.id === material.id)) {
        alert('This material is already in your favorites!');
        return;
    }
    
    favoritesList.unshift(material);
    saveFavorites();
    updateFavoritesPanel();
    updateMaterialCardFavoriteButtons();
    
    // Show confirmation
    showNotification(`❤️ Added "${material.name}" to favorites`, 'success');
}

function removeFromFavorites(materialId) {
    favoritesList = favoritesList.filter(m => m.id !== materialId);
    saveFavorites();
    updateFavoritesPanel();
    updateMaterialCardFavoriteButtons();
    
    // Show confirmation
    const material = allMaterials.find(m => m.id === materialId);
    showNotification(`💔 Removed "${material?.name || materialId}" from favorites`, 'info');
}

function addToRecentlyViewed(material) {
    // Remove if already exists
    recentlyViewedList = recentlyViewedList.filter(m => m.id !== material.id);
    
    // Add to beginning
    recentlyViewedList.unshift(material);
    
    // Limit to MAX_RECENT items
    if (recentlyViewedList.length > MAX_RECENT) {
        recentlyViewedList = recentlyViewedList.slice(0, MAX_RECENT);
    }
    
    saveRecentlyViewed();
    updateFavoritesPanel();
}

function saveFavorites() {
    localStorage.setItem('favoritesList', JSON.stringify(favoritesList));
}

function saveRecentlyViewed() {
    localStorage.setItem('recentlyViewedList', JSON.stringify(recentlyViewedList));
}

function updateFavoritesPanel() {
    const count = document.getElementById('favorites-count');
    if (count) count.textContent = favoritesList.length;
    
    // Update current visible tab
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'favorites';
    if (activeTab === 'favorites') {
        updateFavoritesList();
    } else {
        updateRecentlyViewedList();
    }
}

function updateFavoritesList() {
    const container = document.getElementById('favorites-tab-content');
    if (!container) return;
    
    if (favoritesList.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorites yet. Click the heart on any material to save it!</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="favorites-actions">
            <button class="btn-clear-favorites" onclick="clearFavorites()">Clear All</button>
        </div>
        <div class="material-mini-grid">
            ${favoritesList.map(material => createMiniMaterialCard(material, 'favorite')).join('')}
        </div>
    `;
}

function updateRecentlyViewedList() {
    const container = document.getElementById('recent-tab-content');
    if (!container) return;
    
    if (recentlyViewedList.length === 0) {
        container.innerHTML = '<p class="empty-message">No recently viewed materials.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="favorites-actions">
            <button class="btn-clear-recent" onclick="clearRecentlyViewed()">Clear All</button>
        </div>
        <div class="material-mini-grid">
            ${recentlyViewedList.map(material => createMiniMaterialCard(material, 'recent')).join('')}
        </div>
    `;
}

function createMiniMaterialCard(material, type) {
    const isFavorite = favoritesList.find(m => m.id === material.id);
    
    return `
        <div class="mini-material-card" data-id="${material.id}">
            <img src="${material.image}" alt="${material.name}" class="mini-material-image" 
                 onclick="showMaterialDetail(${JSON.stringify(material).replace(/"/g, '&quot;')})">
            <div class="mini-material-info">
                <h4 class="mini-material-name">${material.name}</h4>
                <p class="mini-material-id">${material.id}</p>
                <div class="mini-material-actions">
                    ${type !== 'favorite' ? `
                        <button class="mini-fav-btn ${isFavorite ? 'active' : ''}" 
                                onclick="${isFavorite ? `removeFromFavorites('${material.id}')` : `addToFavorites(${JSON.stringify(material).replace(/"/g, '&quot;')})`}">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    ` : ''}
                    ${type === 'favorite' ? `
                        <button class="mini-remove-btn" onclick="removeFromFavorites('${material.id}')">
                            Remove
                        </button>
                    ` : ''}
                    <button class="mini-view-btn" onclick="showMaterialDetail(${JSON.stringify(material).replace(/"/g, '&quot;')})">
                        View
                    </button>
                </div>
            </div>
        </div>
    `;
}

function updateMaterialCardFavoriteButtons() {
    document.querySelectorAll('.material-card').forEach(card => {
        const id = card.querySelector('.material-id')?.textContent;
        const existingBtn = card.querySelector('.favorite-btn');
        
        if (existingBtn) existingBtn.remove();
        
        if (id) {
            const isFavorite = favoritesList.find(m => m.id === id);
            const btn = document.createElement('button');
            btn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
            btn.innerHTML = isFavorite ? '❤️' : '🤍';
            btn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
            btn.onclick = () => {
                if (isFavorite) {
                    removeFromFavorites(id);
                } else {
                    const material = allMaterials.find(m => m.id === id);
                    if (material) addToFavorites(material);
                }
            };
            
            // Add to material card header
            const header = card.querySelector('.material-info');
            if (header) header.insertBefore(btn, header.firstChild);
        }
    });
}

function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites?')) {
        favoritesList = [];
        saveFavorites();
        updateFavoritesPanel();
        updateMaterialCardFavoriteButtons();
        showNotification('🧹 Favorites cleared', 'info');
    }
}

function clearRecentlyViewed() {
    if (confirm('Are you sure you want to clear recently viewed?')) {
        recentlyViewedList = [];
        saveRecentlyViewed();
        updateFavoritesPanel();
        showNotification('🧹 Recently viewed cleared', 'info');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==============================
// LEAD CAPTURE SYSTEM
// ==============================

let selectedSamples = [];

function initializeLeadCapture() {
    // Initialize form handlers
    document.getElementById('sampleRequestForm')?.addEventListener('submit', handleSampleRequest);
    document.getElementById('consultationForm')?.addEventListener('submit', handleConsultationRequest);
    
    // Modal close handlers
    document.getElementById('closeSampleModalBtn')?.addEventListener('click', closeSampleModal);
    document.getElementById('closeConsultationModalBtn')?.addEventListener('click', closeConsultationModal);
    
    // Backdrop click handlers
    document.getElementById('sampleModalBackdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'sampleModalBackdrop') closeSampleModal();
    });
    document.getElementById('consultationModalBackdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'consultationModalBackdrop') closeConsultationModal();
    });
    
    // Set minimum date for consultation to today
    const dateInput = document.getElementById('consult-date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
}

function showSampleModal(materialId = null) {
    // If specific material, add it to selection
    if (materialId) {
        const material = allMaterials.find(m => m.id === materialId);
        if (material && !selectedSamples.find(s => s.id === material.id)) {
            selectedSamples.push(material);
        }
    }
    
    updateSamplesList();
    document.getElementById('sampleModalBackdrop').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeSampleModal() {
    document.getElementById('sampleModalBackdrop').style.display = 'none';
    document.body.style.overflow = '';
}

function showConsultationModal() {
    // Pre-fill project size from calculator if available
    const calculatedSqft = sessionStorage.getItem('calculatedSqft');
    if (calculatedSqft) {
        const sizeInput = document.getElementById('project-size');
        if (sizeInput && !sizeInput.value) {
            sizeInput.value = Math.ceil(parseFloat(calculatedSqft));
        }
    }
    
    document.getElementById('consultationModalBackdrop').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeConsultationModal() {
    document.getElementById('consultationModalBackdrop').style.display = 'none';
    document.body.style.overflow = '';
}

function addToSampleRequest(material) {
    if (!selectedSamples.find(s => s.id === material.id)) {
        selectedSamples.push(material);
        updateSampleButtonStates();
        showNotification(`📦 Added "${material.name}" to sample request`, 'success');
    }
}

function removeFromSampleRequest(materialId) {
    selectedSamples = selectedSamples.filter(s => s.id !== materialId);
    updateSamplesList();
    updateSampleButtonStates();
}

function updateSamplesList() {
    const container = document.getElementById('sample-materials-list');
    if (!container) return;
    
    if (selectedSamples.length === 0) {
        container.innerHTML = '<p class="no-samples">No materials selected. Add materials from the catalog or browse and click "Request Sample".</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="sample-items">
            ${selectedSamples.map(material => `
                <div class="sample-item">
                    <img src="${material.image}" alt="${material.name}" class="sample-item-image">
                    <div class="sample-item-info">
                        <h4>${material.name}</h4>
                        <p>${material.id}</p>
                    </div>
                    <button type="button" class="remove-sample" onclick="removeFromSampleRequest('${material.id}')">×</button>
                </div>
            `).join('')}
        </div>
        <p class="sample-note">We'll send up to 3 samples per request. Free shipping!</p>
    `;
}

function updateSampleButtonStates() {
    document.querySelectorAll('.sample-btn').forEach(btn => {
        const materialId = btn.dataset.materialId;
        const isSelected = selectedSamples.find(s => s.id === materialId);
        btn.classList.toggle('selected', !!isSelected);
        btn.textContent = isSelected ? 'Added to Samples' : 'Request Sample';
    });
}

function updateMaterialCardSampleButtons() {
    document.querySelectorAll('.material-card').forEach(card => {
        const id = card.querySelector('.material-id')?.textContent;
        const existingBtn = card.querySelector('.sample-btn');
        
        if (existingBtn) existingBtn.remove();
        
        if (id) {
            const btn = document.createElement('button');
            btn.className = 'sample-btn';
            btn.dataset.materialId = id;
            btn.textContent = 'Request Sample';
            btn.onclick = () => {
                const material = allMaterials.find(m => m.id === id);
                if (material) addToSampleRequest(material);
            };
            
            const info = card.querySelector('.material-info');
            if (info) info.appendChild(btn);
        }
    });
    updateSampleButtonStates();
}

async function handleSampleRequest(e) {
    e.preventDefault();
    
    if (selectedSamples.length === 0) {
        alert('Please select at least one material for samples.');
        return;
    }
    
    const formData = {
        type: 'sample_request',
        name: document.getElementById('sample-name').value,
        email: document.getElementById('sample-email').value,
        phone: document.getElementById('sample-phone').value,
        address: document.getElementById('sample-address').value,
        notes: document.getElementById('sample-notes').value,
        materials: selectedSamples.map(m => ({
            id: m.id,
            name: m.name,
            type: m.type,
            collection: m.collection
        })),
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('✅ Sample request submitted! We\'ll ship them within 2-3 business days.', 'success');
            document.getElementById('sampleRequestForm').reset();
            selectedSamples = [];
            updateSamplesList();
            updateSampleButtonStates();
            closeSampleModal();
        } else {
            throw new Error('Failed to submit request');
        }
    } catch (error) {
        console.error('Sample request error:', error);
        showNotification('❌ Failed to submit request. Please try again or call us directly.', 'error');
    }
}

async function handleConsultationRequest(e) {
    e.preventDefault();
    
    const formData = {
        type: 'consultation_request',
        name: document.getElementById('consult-name').value,
        email: document.getElementById('consult-email').value,
        phone: document.getElementById('consult-phone').value,
        location: document.getElementById('consult-location').value,
        preferredDate: document.getElementById('consult-date').value,
        preferredTime: document.getElementById('consult-time').value,
        projectType: document.getElementById('project-type').value,
        projectSize: document.getElementById('project-size').value,
        notes: document.getElementById('consult-notes').value,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('✅ Consultation scheduled! We\'ll contact you within 24 hours to confirm.', 'success');
            document.getElementById('consultationForm').reset();
            closeConsultationModal();
        } else {
            throw new Error('Failed to submit request');
        }
    } catch (error) {
        console.error('Consultation request error:', error);
        showNotification('❌ Failed to submit request. Please try again or call us directly.', 'error');
    }
}

// ==============================
// MOBILE ENHANCEMENTS
// ==============================

function initializeMobileEnhancements() {
    // Touch/swipe support for material cards
    addSwipeSupport();
    
    // Improve touch targets
    improveTouchTargets();
    
    // Pull-to-refresh
    addPullToRefresh();
    
    // Enhanced mobile navigation
    addMobileKeyboardSupport();
}

function addSwipeSupport() {
    const grid = document.getElementById('material-grid');
    if (!grid) return;
    
    let startX = 0;
    let startY = 0;
    let currentCard = null;
    
    grid.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.material-card');
        if (!card) return;
        
        currentCard = card;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    grid.addEventListener('touchmove', (e) => {
        if (!currentCard) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // If horizontal swipe is more than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            e.preventDefault();
            
            // Add visual feedback
            if (diffX > 0) {
                // Swipe left - show add to favorites action
                currentCard.style.transform = `translateX(-${Math.min(diffX, 100)}px)`;
                currentCard.style.background = 'linear-gradient(90deg, rgba(233, 30, 99, 0.1), transparent)';
            } else {
                // Swipe right - show add to comparison action  
                currentCard.style.transform = `translateX(${Math.min(-diffX, 100)}px)`;
                currentCard.style.background = 'linear-gradient(270deg, rgba(212, 175, 55, 0.1), transparent)';
            }
        }
    });
    
    grid.addEventListener('touchend', (e) => {
        if (!currentCard) return;
        
        const rect = currentCard.getBoundingClientRect();
        const diffX = startX - rect.left;
        
        // Reset visual state
        currentCard.style.transform = '';
        currentCard.style.background = '';
        
        // Trigger actions if swipe was significant
        if (Math.abs(diffX) > 80) {
            const materialId = currentCard.querySelector('.material-id')?.textContent;
            const material = allMaterials.find(m => m.id === materialId);
            
            if (material) {
                if (diffX > 0) {
                    // Swipe left - add to favorites
                    addToFavorites(material);
                    showSwipeNotification('❤️ Added to favorites', currentCard);
                } else {
                    // Swipe right - add to comparison
                    addToComparison(material);
                    showSwipeNotification('🔍 Added to comparison', currentCard);
                }
            }
        }
        
        currentCard = null;
    });
}

function showSwipeNotification(message, card) {
    const notification = document.createElement('div');
    notification.className = 'swipe-notification';
    notification.textContent = message;
    
    card.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 50);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function improveTouchTargets() {
    // Increase button sizes on touch devices
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Add haptic feedback for key interactions
    function addHapticFeedback(element, intensity = 1) {
        if (navigator.vibrate) {
            element.addEventListener('click', () => {
                navigator.vibrate(intensity === 1 ? 10 : 20);
            });
        }
    }
    
    // Add haptic feedback to key buttons
    document.querySelectorAll('.compare-btn, .favorite-btn, .sample-btn').forEach(btn => {
        addHapticFeedback(btn, 1);
    });
    
    document.querySelectorAll('.fab, .comparison-btn, .btn.gold').forEach(btn => {
        addHapticFeedback(btn, 2);
    });
}

function addPullToRefresh() {
    let startY = 0;
    let pullDistance = 0;
    let isPulling = false;
    const pullThreshold = 100;
    
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'pull-refresh-indicator';
    refreshIndicator.innerHTML = '<div class="refresh-spinner"></div><span>Pull to refresh</span>';
    document.body.insertBefore(refreshIndicator, document.body.firstChild);
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        const currentY = e.touches[0].clientY;
        pullDistance = Math.max(0, currentY - startY);
        
        if (pullDistance > 0 && window.scrollY === 0) {
            e.preventDefault();
            
            const progress = Math.min(pullDistance / pullThreshold, 1);
            refreshIndicator.style.transform = `translateY(${pullDistance * 0.5}px)`;
            refreshIndicator.style.opacity = progress;
            
            if (progress >= 1) {
                refreshIndicator.classList.add('ready');
                refreshIndicator.querySelector('span').textContent = 'Release to refresh';
            } else {
                refreshIndicator.classList.remove('ready');
                refreshIndicator.querySelector('span').textContent = 'Pull to refresh';
            }
        }
    });
    
    document.addEventListener('touchend', () => {
        if (isPulling && pullDistance > pullThreshold) {
            // Trigger refresh
            refreshIndicator.classList.add('refreshing');
            refreshIndicator.querySelector('span').textContent = 'Refreshing...';
            
            // Simulate refresh (reload catalog)
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            // Reset indicator
            refreshIndicator.style.transform = '';
            refreshIndicator.style.opacity = '';
            refreshIndicator.classList.remove('ready');
        }
        
        isPulling = false;
        pullDistance = 0;
    });
}

function addMobileKeyboardSupport() {
    // Add keyboard shortcuts for mobile (when external keyboard connected)
    document.addEventListener('keydown', (e) => {
        // Only on catalog page
        if (!document.getElementById('material-grid')) return;
        
        // Arrow key navigation for material cards
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            navigateMaterialCards(e.key);
        }
        
        // Quick actions
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'f':
                case 'F':
                    e.preventDefault();
                    document.getElementById('search-input')?.focus();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    if (comparisonList.length > 0) showComparisonModal();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    toggleFavoritesPanel();
                    break;
            }
        }
    });
}

function navigateMaterialCards(direction) {
    const cards = Array.from(document.querySelectorAll('.material-card:not([style*="display: none"])'));
    const focused = document.querySelector('.material-card.keyboard-focused');
    let currentIndex = focused ? cards.indexOf(focused) : -1;
    
    // Remove existing focus
    cards.forEach(card => card.classList.remove('keyboard-focused'));
    
    // Calculate new index based on direction
    const gridColumns = Math.floor(window.innerWidth / 300); // Approximate
    let newIndex = currentIndex;
    
    switch (direction) {
        case 'ArrowRight':
            newIndex = Math.min(currentIndex + 1, cards.length - 1);
            break;
        case 'ArrowLeft':
            newIndex = Math.max(currentIndex - 1, 0);
            break;
        case 'ArrowDown':
            newIndex = Math.min(currentIndex + gridColumns, cards.length - 1);
            break;
        case 'ArrowUp':
            newIndex = Math.max(currentIndex - gridColumns, 0);
            break;
    }
    
    // Apply focus to new card
    if (cards[newIndex]) {
        cards[newIndex].classList.add('keyboard-focused');
        cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add enter key support to view material
        const enterHandler = (e) => {
            if (e.key === 'Enter') {
                const materialId = cards[newIndex].querySelector('.material-id')?.textContent;
                const material = allMaterials.find(m => m.id === materialId);
                if (material) showMaterialDetail(material);
            }
        };
        
        // Remove existing handler and add new one
        document.removeEventListener('keydown', enterHandler);
        document.addEventListener('keydown', enterHandler);
    }
}

// ==============================
// ANALYTICS & TRACKING INTEGRATION
// ==============================

// Google Analytics 4 Setup
function initializeAnalytics() {
    // Analytics configuration
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual GA4 ID
    const FB_PIXEL_ID = 'XXXXXXXXXX'; // Replace with actual Facebook Pixel ID
    
    // Google Analytics 4
    setupGoogleAnalytics(GA_MEASUREMENT_ID);
    
    // Facebook Pixel
    setupFacebookPixel(FB_PIXEL_ID);
    
    // Custom event tracking
    setupCustomEventTracking();
    
    // Conversion tracking
    setupConversionTracking();
    
    // Heat mapping (placeholder for services like Hotjar)
    setupHeatMapping();
    
    console.log('Analytics initialized successfully');
}

function setupGoogleAnalytics(measurementId) {
    // Load GA4
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
                'custom_parameter_1': 'material_type',
                'custom_parameter_2': 'price_range',
                'custom_parameter_3': 'user_action'
            }
        });
    `;
    document.head.appendChild(script2);
    
    // Make gtag globally available
    window.gtag = window.gtag || function(){dataLayer.push(arguments);};
}

function setupFacebookPixel(pixelId) {
    const script = document.createElement('script');
    script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    
    // Noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" 
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);
}

function setupCustomEventTracking() {
    // Track material views
    window.trackMaterialView = function(material) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
                item_id: material.id,
                item_name: material.name,
                item_category: material.type,
                item_brand: material.brand || '365 Days Flooring',
                price: material.price,
                currency: 'USD'
            });
        }
        
        if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
                content_type: 'product',
                content_ids: [material.id],
                content_name: material.name,
                value: material.price,
                currency: 'USD'
            });
        }
        
        // Custom analytics
        trackCustomEvent('material_view', {
            material_id: material.id,
            material_type: material.type,
            price_range: getPriceRange(material.price)
        });
    };
    
    // Track comparison usage
    window.trackComparison = function(materials) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'compare_products', {
                item_ids: materials.map(m => m.id),
                value: materials.reduce((sum, m) => sum + m.price, 0),
                currency: 'USD'
            });
        }
        
        trackCustomEvent('material_comparison', {
            materials_count: materials.length,
            material_types: [...new Set(materials.map(m => m.type))]
        });
    };
    
    // Track favorites
    window.trackFavoriteAction = function(action, material) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action === 'add' ? 'add_to_wishlist' : 'remove_from_wishlist', {
                item_id: material.id,
                item_name: material.name,
                item_category: material.type,
                value: material.price,
                currency: 'USD'
            });
        }
        
        trackCustomEvent('favorite_action', {
            action: action,
            material_id: material.id,
            material_type: material.type
        });
    };
    
    // Track calculator usage
    window.trackCalculatorUse = function(roomData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_use', {
                room_size: roomData.totalSqFt,
                room_type: roomData.roomType
            });
        }
        
        trackCustomEvent('calculator_usage', {
            total_sqft: roomData.totalSqFt,
            room_type: roomData.roomType,
            waste_factor: roomData.wasteFactor
        });
    };
    
    // Track lead generation
    window.trackLeadCapture = function(leadType, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                lead_type: leadType,
                value: data.estimatedValue || 0,
                currency: 'USD'
            });
        }
        
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_category: leadType,
                value: data.estimatedValue || 0,
                currency: 'USD'
            });
        }
        
        trackCustomEvent('lead_capture', {
            type: leadType,
            source: data.source || 'website',
            estimated_value: data.estimatedValue
        });
    };
    
    // Track search behavior
    window.trackSearch = function(query, results) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                search_term: query,
                results_count: results
            });
        }
        
        trackCustomEvent('search_performed', {
            query: query,
            results_count: results,
            timestamp: Date.now()
        });
    };
}

function setupConversionTracking() {
    // Enhanced conversion tracking for business goals
    window.trackConversion = function(type, value = 0, transactionId = null) {
        const conversionData = {
            conversion_type: type,
            value: value,
            currency: 'USD',
            transaction_id: transactionId,
            timestamp: Date.now()
        };
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', conversionData);
        }
        
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
                value: value,
                currency: 'USD',
                content_type: 'service'
            });
        }
        
        // Store conversion in localStorage for attribution
        const conversions = JSON.parse(localStorage.getItem('conversions') || '[]');
        conversions.push(conversionData);
        localStorage.setItem('conversions', JSON.stringify(conversions));
        
        trackCustomEvent('conversion', conversionData);
    };
    
    // Track consultation bookings as conversions
    const originalTrackLeadCapture = window.trackLeadCapture;
    window.trackLeadCapture = function(leadType, data) {
        originalTrackLeadCapture(leadType, data);
        
        if (leadType === 'consultation') {
            trackConversion('consultation_booked', data.estimatedValue || 500);
        } else if (leadType === 'sample_request') {
            trackConversion('sample_requested', 50);
        }
    };
}

function setupHeatMapping() {
    // Placeholder for heat mapping services like Hotjar, Crazy Egg, etc.
    // Replace with actual implementation based on chosen service
    
    // Example: Hotjar
    // const hotjarId = 'XXXXXXX';
    // const script = document.createElement('script');
    // script.innerHTML = `
    //     (function(h,o,t,j,a,r){
    //         h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    //         h._hjSettings={hjid:${hotjarId},hjsv:6};
    //         a=o.getElementsByTagName('head')[0];
    //         r=o.createElement('script');r.async=1;
    //         r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    //         a.appendChild(r);
    //     })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    // `;
    // document.head.appendChild(script);
    
    console.log('Heat mapping setup (placeholder) - configure with your preferred service');
}

function trackCustomEvent(eventName, parameters = {}) {
    // Store custom events for analysis
    const events = JSON.parse(localStorage.getItem('custom_events') || '[]');
    const event = {
        event_name: eventName,
        parameters: parameters,
        timestamp: Date.now(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        session_id: getSessionId()
    };
    
    events.push(event);
    
    // Keep only last 1000 events to prevent storage overflow
    if (events.length > 1000) {
        events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('custom_events', JSON.stringify(events));
    
    // Send to custom analytics endpoint if available
    // sendToCustomEndpoint(event);
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

function getPriceRange(price) {
    if (price < 2) return 'budget';
    if (price < 5) return 'mid-range';
    if (price < 10) return 'premium';
    return 'luxury';
}

// Enhanced user behavior tracking
function initializeUserBehaviorTracking() {
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            
            // Track milestone scroll depths
            if ([25, 50, 75, 90].includes(scrollDepth)) {
                trackCustomEvent('scroll_depth', { depth: scrollDepth });
            }
        }
    });
    
    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackCustomEvent('time_on_page', { 
            seconds: timeOnPage,
            max_scroll_depth: maxScrollDepth
        });
    });
    
    // Track clicks on key elements
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.material-card, .compare-btn, .favorite-btn, .sample-btn, .fab, .cta-btn');
        if (target) {
            const elementType = target.className.split(' ')[0];
            trackCustomEvent('element_click', {
                element_type: elementType,
                page_section: getPageSection(target)
            });
        }
    });
    
    // Track form interactions
    document.addEventListener('focus', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            trackCustomEvent('form_field_focus', {
                field_name: e.target.name || e.target.id,
                field_type: e.target.type
            });
        }
    }, true);
}

function getPageSection(element) {
    const sections = ['header', 'hero', 'catalog', 'footer'];
    for (const section of sections) {
        if (element.closest(`.${section}`)) {
            return section;
        }
    }
    return 'unknown';
}

// ==============================
// QUICK WINS & FINAL OPTIMIZATIONS  
// ==============================

function initializeQuickWins() {
    // Keyboard shortcuts
    addKeyboardShortcuts();
    
    // Print functionality
    addPrintSupport();
    
    // Social sharing
    addSocialSharing();
    
    // Enhanced loading states
    addLoadingEnhancements();
    
    // Breadcrumb navigation
    addBreadcrumbs();
    
    // Tooltip system
    initializeTooltips();
    
    console.log('Quick wins initialized successfully');
}

function addKeyboardShortcuts() {
    const shortcuts = {
        'ctrl+f': () => document.getElementById('search-input')?.focus(),
        'ctrl+c': () => comparisonList.length > 0 && showComparisonModal(),
        'ctrl+h': () => toggleFavoritesPanel(),
        'ctrl+r': () => clearAllFilters(),
        'ctrl+p': () => window.print(),
        'escape': () => {
            // Close any open modals
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        },
        'ctrl+k': () => {
            // Quick command palette
            showCommandPalette();
        }
    };
    
    document.addEventListener('keydown', (e) => {
        const key = (e.ctrlKey || e.metaKey ? 'ctrl+' : '') + e.key.toLowerCase();
        
        if (shortcuts[key]) {
            e.preventDefault();
            shortcuts[key]();
        }
    });
    
    // Show shortcuts help
    const helpBtn = document.createElement('button');
    helpBtn.textContent = '?';
    helpBtn.className = 'help-btn';
    helpBtn.title = 'Keyboard Shortcuts (Ctrl+?)';
    helpBtn.onclick = showKeyboardShortcutsModal;
    document.body.appendChild(helpBtn);
}

function showCommandPalette() {
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.innerHTML = `
        <div class="palette-content">
            <input type="text" placeholder="Type a command..." class="palette-input">
            <div class="palette-results"></div>
        </div>
    `;
    
    const commands = [
        { name: 'Search materials', action: () => document.getElementById('search-input')?.focus() },
        { name: 'Open comparison', action: () => showComparisonModal() },
        { name: 'Show favorites', action: () => toggleFavoritesPanel() },
        { name: 'Calculate room size', action: () => showRoomCalculator() },
        { name: 'Request sample', action: () => showSampleRequestModal() },
        { name: 'Book consultation', action: () => showConsultationModal() },
        { name: 'Clear filters', action: () => clearAllFilters() },
        { name: 'Print page', action: () => window.print() }
    ];
    
    document.body.appendChild(palette);
    const input = palette.querySelector('.palette-input');
    const results = palette.querySelector('.palette-results');
    
    input.focus();
    
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query)
        );
        
        results.innerHTML = filtered.map((cmd, index) => 
            `<div class="palette-option ${index === 0 ? 'selected' : ''}" data-action="${index}">
                ${cmd.name}
            </div>`
        ).join('');
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            palette.remove();
        } else if (e.key === 'Enter') {
            const selected = results.querySelector('.selected');
            if (selected) {
                const index = parseInt(selected.dataset.action);
                commands.filter(cmd => cmd.name.toLowerCase().includes(input.value.toLowerCase()))[index]?.action();
                palette.remove();
            }
        }
    });
    
    // Close when clicking outside
    palette.addEventListener('click', (e) => {
        if (e.target === palette) {
            palette.remove();
        }
    });
    
    // Trigger initial search
    input.dispatchEvent(new Event('input'));
}

function showKeyboardShortcutsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content shortcuts-modal">
            <span class="close-btn">&times;</span>
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div class="shortcuts-grid">
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>F</kbd>
                    <span>Focus search</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>C</kbd>
                    <span>Open comparison</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>H</kbd>
                    <span>Toggle favorites</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>R</kbd>
                    <span>Clear filters</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>P</kbd>
                    <span>Print page</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    <span>Command palette</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Close modals</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Arrow Keys</kbd>
                    <span>Navigate materials</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    modal.querySelector('.close-btn').onclick = () => {
        modal.remove();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function addPrintSupport() {
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
        @media print {
            .top-bar, .fab, .filter-panel, .floating-cart-btn,
            .modal, .pull-refresh-indicator, .help-btn {
                display: none !important;
            }
            
            .material-card {
                break-inside: avoid;
                margin-bottom: 20px;
                border: 1px solid #ddd;
                box-shadow: none;
            }
            
            .material-image {
                height: 200px;
            }
            
            .material-info {
                padding: 15px;
            }
            
            .price {
                font-size: 18px;
                font-weight: bold;
                color: #000 !important;
            }
            
            .waterproof-badge {
                border: 2px solid #000;
                color: #000 !important;
                background: white;
            }
            
            .print-header {
                display: block;
                text-align: center;
                padding: 20px;
                border-bottom: 2px solid #000;
                margin-bottom: 30px;
            }
            
            .print-footer {
                display: block;
                text-align: center;
                padding: 20px;
                border-top: 1px solid #ddd;
                margin-top: 30px;
                font-size: 12px;
            }
            
            body {
                font-size: 12px;
            }
            
            h1, h2, h3 {
                color: #000 !important;
            }
        }
    `;
    document.head.appendChild(printStyles);
    
    // Add print header and footer
    const printHeader = document.createElement('div');
    printHeader.className = 'print-header';
    printHeader.innerHTML = `
        <h1>365 Days Flooring Catalog</h1>
        <p>Premium Flooring Solutions | Printed on ${new Date().toLocaleDateString()}</p>
    `;
    printHeader.style.display = 'none';
    document.body.insertBefore(printHeader, document.body.firstChild);
    
    const printFooter = document.createElement('div');
    printFooter.className = 'print-footer';
    printFooter.innerHTML = `
        <p>365 Days Flooring | Contact: info@365daysflooring.com | Visit: www.365daysflooring.com</p>
        <p>All prices subject to change. Contact us for current pricing and availability.</p>
    `;
    printFooter.style.display = 'none';
    document.body.appendChild(printFooter);
    
    // Print button
    const printBtn = document.createElement('button');
    printBtn.className = 'fab print-fab';
    printBtn.innerHTML = '🖨️';
    printBtn.title = 'Print Catalog (Ctrl+P)';
    printBtn.onclick = () => window.print();
    printBtn.style.bottom = '90px';
    document.body.appendChild(printBtn);
}

function addSocialSharing() {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'fab share-fab';
    shareBtn.innerHTML = '📤';
    shareBtn.title = 'Share';
    shareBtn.style.bottom = '150px';
    shareBtn.onclick = showSocialShareModal;
    document.body.appendChild(shareBtn);
}

function showSocialShareModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content share-modal">
            <span class="close-btn">&times;</span>
            <h2>📤 Share 365 Days Flooring</h2>
            <p>Share our catalog with friends and family!</p>
            <div class="share-options">
                <button class="share-option" onclick="shareToFacebook()">
                    📘 Facebook
                </button>
                <button class="share-option" onclick="shareToTwitter()">
                    🐦 Twitter
                </button>
                <button class="share-option" onclick="shareToLinkedIn()">
                    💼 LinkedIn
                </button>
                <button class="share-option" onclick="shareToEmail()">
                    ✉️ Email
                </button>
                <button class="share-option" onclick="copyShareLink()">
                    🔗 Copy Link
                </button>
                <button class="share-option" onclick="shareToWhatsApp()">
                    💬 WhatsApp
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // Share functions
    window.shareToFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out this amazing flooring catalog from 365 Days Flooring!');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    };
    
    window.shareToTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Discover premium flooring solutions at 365 Days Flooring! 🏠✨');
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    };
    
    window.shareToLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };
    
    window.shareToEmail = () => {
        const subject = encodeURIComponent('365 Days Flooring Catalog');
        const body = encodeURIComponent(`Check out this premium flooring catalog: ${window.location.href}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };
    
    window.copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showNotification('Link copied to clipboard! 📋');
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = window.location.href;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('Link copied to clipboard! 📋');
        }
    };
    
    window.shareToWhatsApp = () => {
        const text = encodeURIComponent(`Check out this amazing flooring catalog: ${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };
}

function addLoadingEnhancements() {
    // Enhanced loading spinner
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="loading-text">Loading premium flooring...</div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Skeleton loading for material cards
    function createSkeletonCard() {
        const skeleton = document.createElement('div');
        skeleton.className = 'material-card skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-price"></div>
                <div class="skeleton-buttons">
                    <div class="skeleton-btn"></div>
                    <div class="skeleton-btn"></div>
                </div>
            </div>
        `;
        return skeleton;
    }
    
    // Show loading state
    window.showLoadingState = function(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (container) {
            container.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                container.appendChild(createSkeletonCard());
            }
        }
    };
    
    // Hide loading overlay after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.remove(), 300);
        }, 500);
    });
}

function addBreadcrumbs() {
    const breadcrumbContainer = document.createElement('nav');
    breadcrumbContainer.className = 'breadcrumb-nav';
    
    const updateBreadcrumbs = () => {
        const path = window.location.pathname;
        const breadcrumbs = ['Home'];
        
        if (path.includes('catalog')) {
            breadcrumbs.push('Catalog');
        }
        
        // Add current filter context
        const activeFilters = document.querySelectorAll('.filter-btn.active');
        if (activeFilters.length > 0) {
            breadcrumbs.push('Filtered');
        }
        
        breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                <span class="breadcrumb-item ${isLast ? 'active' : ''}">${crumb}</span>
                ${!isLast ? '<span class="breadcrumb-separator">›</span>' : ''}
            `;
        }).join('');
    };
    
    // Insert breadcrumbs after header
    const header = document.querySelector('.top-bar');
    if (header) {
        header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
        updateBreadcrumbs();
    }
}

function initializeTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);
    
    // Add tooltips to elements with title attributes or data-tooltip
    document.addEventListener('mouseenter', (e) => {
        const target = e.target;
        const tooltipText = target.getAttribute('title') || target.getAttribute('data-tooltip');
        
        if (tooltipText) {
            // Remove title to prevent native tooltip
            if (target.getAttribute('title')) {
                target.setAttribute('data-original-title', tooltipText);
                target.removeAttribute('title');
            }
            
            tooltip.textContent = tooltipText;
            tooltip.style.opacity = '1';
            tooltip.style.pointerEvents = 'none';
            
            const rect = target.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        }
    });
    
    document.addEventListener('mouseleave', (e) => {
        const target = e.target;
        const originalTitle = target.getAttribute('data-original-title');
        
        if (originalTitle) {
            target.setAttribute('title', originalTitle);
            target.removeAttribute('data-original-title');
        }
        
        tooltip.style.opacity = '0';
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==============================
// FINALIZED INITIALIZATION + STARTUP
// ==============================

function initializeCatalog() {
    console.log('🚀 Initializing 365 Days Flooring Catalog...');
    
    try {
        // Core system initialization
        loadMaterials();
        
        // Feature systems (in order of importance)
        initializeComparison();
        initializeFavorites(); 
        initializeRoomCalculator();
        initializeEstimateCart();
        initializeLeadCapture();
        initializeMobileEnhancements();
        
        // Analytics and tracking
        initializeAnalytics();
        initializeUserBehaviorTracking();
        
        // Quick wins and optimizations
        initializeQuickWins();
        
        console.log('✅ All systems initialized successfully!');
        
        // Track successful initialization
        if (typeof trackCustomEvent !== 'undefined') {
            trackCustomEvent('catalog_initialized', {
                features_enabled: [
                    'comparison', 'favorites', 'calculator', 'cart', 
                    'lead_capture', 'mobile', 'analytics', 'quick_wins'
                ],
                materials_count: allMaterials.length,
                initialization_time: Date.now()
            });
        }
        
        // Show welcome message for first-time visitors
        if (!localStorage.getItem('has_visited')) {
            setTimeout(() => {
                showWelcomeModal();
                localStorage.setItem('has_visited', 'true');
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error initializing catalog:', error);
        showNotification('Some features may not work properly. Please refresh the page.', 'error');
    }
}

function showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content welcome-modal">
            <span class="close-btn">&times;</span>
            <h2>🏠 Welcome to 365 Days Flooring!</h2>
            <p>Discover our premium flooring collection with these powerful features:</p>
            <div class="feature-highlights">
                <div class="feature-item">
                    <span class="feature-icon">🔍</span>
                    <div>
                        <strong>Smart Search & Filter</strong>
                        <p>Find your perfect flooring quickly</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">⚖️</span>
                    <div>
                        <strong>Compare Materials</strong>
                        <p>Side-by-side comparison tool</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📐</span>
                    <div>
                        <strong>Room Calculator</strong>
                        <p>Calculate exact measurements</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">❤️</span>
                    <div>
                        <strong>Save Favorites</strong>
                        <p>Keep track of materials you love</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📱</span>
                    <div>
                        <strong>Mobile Optimized</strong>
                        <p>Perfect experience on any device</p>
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🎯</span>
                    <div>
                        <strong>Expert Consultation</strong>
                        <p>Book free consultations</p>
                    </div>
                </div>
            </div>
            <div class="welcome-actions">
                <button class="btn gold" onclick="this.closest('.modal').remove()">
                    Start Exploring
                </button>
                <button class="btn" onclick="showKeyboardShortcutsModal(); this.closest('.modal').remove();">
                    View Shortcuts
                </button>
            </div>
            <p class="welcome-tip">💡 <strong>Tip:</strong> Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anytime to open the command palette!</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Enhanced error handling and debugging
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    if (typeof trackCustomEvent !== 'undefined') {
        trackCustomEvent('javascript_error', {
            message: e.error?.message || 'Unknown error',
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    }
});

// Performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const metrics = {
                    page_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    dom_ready_time: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                    first_paint: Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0),
                    materials_count: allMaterials.length
                };
                
                if (typeof trackCustomEvent !== 'undefined') {
                    trackCustomEvent('performance_metrics', metrics);
                }
                
                console.log('📊 Performance Metrics:', metrics);
            }, 0);
        });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Auto-initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCatalog);
} else {
    initializeCatalog();
}

// Export functions for global access (for debugging/testing)
window.CatalogAPI = {
    // Core functions
    loadMaterials,
    filterMaterials,
    searchMaterials,
    
    // Feature functions
    addToComparison,
    removeFromComparison,
    showComparisonModal,
    addToFavorites,
    removeFromFavorites,
    showMaterialDetail,
    
    // Utility functions
    trackCustomEvent,
    showNotification,
    
    // State accessors
    get allMaterials() { return [...allMaterials]; },
    get filteredMaterials() { return [...filteredMaterials]; },
    get comparisonList() { return [...comparisonList]; },
    get favoritesList() { return getFavorites(); }
};

console.log('🎉 365 Days Flooring Catalog System Ready!');
console.log('💡 Access CatalogAPI in console for debugging');
console.log('⌨️ Press Ctrl+? for keyboard shortcuts');

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
