@echo off
cd /d "C:\Users\User\Documents\SENA\inoutmanager\backend"
node server.js
pause


//* # Iniciar ambos servicios

npm run start:both

# Solo backend
npm run start:backend

# Solo frontend  
npm run start:frontend

# Limpiar puertos
npm run clean:ports

# Versión anterior del backend
npm run start:backend-legacy

*/