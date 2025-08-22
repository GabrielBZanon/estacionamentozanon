// Elementos do DOM
const vehiclesList = document.getElementById('vehiclesList');
const newVehicleForm = document.getElementById('newVehicleForm');
const reportForm = document.getElementById('reportForm');
const refreshBtn = document.getElementById('refreshBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const printReportBtn = document.getElementById('printReportBtn');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const noVehiclesMessage = document.getElementById('noVehiclesMessage');
const errorMessage = document.getElementById('errorMessage');
const apiStatusElement = document.getElementById('apiStatus');

// Estado da aplicação
let currentView = 'cards'; // 'cards' ou 'list'
let isOnline = false;

// Modal
const editVehicleModal = new bootstrap.Modal(document.getElementById('editVehicleModal'));

// Função para verificar status da API
async function checkApiStatus() {
    try {
        isOnline = await checkApiStatus();
        const statusBadge = apiStatusElement.querySelector('.badge');
        
        if (isOnline) {
            statusBadge.className = 'badge bg-success';
            statusBadge.textContent = 'Online';
        } else {
            statusBadge.className = 'badge bg-warning';
            statusBadge.textContent = 'Offline (Modo Local)';
            showToast('API offline. Algumas funcionalidades podem estar limitadas.', 'warning');
        }
    } catch (error) {
        console.error('Erro ao verificar status da API:', error);
    }
}

// Função para exibir veículos na lista
function displayVehicles(vehicles) {
    vehiclesList.innerHTML = '';
    
    if (vehicles.length === 0) {
        vehiclesList.classList.add('d-none');
        noVehiclesMessage.classList.remove('d-none');
        return;
    }
    
    noVehiclesMessage.classList.add('d-none');
    vehiclesList.classList.remove('d-none');
    
    if (currentView === 'cards') {
        displayCardsView(vehicles);
    } else {
        displayListView(vehicles);
    }
}

// Visualização em cards
function displayCardsView(vehicles) {
    vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'card vehicle-card mb-3';
        
        // Calcular tempo estacionado e total a pagar
        const hours = calculateHoursDiff(vehicle.entrada, vehicle.saida);
        const total = hours * vehicle.valorHora;
        
        vehicleCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h5 class="card-title">${vehicle.placa}</h5>
                    <span class="status-badge ${vehicle.saida ? 'status-finished' : 'status-active'}">
                        ${vehicle.saida ? 'Finalizado' : 'Estacionado'}
                    </span>
                </div>
                <p class="card-text"><i class="bi bi-clock"></i> Entrada: ${formatDate(vehicle.entrada)}</p>
                ${vehicle.saida ? 
                    `<p class="card-text"><i class="bi bi-clock-history"></i> Saída: ${formatDate(vehicle.saida)}</p>` : 
                    ''}
                <p class="card-text"><strong>Valor Hora:</strong> ${formatCurrency(vehicle.valorHora)}</p>
                <p class="card-text"><strong>Tempo Estacionado:</strong> ${hours} horas</p>
                <p class="card-text"><strong>Total ${vehicle.saida ? 'Pago' : 'a Pagar'}:</strong> ${formatCurrency(total)}</p>
                <div class="d-flex justify-content-end">
                    ${!vehicle.saida ? `
                        <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${vehicle.id}">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger exit-btn" data-id="${vehicle.id}">
                            <i class="bi bi-box-arrow-right"></i> Registrar Saída
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        vehiclesList.appendChild(vehicleCard);
    });
    
    setupVehicleButtons();
}

// Visualização em lista (mais compacta)
function displayListView(vehicles) {
    const table = document.createElement('table');
    table.className = 'table table-hover';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Placa</th>
                <th>Entrada</th>
                <th>Status</th>
                <th>Valor/Hora</th>
                <th>Total</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${vehicles.map(vehicle => {
                const hours = calculateHoursDiff(vehicle.entrada, vehicle.saida);
                const total = hours * vehicle.valorHora;
                
                return `
                    <tr>
                        <td>${vehicle.placa}</td>
                        <td>${formatDate(vehicle.entrada)}</td>
                        <td><span class="status-badge ${vehicle.saida ? 'status-finished' : 'status-active'}">
                            ${vehicle.saida ? 'Finalizado' : 'Estacionado'}
                        </span></td>
                        <td>${formatCurrency(vehicle.valorHora)}</td>
                        <td>${formatCurrency(total)}</td>
                        <td>
                            ${!vehicle.saida ? `
                                <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${vehicle.id}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger exit-btn" data-id="${vehicle.id}">
                                    <i class="bi bi-box-arrow-right"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    
    vehiclesList.appendChild(table);
    setupVehicleButtons();
}

// Configurar botões de ação dos veículos
function setupVehicleButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vehicleId = e.target.closest('.edit-btn').dataset.id;
            openEditModal(vehicleId);
        });
    });
    
    document.querySelectorAll('.exit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vehicleId = e.target.closest('.exit-btn').dataset.id;
            registerExit(vehicleId);
        });
    });
}

// Alternar entre visualização em cards e lista
function toggleView() {
    currentView = currentView === 'cards' ? 'list' : 'cards';
    toggleViewBtn.innerHTML = currentView === 'cards' ? 
        '<i class="bi bi-list"></i> Visualização em Lista' : 
        '<i class="bi bi-grid"></i> Visualização em Cards';
    
    // Recarregar veículos para aplicar a nova visualização
    loadAndDisplayVehicles();
}

// Função para carregar e exibir veículos
async function loadAndDisplayVehicles() {
    try {
        loadingIndicator.classList.remove('d-none');
        vehiclesList.classList.add('d-none');
        noVehiclesMessage.classList.add('d-none');
        errorMessage.classList.add('d-none');
        
        const vehicles = await loadVehicles();
        displayVehicles(vehicles);
    } catch (error) {
        errorMessage.classList.remove('d-none');
        document.getElementById('errorText').textContent = error.message || 'Erro ao carregar veículos';
    } finally {
        loadingIndicator.classList.add('d-none');
    }
}

// Restante do código permanece similar com melhor tratamento de erro...

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', async () => {
    initializeDateFields();
    await checkApiStatus();
    await loadAndDisplayVehicles();
    await updateStats();
    
    // Configurar event listeners
    toggleViewBtn.addEventListener('click', toggleView);
    
    // Verificar status da API a cada 30 segundos
    setInterval(checkApiStatus, 30000);
});