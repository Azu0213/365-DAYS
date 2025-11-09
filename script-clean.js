// 365 Days Flooring Catalog - Clean Version
// Basic functionality only: search, filter, view materials

let allMaterials = [];
let filteredMaterials = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 365 Days Flooring Catalog Starting...');
    loadMaterials();
    setupSearch();
    setupFilter();
    updateYear();
});

// Load materials from JSON file
async function loadMaterials() {
    try {
        console.log('📦 Loading materials...');
        const response = await fetch('data/materials.json?v=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`Failed to load materials: ${response.status}`);
        }
        
        const materials = await response.json();
        console.log(`✅ Loaded ${materials.length} materials`);
        
        // Store globally
        allMaterials = materials;
        filteredMaterials = [...materials];
        
        // Display materials
        displayMaterials(materials);
        setupTypeOptions(materials);
        
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('material-grid').innerHTML = `
            <div class="error">
                <h3>Error Loading Catalog</h3>
                <p>${error.message}</p>
                <button onclick="loadMaterials()">Try Again</button>
            </div>
        `;
    }
}

// Display materials in the grid
function displayMaterials(materials) {
    const grid = document.getElementById('material-grid');
    const count = document.getElementById('results-count');
    
    if (!grid) return;
    
    // Update count
    if (count) count.textContent = `${materials.length} materials`;
    
    // Clear grid
    grid.innerHTML = '';
    
    if (materials.length === 0) {
        grid.innerHTML = '<div class="empty">No materials found</div>';
        return;
    }
    
    // Create cards
    materials.forEach(material => {
        const card = createMaterialCard(material);
        grid.appendChild(card);
    });
}

// Create individual material card
function createMaterialCard(material) {
    const card = document.createElement('div');
    card.className = 'material-card';
    
    // Get image path - use sample image
    const imagePath = material.images?.sample || 'catalog/images/placeholder.jpg';
    
    console.log(`Creating card for ${material.name}: ${imagePath}`);
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${imagePath}" alt="${material.name}" loading="lazy">
        </div>
        <div class="card-info">
            <h3>${material.name}</h3>
            <p class="collection">${material.collection || ''}</p>
            <p class="type">${material.type || ''}</p>
            <span class="id">${material.id}</span>
        </div>
    `;
    
    // Add click to show details
    card.addEventListener('click', () => showDetails(material));
    
    return card;
}

// Show material details in a modal
function showDetails(material) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="${material.images?.sample || 'catalog/images/placeholder.jpg'}" alt="${material.name}">
                </div>
                <div class="modal-info">
                    <h2>${material.name}</h2>
                    <p><strong>Collection:</strong> ${material.collection || 'N/A'}</p>
                    <p><strong>Type:</strong> ${material.type || 'N/A'}</p>
                    <p><strong>ID:</strong> ${material.id}</p>
                    
                    ${material.features ? `
                        <div class="features">
                            <h4>Features:</h4>
                            <ul>
                                ${material.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${material.specifications ? `
                        <div class="specs">
                            <h4>Specifications:</h4>
                            <div class="spec-grid">
                                <div>Thickness: ${material.specifications.thickness || 'N/A'}</div>
                                <div>Wear Layer: ${material.specifications.wear_layer || 'N/A'}</div>
                                <div>Core: ${material.specifications.core || 'N/A'}</div>
                                <div>Warranty: ${material.specifications.warranty || 'N/A'}</div>
                                <div>Waterproof: ${material.specifications.waterproof ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Close modal events
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    };
    
    // Show modal
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        filteredMaterials = allMaterials.filter(material => {
            return material.name.toLowerCase().includes(query) ||
                   material.collection?.toLowerCase().includes(query) ||
                   material.type?.toLowerCase().includes(query) ||
                   material.id.toLowerCase().includes(query);
        });
        
        displayMaterials(filteredMaterials);
    });
}

// Setup type filter
function setupFilter() {
    const typeFilter = document.getElementById('type-filter');
    if (!typeFilter) return;
    
    typeFilter.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        
        if (selectedType === '') {
            filteredMaterials = [...allMaterials];
        } else {
            filteredMaterials = allMaterials.filter(material => 
                material.type === selectedType
            );
        }
        
        displayMaterials(filteredMaterials);
    });
}

// Setup type filter options
function setupTypeOptions(materials) {
    const typeFilter = document.getElementById('type-filter');
    if (!typeFilter) return;
    
    const types = [...new Set(materials.map(m => m.type).filter(Boolean))];
    
    typeFilter.innerHTML = '<option value="">All Types</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

// Update footer year
function updateYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}