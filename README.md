# 🚀 Taller: Despliegue de Aplicación Fullstack con Remix + .NET 9 + Docker + Azure + GitHub Actions

Este repositorio contiene los archivos y configuraciones utilizados durante el taller para crear y desplegar una aplicación fullstack moderna, utilizando tecnologías actuales de frontend, backend, contenedores y despliegue en la nube.

---

## 🎯 Objetivo del Taller

Aprender a crear, contenerizar y desplegar una aplicación compuesta por:

- 🧑‍💻 **Frontend**: Remix (basado en Vite)
- 🧪 **Backend**: .NET 9 Web API
- 🗃 **Base de Datos**: PostgreSQL
- ☁️ **Infraestructura**: Azure App Service
- 🤖 **CI/CD**: GitHub Actions

---

## 🧱 Estructura del Taller

### 1️⃣ Creación de las Aplicaciones

- Crear una aplicación **Remix** con Vite.
- Crear una API REST con **.NET 9** (`dotnet new webapi`).

### 2️⃣ Contenerización con Docker

- Crear un `Dockerfile` para el **frontend**.
- Crear un `Dockerfile` para el **backend**.
- Configurar `docker-compose.yml` para levantar frontend, backend y **PostgreSQL** localmente.

### 3️⃣ Infraestructura en Azure

- Crear un Resource Group, un App Service Plan, dos App Services (frontend y backend).
- Provisión de una base de datos **Azure Database for PostgreSQL Flexible Server**.
- Configuración de **reglas de firewall** para permitir acceso desde internet en desarrollo.

### 4️⃣ Variables de Entorno

- Definir variables en el App Service del **backend** para conexión a la base de datos.
- Validar cadena de conexión, host y credenciales.

### 5️⃣ Automatización con GitHub Actions

- `frontend.yml`: instala dependencias, compila Remix/Vite y despliega.
- `backend.yml`: compila .NET, publica artefacto, despliega en Azure.
- Configurar secretos en GitHub (`PUBLISH_PROFILE`, `APP_NAME`, etc).

### 6️⃣ Verificación Final

- Acceder al **frontend** en producción.
- Consumir los endpoints del **backend** vía navegador o herramienta como Postman.
- Validar conexión completa entre frontend, backend y base de datos.

---

## ✅ Recomendaciones

- Usar variables de entorno seguras para producción (`.env.production`).
- Cerrar el acceso externo al PostgreSQL con reglas de firewall tras el testing.
- Activar monitoreo y logs desde Azure App Service para trazabilidad.

---

## 📂 Estructura del Repositorio

**📦 root/ ├── backend/ # API REST con .NET 9 │ └── Dockerfile ├── frontend/ # Remix (Vite) │ └── Dockerfile ├── docker-compose.yml # Desarrollo local └── .github/workflows/ # Deploy automatizado (frontend.yml, backend.yml)**

---

## 📝 Autor

**Angela torres**  
🚀 Taller práctico de despliegue fullstack con herramientas modernas  
💙 Desarrollado con pasión, errores, reinicios… ¡y mucha determinación!

---


