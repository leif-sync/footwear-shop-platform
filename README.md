
# 🚀 Footwear Shop Platform - Backend Service

Este proyecto es el backend de una plataforma de comercio electrónico de calzado, diseñado para ser robusto, escalable y mantenible. He utilizado **Node.js y TypeScript** junto con principios de **Arquitectura Hexagonal (Ports & Adapters) y DDD (Domain-Driven Design)** para asegurar una clara separación de responsabilidades y facilidad de evolución.

-----

## ✨ Características Clave

Aquí te muestro las principales funcionalidades y decisiones de diseño detrás de esta plataforma:

  * **Arquitectura Sólida:**
      * **Arquitectura Hexagonal / DDD:** Implementa una clara separación de preocupaciones, aislando la lógica de negocio del framework y la infraestructura. Esto mejora la portabilidad, mantenibilidad y testabilidad del código.
      * **API RESTful:** Expone un conjunto de endpoints RESTful limpios y bien definidos para la interacción con el frontend y otros servicios.
  * **Gestión Integral de E-commerce:**
      * **Autenticación y Autorización JWT:** Seguridad robusta para proteger rutas y recursos mediante JSON Web Tokens.
      * **Catálogo de Productos:** CRUD completo para la gestión de productos, incluyendo la subida y almacenamiento de imágenes en **Cloudinary**.
      * **Flujo de Pedidos:** Creación y gestión de pedidos, incluyendo estados y detalles del cliente.
      * **Sistema de Pagos:** Integración con **Webpay Plus** para transacciones seguras.
      * **Notificaciones por Correo Electrónico:** Envío de emails transaccionales (confirmaciones de pedido, etc.) usando **Resend**.
  * **Robustez y Mantenibilidad:**
      * **Tipado Estático con TypeScript:** Mejora la calidad del código, reduce errores en tiempo de ejecución y facilita el desarrollo en equipo.
      * **Validación de Datos con Zod:** Asegura la integridad y seguridad de los datos de entrada y salida de la API.
      * **Tareas Programadas (Cron Jobs):** Gestión de operaciones recurrentes, como la limpieza de datos antiguos.
      * **Configuración por Variables de Entorno:** Permite una configuración flexible y segura para diferentes entornos (desarrollo, testing, producción).
  * **Calidad del Código y Desarrollo:**
      * **JSDoc para Documentación:** Documentación interna del código para facilitar la comprensión y el mantenimiento. (¡Próximamente expansión a OpenAPI/Swagger para la API\!)
      * **Pruebas de Integración:** Cobertura de pruebas con **Vitest y Supertest** para asegurar la fiabilidad de la API y los componentes clave.

-----

## 🛠️ Tecnologías Utilizadas

Un vistazo a las herramientas que hacen posible esta plataforma:

  * **Backend:**
      * **Node.js** & **Express.js**: Para un servidor robusto y eficiente.
      * **TypeScript**: Lenguaje principal para el desarrollo.
      * **Prisma**: ORM moderno para una interacción eficiente y segura con la base de datos.
      * **PostgreSQL**: Base de datos relacional para el almacenamiento persistente de datos.
  * **Seguridad y Utilidades:**
      * **JWT (JSON Web Tokens)**: Para la gestión de sesiones y permisos.
      * **Zod**: Validación de esquemas de datos en tiempo de ejecución.
      * **Multer**: Middleware para el manejo de `multipart/form-data` (subida de archivos).
      * **Cron**: Para la programación de tareas.
  * **Integraciones Externas:**
      * **Cloudinary**: Almacenamiento y gestión de imágenes en la nube.
      * **Resend**: Servicio de envío de correos electrónicos transaccionales.
      * **Webpay Plus**: Procesador de pagos.
  * **Testing y Documentación:**
      * **Vitest**: Framework de pruebas rápido para unitarias e integración.
      * **Supertest**: Para testear endpoints HTTP.
      * **JSDoc**: Documentación de código.

-----

## 🚀 Instalación y Configuración

Sigue estos sencillos pasos para tener el proyecto funcionando en tu máquina local:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/leif-sync/footwear-shop-platform.git
    cd footwear-shop-platform
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura tus variables de entorno:**
      * Crea un archivo `.env` en la raíz del proyecto.
      * Copia el contenido de `.env.example` en tu nuevo `.env`.
      * **Crucial:** Rellena tus credenciales y URLs. Asegúrate de configurar:
          * Tu conexión a la base de datos **PostgreSQL**.
          * `CLOUDINARY_URL` si usas Cloudinary.
          * `WEBPAY_PLUS_API_KEY` si usas Webpay Plus.
          * `EMAIL_SENDER_API_KEY` para Resend y verifica que los correos del remitente existan para evitar fallos.
4.  **Prepara la base de datos:**
    ```bash
    npm run prisma:migrate:dev
    ```
5.  **Compila el código TypeScript:**
    ```bash
    npm run build
    ```
6.  **Inicia el servidor:**
    ```bash
    npm run start
    ```

¡Listo\! Tu API backend debería estar corriendo.

-----

## ✅ Pruebas

Para asegurar la calidad del código, puedes ejecutar las pruebas del proyecto:

```bash
npm run test
```

**Nota sobre los tests:** Actualmente, los tests están configurados para funcionar con **repositorios en memoria** para mayor rapidez y aislamiento. Si decides ejecutar las pruebas contra una base de datos real (ej. PostgreSQL), ten en cuenta que podrías encontrar errores debido a datos residuales entre pruebas paralelas. Estoy trabajando activamente en mejorar la gestión de tests para entornos de base de datos reales, posiblemente añadiendo un `npm run test:sequential` con limpieza de datos.

-----

## 📞 Contacto

¿Preguntas, feedback o solo quieres saludar? Conéctate conmigo:

  * **LinkedIn:** [Yurguen Molina](https://www.linkedin.com/in/yurguen-molina-gonzales-4045b0373/ "Ver perfil de LinkedIn")
  * **Correo electrónico:** [andersonmolinagonzales0@gmail.com](mailto:andersonmolinagonzales0@gmail.com "Enviar correo electrónico")