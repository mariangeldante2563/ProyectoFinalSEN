const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const credenciales = require("../credenciales");

async function loginRole(role) {
    let driver;
    try {
        console.log("======================================");
        console.log(`CASO DE PRUEBA: Inicio de sesión - Perfil ${role.charAt(0).toUpperCase() + role.slice(1)}`);
        console.log("======================================");

        console.log("Inicializando Google Chrome...");
        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new chrome.Options())
            .build();

        console.log("Google Chrome iniciado correctamente.");
        console.log("Abriendo la aplicación de inicio de sesión...");
        await driver.get("http://localhost:3000/components/auth/login.html");

        // Wait for email field to be present
        await driver.wait(until.elementLocated(By.id("email")), 10000);
        console.log("Página de inicio de sesión cargada correctamente.");

        // Select the role tab (employee or administrator)
        const roleTab = await driver.findElement(By.id(`tab-${role}`));
        await roleTab.click();
        console.log(`[OK] Perfil ${role} seleccionado.`);

        // Wait for role description to update (avoids empty text warning)
        let roleDescriptionText;
        if (role === "empleado") {
            roleDescriptionText = "Ingrese sus credenciales para acceder como empleado.";
        } else {
            roleDescriptionText = "Ingrese sus credenciales para acceder como administrador.";
        }
        const roleDescription = await driver.findElement(By.id("roleDescription"));
        await driver.wait(async () => {
            const text = await roleDescription.getText();
            return text.trim() !== "" && text.includes(roleDescriptionText);
        }, 5000);
        const actualText = await roleDescription.getText();
        console.log(`[OK] Descripción del rol correcta: "${actualText}"`);

        // Enter email
        const emailField = await driver.findElement(By.id("email"));
        await emailField.clear();
        await emailField.sendKeys(credenciales[role].correo);
        console.log("[OK] Correo ingresado.");

        // Enter password
        const passwordField = await driver.findElement(By.id("password"));
        await passwordField.clear();
        await passwordField.sendKeys(credenciales[role].password);
        console.log("[OK] Contraseña ingresada.");

        // If administrator, enter admin code
        if (role === "administrador") {
            // Wait for admin code field to be visible (appears when admin tab is selected)
            const adminCodeGroup = await driver.findElement(By.id("adminCodeGroup"));
            await driver.wait(until.elementIsVisible(adminCodeGroup), 5000);
            const adminCodeField = await driver.findElement(By.id("adminCode"));
            await adminCodeField.clear();
            await adminCodeField.sendKeys(credenciales[role].codigoAdmin);
            console.log("[OK] Código de administrador ingresado.");
        }

        // Click login button
        const loginButton = await driver.findElement(By.css("button.login-submit-btn"));
        await driver.wait(until.elementIsVisible(loginButton), 10000);
        await driver.wait(until.elementIsEnabled(loginButton), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", loginButton);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", loginButton);
        console.log("[OK] Botón Iniciar Sesión presionado.");

        // Wait for dashboard to load based on role
        let dashboardSelector;
        if (role === "empleado") {
            dashboardSelector = By.xpath("//h2[text()='Dashboard de Empleado']");
        } else {
            dashboardSelector = By.xpath("//h1[contains(@class, 'admin-title') and text()='Dashboard Administrativo']");
        }
        await driver.wait(until.elementLocated(dashboardSelector), 15000);
        console.log(`[OK] Dashboard de ${role} cargado correctamente.`);

        // Verify dashboard title
        const dashboardTitle = await driver.findElement(dashboardSelector);
        const titleText = await dashboardTitle.getText();
        console.log(`Título encontrado: "${titleText}"`);

        // Optional: Wait a bit to see the dashboard (for visual confirmation)
        await driver.sleep(2000);

        // ======================
        // LOGOUT SECTION (IMPROVED)
        // ======================
        // Logout
        const logoutButton = await driver.findElement(By.id("logoutBtn"));
        await driver.wait(until.elementIsVisible(logoutButton), 5000);
        await driver.wait(until.elementIsEnabled(logoutButton), 5000);
        await driver.executeScript("arguments[0].click();", logoutButton);
        console.log("[OK] Botón Cerrar Sesión presionado.");

        // Handle confirmation alert if present
        try {
            // Wait for alert to appear (up to 5 seconds)
            await driver.wait(until.alertIsPresent(), 5000);
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            console.log(`Alerta de cierre de sesión: "${alertText}"`);
            await alert.accept(); // Click "Aceptar"/"OK"
            console.log("[OK] Alerta de cierre de sesión aceptada.");
        } catch (err) {
            console.log("[INFO] No apareció alerta de confirmación al cerrar sesión (continuando)...");
        }

        // Wait for redirect to login page (by URL - more reliable than waiting for element)
        try {
            await driver.wait(async () => {
                const currentUrl = await driver.getCurrentUrl();
                return currentUrl.includes("/components/auth/login.html");
            }, 15000); // Wait up to 15 seconds for URL to change to login page
            console.log("[OK] Redirigido a la página de inicio de sesión (por URL).");
        } catch (err) {
            console.error("ERROR: No se redirigió a la página de inicio de sesión después de cerrar sesión.");
            // Let's see what URL we're actually on for debugging
            const currentUrl = await driver.getCurrentUrl();
            console.log(`URL actual después de logout: ${currentUrl}`);
            throw err; // Re-throw to be caught by outer try/catch
        }

        // Now wait for email field to be present (should be quick since we're on the right page)
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

// Main execution: test both roles
(async () => {
    try {
        await loginRole("empleado");
        await loginRole("administrador");
        console.log("\n✅ AMBAS PRUEBAS COMPLETADAS EXITOSAMENTE");
    } catch (error) {
        console.error("\n❌ ALGUNA PRUEBA FALLÓ:", error.message);
        process.exit(1);
    }
})();