document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('floatingInput');
    const passwordInput = document.getElementById('floatingPassword');
    const submitBtn = form.querySelector('button[type="submit"]');
    const checkbox = document.getElementById('checkDefault');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const MIN_PASSWORD_LENGTH = 6;

    function showError(input, message) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        
        let error = input.nextElementSibling;
        if (!error || !error.classList.contains('invalid-feedback')) {
            error = document.createElement('div');
            error.className = 'invalid-feedback';
            error.style.display = 'block';
            error.style.color = '#dc3545';
            error.style.fontSize = '0.875rem';
            error.style.marginTop = '-12px';
            error.style.marginBottom = '12px';
            input.parentNode.appendChild(error);
        }
        error.textContent = message;
    }

    function clearError(input) {
        input.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
        
        const error = input.parentNode.querySelector('.invalid-feedback');
        if (error) {
            error.remove();
        }
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

    // Валидация пароля
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
        
        clearError(passwordInput);
        return true;
    }

    function updateSubmitButtonState() {
        const isEmailValid = emailRegex.test(emailInput.value.trim());
        const isPasswordValid = passwordInput.value.length >= MIN_PASSWORD_LENGTH;
        
        submitBtn.disabled = !(isEmailValid && isPasswordValid);
        submitBtn.style.opacity = submitBtn.disabled ? '0.6' : '1';
        submitBtn.style.cursor = submitBtn.disabled ? 'not-allowed' : 'pointer';
    }

    emailInput.addEventListener('input', function() {
        if (emailInput.classList.contains('is-invalid')) {
            validateEmail();
        }
        updateSubmitButtonState();
    });

    emailInput.addEventListener('blur', validateEmail);

    passwordInput.addEventListener('input', function() {
        if (passwordInput.classList.contains('is-invalid')) {
            validatePassword();
        }
        updateSubmitButtonState();
    });

    passwordInput.addEventListener('blur', validatePassword);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';
        
        setTimeout(function() {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const remember = checkbox.checked;
            
            console.log('Форма отправлена:', { email, password, remember });
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
            
            alert('Вход выполнен успешно!');
        }, 1000);
    });

    updateSubmitButtonState();

    const style = document.createElement('style');
    style.textContent = `
        .form-control.is-invalid {
            border-color: #dc3545 !important;
            padding-right: calc(1.5em + 0.75rem);
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }
        
        .form-control.is-invalid:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
        }
        
        .form-control:disabled {
            background-color: #e9ecef;
            opacity: 1;
            cursor: not-allowed;
        }
        
        .btn-primary:disabled {
            background-color: #6c757d;
            border-color: #6c757d;
        }
    `;
    document.head.appendChild(style);
});