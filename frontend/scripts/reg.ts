import '../styles/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './api';

type RegisterField = 'name' | 'lastName' | 'email' | 'password' | 'passwordRepeat';

function initRegister(): void {
  if (window.__registerInitialized) {
    return;
  }
  window.__registerInitialized = true;

  const registerForm = document.querySelector('form');
  const inputs: Record<RegisterField, HTMLInputElement | null> = {
    name: document.querySelector('#name'),
    lastName: document.querySelector('#last-name'),
    email: document.querySelector('#email'),
    password: document.querySelector('#password'),
    passwordRepeat: document.querySelector('#password2'),
  };

  if (!registerForm) {
    return;
  }

  const validators: Record<RegisterField, (value: string) => string> = {
    lastName: (value) => {
      if (!value?.trim()) return 'Фамилия обязательна';
      if (!/^[А-ЯЁ][а-яё\s]+$/.test(value.trim())) {
        return 'Фамилия должна начинаться с заглавной буквы';
      }
      return '';
    },
    name: (value) => {
      if (!value?.trim()) return 'Имя обязательно';
      if (!/^[А-ЯЁ][а-яё\s]+$/.test(value.trim())) {
        return 'Имя должно начинаться с заглавной буквы';
      }
      return '';
    },
    email: (value) => {
      if (!value?.trim()) return 'Email обязателен';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return 'Введите корректный email';
      }
      return '';
    },
    password: (value) => {
      if (!value) return 'Пароль обязателен';
      if (value.length < 8) return 'Пароль должен быть не менее 8 символов';
      if (!/[A-ZА-ЯЁ]/.test(value)) return 'Пароль должен содержать заглавную букву';
      if (!/[0-9]/.test(value)) return 'Пароль должен содержать цифру';
      return '';
    },
    passwordRepeat: (value) => {
      if (!value) return 'Подтвердите пароль';
      if (value !== inputs.password?.value) return 'Пароли не совпадают';
      return '';
    },
  };

  function showError(input: HTMLInputElement | null, message: string): void {
    if (!input) return;
    input.classList.add('is-invalid');
    const formControl = input.closest('.form-floating');
    if (!formControl) return;

    let errorSpan = formControl.querySelector('.invalid-feedback');
    if (!errorSpan) {
      errorSpan = document.createElement('div');
      errorSpan.className = 'invalid-feedback d-block';
      formControl.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
  }

  function clearError(input: HTMLInputElement | null): void {
    if (!input) return;
    input.classList.remove('is-invalid');
    const formControl = input.closest('.form-floating');
    if (!formControl) return;
    const errorSpan = formControl.querySelector('.invalid-feedback');
    if (errorSpan) errorSpan.textContent = '';
  }

  function clearAllErrors(): void {
    Object.values(inputs).forEach((input) => clearError(input));
  }

  (Object.keys(inputs) as RegisterField[]).forEach((key) => {
    const input = inputs[key];
    if (input) {
      input.addEventListener('input', () => {
        const error = validators[key](input.value);
        if (!error) clearError(input);
      });
      input.addEventListener('focus', () => clearError(input));
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearAllErrors();
    let isValid = true;

    (Object.keys(validators) as RegisterField[]).forEach((key) => {
      const input = inputs[key];
      if (input) {
        const error = validators[key](input.value);
        if (error) {
          showError(input, error);
          isValid = false;
        }
      }
    });

    if (!isValid) {
      return;
    }

    try {
      await window.api.signup(
        inputs.name!.value.trim(),
        inputs.lastName!.value.trim(),
        inputs.email!.value.trim(),
        inputs.password!.value,
        inputs.passwordRepeat!.value
      );

      window.location.assign(new URL('login.html', window.location.href).href);
    } catch (error) {
      const serverMessage =
        error instanceof Error ? error.message : 'Произошла ошибка при регистрации';

      if (
        serverMessage.includes('exists') ||
        serverMessage.includes('уже') ||
        serverMessage.includes('Email')
      ) {
        showError(inputs.email, 'Пользователь с таким email уже зарегистрирован');
      } else {
        let errorElement = document.querySelector('.error-message') as HTMLElement | null;
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'error-message alert alert-danger mt-3';
          errorElement.setAttribute('role', 'alert');
          registerForm.appendChild(errorElement);
        }
        errorElement.textContent = 'Ошибка: ' + serverMessage;
        errorElement.style.display = 'block';
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRegister);
} else {
  initRegister();
}
