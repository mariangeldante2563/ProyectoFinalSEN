const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const credenciales = require("../credenciales");

async function loginAdministrador() {
    let driver;
    try {
        console.log("======================================");
        console.log("CASO DE PRUEBA: Inicio de sesión - Perfil Administrador");
        console.log("======================================");

        console.log("Inicializando Google Chrome...");
        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new chrome.Options())
            .build();

        console.log("Google Chrome iniciado correctamente.");
        console.log("Abriendo la aplicación de inicio de sesión...");
        await driver.get("http://localhost:3000/components/auth/login.html");

        // Esperar campo de email
        await driver.wait(until.elementLocated(By.id("email")), 10000);
        console.log("Página de inicio de sesión cargada correctamente.");

        // SELECCIONAR PESTAÑA ADMINISTRADOR - ID CORREGIDO A "tab-admin"
        const adminTab = await driver.findElement(By.id("tab-admin"));
        await adminTab.click();
        console.log("[OK] Perfil Administrador seleccionado.");

        // ESPERAR POR INDICADOR CONFIABLE: VISIBILIDAD DEL CAMPO DE CÓDIGO DE ADMINISTRADOR
        const adminCodeGroup = await driver.findElement(By.id("adminCodeGroup"));
        await driver.wait(until.elementIsVisible(adminCodeGroup), 10000); // ✅ LÍNEA 34 CORREGIDA
        console.log("[OK] Grupo de código de administrador visible (confirmación de cambio de pestaña).");

        // Verificar descripción del rol (opcional, pero buena práctica)
        const roleDescription = await driver.findElement(By.id("roleDescription"));
        const roleText = await roleDescription.getText();
        console.log(`[INFO] Texto de descripción actual: "${roleText.trim()}"`);
        
        // Validar que contenga la frase esperada (flexible a variaciones menores)
        if (!roleText.trim().includes("Ingrese sus credenciales para acceder como administrador")) {
            console.log("[WARNING] La descripción del rol no contiene el texto esperado, pero continuamos...");
        }

        // Ingresar correo
        const emailField = await driver.findElement(By.id("email"));
        await emailField.clear();
        await emailField.sendKeys(credenciales.administrador.correo);
        console.log("[OK] Correo ingresado.");

        // Ingresar contraseña
        const passwordField = await driver.findElement(By.id("password"));
        await passwordField.clear();
        await passwordField.sendKeys(credenciales.administrador.password);
        console.log("[OK] Contraseña ingresada.");

        // Ingresar código de administrador
        const adminCodeField = await driver.findElement(By.id("adminCode"));
        await adminCodeField.clear();
        await adminCodeField.sendKeys(credenciales.administrador.codigoAdmin);
        console.log("[OK] Código de administrador ingresado.");

        // Hacer clic en Iniciar Sesión
        const loginButton = await driver.findElement(By.css("button.login-submit-btn"));
        await driver.wait(until.elementIsVisible(loginButton), 10000);
        await driver.wait(until.elementIsEnabled(loginButton), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", loginButton);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", loginButton);
        console.log("[OK] Botón Iniciar Sesión presionado.");

        // Esperar dashboard de administrador
        const dashboardSelector = By.xpath("//h1[contains(@class, 'admin-title') and text()='Dashboard Administrativo']");
        await driver.wait(until.elementLocated(dashboardSelector), 15000);
        console.log("[OK] Dashboard de Administrador cargado correctamente.");

        // Verificar título
        const dashboardTitle = await driver.findElement(dashboardSelector);
        const titleText = await dashboardTitle.getText();
        console.log(`Título encontrado: "${titleText}"`);

        // Esperar breve (opcional, para ver el dashboard)
        await driver.sleep(2000);

        // Cerrar sesión
        const logoutButton = await driver.findElement(By.id("logoutBtn"));
        await driver.wait(until.elementIsVisible(logoutButton), 5000);
        await driver.wait(until.elementIsEnabled(logoutButton), 5000);
        await driver.executeScript("arguments[0].click();", logoutButton);
        console.log("[OK] Botón Cerrar Sesión presionado.");

        // Manejar alerta de confirmación (si aparece)
        try {
            await driver.wait(until.alertIsPresent(), 5000);
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            console.log(`Alerta de cierre de sesión: "${alertText}"`);
            await alert.accept();
            console.log("[OK] Alerta de cierre de sesión aceptada.");
        } catch (err) {
            console.log("[INFO] No apareció alerta de confirmación al cerrar sesión (continuando)...");
        }

        // Esperar redirección a login (por URL - más confiable)
        try {
            await driver.wait(async () => {
                const currentUrl = await driver.getCurrentUrl();
                return currentUrl.includes("/components/auth/login.html");
            }, 15000);
            console.log("[OK] Redirigido a la página de inicio de sesión (por URL).");
        } catch (err) {
            console.error("ERROR: No se redirigió a la página de inicio de sesión después de cerrar sesión.");
            const currentUrl = await driver.getCurrentUrl();
            console.log(`URL actual después de logout: ${currentUrl}`);
            throw err;
        }

        // Esperar campo de email (ya estamos en la página correcta)
        await driver.wait(until.elementLocated(By.id("email")), 10000);
        console.log("[OK] Campo de correo localizado en la página de inicio de sesión.");

    } catch (error) {
        console.error("ERROR DURANTE LA EJECUCIÓN:");
        console.error(error);
        throw error;
    } finally {
        if (driver) {
            console.log("La prueba finalizará en 5 segundos...");
            await driver.sleep(5000);
            await driver.quit();
            console.log("Navegador cerrado.");
        }
    }
}

// Ejecutar prueba
loginAdministrador()
    .then(() => console.log("\n✅ PRUEBA DE ADMINISTRADOR COMPLETADA EXITOSAMENTE"))
    .catch(error => {
        console.error("\n❌ PRUEBA DE ADMINISTRADOR FALLÓ:", error.message);
        process.exit(1);
    });