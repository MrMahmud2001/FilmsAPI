const API_BASE = '/api/films';

let currentPage    = 1;
let currentTotal   = 0;
let currentFilters = {};
let isLoading      = false;
const PAGE_SIZE    = 8;

document.addEventListener('DOMContentLoaded', function () {
    initSearch();
    initFilters();
    initFilmPopup();
    loadFilms({ page: 1, pageSize: PAGE_SIZE, sortBy: 'rating_desc' }, false);

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
        loadMoreBtn.addEventListener('click', function () {
            if (isLoading) return;
            currentPage++;
            loadFilms({ ...currentFilters, page: currentPage, pageSize: PAGE_SIZE }, true);
        });
    }
});

// ─────────────────────────────────────────────
// ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ
// ─────────────────────────────────────────────
function loadFilms(params, append) {
    isLoading = true;

    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, v);
    });

    const container   = document.querySelector('.films_content');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!append && container) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Загрузка...</p>';
    }
    if (loadMoreBtn) {
        loadMoreBtn.disabled    = true;
        loadMoreBtn.textContent = 'Загрузка...';
    }

    fetch(`${API_BASE}?${query.toString()}`)
        .then(r => r.json())
        .then(data => {
            currentTotal   = data.total;
            currentFilters = { ...params };
            delete currentFilters.page;
            delete currentFilters.pageSize;

            if (!append) {
                renderFilms(data.films, false);
            } else {
                appendFilms(data.films);
            }

            updateLoadMoreBtn(data.total, params.page, params.pageSize);
            isLoading = false;
        })
        .catch(() => {
            if (container && !append) {
                container.innerHTML = '<p style="text-align:center;padding:40px;color:#f44336;">Ошибка загрузки. Проверьте соединение с сервером.</p>';
            }
            if (loadMoreBtn) {
                loadMoreBtn.disabled    = false;
                loadMoreBtn.textContent = 'Загрузить ещё';
            }
            isLoading = false;
        });
}

function renderFilms(films, append) {
    const container = document.querySelector('.films_content');
    if (!container) return;

    const endMsg = document.getElementById('endMessage');
    if (endMsg) endMsg.remove();

    if (!films || films.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Фильмы не найдены. Попробуйте изменить фильтры.</p>';
        return;
    }

    container.innerHTML = films.map(f => buildCard(f)).join('');
    initFavorites();
    initFilmPopup();
}

function appendFilms(films) {
    const container = document.querySelector('.films_content');
    if (!container || !films || films.length === 0) return;

    films.forEach(f => {
        const card = document.createElement('div');
        card.className = 'films_card';
        card.innerHTML = buildCardInner(f);
        container.appendChild(card);
    });

    initFavorites();
    initFilmPopup();
}

function buildCard(f) {
    return `<div class="films_card">${buildCardInner(f)}</div>`;
}

function buildCardInner(f) {
    return `
        <img src="${f.posterPath || 'img/placeholder.jpg'}"
             class="films_poster"
             alt="Постер фильма"
             data-film-id="${f.filmID}"
             data-film-title="${f.title}"
             data-rating="${f.rating}"
             data-duration="${f.durationMinutes} мин"
             data-genre="${f.genreName}">
        <p class="films_title">${f.title}</p>
        <button class="favorite-btn"
                data-film-id="${f.filmID}"
                data-film-title="${f.title}">♥ В избранное</button>
        <a href="${f.pageURL || '#'}" target="_blank" class="films_button">Перейти</a>
    `;
}

function updateLoadMoreBtn(total, page, pageSize) {
    const btn    = document.getElementById('loadMoreBtn');
    const loaded = page * pageSize;

    if (!btn) return;

    if (loaded < total) {
        btn.style.display = 'block';
        btn.disabled      = false;
        btn.textContent   = 'Загрузить ещё';
        const endMsg = document.getElementById('endMessage');
        if (endMsg) endMsg.remove();
    } else {
        btn.style.display = 'none';
        if (total > 0) showEndMessage();
    }
}

function showEndMessage() {
    if (document.getElementById('endMessage')) return;
    const msg = document.createElement('div');
    msg.id            = 'endMessage';
    msg.style.cssText = 'text-align:center;padding:20px;color:#666;font-size:14px;';
    msg.textContent   = '✓ Все фильмы загружены';
    const btn = document.getElementById('loadMoreBtn');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(msg, btn);
}

