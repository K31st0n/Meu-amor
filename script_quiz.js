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
            correct: 0 // índice da resposta correta
        },
        {
            question: "Qual foi nosso primeiro lugar especial?",
            options: ["Cinema", "Rodoviária", "Praça da matriz", "Casa da Vovó"],
            correct: 2
        },
        {
            question: "Qual é a sua cor favorita?",
            options: ["Rosa", "Azul", "Verde", "Roxo"],
            correct: 0
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

    function updateProgress() {
        const percent = ((currentQuestion + 1) / questions.length) * 100;
        progressFill.style.width = percent + '%';
    }

    function renderQuestion() {
        const q = questions[currentQuestion];
        let html = `<h2>${q.question}</h2><div class="options-group">`;
        
        q.options.forEach((opt, idx) => {
            const selected = idx === selectedAnswer ? ' selected' : '';
            html += `<button class="option-btn${selected}" data-index="${idx}">${opt}</button>`;
        });
        
        html += '</div>';
        questionContainer.innerHTML = html;

        // Eventos dos botões de opção
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!answered) {
                    selectedAnswer = parseInt(this.getAttribute('data-index'));
                    answered = true;

                    // Mostrar resposta correta
                    document.querySelectorAll('.option-btn').forEach(b => {
                        b.classList.remove('selected');
                    });
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
        // Esconder quiz, mostrar fotos
        quizSection.style.display = 'none';
        photosSection.style.display = 'block';
        // Dar tempo para o DOM renderizar antes de inicializar galeria
        setTimeout(() => initPhotosGallery(), 50);
    }

    // Eventos dos botões
    nextBtn.addEventListener('click', nextQuestion);
    finishBtn.addEventListener('click', finishQuiz);

    // Iniciar o quiz
    renderQuestion();

    // ===== GALERIA DE FOTOS =====
    function initPhotosGallery() {
        console.log('=== INICIANDO GALERIA ===');
        
        const photoInput = document.getElementById('photoInput');
        const addPhotoBtn = document.getElementById('addPhotoBtn');
        const photoDisplay = document.getElementById('photoDisplay');
        const thumbnails = document.getElementById('thumbnails');
        
        console.log('Elements encontrados:', {
            photoInput: !!photoInput,
            addPhotoBtn: !!addPhotoBtn,
            photoDisplay: !!photoDisplay,
            thumbnails: !!thumbnails
        });
        
        // Selecionar especificamente os botões da SEÇÃO DE FOTOS, não do quiz
        const prevBtn = photosSection.querySelector('.nav-btn.prev');
        const nextBtn_photos = photosSection.querySelector('.nav-btn.next');
        const autoplayToggle = document.getElementById('autoplayToggle');
        
        console.log('Botões encontrados:', {
            prevBtn: !!prevBtn,
            nextBtn_photos: !!nextBtn_photos,
            autoplayToggle: !!autoplayToggle
        });

        let photos = [];
        let current = 0;
        let autoplay = false;
        let intervalId = null;

        // Carregar fotos do photos.json
        console.log('Iniciando carregamento de fotos...');
        fetch('photos.json')
            .then(resp => {
                console.log('✓ Resposta do servidor:', resp.status);
                if (!resp.ok) throw new Error('Erro HTTP: ' + resp.status);
                return resp.json();
            })
            .then(list => {
                console.log('✓ Fotos carregadas do JSON:', list);
                if (Array.isArray(list) && list.length > 0) {
                    photos = list;
                    current = 0;
                    console.log('✓ Array de fotos configurado:', photos.length, 'fotos');
                    render();
                    if (photos.length > 1) startAutoplay();
                } else {
                    console.warn('⚠ Lista de fotos vazia ou inválida');
                }
            })
            .catch((err) => {
                console.error('✗ ERRO ao carregar fotos:', err.message, err);
            });

        function render() {
            console.log('render() chamada. Total de fotos:', photos.length, 'Foto atual:', current);
            
            if (photos.length === 0) {
                console.warn('⚠ Nenhuma foto disponível');
                photoDisplay.src = 'https://via.placeholder.com/400x500?text=Suas+Fotos+Aqui';
                thumbnails.innerHTML = '';
                return;
            }

            let srcUrl = photos[current];
            console.log('Foto atual (bruta):', srcUrl);
            
            if (!/^data:|^https?:|^\/|^\.\//.test(srcUrl)) srcUrl = './' + srcUrl;
            console.log('Foto atual (processada):', srcUrl);
            
            photoDisplay.src = encodeURI(srcUrl);
            console.log('Imagem definida em photoDisplay');

            thumbnails.innerHTML = '';
            photos.forEach((src, i) => {
                const t = document.createElement('div');
                t.className = 'thumb' + (i === current ? ' active' : '');
                const img = document.createElement('img');
                let thumbUrl = src;
                if (!/^data:|^https?:|^\/|^\.\//.test(thumbUrl)) thumbUrl = './' + thumbUrl;
                img.src = encodeURI(thumbUrl);
                img.alt = `Foto ${i+1}`;
                t.appendChild(img);
                t.addEventListener('click', () => {
                    current = i;
                    render();
                    if (photos.length > 1) startAutoplay();
                });
                thumbnails.appendChild(t);
            });
            
            console.log('✓ render() concluída. Thumbnails criadas:', photos.length);
        }

        function next() {
            if (photos.length === 0) return;
            current = (current + 1) % photos.length;
            render();
        }

        function prev() {
            if (photos.length === 0) return;
            current = (current - 1 + photos.length) % photos.length;
            render();
        }

        function startAutoplay() {
            if (intervalId) return;
            intervalId = setInterval(next, 3500);
            autoplay = true;
            autoplayToggle.textContent = '⏸';
        }

        function stopAutoplay() {
            clearInterval(intervalId);
            intervalId = null;
            autoplay = false;
            autoplayToggle.textContent = '▶︎';
        }

        // File input
        photoInput.addEventListener('change', function(event) {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;

            const readers = files.map(file => {
                return new Promise((resolve) => {
                    const r = new FileReader();
                    r.onload = (e) => resolve(e.target.result);
                    r.readAsDataURL(file);
                });
            });

            Promise.all(readers).then(results => {
                photos = results.concat(photos);
                current = 0;
                render();
                if (photos.length > 1) startAutoplay();
            });
        });

        // Botão para adicionar fotos
        addPhotoBtn.addEventListener('click', () => photoInput.click());

        // Navegação
        prevBtn.addEventListener('click', () => { prev(); if (photos.length > 1) startAutoplay(); });
        nextBtn_photos.addEventListener('click', () => { next(); if (photos.length > 1) startAutoplay(); });

        // Autoplay toggle
        autoplayToggle.addEventListener('click', () => {
            if (autoplay) stopAutoplay(); else startAutoplay();
        });

        // Drag and drop
        const frame = document.querySelector('.photo-frame');
        frame.addEventListener('dragover', (e) => { e.preventDefault(); frame.style.transform = 'scale(1.02)'; });
        frame.addEventListener('dragleave', (e) => { e.preventDefault(); frame.style.transform = 'scale(1)'; });
        frame.addEventListener('drop', (e) => {
            e.preventDefault();
            frame.style.transform = 'scale(1)';
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            if (files.length === 0) return;

            const readers = files.map(file => new Promise(resolve => {
                const r = new FileReader();
                r.onload = (ev) => resolve(ev.target.result);
                r.readAsDataURL(file);
            }));

            Promise.all(readers).then(results => {
                photos = results.concat(photos);
                current = 0;
                render();
                if (photos.length > 1) startAutoplay();
            });
        });

        frame.addEventListener('click', () => photoInput.click());

        render();
    }
});
