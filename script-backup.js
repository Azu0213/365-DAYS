// Simple 365 Days Flooring Catalog
// Clean, basic functionality only

// Global variables
let allMaterials = [];
let filteredMaterials = [];

// Initialize the catalog
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 365 Days Flooring Catalog Loading...');
    loadCatalog();
    setupSearchFilter();
    setupTypeFilter();
    updateFooterYear();
});

// Load materials from JSON
async function loadCatalog() {
    try {
        console.log('📦 Loading materials...');
        const response = await fetch('data/materials.json?v=' + Date.now());
        if (!response.ok) throw new Error(`Failed to load materials: ${response.status}`);
        const materials = await response.json();
        
        console.log(`✅ Loaded ${materials.length} materials`);
        
        // Store materials globally
        allMaterials = materials;
        filteredMaterials = [...materials];
        
        renderCatalog(materials);
        populateTypeFilter(materials);
        
    } catch (error) {
        console.error('❌ Error loading catalog:', error);
        showErrorState(error.message);
    }
}

// Render the catalog grid
function renderCatalog(materials) {
    const container = document.getElementById('material-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (materials.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No materials found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }
    
    materials.forEach((material) => {
        const card = createMaterialCard(material);
        container.appendChild(card);
    });
    
    updateResultsCount(materials.length);
}

// Create individual material card
function createMaterialCard(material) {
    const card = document.createElement('div');
    card.className = 'material-card';
    
    // Use sample image from our image structure
    const imageUrl = material.images?.sample || material.image || 'catalog/images/placeholder.jpg';
    
    console.log(`🖼️ Creating card for ${material.name}: ${imageUrl}`);
    
    card.innerHTML = `
        <div class="material-image-container">
            <img src="${imageUrl}" alt="${material.name}" class="material-image" loading="lazy" onerror="console.error('Failed to load image: ${imageUrl}')">
        </div>
        <div class="material-info">
            <h3 class="material-name">${material.name}</h3>
            <p class="material-collection">${material.collection || ''}</p>
            <p class="material-type">${material.type || ''}</p>
            <div class="material-id">${material.id}</div>
        </div>
    `;
    
    // Add click event to show details
    card.addEventListener('click', () => showMaterialDetail(material));
    
    return card;
}

// Show material details in modal
function showMaterialDetail(material) {
    const modal = document.createElement('div');
    modal.className = 'material-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                <div class="modal-images">
                    <img src="${material.images?.sample || material.image}" alt="${material.name}" class="modal-image">
                </div>
                <div class="modal-info">
                    <h2>${material.name}</h2>
                    <p class="modal-collection">${material.collection || ''}</p>
                    <p class="modal-type">${material.type || ''}</p>
                    <p class="modal-id">Item #${material.id}</p>
                    
                    ${material.features ? `
                        <div class="modal-features">
                            <h4>Features:</h4>
                            <ul>
                                ${material.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${material.specifications ? `
                        <div class="modal-specs">
                            <h4>Specifications:</h4>
                            <div class="specs-grid">
                                <div class="spec-item">
                                    <span class="spec-label">Thickness:</span>
                                    <span class="spec-value">${material.specifications.thickness || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Wear Layer:</span>
                                    <span class="spec-value">${material.specifications.wear_layer || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Core:</span>
                                    <span class="spec-value">${material.specifications.core || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Warranty:</span>
                                    <span class="spec-value">${material.specifications.warranty || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Waterproof:</span>
                                    <span class="spec-value ${material.specifications.waterproof ? 'waterproof-yes' : 'waterproof-no'}">
                                        ${material.specifications.waterproof ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Setup search functionality
function setupSearchFilter() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        filteredMaterials = allMaterials.filter(material => {
            return material.name.toLowerCase().includes(searchTerm) ||
                   material.collection.toLowerCase().includes(searchTerm) ||
                   material.type.toLowerCase().includes(searchTerm) ||
                   material.id.toLowerCase().includes(searchTerm);
        });
        
        renderCatalog(filteredMaterials);
    });
}

// Setup type filter
function setupTypeFilter() {
    const typeSelect = document.getElementById('type-filter');
    if (!typeSelect) return;
    
    typeSelect.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        
        if (selectedType === '') {
            filteredMaterials = [...allMaterials];
        } else {
            filteredMaterials = allMaterials.filter(material => 
                material.type === selectedType
            );
        }
        
        renderCatalog(filteredMaterials);
    });
}

// Populate type filter options
function populateTypeFilter(materials) {
    const typeSelect = document.getElementById('type-filter');
    if (!typeSelect) return;
    
    const types = [...new Set(materials.map(m => m.type).filter(Boolean))];
    
    typeSelect.innerHTML = '<option value="">All Types</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

// Update results count
function updateResultsCount(count) {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `${count} materials found`;
    }
}

// Show error state
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

// Update footer year
function updateFooterYear() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}