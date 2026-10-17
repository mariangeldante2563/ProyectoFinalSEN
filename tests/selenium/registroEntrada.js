const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function registroEntrada() {

    let driver;

    try {

        console.log("======================================");
        console.log("CASO DE PRUEBA 002");
        console.log("Registro de Entrada");
        console.log("======================================");

        console.log("Inicializando Google Chrome...");

        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new chrome.Options())
            .build();

        console.log("Google Chrome iniciado correctamente.");
        console.log(">>> ESTE ES EL NUEVO SCRIPT <<<");

        // Abrir Login
        await driver.get("http://localhost:3000/components/auth/login.html");

        console.log("Página de inicio de sesión abierta correctamente.");

        console.log("");
        console.log("======================================");
        console.log("INICIE SESIÓN MANUALMENTE");
        console.log("Ingrese como EMPLEADO.");
        console.log("Cuando llegue al Dashboard no cierre el navegador.");
        console.log("Selenium esperará 30 segundos.");
        console.log("======================================");

        // Tiempo para iniciar sesión manualmente
        await driver.sleep(30000);

        console.log("");
        console.log("Continuando con la prueba...");

        console.log("");
        console.log("========== PASO 3 ==========");
        console.log("Buscando el botón Registrar Entrada...");

        // Buscar el botón
        const botonEntrada = await driver.wait(
            until.elementLocated(By.id("entryBtn")),
            10000
        );

        console.log("[OK] Botón encontrado.");

        // Validar que sea visible
        await driver.wait(
            until.elementIsVisible(botonEntrada),
            10000
        );

        console.log("[OK] Botón visible.");

        // Validar que esté habilitado
        const habilitado = await botonEntrada.isEnabled();

        console.log("[OK] ¿Está habilitado?:", habilitado);

    } catch (error) {

        console.error("");
        console.error("ERROR DURANTE LA EJECUCIÓN");
        console.error(error);

    } finally {

        if (driver) {

            console.log("");
            console.log("La prueba finalizará en 10 segundos...");

            await driver.sleep(10000);

            await driver.quit();

            console.log("Navegador cerrado.");

        }

    }

}

registroEntrada();