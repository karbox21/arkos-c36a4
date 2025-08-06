// Configuração do Firebase para o projeto ARKOS
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { collection, doc, setDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAD8uLz9NfCfyeR0YtA60m4H4tVP0RlSAk',
  authDomain: 'arkos-c36a4.web.app',
  projectId: 'arkos-c36a4',
  storageBucket: 'arkos-c36a4.appspot.com',
  messagingSenderId: '987078281603',
  appId: '1:987078281603:web:1d34affdd58f2976d48eb6',
  databaseURL: 'https://arkos-c36a4-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Para Realtime Database
const firestore = getFirestore(app); // Para Firestore

// Registrar usuário online
export const registerOnlineUser = async (userData) => {
  try {
    if (!userData?.id) throw new Error('ID do usuário não informado');
    await setDoc(doc(firestore, 'online_users', userData.id), {
      user_id: userData.id,
      display_name: userData.name,
      email: userData.email,
      online: true,
      last_active: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar usuário online:', error);
    return { error };
  }
};

// Atualizar atividade do usuário
export const updateUserActivity = async (userData) => {
  try {
    if (!userData?.id) throw new Error('ID do usuário não informado');
    await updateDoc(doc(firestore, 'online_users', userData.id), {
      last_active: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar atividade do usuário:', error);
    return { error };
  }
};

// Registrar atividade
export const registerActivity = async (type, message, userData = null) => {
  try {
    await addDoc(collection(firestore, 'activities'), {
      type,
      message,
      user_id: userData?.id || 'anonymous',
      user_name: userData?.name || 'Usuário Anônimo',
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    return { error };
  }
};

export { app, auth, db, firestore };