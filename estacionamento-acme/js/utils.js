// Função para exibir toast de notificação
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover o toast do DOM após ser escondido
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Função para formatar data
function formatDate(dateString) {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Função para formatar valor monetário
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para calcular diferença de horas entre duas datas
function calculateHoursDiff(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end - start;
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60))); // Mínimo de 1 hora
}

// Função para validar placa de veículo (padrão Mercosul e antigo)
function validatePlaca(placa) {
    // Padrão Mercosul: AAA0A00
    // Padrão antigo: AAA0000
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    return placaRegex.test(placa.toUpperCase().replace(/-/g, ''));
}

// Função para inicializar campos de data com valores padrão
function initializeDateFields() {
    // Definir data e hora atuais como padrão para o formulário de entrada
    const now = new Date();
    const localDatetime = now.toISOString().substring(0, 16);
    document.getElementById('entrada').value = localDatetime;
    
    // Definir data atual como padrão para o relatório
    const today = now.toISOString().substring(0, 10);
    document.getElementById('dataRelatorio').value = today;
}