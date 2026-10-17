const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const credenciales = require("../credenciales");


async function loginEmpleado() {

    let driver;

    try {

        console.log("======================================");
        console.log("CASO DE PRUEBA EMPLEADO");
        console.log("Inicio de sesión - Perfil Empleado");
        console.log("======================================");

        console.log("Inicializando Google Chrome...");

        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new chrome.Options())
            .build();

        console.log("Google Chrome iniciado correctamente.");
        console.log(">>> PASO 2: Llegué antes de abrir la aplicación <<<");
        console.log("Abriendo la aplicación...");

        await driver.get("http://localhost:3000/components/auth/login.html");

        await driver.wait(
            until.elementLocated(By.id("email")),
            10000
        );

        console.log("Página de inicio de sesión cargada correctamente.");
        // Seleccionar perfil Empleado

const botonEmpleado = await driver.findElement(By.id("tab-empleado"));

await botonEmpleado.click();

console.log("[OK] Perfil Empleado seleccionado.");


// Ingresar correo

const campoCorreo = await driver.findElement(By.id("email"));

await campoCorreo.clear();

await campoCorreo.sendKeys(credenciales.empleado.correo);

console.log("[OK] Correo ingresado.");


// Ingresar contraseña

const campoPassword = await driver.findElement(By.id("password"));

await campoPassword.clear();

await campoPassword.sendKeys(credenciales.empleado.password);

console.log("[OK] Contraseña ingresada.");
console.log("========== LLEGUÉ AL PASO LOGIN ==========");
// Buscar el botón Iniciar Sesión

console.log("Buscando botón Iniciar Sesión...");

const botonLogin = await driver.wait(

    until.elementLocated(
        By.css("button.login-submit-btn")
    ),

    10000

);

console.log("Botón encontrado.");

await driver.wait(

    until.elementIsVisible(botonLogin),

    10000

);

console.log("Botón visible.");

await driver.wait(

    until.elementIsEnabled(botonLogin),

    10000

);

console.log("Botón habilitado.");

// Llevar el botón al área visible

await driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    botonLogin
);

// Esperar un momento para que termine el desplazamiento

await driver.sleep(500);

// Hacer clic

await driver.executeScript(
    "arguments[0].click();",
    botonLogin
);

console.log("[OK] Botón Iniciar Sesión presionado.");







console.log("[OK] Botón Iniciar Sesión presionado.");

// Esperar que aparezca el Dashboard

await driver.wait(

    until.elementLocated(

        By.xpath("//h2[text()='Dashboard de Empleado']")

    ),

    10000

);

console.log("[OK] Dashboard cargado correctamente.");

const tituloDashboard = await driver.findElement(

    By.xpath("//h2[text()='Dashboard de Empleado']")

);

const texto = await tituloDashboard.getText();

console.log("Título encontrado:", texto);




    } catch (error) {

        console.error("ERROR DURANTE LA EJECUCIÓN");
        console.error(error);

    } finally {

        if (driver) {

            console.log("La prueba finalizará en 5 segundos...");

            await driver.sleep(5000);

            await driver.quit();

            console.log("Navegador cerrado.");

        }

    }

}

loginEmpleado();