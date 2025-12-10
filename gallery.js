/* gallery.js
   Utilitário para inicializar uma galeria de fotos (thumbnails, navegação,
   autoplay, upload e drag&drop). Expõe `initGallery(options)` no escopo global.
*/
(function(window, document){
    function getEl(root, sel){
        if (!sel) return null;
        if (typeof sel === 'string') return (root || document).querySelector(sel);
        return sel; // já é elemento
    }

    function isUrlLike(s){
        return /^data:|^https?:|^\/|^\.\//.test(s);
    }

    function normalize(src){
        if (!src) return src;
        return isUrlLike(src) ? src : './' + src;
    }

    function initGallery(opts){
        if (!opts) opts = {};
        const root = opts.root || document;
        const photoDisplay = getEl(root, opts.photoDisplay) || document.getElementById('photoDisplay');
        const thumbnails = getEl(root, opts.thumbnails) || document.getElementById('thumbnails');
        const photoInput = getEl(root, opts.photoInput) || document.getElementById('photoInput');
        const addPhotoBtn = getEl(root, opts.addPhotoBtn) || document.getElementById('addPhotoBtn');
        const prevBtn = getEl(root, opts.prev) || root.querySelector('.nav-btn.prev');
        const nextBtn = getEl(root, opts.next) || root.querySelector('.nav-btn.next');
        const autoplayToggle = getEl(root, opts.autoplayToggle) || document.getElementById('autoplayToggle');
        const frame = getEl(root, opts.frame) || root.querySelector('.photo-frame');
        const photosJsonUrl = opts.photosJsonUrl || 'photos.json';
        // opções de dimensão da moldura / mat (espaço entre borda e foto)
        const mat = typeof opts.mat === 'number' ? opts.mat : 20;
        const maxInnerWidth = opts.maxInnerWidth || 380; // largura máxima da foto dentro da moldura
        const maxInnerHeight = opts.maxInnerHeight || 520; // altura máxima da foto dentro da moldura

        if (!photoDisplay || !thumbnails) return null;

        let photos = [];
        let current = 0;
        let autoplay = false;
        let intervalId = null;
        const intervalMs = opts.intervalMs || 3500;

        function render(){
            if (!photoDisplay || !thumbnails) return;
            if (photos.length === 0){
                photoDisplay.src = 'https://via.placeholder.com/400x500?text=Suas+Fotos+Aqui';
                thumbnails.innerHTML = '';
                return;
            }

            let srcUrl = normalize(photos[current]);
            // define src (use onload para ajustar frame ao aspect ratio)
            if (photoDisplay) {
                photoDisplay.onload = function(){
                    try {
                        const nw = photoDisplay.naturalWidth || maxInnerWidth;
                        const nh = photoDisplay.naturalHeight || maxInnerHeight;
                        const ratio = nw / nh;
                        let w = nw;
                        let h = nh;
                        if (w > maxInnerWidth) { w = maxInnerWidth; h = w / ratio; }
                        if (h > maxInnerHeight) { h = maxInnerHeight; w = h * ratio; }
                        // aplicar dimensões internas e ajustar moldura externa
                        const outerW = Math.round(w + mat * 2);
                        const outerH = Math.round(h + mat * 2);
                        if (frame) {
                            frame.style.width = outerW + 'px';
                            frame.style.height = outerH + 'px';
                        }
                        photoDisplay.style.width = Math.round(w) + 'px';
                        photoDisplay.style.height = Math.round(h) + 'px';
                        photoDisplay.style.objectFit = 'cover';
                    } catch (e) {
                        // se algo falhar, não bloqueia a renderização
                    }
                };
                photoDisplay.src = encodeURI(srcUrl);
            }

            thumbnails.innerHTML = '';
            photos.forEach((src, i) => {
                const t = document.createElement('div');
                t.className = 'thumb' + (i === current ? ' active' : '');
                const img = document.createElement('img');
                img.src = encodeURI(normalize(src));
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

        function next(){ if (photos.length === 0) return; current = (current + 1) % photos.length; render(); }
        function prev(){ if (photos.length === 0) return; current = (current - 1 + photos.length) % photos.length; render(); }

        function startAutoplay(){ if (intervalId) return; intervalId = setInterval(next, intervalMs); autoplay = true; if (autoplayToggle) autoplayToggle.textContent = '⏸'; }
        function stopAutoplay(){ clearInterval(intervalId); intervalId = null; autoplay = false; if (autoplayToggle) autoplayToggle.textContent = '▶︎'; }

        function handleFilesList(files){
            const readers = files.map(file => new Promise(resolve => {
                const r = new FileReader(); r.onload = (e) => resolve(e.target.result); r.readAsDataURL(file);
            }));
            Promise.all(readers).then(results => {
                photos = results.concat(photos);
                current = 0;
                render();
                if (photos.length > 1) startAutoplay();
            });
        }

        // carregar manifest externo (silencioso se falhar)
        fetch(photosJsonUrl).then(r => { if (!r.ok) throw new Error('no manifest'); return r.json(); }).then(list => {
            if (Array.isArray(list) && list.length) { photos = list.concat(photos); current = 0; render(); if (photos.length > 1) startAutoplay(); }
        }).catch(()=>{});

        if (photoInput) photoInput.addEventListener('change', (e) => { const files = Array.from(e.target.files); if (!files.length) return; handleFilesList(files); });
        if (addPhotoBtn) addPhotoBtn.addEventListener('click', () => { if (photoInput) photoInput.click(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); if (photos.length > 1) startAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); if (photos.length > 1) startAutoplay(); });
        if (autoplayToggle) autoplayToggle.addEventListener('click', () => { if (autoplay) stopAutoplay(); else startAutoplay(); });

        if (frame){
            frame.addEventListener('dragover', (e) => { e.preventDefault(); frame.style.transform = 'scale(1.02)'; });
            frame.addEventListener('dragleave', (e) => { e.preventDefault(); frame.style.transform = 'scale(1)'; });
            frame.addEventListener('drop', (e) => {
                e.preventDefault(); frame.style.transform = 'scale(1)';
                const files = Array.from(e.dataTransfer.files || []).filter(f => f.type && f.type.startsWith('image/'));
                if (!files.length) return;
                handleFilesList(files);
            });
            frame.addEventListener('click', () => { if (photoInput) photoInput.click(); });
        }

        // expose control methods
        return {
            next, prev, startAutoplay, stopAutoplay, render,
            getPhotos: () => photos
        };
    }

    window.initGallery = initGallery;
})(window, document);
