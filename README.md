# Thirix - Red Social Multimedia en Tiempo Real

Thirix es una red social moderna desarrollada con **React + TypeScript + Vite** en el frontend y **Node.js + Express + MongoDB + Socket.IO** en el backend.

La plataforma permite a los usuarios publicar contenido multimedia, interactuar mediante comentarios y mensajes privados, recibir notificaciones en tiempo real y realizar transmisiones en vivo.

---

# Arquitectura del Proyecto

## Frontend

```text
src/
├── components/
│   ├── chat/
│   │   ├── AudioRecorderModal.tsx     # Grabación de audio
│   │   ├── CameraModal.tsx            # Captura de fotos y filtros
│   │   └── MediaPreview.tsx           # Vista previa multimedia
│   │
│   ├── CommentSection.tsx             # Sistema de comentarios
│   ├── Footer.tsx                     # Pie de página
│   ├── Header.tsx                     # Barra de navegación
│   ├── Layout.tsx                     # Layout principal
│   ├── MediaUpload.tsx                # Subida de imágenes/videos
│   ├── PostCard.tsx                   # Tarjeta de publicación
│   ├── ProtectedRoute.tsx             # Rutas protegidas
│   ├── PublicRoute.tsx                # Rutas públicas
│   └── UserCard.tsx                   # Tarjeta de usuario
│
├── contexts/
│   └── AuthContext.tsx                # Contexto global de autenticación
│
├── lib/
│   └── socket.ts                      # Configuración Socket.IO
│
├── pages/
│   ├── Chat.tsx                       # Conversación individual
│   ├── CreatePost.tsx                 # Crear publicación
│   ├── EditProfile.tsx                # Editar perfil
│   ├── Feed.tsx                       # Muro principal
│   ├── LiveStream.tsx                 # Transmisiones en vivo
│   ├── Login.tsx                      # Inicio de sesión
│   ├── Messages.tsx                   # Lista de conversaciones
│   ├── NotFound.tsx                   # Página 404
│   ├── Notifications.tsx             # Notificaciones
│   ├── Profile.tsx                    # Perfil de usuario
│   ├── Register.tsx                   # Registro
│   ├── SavedPosts.tsx                 # Publicaciones guardadas
│   └── Search.tsx                     # Búsqueda de usuarios
│
├── services/
│   ├── auth.service.ts                # Autenticación
│   ├── message.service.ts             # Mensajería
│   ├── notification.service.ts        # Notificaciones
│   ├── post.service.ts                # Publicaciones
│   └── user.service.ts                # Usuarios
│
├── types/
│   └── index.ts                       # Interfaces TypeScript
│
├── App.tsx                            # Rutas principales
├── main.tsx                           # Punto de entrada
├── index.css                          # Estilos globales
└── vite-env.d.ts
```

---

## Backend

```text
THIRIX-BACKEND/
├── src/
│
├── middlewares/
│   └── upload.middleware.js           # Multer y subida de archivos
│
├── models/
│   ├── Comment.js                     # Modelo de comentarios
│   ├── Conversation.js                # Conversaciones
│   ├── Message.js                     # Mensajes privados
│   ├── Notification.js                # Notificaciones
│   ├── Post.js                        # Publicaciones
│   └── User.js                        # Usuarios
│
├── routes/
│   ├── auth.routes.js                 # Login y registro
│   ├── comment.routes.js              # Comentarios
│   ├── conversation.routes.js         # Conversaciones
│   ├── feed.routes.js                 # Feed principal
│   ├── live.routes.js                 # Streaming en vivo
│   ├── message.routes.js              # Mensajería
│   ├── notification.routes.js         # Notificaciones
│   ├── post.routes.js                 # Publicaciones
│   └── user.routes.js                 # Usuarios
│
├── socket/
│   └── socket.js                      # Eventos Socket.IO
│
├── utils/
│   └── generateToken.js               # JWT
│
├── app.js                             # Configuración Express
├── server.js                          # Servidor principal
│
├── .env
├── package.json
└── package-lock.json
```

---

# Tecnologías Utilizadas

## Frontend

- React
- TypeScript
- Vite
- React Router DOM
- Socket.IO Client
- Tailwind CSS
- Lucide React
- React Webcam

## Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT
- Multer
- Cloudinary
- Cookie Parser
- CORS

---

# Funcionalidades Principales

### Usuarios

- Registro de usuarios
- Inicio de sesión
- Edición de perfil
- Seguimiento de usuarios
- Búsqueda de perfiles

### Publicaciones

- Crear publicaciones
- Editar publicaciones
- Eliminar publicaciones
- Guardar publicaciones
- Feed dinámico

### Multimedia

- Subida de imágenes
- Subida de videos
- Captura desde cámara web
- Grabación de audio
- Vista previa multimedia

### Comentarios

- Crear comentarios
- Eliminar comentarios
- Actualización en tiempo real

### Mensajería

- Conversaciones privadas
- Envío de imágenes
- Envío de audio
- Indicadores en tiempo real

### Notificaciones

- Likes
- Comentarios
- Seguimientos
- Mensajes

### Streaming

- Crear transmisiones en vivo
- Visualización en tiempo real
- Chat durante la transmisión

---

# Instalación Frontend

```bash
npm install

npm run dev
```

Servidor:

```text
http://localhost:5173
```

---

# Instalación Backend

```bash
npm install

npm run dev
```

Servidor:

```text
http://localhost:5000
```

---

# Variables de Entorno Backend

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# Rutas Principales Frontend

| Ruta | Página | Descripción |
|--------|---------|-------------|
| / | Feed | Muro principal |
| /login | Login | Inicio de sesión |
| /register | Register | Registro |
| /profile/:id | Profile | Perfil de usuario |
| /edit-profile | EditProfile | Editar perfil |
| /create-post | CreatePost | Crear publicación |
| /messages | Messages | Conversaciones |
| /chat/:id | Chat | Chat privado |
| /notifications | Notifications | Notificaciones |
| /saved-posts | SavedPosts | Publicaciones guardadas |
| /search | Search | Búsqueda de usuarios |
| /live | LiveStream | Transmisiones en vivo |

---

# API Principal

| Endpoint | Método | Descripción |
|-----------|---------|-------------|
| /api/auth | POST | Autenticación |
| /api/users | GET | Usuarios |
| /api/posts | GET | Publicaciones |
| /api/comments | GET | Comentarios |
| /api/messages | GET | Mensajes |
| /api/conversations | GET | Conversaciones |
| /api/notifications | GET | Notificaciones |
| /api/live | GET | Streaming |

---

# Autor

### Thiago Paolo Icochea Rodriguez

Proyecto desarrollado como una red social multimedia moderna enfocada en interacción social, contenido multimedia y comunicación en tiempo real.