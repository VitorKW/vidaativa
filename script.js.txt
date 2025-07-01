// --- Configurações do ThingSpeak ---
const CHANNEL_ID = 'SEU_CHANNEL_ID_AQUI'; // <-- Substitua pelo ID do seu canal ThingSpeak
const READ_API_KEY = 'SUA_READ_API_KEY_AQUI'; // <-- Substitua pela sua Read API Key do ThingSpeak

// IDs dos campos no ThingSpeak (conforme configurado no código do ESP32)
const FIELD_TEMPERATURA = 1; // field1
const FIELD_CORRENTE = 2;    // field2
const FIELD_STATUS_MOTOR = 3; // field3

// --- Elementos HTML ---
const temperaturaSpan = document.getElementById('temperatura');
const correnteSpan = document.getElementById('corrente');
const statusMotorSpan = document.getElementById('statusMotor');
const lastUpdatedSpan = document.getElementById('lastUpdated');
const refreshButton = document.getElementById('refreshButton');
const errorMessageDiv = document.getElementById('errorMessage');

// --- Função para buscar e exibir os dados ---
async function fetchDataFromThingSpeak() {
    errorMessageDiv.textContent = ''; // Limpa mensagens de erro anteriores
    try {
        // Constrói a URL para a API de leitura do ThingSpeak
        // Pega os últimos dados do canal
        const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1&api_key=${READ_API_KEY}`;

        console.log('Buscando dados de:', url); // Para debug no console do navegador
        const response = await fetch(url); // Faz a requisição GET
        
        if (!response.ok) { // Verifica se a resposta foi bem-sucedida (código 200)
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Converte a resposta para JSON

        if (data && data.feeds && data.feeds.length > 0) {
            const latestFeed = data.feeds[0]; // Pega o feed mais recente

            const temp = latestFeed[`field${FIELD_TEMPERATURA}`];
            const current = latestFeed[`field${FIELD_CORRENTE}`];
            const motorStatus = latestFeed[`field${FIELD_STATUS_MOTOR}`];

            temperaturaSpan.textContent = parseFloat(temp).toFixed(2); // Formata com 2 casas decimais
            correnteSpan.textContent = parseFloat(current).toFixed(2); // Formata com 2 casas decimais

            if (motorStatus === '1') {
                statusMotorSpan.textContent = 'LIGADO';
                statusMotorSpan.style.color = '#28a745'; // Verde
            } else {
                statusMotorSpan.textContent = 'DESLIGADO';
                statusMotorSpan.style.color = '#dc3545'; // Vermelho
            }
            
            // Atualiza a hora da última atualização
            const now = new Date();
            lastUpdatedSpan.textContent = now.toLocaleTimeString();

            console.log('Dados atualizados com sucesso!');
        } else {
            errorMessageDiv.textContent = 'Nenhum dado encontrado no canal ThingSpeak.';
            console.warn('Nenhum feed de dados encontrado.');
        }

    } catch (error) {
        errorMessageDiv.textContent = `Falha ao buscar dados: ${error.message}. Verifique sua conexão e chaves API.`;
        console.error('Erro ao buscar dados do ThingSpeak:', error);
    }
}

// --- Event Listeners e Atualização Inicial ---
refreshButton.addEventListener('click', fetchDataFromThingSpeak); // Adiciona um ouvinte de clique ao botão

// Atualiza os dados a cada 20 segundos automaticamente
setInterval(fetchDataFromThingSpeak, 20000); // Ajuste este valor se precisar de mais ou menos frequência

// Carrega os dados na primeira vez que a página é carregada
fetchDataFromThingSpeak();