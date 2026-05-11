/* ============================================
   LÓGICA DO QUIZ
   ============================================ */

// Variáveis Globais
let currentQuestion = 0;
let userAnswers = [];
let scores = {};

// Inicializar scores
Object.keys(procedures).forEach(proc => {
    scores[proc] = 0;
});

/* ============================================
   FUNÇÃO: Iniciar Quiz
   ============================================ */
function startQuiz() {
    // Resetar dados
    currentQuestion = 0;
    userAnswers = [];
    Object.keys(procedures).forEach(proc => {
        scores[proc] = 0;
    });

    // Ir para tela do quiz
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');

    // Mostrar primeira pergunta
    showQuestion();
}

/* ============================================
   FUNÇÃO: Exibir Pergunta
   ============================================ */
function showQuestion() {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    // Atualizar progress bar
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Atualizar contador
    document.getElementById('question-counter').textContent = 
        `${currentQuestion + 1} de ${questions.length}`;

    // Exibir pergunta
    document.getElementById('question-text').textContent = question.text;

    // Limpar opções anteriores
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    // Criar opções
    question.options.forEach((option, index) => {
        const optionHTML = `
            <label class="option">
                <input type="radio" name="option" value="${index}" 
                       ${userAnswers[currentQuestion] === index ? 'checked' : ''}>
                <label class="option-text">${option.text}</label>
            </label>
        `;
        optionsContainer.innerHTML += optionHTML;

        // Adicionar evento de seleção
        const radio = optionsContainer.lastChild.querySelector('input');
        radio.addEventListener('change', () => selectOption(index));
    });

    // Atualizar botões
    updateButtonsVisibility();
}

/* ============================================
   FUNÇÃO: Selecionar Opção
   ============================================ */
function selectOption(index) {
    userAnswers[currentQuestion] = index;
    
    // Adicionar pontos
    const option = questions[currentQuestion].options[index];
    for (const [procedure, points] of Object.entries(option.points)) {
        scores[procedure] += points;
    }

    // Marcar opção como selecionada visualmente
    document.querySelectorAll('.option').forEach((el, i) => {
        if (i === index) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
}

/* ============================================
   FUNÇÃO: Pergunta Anterior
   ============================================ */
function previousQuestion() {
    if (currentQuestion > 0) {
        // Remover pontos da resposta anterior
        const option = questions[currentQuestion].options[userAnswers[currentQuestion]];
        for (const [procedure, points] of Object.entries(option.points)) {
            scores[procedure] -= points;
        }

        currentQuestion--;
        showQuestion();
    }
}

/* ============================================
   FUNÇÃO: Próxima Pergunta
   ============================================ */
function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    }
}

/* ============================================
   FUNÇÃO: Atualizar Visibilidade dos Botões
   ============================================ */
function updateButtonsVisibility() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');

    // Mostrar/esconder botão "Anterior"
    if (currentQuestion === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // Mostrar/esconder botão "Próxima" e "Finalizar"
    if (currentQuestion === questions.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }
}

/* ============================================
   FUNÇÃO: Finalizar Quiz
   ============================================ */
function finishQuiz() {
    // Verificar se respondeu a última pergunta
    if (userAnswers[currentQuestion] === undefined) {
        alert('Por favor, selecione uma opção antes de continuar!');
        return;
    }

    // Ir para tela de resultados
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('results-screen').classList.add('active');

    // Exibir resultados
    showResults();
}

/* ============================================
   FUNÇÃO: Mostrar Resultados
   ============================================ */
function showResults() {
    // Encontrar procedimento com maior pontuação
    let topProcedure = '';
    let topScore = -1;

    for (const [procedure, score] of Object.entries(scores)) {
        if (score > topScore) {
            topScore = score;
            topProcedure = procedure;
        }
    }

    // Exibir resultado principal
    const mainResult = procedures[topProcedure];
    document.getElementById('result-procedure').textContent = mainResult.name;
    document.getElementById('result-description').textContent = mainResult.description;
    document.getElementById('detail-duration').textContent = mainResult.duration;
    document.getElementById('detail-recovery').textContent = mainResult.recovery;
    document.getElementById('detail-duration-effect').textContent = mainResult.durability;
    document.getElementById('detail-pain').textContent = mainResult.painLevel;
    document.getElementById('detail-price').textContent = mainResult.price;

    // Mostrar alternativas
    const alternativesContainer = document.getElementById('alternatives-container');
    alternativesContainer.innerHTML = '';

    // Pegar top 2 alternativas
    const sortedProcedures = Object.entries(scores)
        .filter(([proc]) => proc !== topProcedure)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

    sortedProcedures.forEach(([procedure, score]) => {
        const alt = procedures[procedure];
        const altCard = `
            <div class="alternative-card" onclick="alert('${alt.name}\\n\\n${alt.description}\\n\\nDuração: ${alt.duration}\\nRecuperação: ${alt.recovery}\\nDurabilidade: ${alt.durability}\\nNível de Dor: ${alt.painLevel}\\nPreço: ${alt.price}')">
                <span class="alternative-emoji">${alt.emoji}</span>
                <span class="alternative-name">${alt.name}</span>
            </div>
        `;
        alternativesContainer.innerHTML += altCard;
    });
}

/* ============================================
   FUNÇÃO: Compartilhar Resultado
   ============================================ */
function shareResult() {
    const topProcedure = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])[0][0];
    
    const procedureName = procedures[topProcedure].name;
    const text = `Descobri que o procedimento estético ideal para mim é: ${procedureName}! 💖 Teste você também no Sofia Estética!`;
    
    // Copiar para clipboard
    navigator.clipboard.writeText(text).then(() => {
        alert('Resultado copiado! Você pode compartilhar em suas redes sociais.');
    }).catch(() => {
        alert(`Resultado: ${text}`);
    });
}

/* ============================================
   FUNÇÃO: Reiniciar Quiz
   ============================================ */
function restartQuiz() {
    // Resetar dados
    currentQuestion = 0;
    userAnswers = [];
    Object.keys(procedures).forEach(proc => {
        scores[proc] = 0;
    });

    // Voltar para tela inicial
    document.getElementById('results-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('active');
}
