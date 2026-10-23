// Requisitos: Vite en http://localhost:3000 y backend en http://localhost:5000.
// Configure TEST_USER y TEST_PASSWORD en el entorno; no hay credenciales por defecto.
// Ejecucion PowerShell: $env:TEST_USER="..."; $env:TEST_PASSWORD="..."; node tests/selenium/registroEntrada.js
// Recuperacion: Si el test falla despues de marcar entrada, la proxima ejecucion detectara
// la jornada activa y marcara salida automaticamente via preflight. Si queda incompleta,
// el preflight se detendra y pedira cierre manual.

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const API_BASE_URL = 'http://localhost:5000/api';
const LOGIN_URL = 'http://localhost:3000/components/auth/login.html';
const DASHBOARD_PATH = '/components/empleado/dashboard-empleado.html';
const WAIT_TIMEOUT_MS = 15000;

function readCredentials() {
    const user = process.env.TEST_USER;
    const password = process.env.TEST_PASSWORD;
    if (!user || !password) {
        throw new Error('Defina TEST_USER y TEST_PASSWORD antes de ejecutar registroEntrada.js.');
    }
    return { user, password };
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => null);
    if (!response.ok) {
        const reason = result?.error || result?.message || 'respuesta sin detalle';
        throw new Error(`${options.method || 'GET'} ${url} devolvio HTTP ${response.status}: ${reason}`);
    }
    return result;
}

async function preflight(user, password) {
    const login = await requestJson(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ correoElectronico: user, password })
    });
    if (!login.token || !login.user?.id) {
        throw new Error('El login de preflight no devolvio token y usuario.');
    }

    const headers = { Authorization: `Bearer ${login.token}`, Accept: 'application/json' };
    const activeResult = await requestJson(`${API_BASE_URL}/attendance/sessions/active`, { headers });
    const session = activeResult.data;

    if (session === null) return login.token;
    if (session?.estado === 'incompleta') {
        console.error('[PREFLIGHT] Jornada incompleta detectada. Cerrar manualmente antes de reintentar.');
        throw new Error('La jornada incompleta de TEST_USER requiere cierre manual.');
    }
    if (session?.estado !== 'activa') {
        throw new Error(`Estado de jornada inesperado en preflight: ${session?.estado || 'sin estado'}.`);
    }

    await requestJson(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'salida' })
    });
    console.log('[PREFLIGHT] Jornada activa cerrada.');
    return login.token;
}

async function waitForToast(driver, kind, messagePart) {
    const selector = `#toast-container .toast.toast-${kind}[role="alert"]`;
    await driver.wait(async () => {
        const toasts = await driver.findElements(By.css(selector));
        for (const toast of toasts) {
            if (await toast.isDisplayed() && (await toast.getText()).includes(messagePart)) return true;
        }
        return false;
    }, 10000, `No aparecio toast ${kind} con el mensaje esperado: ${messagePart}`);
}

async function waitForButton(driver, selector) {
    const button = await driver.wait(until.elementLocated(By.css(selector)), WAIT_TIMEOUT_MS);
    await driver.wait(until.elementIsVisible(button), WAIT_TIMEOUT_MS);
    await driver.wait(async () => button.isEnabled(), WAIT_TIMEOUT_MS);
    return button;
}

async function waitForHistory(driver) {
    await driver.wait(async () => driver.executeScript(() => {
        const history = document.querySelector('#employeeRecords');
        return Boolean(history && (
            history.querySelector('.records-table tbody') ||
            history.textContent.includes('No hay registros disponibles.')
        ));
    }), WAIT_TIMEOUT_MS, 'El historial no termino de cargar.');
}

async function runTest() {
    let driver;
    try {
        const { user, password } = readCredentials();
        const token = await preflight(user, password);

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options())
            .build();

        await driver.get(LOGIN_URL);
        const emailInput = await driver.wait(until.elementLocated(By.css('#email')), WAIT_TIMEOUT_MS);
        await driver.wait(until.elementIsVisible(emailInput), WAIT_TIMEOUT_MS);
        await emailInput.sendKeys(user);

        const passwordInput = await driver.wait(until.elementLocated(By.css('#password')), WAIT_TIMEOUT_MS);
        await driver.wait(until.elementIsVisible(passwordInput), WAIT_TIMEOUT_MS);
        await passwordInput.sendKeys(password);

        const submitButton = await driver.wait(
            until.elementLocated(By.css('#loginForm button.login-submit-btn[type="submit"]')),
            WAIT_TIMEOUT_MS
        );
        await driver.wait(until.elementIsVisible(submitButton), WAIT_TIMEOUT_MS);
        await submitButton.click();
        await driver.wait(until.urlContains(DASHBOARD_PATH), WAIT_TIMEOUT_MS);

        const history = await driver.wait(until.elementLocated(By.id('employeeRecords')), WAIT_TIMEOUT_MS);
        await waitForHistory(driver);
        const initialHistoryText = await history.getText();

        const entryButton = await waitForButton(driver, '#entryBtn');
        await entryButton.click();
        await waitForToast(driver, 'success', 'Entrada registrada');

        await driver.wait(async () => entryButton.isEnabled(), WAIT_TIMEOUT_MS);
        await entryButton.click();
        await waitForToast(driver, 'error', 'Error al registrar asistencia');

        const duplicateStatus = await driver.executeAsyncScript(done => {
            fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type: 'entrada' })
            })
                .then(response => done(response.status))
                .catch(error => done({ error: error.message }));
        });
        if (duplicateStatus !== 409) {
            throw new Error(`La entrada duplicada debia devolver HTTP 409; recibio ${JSON.stringify(duplicateStatus)}.`);
        }

        const exitButton = await waitForButton(driver, '#exitBtn');
        await exitButton.click();
        await waitForToast(driver, 'success', 'Salida registrada');

        await driver.wait(async () => {
            const currentHistoryText = await history.getText();
            return currentHistoryText !== initialHistoryText &&
                currentHistoryText.includes('Entrada') && currentHistoryText.includes('Salida');
        }, WAIT_TIMEOUT_MS, 'El historial no refleja las marcas de entrada y salida de esta ejecucion.');

        console.log('T015 completada: login, entrada, 409 duplicado, salida e historial verificados.');
    } catch (error) {
        console.error('T015 fallo:', error.message);
        if (driver) {
            try {
                console.error('Captura de pantalla (base64):', await driver.takeScreenshot());
            } catch (screenshotError) {
                console.error('No se pudo capturar la pantalla:', screenshotError.message);
            }
        }
        process.exitCode = 1;
    } finally {
        if (driver) {
            try {
                await driver.quit();
            } catch (quitError) {
                console.error('No se pudo cerrar Chrome correctamente:', quitError.message);
                process.exitCode = 1;
            }
        }
    }
}

runTest();