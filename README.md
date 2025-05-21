# DoxBox.org Web Application

[![Current Version](https://img.shields.io/badge/version-25.5.16-blue.svg)](package.json)
[![Built with Vue.js](https://img.shields.io/badge/built%20with-Vue.js-4FC08D.svg)](https://vuejs.org/)
[![Powered by Vite](https://img.shields.io/badge/powered%20by-Vite-646CFF.svg)](https://vitejs.dev/)
[![Styled with Bootstrap](https://img.shields.io/badge/styled%20with-Bootstrap-7952B3.svg)](https://getbootstrap.com/)
[![State Management with Pinia](https://img.shields.io/badge/state%20management-Pinia-FFD700.svg)](https://pinia.vuejs.org/)
[![Deployed on Firebase](https://img.shields.io/badge/deployed%20on-Firebase-FFCA28.svg)](https://firebase.google.com/)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-green.svg?logo=firebase)](firebase.json)

## Overview

doxbox.org is a simple progressive web application built with Vue.js and Firebase. It serves as a central hub for various activities for the Dox Box clan, including managing game servers, tracking tabletop RPG sessions, maintaining a tabletop journal, and viewing Discord bot statistics. The application features a reactive UI, user authentication, and real-time data synchronization for certain features.

## Features

-   **User Authentication:** Secure login and registration system.
-   **Game Servers Overview (`GameserversView`):** Displays information about various game servers.
-   **Quinn Integration (`QuinnView`):** Shows dice rolling statistics from a Discord bot named Quinn, leveraging Firebase Realtime Database.
-   **Tabletop Sessions Management (`SessionsView`):** Allows users to track and manage tabletop RPG sessions, potentially with calendar integration.
-   **Journaling (`JournalView`):** A feature-rich journaling system with hierarchical entries (Arcs, Stages, Steps).
-   **User Settings (`SettingsView`):** Allows users to configure their preferences.
-   **Dynamic Routing:** Utilizes Vue Router for navigating between different sections of the application.
-   **State Management:** Employs Pinia for robust and maintainable state management.
-   **Responsive Design:** Uses Bootstrap for styling and aims for a responsive user experience.
-   **Particle Effects:** Includes `tsparticles` for animated backgrounds.
-   **Toast Notifications:** Provides user feedback through toast messages.

## Tech Stack

-   **Frontend:** Vue.js 3
-   **Build Tool:** Vite
-   **Routing:** Vue Router
-   **State Management:** Pinia with `pinia-plugin-persistedstate`
-   **Styling:** Bootstrap 5, SCSS
-   **Backend & Database:**
    -   Firebase Authentication
    -   Firebase Firestore (for general data, as per `firestore.rules`)
    -   Firebase Realtime Database (specifically for `quinnStore`)
-   **Deployment:** Firebase Hosting
-   **UI Components/Libraries:**
    -   `V-Calendar`: For calendar functionalities.
    -   `@tsparticles/vue3`: For particle animations.
    -   `marked`: For Markdown rendering.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (which includes npm)
-   [Yarn](https://yarnpkg.com/) (optional, but `package.json` scripts use it)
-   [Firebase CLI](https://firebase.google.com/docs/cli)

## Firebase Setup

This project uses Firebase for its backend services.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Register your app:** Add a web app to your Firebase project.
3.  **Get Firebase Config:** After registering your app, you'll be given a Firebase configuration object.
4.  **Configure `src/firebase.js`:**

    -   Create a file named `firebase.js` in the `src` directory if it doesn't exist.
    -   Populate it with your Firebase project's configuration. It should look something like this:

    ```javascript
    // src/firebase.js
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';
    import { getDatabase } from 'firebase/database'; // If using Realtime Database

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_AUTH_DOMAIN',
        projectId: 'YOUR_PROJECT_ID',
        storageBucket: 'YOUR_STORAGE_BUCKET',
        messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
        appId: 'YOUR_APP_ID',
        // measurementId: "YOUR_MEASUREMENT_ID" // Optional
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const realtimeDB = getDatabase(app); // If using Realtime Database

    export { app, auth, db, realtimeDB };
    ```

5.  **Set up Firebase Emulators (Optional, for local development):**
    Refer to the [Firebase documentation](https://firebase.google.com/docs/emulator-suite/install_and_configure) to set up local emulators for Authentication, Firestore, and Realtime Database.
6.  **Configure Firestore Rules:** Update `firestore.rules` as needed and deploy them using the Firebase CLI: `firebase deploy --only firestore:rules`.
7.  **Configure Realtime Database Rules (if applicable):** If you are using Realtime Database features beyond `quinnStore` or have specific security needs for it.
8.  **Configure Hosting:** `firebase.json` is already configured for Firebase Hosting.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd doxbox.org
    ```

2.  **Install dependencies:**
    Using Yarn (recommended based on `package.json` scripts):
    ```bash
    yarn install
    ```
    Or using npm:
    ```bash
    npm install
    ```

## Running for Development

To start the development server (usually on `http://localhost:5173` by default with Vite):

Using Yarn:

```bash
yarn dev
```

Or using npm:

```bash
npm run dev
```

The application will open in your default web browser, and Vite's Hot Module Replacement (HMR) will automatically update the app as you make changes to the source files.

## Building for Production

To create a production-ready build of the application in the `dist` directory:

Using Yarn:

```bash
yarn build
```

Or using npm:

```bash
npm run build
```

This command will bundle and optimize the application for performance. The `vite.config.js` also includes a step to generate a `public/version.json` file during the build.

## Deployment

The project is configured for deployment to Firebase Hosting.

1.  **Login to Firebase:**
    If you haven't already, log in to Firebase using the CLI:

    ```bash
    firebase login
    ```

2.  **Select Firebase Project:**
    If you have multiple Firebase projects, you might need to select the correct one:

    ```bash
    firebase use <your-project-id>
    ```

3.  **Deploy:**
    The `package.json` includes a convenient deploy script:
    Using Yarn:

    ```bash
    yarn deploy
    ```

    Or using npm:

    ```bash
    npm run deploy
    ```

    This script first runs `yarn build` (or `npm run build`) and then `firebase deploy`.

    Alternatively, you can deploy manually after building:

    ```bash
    firebase deploy --only hosting
    ```

## License

This project is licensed under the GNU Affero General Public License v3.0.
See the [LICENSE](LICENSE) file for details.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
