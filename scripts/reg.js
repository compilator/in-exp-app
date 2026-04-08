document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('password2');
    const submitBtn = form.querySelector('button[type="submit"]');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s'-]{2,50}$/;

    const MIN_PASSWORD_LENGTH = 8;
    const MIN_NAME_LENGTH = 2;

    
    function showError(input, message) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        
        const existingError = input.parentNode.querySelector('.invalid-feedback');
        if (existingError) existingError.remove();
        
        const error = document.createElement('div');
        error.className = 'invalid-feedback';
        error.style.display = 'block';
        error.style.color = '#dc3545';
        error.style.fontSize = '0.875rem';
        error.style.marginTop = '-10px';
        error.style.marginBottom = '8px';
        error.textContent = message;
        input.parentNode.appendChild(error);
    }

    function clearError(input) {
        input.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
        
        const error = input.parentNode.querySelector('.invalid-feedback');
        if (error) error.remove();
    }

    function validateName(input, fieldName) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, `Введите ${fieldName}`);
            return false;
        }
        
        if (value.length < MIN_NAME_LENGTH) {
            showError(input, `${fieldName} должен содержать не менее ${MIN_NAME_LENGTH} символов`);
            return false;
        }
        
        if (!nameRegex.test(value)) {
            showError(input, `${fieldName} может содержать только буквы, пробелы, дефисы и апострофы`);
            return false;
        }
        
        clearError(input);
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        
        if (!value) {
            showError(emailInput, 'Введите электронную почту');
            return false;
        }
        
        if (!emailRegex.test(value)) {
            showError(emailInput, 'Введите корректный email');
            return false;
        }
        
        clearError(emailInput);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        
        if (!value) {
            showError(passwordInput, 'Введите пароль');
            return false;
        }
        
        if (value.length < MIN_PASSWORD_LENGTH) {
            showError(passwordInput, `Пароль должен содержать не менее ${MIN_PASSWORD_LENGTH} символов`);
            return false;
        }

        const hasLetter = /[a-zA-Zа-яА-ЯёЁ]/.test(value);
        const hasNumber = /\d/.test(value);
        
        if (!hasLetter || !hasNumber) {
            showError(passwordInput, 'Пароль должен содержать буквы и цифры');
            return false;
        }
        
        clearError(passwordInput);
        return true;
    }

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirm = confirmPasswordInput.value;
        
        if (!confirm) {
            showError(confirmPasswordInput, 'Подтвердите пароль');
            return false;
        }
        
        if (password !== confirm) {
            showError(confirmPasswordInput, 'Пароли не совпадают');
            return false;
        }
        
        clearError(confirmPasswordInput);
        return true;
    }

    function updateSubmitButtonState() {
        const isNameValid = nameInput.value.trim().length >= MIN_NAME_LENGTH && nameRegex.test(nameInput.value.trim());
        const isLastNameValid = lastNameInput.value.trim().length >= MIN_NAME_LENGTH && nameRegex.test(lastNameInput.value.trim());
        const isEmailValid = emailRegex.test(emailInput.value.trim());
        const isPasswordValid = passwordInput.value.length >= MIN_PASSWORD_LENGTH && 
                                /[a-zA-Zа-яА-ЯёЁ]/.test(passwordInput.value) && 
                                /\d/.test(passwordInput.value);
        const isConfirmValid = confirmPasswordInput.value === passwordInput.value && 
                               confirmPasswordInput.value.length > 0;
        
        const allValid = isNameValid && isLastNameValid && isEmailValid && isPasswordValid && isConfirmValid;
        
        submitBtn.disabled = !allValid;
        submitBtn.style.opacity = submitBtn.disabled ? '0.6' : '1';
        submitBtn.style.cursor = submitBtn.disabled ? 'not-allowed' : 'pointer';
    }

    nameInput.addEventListener('input', function() {
        if (nameInput.classList.contains('is-invalid')) validateName(nameInput, 'Имя');
        updateSubmitButtonState();
    });
    nameInput.addEventListener('blur', () => validateName(nameInput, 'Имя'));

    lastNameInput.addEventListener('input', function() {
        if (lastNameInput.classList.contains('is-invalid')) validateName(lastNameInput, 'Фамилия');
        updateSubmitButtonState();
    });
    lastNameInput.addEventListener('blur', () => validateName(lastNameInput, 'Фамилия'));

    emailInput.addEventListener('input', function() {
        if (emailInput.classList.contains('is-invalid')) validateEmail();
        updateSubmitButtonState();
    });
    emailInput.addEventListener('blur', validateEmail);

    passwordInput.addEventListener('input', function() {
        if (passwordInput.classList.contains('is-invalid')) validatePassword();
        if (confirmPasswordInput.value) validateConfirmPassword(); 
        updateSubmitButtonState();
    });
    passwordInput.addEventListener('blur', validatePassword);

    confirmPasswordInput.addEventListener('input', function() {
        if (confirmPasswordInput.classList.contains('is-invalid')) validateConfirmPassword();
        updateSubmitButtonState();
    });
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const results = [
            validateName(nameInput, 'Имя'),
            validateName(lastNameInput, 'Фамилия'),
            validateEmail(),
            validatePassword(),
            validateConfirmPassword()
        ];
        
        if (results.includes(false)) {
            const firstError = form.querySelector('.is-invalid');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Регистрация...';
        
        setTimeout(function() {
            const formData = {
                name: nameInput.value.trim(),
                lastName: lastNameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value 
            };
            
            console.log('Регистрация:', formData);

            alert('Регистрация прошла успешно! Проверьте почту для подтверждения.');
            form.reset();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Зарегистрироваться';
            
        }, 1500);
    });

    updateSubmitButtonState();
    
    const style = document.createElement('style');
    style.textContent = `
        .form-control.is-invalid {
            border-color: #dc3545 !important;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            padding-right: calc(1.5em + 0.75rem);
        }
        
        .form-control.is-invalid:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
        }
        
        .form-floating > .form-control.is-invalid ~ label {
            color: #dc3545;
        }
        
        .btn-primary:disabled {
            background-color: #6c757d;
            border-color: #6c757d;
            pointer-events: none;
        }
        
        /* Плавная анимация для полей */
        .form-control {
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
    `;
    document.head.appendChild(style);
});