// Elementos da tela
const telaEscolha = document.getElementById('telaEscolha');
const telaAluno = document.getElementById('telaAluno');
const telaProf = document.getElementById('telaProf');
const statusMsg = document.getElementById('status');

// Função para salvar configuração
function salvarConfig(tipo, nome) {
    chrome.storage.local.set({ 
        'tipo_usuario': tipo, 
        'nome_usuario': nome 
    }, function() {
        statusMsg.innerText = "Configuração Salva!";
        
        // Envia mensagem para a aba ativa atualizar a configuração
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {acao: "atualizarConfig"}, function(r) {
                    if (chrome.runtime.lastError) console.log("Aba offline ou não é o Meet");
                });
            }
        });
    });
}

// Botões de escolha inicial
document.getElementById('escolhaAluno').addEventListener('click', () => {
    telaEscolha.classList.add('hidden');
    telaAluno.classList.remove('hidden');
});

document.getElementById('escolhaProf').addEventListener('click', () => {
    telaEscolha.classList.add('hidden');
    telaProf.classList.remove('hidden');
});

// Botões de Salvar
document.getElementById('salvarAluno').addEventListener('click', () => {
    const nome = document.getElementById('nomeAluno').value;
    if (nome) salvarConfig('aluno', nome);
    else alert("Digite seu nome!");
});

document.getElementById('salvarProf').addEventListener('click', () => {
    salvarConfig('professor', 'Professor');
});

// Botões de Resetar
function resetarTudo() {
    // Remove a escolha da memória
    chrome.storage.local.remove(['tipo_usuario'], function() {
        // Recarrega o popup para voltar ao início
        location.reload();
    });
}

document.getElementById('resetAluno').addEventListener('click', resetarTudo);
document.getElementById('resetProf').addEventListener('click', resetarTudo);
// ----------------------------------------------------

// Ao abrir, verifica se já tem algo salvo (Auto-Login)
chrome.storage.local.get(['tipo_usuario', 'nome_usuario'], function(result) {
    if (result.tipo_usuario === 'aluno') {
        document.getElementById('escolhaAluno').click();
        if(result.nome_usuario) document.getElementById('nomeAluno').value = result.nome_usuario;
    } else if (result.tipo_usuario === 'professor') {
        document.getElementById('escolhaProf').click();
    }
});