// ─────────────────────────────────────────────
// ИЗБРАННОЕ
// ─────────────────────────────────────────────
function initFavorites() {
    document.querySelectorAll('.favorite-btn').forEach(button => {
        if (button._favInit) return;
        button._favInit = true;
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const filmId    = this.getAttribute('data-film-id');
            const filmTitle = this.getAttribute('data-film-title');
            const btn       = this;

            fetch(`${API_BASE}/favorites`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ filmId, filmTitle })
            })
            .then(r => r.json())
            .then(data => { if (data.success) { markFavorite(btn); showNotification('Фильм добавлен в избранное!'); } })
            .catch(() => { markFavorite(btn); showNotification('Фильм добавлен в избранное!'); });
        });
    });
}

function markFavorite(btn) {
    btn.classList.add('active');
    btn.textContent          = '✓ В избранном';
    btn.style.backgroundColor = '#4caf50';
}

// ─────────────────────────────────────────────
// ПОИСК + АВТОДОПОЛНЕНИЕ
// ─────────────────────────────────────────────
function initSearch() {
    const searchInput = document.querySelector('.search_input');
    const searchForm  = document.querySelector('.search_form');
    if (!searchInput || !searchForm) return;

    searchForm.style.position = 'relative';

    const dropdown = document.createElement('div');
    dropdown.className    = 'search-dropdown';
    dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:white;border:1px solid #ccc;border-radius:6px;max-height:300px;overflow-y:auto;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;';
    searchForm.appendChild(dropdown);

    let searchTimeout;

    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        if (query.length < 1) { dropdown.style.display = 'none'; return; }
        searchTimeout = setTimeout(() => {
            fetch(`${API_BASE}/suggest?q=${encodeURIComponent(query)}`)
                .then(r => r.json())
                .then(data => displaySuggestions(data.suggestions || []))
                .catch(() => displaySuggestions(getLocalSuggestions(query)));
        }, 300);
    });

    function displaySuggestions(suggestions) {
        if (!suggestions.length) { dropdown.style.display = 'none'; return; }
        dropdown.innerHTML = suggestions.map(item => {
            const title = typeof item === 'string' ? item : item.title;
            const id    = typeof item === 'object'  ? item.id : '';
            return `<div class="search-suggestion" data-film-id="${id}" data-film-title="${title}" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #eee;">${title}</div>`;
        }).join('');
        dropdown.style.display = 'block';
        dropdown.querySelectorAll('.search-suggestion').forEach(item => {
            item.addEventListener('mouseenter', function () { this.style.backgroundColor = '#f5f5f5'; });
            item.addEventListener('mouseleave', function () { this.style.backgroundColor = ''; });
            item.addEventListener('click', function () {
                searchInput.value      = this.getAttribute('data-film-title');
                dropdown.style.display = 'none';
                currentPage = 1;
                loadFilms({ search: searchInput.value, page: 1, pageSize: PAGE_SIZE }, false);
            });
        });
    }

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        dropdown.style.display = 'none';
        const query = searchInput.value.trim();
        if (query) { currentPage = 1; loadFilms({ search: query, page: 1, pageSize: PAGE_SIZE }, false); }
    });

    document.addEventListener('click', function (e) {
        if (!searchForm.contains(e.target)) dropdown.style.display = 'none';
    });
}

function getLocalSuggestions(query) {
    const results = [];
    document.querySelectorAll('.films_title').forEach(el => {
        if (el.textContent.toLowerCase().includes(query.toLowerCase()))
            results.push({ id: '', title: el.textContent.trim() });
    });
    return results;
}

// ─────────────────────────────────────────────
// ФИЛЬТРЫ
// ─────────────────────────────────────────────
function initFilters() {
    const slider = document.getElementById('ratingSlider');
    const output = document.getElementById('ratingValue');

    if (slider) {
        slider.addEventListener('input', function () {
            output.textContent = parseFloat(this.value).toFixed(1) + '+';
        });
    }

    document.querySelectorAll('.genre-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.genre-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            currentPage = 1;
            loadFilms({ ...collectFilters(), page: 1, pageSize: PAGE_SIZE }, false);
        });
    }

    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            document.querySelectorAll('.genre-link').forEach(l => l.classList.remove('active'));
            ['yearFrom', 'yearTo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            if (slider) { slider.value = 0; output.textContent = '0.0+'; }
            ['countryFilter', 'durationFilter'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            const sortFilter = document.getElementById('sortFilter');
            if (sortFilter) sortFilter.value = 'rating_desc';
            currentPage = 1;
            loadFilms({ page: 1, pageSize: PAGE_SIZE, sortBy: 'rating_desc' }, false);
        });
    }
}

