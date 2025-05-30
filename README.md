# CoalFlow App

## Descripción

La aplicación permite:
* Gestionar ciudades y los depósitos de carbón asociados a cada una.
* Visualizar el inventario de carbón por tipo y depósito.
* Crear órdenes de traslado de carbón entre depósitos, validando stock.
* Un dashboard simple con métricas clave.

**Nota Importante:** La simulación de datos se realiza mediante servicios in-memory, como se especifica en los requerimientos del desafío. Por lo tanto, los datos creados o modificados durante una sesión se perderán al refrescar el navegador o reiniciar la aplicación.

## Tech Stack y Características Clave

* **Angular 18:**
    * Componentes Standalone
    * Signals para el manejo de estado reactivo
    * Sistema de Rutas moderno con carga diferida (Lazy Loading)
* **TypeScript**
* **Formularios Reactivos** con validaciones.
* **Servicios In-Memory** para simulación de datos y lógica de negocio.
* **Angular Material** para componentes UI y diseño responsive.
* **SCSS** para estilos.
* **UUID** para la generación de identificadores únicos en los datos simulados.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:
* Node.js (se recomienda la última versión LTS)
* Yarn (este proyecto usa `yarn` para la gestión de dependencias por que hubo problemas al usar npm)
* Angular CLI v18 (<code>npm install -g @angular/cli</code> o <code>yarn global add @angular/cli</code>)

## Getting Started / Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO_AQUI>
    cd coalflow-app
    ```

2.  **Instala las dependencias usando Yarn:**
    Debido a configuraciones iniciales o preferencias, este proyecto utiliza `yarn` para la instalación de dependencias.
    ```bash
    yarn install
    ```
    Si no tienes Yarn instalado, puedes instalarlo globalmente mediante npm: `npm install --global yarn`.

## Ejecutar la Aplicación

Una vez instaladas las dependencias, puedes iniciar el servidor de desarrollo:

```bash
yarn start