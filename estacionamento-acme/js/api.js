// Configuração da API
const API_CONFIG = {
    BASE_URL: 'https://estacionamento-acme-api.vercel.app',
    USE_CORS_PROXY: false, // Alterne para true se precisar do proxy
    CORS_PROXY: 'https://api.allorigins.win/raw?url=' // Proxy alternativo
};

// Função para construir a URL da API
function buildApiUrl(endpoint) {
    if (API_CONFIG.USE_CORS_PROXY) {
        return `${API_CONFIG.CORS_PROXY}${encodeURIComponent(API_CONFIG.BASE_URL + endpoint)}`;
    }
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Função para fazer requisições com tratamento de erro
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Função para verificar se a API está online
async function checkApiStatus() {
    try {
        const response = await fetch(buildApiUrl('/'), { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.log('API offline:', error.message);
        return false;
    }
}

// Função para carregar veículos
async function loadVehicles() {
    try {
        return await makeRequest(buildApiUrl('/veiculos'));
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        showToast('Erro ao carregar veículos. Verifique a conexão com a API.', 'danger');
        
        // Retornar dados de exemplo para desenvolvimento
        return [
            {
                id: 1,
                placa: 'AAA0000',
                entrada: new Date().toISOString(),
                saida: null,
                valorHora: 10.00
            },
            {
                id: 2,
                placa: 'AAL2525',
                entrada: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                saida: null,
                valorHora: 10.00
            }
        ];
    }
}

// Função para registrar novo veículo
async function registerVehicle(vehicleData) {
    try {
        return await makeRequest(buildApiUrl('/veiculos'), {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    } catch (error) {
        console.error('Erro ao registrar veículo:', error);
        showToast('Erro ao registrar veículo. Verifique a conexão com a API.', 'danger');
        
        // Simular sucesso para desenvolvimento
        return { ...vehicleData, id: Date.now() };
    }
}

// Função para atualizar veículo
async function updateVehicle(id, vehicleData) {
    try {
        return await makeRequest(buildApiUrl(`/veiculos/${id}`), {
            method: 'PUT',
            body: JSON.stringify(vehicleData)
        });
    } catch (error) {
        console.error('Erro ao atualizar veículo:', error);
        showToast('Erro ao atualizar veículo. Verifique a conexão com a API.', 'danger');
        
        // Simular sucesso para desenvolvimento
        return { ...vehicleData, id };
    }
}

// Função para registrar saída de veículo
async function registerVehicleExit(vehicleId, exitData) {
    try {
        return await makeRequest(buildApiUrl(`/veiculos/${vehicleId}/saida`), {
            method: 'PUT',
            body: JSON.stringify(exitData)
        });
    } catch (error) {
        console.error('Erro ao registrar saída:', error);
        showToast('Erro ao registrar saída. Verifique a conexão com a API.', 'danger');
        
        // Simular sucesso para desenvolvimento
        return { ...exitData, id: vehicleId };
    }
}

// Função para buscar relatório por data
async function getReportByDate(date) {
    try {
        return await makeRequest(buildApiUrl(`/relatorios?data=${date}`));
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showToast('Erro ao gerar relatório. Verifique a conexão com a API.', 'danger');
        
        // Retornar relatório de exemplo
        return {
            data: date,
            totalEstadias: 3,
            faturamento: 60.00,
            veiculos: [
                { placa: 'AAA0000', entrada: `${date}T08:00:00`, saida: `${date}T10:00:00`, valor: 20.00 },
                { placa: 'AAL2525', entrada: `${date}T08:00:00`, saida: `${date}T10:00:00`, valor: 20.00 },
                { placa: 'AAA1358', entrada: `${date}T08:00:00`, saida: `${date}T10:00:00`, valor: 20.00 }
            ]
        };
    }
}

// Função para buscar estatísticas
async function getStats() {
    try {
        // Tenta buscar da API
        return await makeRequest(buildApiUrl('/estatisticas'));
    } catch (error) {
        console.warn('Não foi possível carregar estatísticas da API, usando dados locais:', error);
        
        // Fallback: calcular estatísticas localmente baseado nos veículos
        const vehicles = await loadVehicles();
        const today = new Date().toISOString().split('T')[0];
        
        const todayStays = vehicles.filter(v => 
            v.entrada && v.entrada.startsWith(today)
        ).length;
        
        const activeVehicles = vehicles.filter(v => !v.saida).length;
        
        const todayRevenue = vehicles
            .filter(v => v.entrada && v.entrada.startsWith(today) && v.saida)
            .reduce((total, vehicle) => {
                const hours = calculateHoursDiff(vehicle.entrada, vehicle.saida);
                return total + (hours * vehicle.valorHora);
            }, 0);
        
        return {
            activeVehicles,
            todayStays,
            todayRevenue,
            freeSpots: Math.max(0, 10 - activeVehicles) // Assumindo 10 vagas totais
        };
    }
}