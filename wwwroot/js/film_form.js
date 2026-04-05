// ─────────────────────────────────────────────
// ВАЛИДАЦИЯ НА СТОРОНЕ КЛИЕНТА + ОТПРАВКА ФОРМЫ
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initFormValidation();
    initCharCounter();
    initPosterPreview();
});

// ─────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ─────────────────────────────────────────────
function showError(fieldId, message) {
    const el = document.getElementById(fieldId + 'Error');
    const input = document.getElementById(fieldId) || document.querySelector(`[id="${fieldId}"]`);
    if (el) { el.textContent = message; el.style.display = 'block'; }
    if (input) input.classList.add('input-error');
}

function clearError(fieldId) {
    const el = document.getElementById(fieldId + 'Error');
    const input = document.getElementById(fieldId) || document.querySelector(`[id="${fieldId}"]`);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
    if (input) input.classList.remove('input-error');
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

// ─────────────────────────────────────────────
// ПРАВИЛА ВАЛИДАЦИИ (клиент)
// ─────────────────────────────────────────────
const VALIDATION_RULES = {
    movieTitle: {
        validate(val) {
            if (!val.trim()) return 'Название обязательно для заполнения';
            if (val.trim().length < 2) return 'Название должно содержать не менее 2 символов';
            if (val.trim().length > 200) return 'Название не должно превышать 200 символов';
            return null;
        }
    },
    movieOriginalTitle: {
        validate(val) {
            if (val.trim().length > 200) return 'Оригинальное название не должно превышать 200 символов';
            return null;
        }
    },
    movieGenre: {
        validate(val) {
            if (!val.trim()) return 'Жанр обязателен для заполнения';
            const allowed = ['Комедия','Драма','Хоррор','Боевик','Романтика','Фантастика','Аниме','Криминал','Биография','Вестерн'];
            const entered = val.split(',').map(g => g.trim()).filter(Boolean);
            if (entered.length === 0) return 'Укажите хотя бы один жанр';
            const invalid = entered.filter(g => !allowed.includes(g));
            if (invalid.length > 0) return `Неизвестные жанры: ${invalid.join(', ')}. Доступны: ${allowed.join(', ')}`;
            return null;
        }
    },
    movieYear: {
        validate(val) {
            if (!val) return 'Год выпуска обязателен';
            const year = parseInt(val, 10);
            if (isNaN(year)) return 'Введите корректный год';
            if (year < 1900 || year > 2099) return 'Год должен быть в диапазоне 1900–2099';
            return null;
        }
    },
    movieCountry: {
        validate(val) {
            if (!val) return 'Выберите страну производства';
            return null;
        }
    },
    movieDirector: {
        validate(val) {
            if (!val.trim()) return 'Имя режиссёра обязательно';
            if (val.trim().length < 2) return 'Имя режиссёра слишком короткое';
            if (val.trim().length > 150) return 'Имя режиссёра не должно превышать 150 символов';
            if (!/^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$/.test(val.trim()))
                return 'Имя режиссёра может содержать только буквы, пробелы, дефисы и точки';
            return null;
        }
    },
    movieRating: {
        validate(val) {
            if (val === '' || val === undefined) return null; // необязательное
            const s = String(val).trim();
            if (s.includes(',')) return 'Дробная часть только через точку, например 7.5';
            const r = parseFloat(s);
            if (isNaN(r)) return 'Введите число от 0 до 10';
            if (r < 0 || r > 10) return 'Рейтинг должен быть от 0 до 10';
            return null;
        }
    },
    movieDuration: {
        validate(val) {
            if (val === '' || val === undefined) return 'Укажите длительность фильма (минуты)';
            const d = parseInt(val, 10);
            if (isNaN(d)) return 'Введите целое число минут';
            if (d <= 0) return 'Длительность должна быть больше 0';
            if (d > 900) return 'Длительность не должна превышать 900 минут';
            return null;
        }
    },
    movieDescription: {
        validate(val) {
            if (!val.trim()) return 'Описание обязательно для заполнения';
            if (val.trim().length < 20) return `Описание слишком короткое (${val.trim().length}/20 символов минимум)`;
            if (val.trim().length > 1000) return 'Описание не должно превышать 1000 символов';
            return null;
        }
    },
    moviePosterFile: {
        validate(files) {
            if (!files || files.length === 0) return 'Загрузите постер фильма';
            const file = files[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) return 'Допустимые форматы: JPG, PNG';
            const maxSize = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSize) return `Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимум 5 МБ`;
            return null;
        }
    }
};

// ─────────────────────────────────────────────
// ВАЛИДАЦИЯ ОДНОГО ПОЛЯ
// ─────────────────────────────────────────────
function validateField(fieldId) {
    const rule = VALIDATION_RULES[fieldId];
    if (!rule) return true;

    const el = document.getElementById(fieldId);
    if (!el) return true;

    const val = el.type === 'file' ? el.files : el.value;
    const error = rule.validate(val);

    if (error) {
        showError(fieldId, error);
        return false;
    } else {
        clearError(fieldId);
        return true;
    }
}

// ─────────────────────────────────────────────
// ВАЛИДАЦИЯ ВСЕЙ ФОРМЫ
// ─────────────────────────────────────────────
function validateForm() {
    const fields = [
        'movieTitle',
        'movieOriginalTitle',
        'movieGenre',
        'movieYear',
        'movieCountry',
        'movieDirector',
        'movieRating',
        'movieDuration',
        'movieDescription',
        'moviePosterFile'
    ];

    let isValid = true;
    fields.forEach(id => {
        if (!validateField(id)) isValid = false;
    });

    return isValid;
}

