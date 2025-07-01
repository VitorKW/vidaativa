// --- Configurações do ThingSpeak ---
const CHANNEL_ID = '3001123'; // <-- Substitua pelo ID do seu canal ThingSpeak
const READ_API_KEY = '2H5RLCSU6KO803X7'; // <-- Substitua pela sua Read API Key do ThingSpeak

// IDs dos campos no ThingSpeak (conforme configurado no código do ESP32 e no envio manual)
const FIELD_TEMPERATURA = 1; // field1
const FIELD_CORRENTE = 2;    // field2
const FIELD_STATUS_MOTOR = 3; // field3

// --- Credenciais de Login (MUITO SIMPLES - APENAS PARA TCC/DEMONSTRAÇÃO!) ---
const VALID_USERNAME = 'vidaativa';
const VALID_PASSWORD = 'senhaforte'; // Não use senhas reais aqui!

// --- Elementos HTML - Seções e Formulário de Login ---
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('loginMessage');
const logoutButton = document.getElementById('logoutButton');

// --- Elementos HTML - Dados da Piscina ---
const temperaturaSpan = document.getElementById('temperatura');
const correnteSpan = document.getElementById('corrente');
const statusMotorSpan = document.getElementById('statusMotor');
const lastUpdatedSpan = document.getElementById('lastUpdated');
const refreshButton = document.getElementById('refreshButton');
const errorMessageDiv = document.getElementById('errorMessage');

let fetchInterval; // Variável para armazenar o ID do setInterval

// --- Funções de Autenticação ---
function showLoginScreen() {
    loginSection.classList.remove('hidden'); // Mostra a seção de login
    appSection.classList.add('hidden');      // Oculta a seção do aplicativo
    loginMessage.textContent = '';           // Limpa mensagens de erro
    usernameInput.value = '';                // Limpa campos de entrada
    passwordInput.value = '';
    clearInterval(fetchInterval);            // Para de buscar dados quando faz logout
}

function showAppScreen() {
    loginSection.classList.add('hidden');     // Oculta a seção de login
    appSection.classList.remove('hidden');    // Mostra a seção do aplicativo
    // Inicia a busca de dados quando o usuário faz login
    fetchDataFromThingSpeak(); // Busca dados imediatamente
    fetchInterval = setInterval(fetchDataFromThingSpeak, 20000); // Continua buscando a cada 20 segundos
}

// --- Função para buscar e exibir os dados ---
async function fetchDataFromThingSpeak() {
    errorMessageDiv.textContent = ''; // Limpa mensagens de erro anteriores
    try {
        // Constrói a URL para a API de leitura do ThingSpeak
        const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1&api_key=${READ_API_KEY}`;

        console.log('Buscando dados de:', url); // Para depuração no console do navegador
        const response = await fetch(url); // Faz a requisição GET
        
        if (!response.ok) { // Verifica se a resposta HTTP foi bem-sucedida (código 200)
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Converte a resposta para JSON

        if (data && data.feeds && data.feeds.length > 0) {
            const latestFeed = data.feeds[0]; // Pega o feed (última entrada de dados) mais recente

            // Extrai os valores dos campos
            const temp = latestFeed[`field${FIELD_TEMPERATURA}`];
            const current = latestFeed[`field${FIELD_CORRENTE}`];
            const motorStatus = latestFeed[`field${FIELD_STATUS_MOTOR}`];

            // Atualiza o conteúdo dos elementos HTML com os dados lidos
            temperaturaSpan.textContent = temp ? parseFloat(temp).toFixed(2) : '-';
            correnteSpan.textContent = current ? parseFloat(current).toFixed(2) : '-';

            // Lógica para exibir o status do motor
            if (motorStatus === '1') {
                statusMotorSpan.textContent = 'LIGADO';
                statusMotorSpan.style.color = '#28a745'; // Verde
            } else if (motorStatus === '0') {
                statusMotorSpan.textContent = 'DESLIGADO';
                statusMotorSpan.style.color = '#dc3545'; // Vermelho
            } else {
                statusMotorSpan.textContent = '-'; // Caso o status não seja 0 nem 1
                statusMotorSpan.style.color = '#333';
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

// --- Event Listeners ---

// Adiciona um ouvinte de evento para o envio do formulário de login
loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página

    const username = usernameInput.value;
    const password = passwordInput.value;

    // Verifica as credenciais
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        showAppScreen(); // Se correto, mostra a tela do aplicativo
    } else {
        loginMessage.textContent = 'Usuário ou senha inválidos.';
        loginMessage.style.color = '#dc3545'; // Mensagem de erro em vermelho
    }
});

// Adiciona um ouvinte de clique ao botão de atualização de dados
refreshButton.addEventListener('click', fetchDataFromThingSpeak);

// Adiciona um ouvinte de clique ao botão de logout
logoutButton.addEventListener('click', showLoginScreen);

// --- Inicialização ---
// Mostra a tela de login quando a página é carregada pela primeira vez
showLoginScreen();