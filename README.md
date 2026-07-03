# TechInspect Pro (React + Firebase)

App de inspección y reporte técnico para planta, con:
- **Dashboard**: checklist por máquina/sector, con toggles y comentarios.
- **Administrador**: alta, edición y baja de máquinas y sus puntos de control (protegido con login).
- **Reportes**: listado histórico de reportes enviados, con detalle por sector.
- **Exportación**: descarga de PDF y envío por email (Formspree).

Todo queda guardado en **Firebase Firestore**.

---

## 1. Instalación local

Requisitos: Node.js 18+ instalado.

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`. Vas a ver la pantalla en blanco hasta que configures Firebase (paso 2).

---

## 2. Crear el proyecto en Firebase (gratis)

Una aclaración importante: Firebase (plan **Spark**, el gratuito) **no es "sin límites"**,
pero para este uso (una planta, pocos usuarios) los límites gratuitos son muy generosos:
50.000 lecturas y 20.000 escrituras por día, 1 GiB de almacenamiento. Para lo que
describís, no deberías acercarte a esos topes. Si en algún momento lo necesitás, se puede
pasar al plan Blaze (pago por uso) sin cambiar nada del código.

Pasos:

1. Andá a [https://console.firebase.google.com](https://console.firebase.google.com) y creá un proyecto nuevo.
2. En el menú lateral, andá a **Compilación > Firestore Database** y creá la base de datos
   (modo producción; después pegamos las reglas de seguridad).
3. En el menú lateral, andá a **Compilación > Authentication**, pestaña **Sign-in method**,
   y habilitá el proveedor **Correo electrónico/contraseña**.
4. En **Authentication > Users**, creá manualmente el usuario administrador (tu email y una contraseña).
   Ese es el único login que existe en la app — los técnicos de planta no necesitan cuenta,
   solo cargan su nombre en el campo de texto del dashboard.
5. Andá a **Configuración del proyecto** (ícono de tuerca) > **Tus apps** > **Web** (ícono `</>`)
   y registrá una app. Ahí te va a dar un objeto `firebaseConfig` con varias claves.
6. Copiá `.env.example` a `.env` y completá cada valor con lo que te dio Firebase:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

7. En Firestore Database > pestaña **Reglas**, pegá el contenido del archivo `firestore.rules`
   incluido en este proyecto, y publicá. Esto permite que cualquiera lea las máquinas y cree
   reportes (necesario porque los técnicos no tienen login), pero solo el admin logueado puede
   editar/borrar máquinas y reportes.

Con eso ya podés entrar a `/admin/login`, loguearte, y cargar tu primera máquina desde el
módulo Administrador. Después esa máquina va a aparecer automáticamente en el Dashboard.

---

## 3. Envío de reportes por email (Formspree, gratis)

1. Creá una cuenta gratuita en [https://formspree.io](https://formspree.io) (50 envíos/mes gratis).
2. Creá un formulario nuevo, con destino tu email.
3. Formspree te da una URL tipo `https://formspree.io/f/xxxxxxxx`. Pegala en `.env`:

```
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

4. Al enviar un reporte desde el Dashboard, el botón "Enviar por email" manda un resumen de
   texto del reporte (máquina por máquina, con estado de cada punto y comentarios) a tu casilla.

**Importante**: Formspree en el plan gratuito no adjunta archivos PDF automáticamente.
Por eso el botón "Descargar PDF" siempre está disponible al lado: generás el PDF localmente
(sin backend, con `jsPDF`) y lo adjuntás vos a mano por email o WhatsApp si lo necesitás con
ese formato. Si en algún momento querés que el PDF vaya adjunto automático, hay que pasar a un
servicio con backend propio (por ejemplo una función en Firebase Cloud Functions con un
servicio de email como Resend, similar a como está armado TrackTools) — avisame si querés que
lo armemos así más adelante.

Si no configurás Formspree, el botón "Enviar por email" simplemente va a mostrar un error
explicando que falta la variable de entorno; el resto de la app funciona igual.

---

## 4. Subir a GitHub

```bash
git init
git add .
git commit -m "TechInspect Pro - primera versión React + Firebase"
git branch -M main
git remote add origin <URL_DE_TU_REPO>
git push -u origin main
```

El archivo `.gitignore` ya excluye `.env` y `node_modules`, así que tus claves de Firebase no
se suben al repo. Ojo: las claves de Firebase Web (`apiKey`, etc.) no son secretas en el sentido
estricto — quedan visibles en el navegador igual — la seguridad real la dan las **reglas de
Firestore**, no ocultar esas claves. Aun así, es buena práctica no subirlas al repo público.

---

## 5. Deploy en Netlify

1. En Netlify, "Add new site" > "Import an existing project" > conectá tu repo de GitHub.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. En **Site settings > Environment variables**, cargá las mismas variables que tenés en tu
   `.env` local (todas las que empiezan con `VITE_`).
5. Deploy. Netlify te va a dar una URL pública.

---

## 6. Estructura del proyecto

```
trackinspect-react/
  src/
    components/     Header, Footer, MachineCard, ProtectedRoute
    pages/          Dashboard, AdminLogin, AdminPanel, ReportsList, ReportDetail
    utils/          pdfGenerator.js (jsPDF), formspree.js (envío de email)
    hooks/          useAdminAuth.js
    firebase.js     inicialización de Firebase (Firestore + Auth)
    App.jsx         rutas
    main.jsx        entry point
  firestore.rules   reglas sugeridas para copiar en Firebase Console
  .env.example      variables de entorno necesarias
```

## 7. Modelo de datos en Firestore

**Colección `machines`**
```
{ name: "Sector PL01", sector: "PL01", items: [{ id, label, icon }] }
```

**Colección `reports`** (cada documento es una sesión de inspección completa, con todas las
máquinas que estaban cargadas en ese momento)
```
{
  technician: "Juan Pérez",
  date: "2026-07-02T13:00:00.000Z",
  sectors: [
    { machineId, machineName, status: "OK" | "PENDIENTE", comments, items: [{ id, label, verified }] }
  ],
  createdAt: <serverTimestamp>
}
```

---

## Próximos pasos posibles

- Roles de operador vs. admin (como en TrackTools) si en algún momento los técnicos también
  necesitan login.
- Envío automático del PDF adjunto por email vía Cloud Functions + Resend.
- Notificaciones cuando un reporte queda con puntos "PENDIENTE".
- Filtros y búsqueda en el listado de reportes (por fecha, por técnico, por sector).
