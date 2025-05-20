# DevFlow

DevFlow es un gestor de proyectos diseñado para desarrolladores, donde pueden subir y gestionar sus proyectos de manera colaborativa. La aplicación permite a los usuarios autenticarse utilizando su cuenta de GitHub, facilitando el acceso y la gestión de proyectos.

## Características

- **Autenticación con GitHub**: Los usuarios pueden iniciar sesión utilizando su cuenta de GitHub, lo que simplifica el proceso de registro y acceso.
- **Gestión de Proyectos**: Los usuarios pueden crear nuevos proyectos, ver una lista de proyectos existentes y acceder a los detalles de cada proyecto.
- **Colaboradores**: Cada proyecto puede tener colaboradores que pueden ser invitados a unirse, facilitando el trabajo en equipo.
- **Chat en Vivo**: Cada proyecto cuenta con una sala de chat donde los desarrolladores pueden comunicarse en tiempo real, mejorando la colaboración y la comunicación.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
devflow
├── public
│   ├── index.html
│   └── favicon.ico
├── src
│   ├── components
│   │   ├── Auth
│   │   ├── Projects
│   │   ├── Collaborators
│   │   ├── Chat
│   │   ├── Layout
│   │   └── common
│   ├── context
│   ├── firebase
│   ├── hooks
│   ├── pages
│   ├── utils
│   ├── App.jsx
│   ├── index.jsx
│   └── styles.css
├── .env
├── .gitignore
├── package.json
├── README.md
└── firebase.json
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```
   cd devflow
   ```
3. Instala las dependencias:
   ```
   npm install
   ```
4. Configura las variables de entorno en el archivo `.env`.
5. Inicia la aplicación:
   ```
   npm start
   ```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la licencia MIT.