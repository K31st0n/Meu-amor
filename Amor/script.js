document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById('photoInput');
    const photoDisplay = document.getElementById('photoDisplay');
    const thumbnails = document.getElementById('thumbnails');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    const autoplayToggle = document.getElementById('autoplayToggle');

    let photos = []; // array de dataURLs
    let current = 0;
    let autoplay = false;
    let intervalId = null;

    // Tenta carregar um manifest `photos.json` com caminhos relativos (ex: ["photos/img1.jpg","photos/img2.png"]) 
    // se existir no mesmo diretório do `index.html`. Isso permite usar fotos que você já colocou na pasta `photos/`.
    fetch('photos.json')
        .then(resp => {
            if (!resp.ok) throw new Error('no manifest');
            return resp.json();
        })
        .then(list => {
            if (Array.isArray(list) && list.length > 0) {
                // adiciona ao início da lista atual
                photos = list.concat(photos);
                current = 0;
                render();
                if (photos.length > 1) startAutoplay();
            }
        })
        .catch(() => {
            // não há manifest ou erro ao carregar — continua silenciosamente
            console.log('Nenhum photos.json encontrado ou falha ao carregar manifest.');
        });

    function render() {
        if (photos.length === 0) {
            photoDisplay.src = 'https://via.placeholder.com/400x500?text=Suas+Fotos+Aqui';
            thumbnails.innerHTML = '';
            return;
        }

        // Normaliza o caminho: se não for data: / http / absoluto, prefixa com './' para resolver na mesma pasta
        let srcUrl = photos[current];
        if (!/^data:|^https?:|^\/|^\.\//.test(srcUrl)) srcUrl = './' + srcUrl;
        photoDisplay.src = encodeURI(srcUrl);
        // thumbnails
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

    function resetAutoplay() {
        if (autoplay) {
            stopAutoplay();
            startAutoplay();
        }
    }

    // File input change: aceita múltiplos arquivos
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
            photos = results.concat(photos); // adiciona novas no começo
            current = 0;
            render();
            if (photos.length > 1) startAutoplay();
        });
    });

    // Navegação
    nextBtn.addEventListener('click', () => { next(); if (photos.length > 1) startAutoplay(); });
    prevBtn.addEventListener('click', () => { prev(); if (photos.length > 1) startAutoplay(); });

    // Toggle autoplay
    autoplayToggle.addEventListener('click', () => {
        if (autoplay) stopAutoplay(); else startAutoplay();
    });

    // Drag and drop na photo-frame
    const frame = document.querySelector('.photo-frame');
    frame.addEventListener('dragover', (e) => { e.preventDefault(); frame.style.transform = 'scale(1.02)'; });
    frame.addEventListener('dragleave', (e) => { e.preventDefault(); frame.style.transform = 'scale(1)'; });
    frame.addEventListener('drop', (e) => {
        e.preventDefault();
        frame.style.transform = 'scale(1)';
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;

        const readers = files.map(file => new Promise(resolve => {
            const r = new FileReader(); r.onload = (ev) => resolve(ev.target.result); r.readAsDataURL(file);
        }));
        Promise.all(readers).then(results => {
            photos = results.concat(photos);
            current = 0;
            render();
            if (photos.length > 1) startAutoplay();
        });
    });

    // clique na moldura abre o input
    frame.addEventListener('click', () => photoInput.click());

    // Inicializa
    render();
});
