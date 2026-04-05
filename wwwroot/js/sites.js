document.querySelector('.entrance_form_button').addEventListener('click', function(e) {
    e.preventDefault();
    validateForm();
});

function validateForm() {
    let isValid = true;
    const errors = [];


    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.entrance_form_input').forEach(el => {
        el.classList.remove('error-field');
    });

    const existingErrorBox = document.getElementById('formErrorBox');
    if (existingErrorBox) {
        existingErrorBox.remove();
    }

    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName) {
        showError('lastName', 'Поле обязательно для заполнения.');
        errors.push('Фамилия: обязательное поле');
        isValid = false;
    } else if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(lastName) || lastName.length < 2) {
        showError('lastName', 'Только буквы, не менее 2 символов.');
        errors.push('Фамилия: только буквы, минимум 2 символа');
        isValid = false;
    }

    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) {
        showError('firstName', 'Поле обязательно для заполнения.');
        errors.push('Имя: обязательное поле');
        isValid = false;
    } else if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(firstName) || firstName.length < 2) {
        showError('firstName', 'Только буквы, не менее 2 символов.');
        errors.push('Имя: только буквы, минимум 2 символа');
        isValid = false;
    }

    const middleName = document.getElementById('middleName').value.trim();
    if (middleName && (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(middleName) || middleName.length < 2)) {
        showError('middleName', 'Только буквы, не менее 2 символов (опционально).');
        errors.push('Отчество: только буквы, минимум 2 символа');
        isValid = false;
    }

    const email = document.getElementById('email').value.trim();
    if (!email) {
        showError('email', 'Поле обязательно для заполнения.');
        errors.push('Почта: обязательное поле');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Адрес электронной почты должен содержать символ «@». Похоже, вы его пропустили.');
        errors.push('Почта: неверный формат email');
        isValid = false;
    }

    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('username', 'Поле обязательно для заполнения.');
        errors.push('Логин: обязательное поле');
        isValid = false;
    } else if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        showError('username', 'Только латинские буквы, цифры и подчеркивание, 3-20 символов.');
        errors.push('Логин: 3-20 символов, латинские буквы, цифры, подчеркивание');
        isValid = false;
    }

    const password = document.getElementById('password').value;
    if (!password) {
        showError('password', 'Поле обязательно для заполнения.');
        errors.push('Пароль: обязательное поле');
        isValid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password)) {
        showError('password', 'Минимум 6 символов, хотя бы одна цифра и одна буква.');
        errors.push('Пароль: минимум 6 символов, одна цифра и одна буква');
        isValid = false;
    }

    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!confirmPassword) {
        showError('confirmPassword', 'Поле обязательно для заполнения.');
        errors.push('Повторный пароль: обязательное поле');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'Пароли не совпадают.');
        errors.push('Повторный пароль: не совпадает с паролем');
        isValid = false;
    }
    if (!isValid) {
        showGlobalErrors(errors);
    } else {
        alert('Регистрация прошла успешно!');
    }
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    errorElement.textContent = message;
    document.getElementById(fieldId).classList.add('error-field');
}

function showGlobalErrors(errors) {
    const errorBox = document.createElement('div');
    errorBox.id = 'formErrorBox';
    errorBox.style.backgroundColor = '#ffdddd';
    errorBox.style.padding = '15px';
    errorBox.style.marginTop = '15px';
    errorBox.style.border = '1px solid #ff9999';
    errorBox.style.borderRadius = '5px';
    errorBox.style.width = '100%';
    errorBox.style.textAlign = 'center'; 

    errorBox.innerHTML = `
        <strong>Обнаружено ${errors.length} ошиб${errors.length === 1 ? 'ка' : errors.length < 5 ? 'ки' : 'ок'}:</strong><br>
        <ol style="margin: 10px 0; padding-left: 20px; text-align: left; display: inline-block;">
            ${errors.map(err => `<li>${err}</li>`).join('')}
        </ol>
    `;

    const form = document.querySelector('.entrance');
    form.parentNode.insertBefore(errorBox, form.nextSibling);
}