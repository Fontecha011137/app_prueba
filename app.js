// Importar los módulos necesarios de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración de Firebase (asegúrate de que esté configurado correctamente)
const firebaseConfig = {
    apiKey: "AIzaSyAmLH4heCNY5wA9-knJM5aqyKi1-xzLoxg",
  authDomain: "sumas-ramdom.firebaseapp.com",
  projectId: "sumas-ramdom",
  storageBucket: "sumas-ramdom.firebasestorage.app",
  messagingSenderId: "917536734254",
  appId: "1:917536734254:web:6f0f09d160a9768f5b73bf",
  measurementId: "G-38YF11ZKC6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);  // Inicializar Firestore

// Variables del juego
let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let userId = null;  // Almacena el ID del usuario

// Esperar a que el DOM se cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const gameArea = document.getElementById('game-area');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const loginButton = document.getElementById('login-btn');
    const signupButton = document.getElementById('signup-btn');
    const submitGuessButton = document.getElementById('submit-guess-btn');
    const guessInput = document.getElementById('guess');
    const gameMessage = document.getElementById('game-message');
    const attemptsDisplay = document.getElementById('attempts');

    // Cambiar la UI según si el usuario está autenticado
    auth.onAuthStateChanged(user => {
        if (user) {
            loginForm.style.display = 'none';
            gameArea.style.display = 'block';
            welcomeMessage.innerHTML = `Bienvenido, ${user.email}!`;
            userId = user.uid;  // Guardar el ID del usuario

            // Cargar el puntaje y los intentos desde Firestore
            loadUserGameData(userId);
        } else {
            loginForm.style.display = 'block';
            gameArea.style.display = 'none';
        }
    });

    // Iniciar sesión
    loginButton.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        signInWithEmailAndPassword(auth, email, password)
            .then(() => console.log('Usuario iniciado sesión'))
            .catch(error => alert("Error al iniciar sesión: " + error.message));
    });

    // Registrarse
    signupButton.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => console.log('Usuario registrado'))
            .catch(error => alert("Error al registrarse: " + error.message));
    });

    // Cerrar sesión
    logoutButton.addEventListener('click', () => {
        signOut(auth)
            .then(() => console.log('Usuario cerrado sesión'))
            .catch(error => alert("Error al cerrar sesión: " + error.message));
    });

    // Función para el juego: adivina el número
    submitGuessButton.addEventListener('click', () => {
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            gameMessage.innerHTML = "Por favor ingresa un número entre 1 y 100.";
            return;
        }
        attempts++;
        attemptsDisplay.innerHTML = `Intentos: ${attempts}`;

        if (guess === randomNumber) {
            gameMessage.innerHTML = `¡Felicidades! Has adivinado el número en ${attempts} intentos.`;
            // Guardar los datos del juego en Firestore
            saveUserGameData(userId, attempts);
            // Reiniciar el juego
            randomNumber = Math.floor(Math.random() * 100) + 1;
            attempts = 0;
            attemptsDisplay.innerHTML = `Intentos: 0`;
        } else if (guess < randomNumber) {
            gameMessage.innerHTML = "El número es mayor. Intenta de nuevo.";
        } else {
            gameMessage.innerHTML = "El número es menor. Intenta de nuevo.";
        }
    });

    // Función para cargar los datos del usuario desde Firestore
    async function loadUserGameData(userId) {
        const userDoc = doc(db, "games", userId);
        const docSnapshot = await getDoc(userDoc);

        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            attempts = data.attempts || 0;
            attemptsDisplay.innerHTML = `Intentos: ${attempts}`;
        } else {
            console.log("No se encontraron datos del juego para este usuario.");
        }
    }

    // Función para guardar los datos del juego del usuario en Firestore
    async function saveUserGameData(userId, attempts) {
        const userDoc = doc(db, "games", userId);
        await setDoc(userDoc, { attempts: attempts });
        console.log("Datos del juego guardados en Firestore.");
    }
});