// ─────────────────────────────────────────────
// ИНИЦИАЛИЗАЦИЯ — навешиваем валидацию в реальном времени
// ─────────────────────────────────────────────
function initFormValidation() {
    const form = document.getElementById('addMovieForm');
    if (!form) return;

    // Валидация при потере фокуса
    Object.keys(VALIDATION_RULES).forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (!el) return;

        el.addEventListener('blur', () => validateField(fieldId));
        el.addEventListener('input', () => {
            if (el.classList.contains('input-error')) validateField(fieldId);
        });
        if (el.type === 'file') {
            el.addEventListener('change', () => validateField(fieldId));
        }
    });

    // Отправка формы
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearAllErrors();

        if (!validateForm()) {
            const firstError = form.querySelector('.input-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showFormMessage('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        await submitForm();
    });
}

// ─────────────────────────────────────────────
// РАЗБОР ОШИБОК API (наш JSON, ProblemDetails, массивы в errors)
// ─────────────────────────────────────────────
function serverMessageText(data) {
    if (!data || typeof data !== 'object') return '';
    return data.message || data.title || data.detail || '';
}

function applyServerFieldErrors(errors) {
    if (!errors || typeof errors !== 'object') return;
    const keyToField = {
        Title: 'movieTitle',
        OriginalTitle: 'movieOriginalTitle',
        Genre: 'movieGenre',
        ReleaseYear: 'movieYear',
        CountryCode: 'movieCountry',
        Director: 'movieDirector',
        Rating: 'movieRating',
        DurationMinutes: 'movieDuration',
        Description: 'movieDescription'
    };
    Object.entries(errors).forEach(([key, msg]) => {
        const field = keyToField[key] || key;
        const text = Array.isArray(msg) ? msg.filter(Boolean).join(' ') : String(msg || '');
        if (text) showError(field, text);
    });
}

// ─────────────────────────────────────────────
// ОТПРАВКА НА СЕРВЕР
// ─────────────────────────────────────────────
async function submitForm() {
    const submitBtn = document.querySelector('.movie-form-button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Публикация...';

    const formData = new FormData();
    formData.append('title',           document.getElementById('movieTitle').value.trim());
    formData.append('originalTitle',   document.getElementById('movieOriginalTitle').value.trim());
    formData.append('genre',           document.getElementById('movieGenre').value.trim());
    formData.append('releaseYear',     document.getElementById('movieYear').value);
    formData.append('countryCode',     document.getElementById('movieCountry').value);
    formData.append('director',        document.getElementById('movieDirector').value.trim());
    formData.append('rating', document.getElementById('movieRating').value || '0');
    formData.append('durationMinutes', document.getElementById('movieDuration').value.trim());
    formData.append('description', document.getElementById('movieDescription').value.trim());

    const posterFile = document.getElementById('moviePosterFile').files[0];
    if (posterFile) formData.append('poster', posterFile);

    try {
        const response = await fetch('/api/films/add', {
            method: 'POST',
            body: formData
        });

        const raw = await response.text();
        let data;
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch {
            showFormMessage(
                response.ok
                    ? 'Сервер вернул неожиданный ответ. Обновите страницу и попробуйте снова.'
                    : `Ошибка сервера (${response.status}). Запустите приложение через dotnet run и откройте сайт по адресу с порта (не как файл с диска).`,
                'error'
            );
            return;
        }

        if (response.ok && data.success) {
            showFormMessage('Фильм успешно добавлен!', 'success');
            document.getElementById('addMovieForm').reset();
            clearAllErrors();
            document.getElementById('posterPreview').style.display = 'none';
            document.getElementById('charCount').textContent = '0 / 1000';

            setTimeout(() => {
                window.location.href = 'films.html';
            }, 2000);
        } else {
            applyServerFieldErrors(data.errors);
            let banner = serverMessageText(data);
            if (!banner && data.errors && Object.keys(data.errors).length)
                banner = 'Исправьте отмеченные поля.';
            if (!banner) banner = 'Ошибка при добавлении фильма';
            showFormMessage(banner, 'error');
        }
    } catch (err) {
        showFormMessage('Нет соединения с сервером. Попробуйте позже.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Опубликовать фильм';
    }
}

// ─────────────────────────────────────────────
// СЧЁТЧИК СИМВОЛОВ В ОПИСАНИИ
// ─────────────────────────────────────────────
function initCharCounter() {
    const textarea = document.getElementById('movieDescription');
    const counter  = document.getElementById('charCount');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', function () {
        const len = this.value.length;
        counter.textContent = `${len} / 1000`;
        counter.style.color = len > 1000 ? '#f44336' : len >= 20 ? '#4caf50' : '#666';
    });
}

// ─────────────────────────────────────────────
// ПРЕДПРОСМОТР ПОСТЕРА
// ─────────────────────────────────────────────
function initPosterPreview() {
    const fileInput = document.getElementById('moviePosterFile');
    const preview   = document.getElementById('posterPreview');
    if (!fileInput || !preview) return;

    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) { preview.style.display = 'none'; return; }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src         = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

// ─────────────────────────────────────────────
// СООБЩЕНИЕ О РЕЗУЛЬТАТЕ ФОРМЫ
// ─────────────────────────────────────────────
function showFormMessage(text, type) {
    let msg = document.getElementById('formMessage');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'formMessage';
        const btn = document.querySelector('.movie-form-button');
        btn.parentNode.insertBefore(msg, btn);
    }

    msg.textContent = text;
    msg.className   = `form-message form-message--${type}`;
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (type === 'success') {
        setTimeout(() => msg.remove(), 3000);
    }
}
