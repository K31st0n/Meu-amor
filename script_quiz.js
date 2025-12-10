document.addEventListener('DOMContentLoaded', function() {
    const quizSection = document.getElementById('quizSection');
    const photosSection = document.getElementById('photosSection');
    const questionContainer = document.getElementById('questionContainer');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    const progressFill = document.getElementById('progressFill');

    // PERGUNTAS DO QUIZ (customize aqui!)
    const questions = [
        {
            question: "Qual é meu apelido favorito para você?",
            options: ["Meu amor", "Princesa", "Neném", "Minha manga Rosa"],
            correct: 3 // índice da resposta correta ("Minha manga Rosa")
        },
        {
            question: "Qual foi nosso primeiro lugar especial?",
            options: ["Cinema", "Rodoviária", "Praça da matriz", "Casa da Vovó"],
            correct: 2
        },
        {
            question: "Qual é a sua cor favorita?",
            options: ["Rosa", "Azul", "Verde", "Roxo"],
            correct: 2
        },
        {
            question: "Em que mês é seu aniversário?",
            options: ["Março", "Junho", "Setembro", "Dezembro"],
            correct: 2
        },
        {
            question: "Quantas vezes você é linda?",
            options: ["Muitas", "Sempre", "Infinitas", "Todas as três!"],
            correct: 3
        }
    ];

    let currentQuestion = 0;
    let answered = false;
    let selectedAnswer = null;
    // armazena respostas selecionadas por pergunta (índices) — null = não respondida
    const selectedAnswers = new Array(questions.length).fill(null);

    function updateProgress() {
        const percent = ((currentQuestion + 1) / questions.length) * 100;
        progressFill.style.width = percent + '%';
    }

    function renderQuestion() {
        const q = questions[currentQuestion];
        let html = `<h2>${q.question}</h2><div class="options-group">`;
        
        q.options.forEach((opt, idx) => {
            const selected = idx === selectedAnswers[currentQuestion] ? ' selected' : '';
            html += `<button class="option-btn${selected}" data-index="${idx}">${opt}</button>`;
        });
        
        html += '</div>';
        questionContainer.innerHTML = html;

        // Eventos dos botões de opção
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!answered) {
                    selectedAnswer = parseInt(this.getAttribute('data-index'));
                    selectedAnswers[currentQuestion] = selectedAnswer;
                    answered = true;

                    // Atualiza seleção visual
                    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');

                    // Mostrar botões de navegação
                    if (currentQuestion < questions.length - 1) {
                        nextBtn.style.display = 'block';
                    } else {
                        finishBtn.style.display = 'block';
                    }
                }
            });
        });

        updateProgress();
    }

    function nextQuestion() {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            answered = false;
            selectedAnswer = null;
            nextBtn.style.display = 'none';
            renderQuestion();
        }
    }

    function finishQuiz() {
        // Verifica se todas respostas estão corretas
        const allCorrect = questions.every((q, i) => selectedAnswers[i] === q.correct);
        if (allCorrect) {
            // Esconder quiz, mostrar fotos
            quizSection.style.display = 'none';
            photosSection.style.display = 'block';
            // Dar tempo para o DOM renderizar antes de inicializar galeria
            setTimeout(() => initPhotosGallery(), 50);
            return;
        }

        // Caso haja erro, mostrar mensagem e permitir nova tentativa
        questionContainer.innerHTML = `
            <h2>Ops... Algumas respostas estão erradas</h2>
            <p>Você precisa responder corretamente para revelar o álbum. Tente novamente.</p>
            <button id="retryBtn" class="quiz-btn">Tentar Novamente</button>
        `;
        finishBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        document.getElementById('retryBtn').addEventListener('click', () => {
            // reset do quiz
            currentQuestion = 0;
            for (let i = 0; i < selectedAnswers.length; i++) selectedAnswers[i] = null;
            answered = false;
            selectedAnswer = null;
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'none';
            renderQuestion();
        });
    }

    // Eventos dos botões
    nextBtn.addEventListener('click', nextQuestion);
    finishBtn.addEventListener('click', finishQuiz);

    // Iniciar o quiz
    renderQuestion();

    // ===== GALERIA DE FOTOS =====
    function initPhotosGallery() {
        if (window.initGallery) {
            window.initGallery({
                root: photosSection,
                photoDisplay: '#photoDisplay',
                thumbnails: '#thumbnails',
                photoInput: '#photoInput',
                addPhotoBtn: '#addPhotoBtn',
                prev: '.nav-btn.prev',
                next: '.nav-btn.next',
                autoplayToggle: '#autoplayToggle',
                frame: '.photo-frame',
                photosJsonUrl: 'photos.json'
            });
        }
    }
});
