// Variáveis Globais de Controle
let segundosFocados = 0;
let painelExistente = null;
let intervaloTimer = null;
let nomeDoAluno = "Aluno";

// 1. Função Principal: Decide se ativa ou desativa baseado no perfil
function iniciarExtensao() {
    chrome.storage.local.get(['tipo_usuario', 'nome_usuario'], function(dados) {
        
        // Se for PROFESSOR: Limpa tudo e fica quieto
        if (dados.tipo_usuario === 'professor') {
            console.log("Modo Professor: Painel desativado.");
            removerPainel();
            return; 
        }

        // Se for ALUNO: Ativa o rastreamento
        if (dados.tipo_usuario === 'aluno') {
            nomeDoAluno = dados.nome_usuario || "Aluno Sem Nome";
            console.log("Modo Aluno: Iniciando para " + nomeDoAluno);
            criarPainel(nomeDoAluno);
            iniciarTimer();
        }
    });
}

// 2. Cria o Painel Visual na tela do Meet
function criarPainel(nome) {
    // Se já existe, não cria de novo
    if (document.getElementById('painelExtensao')) return;

    painelExistente = document.createElement("div");
    painelExistente.id = "painelExtensao";
    
    // Estilo do painel (Visual Hacker Verde)
    Object.assign(painelExistente.style, {
        position: "fixed",
        bottom: "80px",
        left: "20px",
        padding: "15px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "#00ff00",
        borderRadius: "10px",
        zIndex: "99999",
        fontFamily: "monospace",
        border: "2px solid #00ff00",
        minWidth: "150px",
        textAlign: "center"
    });
    
    // Conteúdo HTML do painel
    painelExistente.innerHTML = `
        <div style="font-size:11px; color:#ccc; margin-bottom:5px;">Aluno: ${nome}</div>
        <div id="displayTempo" style="font-size:18px; font-weight:bold; margin-bottom: 10px;">00:00</div>
        <button id="btnEntregar" style="cursor:pointer; background:#0b9c36; color:white; border:none; padding:8px; width:100%; border-radius:4px; font-weight:bold;">
            ENTREGAR RELATÓRIO
        </button>
    `;
    
    document.body.appendChild(painelExistente);

    // Adiciona a lógica ao botão de entregar
    document.getElementById('btnEntregar').addEventListener('click', enviarRelatorio);
}

// 3. Função de Envio para o Google Forms
function enviarRelatorio() {
    const btn = document.getElementById('btnEntregar');
    
    
    const URL_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSc34MpsL1OE4o20MO6L782QyhuirSi746UaJDLfPeM8NTA3kQ/formResponse"; 
    
    const ENTRY_NOME = "entry.1370640111"; 
    
    const ENTRY_TEMPO = "entry.168653226"; 

    // Prepara os dados
    const formData = new FormData();
    formData.append(ENTRY_NOME, nomeDoAluno);
    formData.append(ENTRY_TEMPO, formatarTempo(segundosFocados));

    // Feedback visual: "Enviando..."
    btn.innerText = "Enviando...";
    btn.style.backgroundColor = "#e7d4d4ff";
    btn.disabled = true;

    // Dispara para o Google
    fetch(URL_FORM, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    }).then(() => {
        alert("✅ Relatório enviado com sucesso!");
        btn.innerText = "ENVIADO!";
        btn.style.backgroundColor = "#333333ff";
    }).catch((err) => {
        alert("❌ Erro ao enviar. Verifique sua conexão.");
        console.error(err);
        btn.innerText = "TENTAR NOVAMENTE";
        btn.disabled = false;
        btn.style.backgroundColor = "red";
    });
}

// 4. Remove o painel (usado quando troca para Professor)
function removerPainel() {
    const p = document.getElementById('painelExtensao');
    if (p) p.remove();
    clearInterval(intervaloTimer);
}

// 5. O Cronômetro Inteligente
function iniciarTimer() {
    // Garante que não tenha dois timers rodando
    if (intervaloTimer) clearInterval(intervaloTimer);
    
    intervaloTimer = setInterval(() => {
        // Verifica se a aba está visível
        if (document.visibilityState === 'visible') {
            segundosFocados++;
            
            // Atualiza o texto na tela
            const display = document.getElementById('displayTempo');
            if (display) {
                display.innerText = formatarTempo(segundosFocados);
                // Borda Verde = Focado
                if(painelExistente) painelExistente.style.borderColor = "#00ff00";
            }
        } else {
            // Se o aluno saiu da aba: Borda Vermelha
            if(painelExistente) painelExistente.style.borderColor = "red";
        }
    }, 1000);
}

// Auxiliar: Formata segundos em MM:SS
function formatarTempo(totalSegundos) {
    const m = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const s = (totalSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// 6. Ouve mensagens do Popup (Para trocar de perfil sem recarregar a página)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.acao === "atualizarConfig") {
        iniciarExtensao(); // Reinicia a lógica com o novo perfil
        sendResponse({status: "ok"});
    }
});

// 7. Inicia tudo assim que o script carrega
iniciarExtensao();