function collectFilters() {
    const params = {};
    const activeGenre = document.querySelector('.genre-link.active');
    if (activeGenre) params.genre = activeGenre.textContent.trim();
    const yearFrom = document.getElementById('yearFrom');
    const yearTo   = document.getElementById('yearTo');
    if (yearFrom && yearFrom.value) params.yearFrom = yearFrom.value;
    if (yearTo   && yearTo.value)   params.yearTo   = yearTo.value;
    const slider = document.getElementById('ratingSlider');
    if (slider && parseFloat(slider.value) > 0) params.minRating = parseFloat(slider.value).toFixed(1);
    const countryFilter  = document.getElementById('countryFilter');
    const durationFilter = document.getElementById('durationFilter');
    const sortFilter     = document.getElementById('sortFilter');
    if (countryFilter  && countryFilter.value)  params.countryCode  = countryFilter.value;
    if (durationFilter && durationFilter.value) params.durationCat  = durationFilter.value;
    if (sortFilter     && sortFilter.value)     params.sortBy       = sortFilter.value;
    return params;
}

// ─────────────────────────────────────────────
// ТУЛТИП НА ПОСТЕРЕ
// ─────────────────────────────────────────────
function initFilmPopup() {
    document.querySelectorAll('.films_poster').forEach(poster => {
        if (poster._tooltipInit) return;
        poster._tooltipInit = true;

        poster.addEventListener('mouseenter', function () {
            removeTooltip();
            const tooltip         = document.createElement('div');
            tooltip.className     = 'film-tooltip-active';
            tooltip.style.cssText = 'position:absolute;background:rgba(0,0,0,0.9);color:white;padding:15px;border-radius:8px;font-size:14px;z-index:10000;min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;font-family:Arial,sans-serif;';
            tooltip.innerHTML = `
                <div style="margin-bottom:8px;"><strong>Рейтинг:</strong> <span style="color:#4caf50;">${this.getAttribute('data-rating') || 'N/A'}</span></div>
                <div style="margin-bottom:8px;"><strong>Длительность:</strong> ${this.getAttribute('data-duration') || 'N/A'}</div>
                <div><strong>Жанр:</strong> ${this.getAttribute('data-genre') || 'N/A'}</div>
            `;
            document.body.appendChild(tooltip);
            this._tooltip = tooltip;
            positionTooltip(tooltip, this);
        });
        poster.addEventListener('mousemove', function (e) { if (this._tooltip) positionTooltip(this._tooltip, this, e); });
        poster.addEventListener('mouseleave', function () { removeTooltip(); this._tooltip = null; });
    });
}

function removeTooltip() {
    document.querySelectorAll('.film-tooltip-active').forEach(t => t.remove());
}

function positionTooltip(tooltip, poster, event) {
    const rect       = poster.getBoundingClientRect();
    const scrollTop  = window.pageYOffset;
    const scrollLeft = window.pageXOffset;
    let top, left;
    if (event) { top = event.pageY + 12; left = event.pageX + 12; }
    else       { top = rect.top + scrollTop + rect.height / 2 - 50; left = rect.left + scrollLeft + rect.width + 10; }
    if (left + 210 > window.innerWidth + scrollLeft) left = rect.left + scrollLeft - 220;
    tooltip.style.top  = `${top}px`;
    tooltip.style.left = `${left}px`;
}

// ─────────────────────────────────────────────
// УВЕДОМЛЕНИЕ
// ─────────────────────────────────────────────
function showNotification(message) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const note        = document.createElement('div');
    note.className    = 'notification';
    note.style.cssText = 'position:fixed;top:80px;right:20px;background:#4caf50;color:white;padding:15px 25px;border-radius:6px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;font-family:Arial,sans-serif;';
    note.textContent  = message;
    document.body.appendChild(note);
    setTimeout(() => { note.style.animation = 'slideOut 0.3s ease'; setTimeout(() => note.remove(), 300); }, 2000);
}

// ─────────────────────────────────────────────
// СТИЛИ
// ─────────────────────────────────────────────
if (!document.getElementById('ajax-styles')) {
    const style    = document.createElement('style');
    style.id       = 'ajax-styles';
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .genre-link.active { background-color: #4caf50 !important; color: white !important; }
        .films_card { display: flex; max-width: 300px; width: 100%; }
    `;
    document.head.appendChild(style);
}
