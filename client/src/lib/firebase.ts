import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';

// Verificar se as credenciais do Firebase estão disponíveis
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                          import.meta.env.VITE_FIREBASE_PROJECT_ID;

let db: any = null;

if (hasFirebaseConfig) {
  try {
    // Configuração do Firebase
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('🔥 Firebase configurado com sucesso!');
  } catch (error) {
    console.warn('⚠️ Firebase indisponível, usando sistema local:', error);
  }
} else {
  console.log('💾 Usando sistema local (Firebase não configurado)');
}

export { db };

// Collections (só criar se Firebase disponível)
const productsCollection = db ? collection(db, 'products') : null;
const categoriesCollection = db ? collection(db, 'categories') : null;

// Funções para produtos
export const firebaseProducts = {
  // Ouvir mudanças em tempo real
  onSnapshot: (callback: (products: any[]) => void) => {
    if (!db || !productsCollection) {
      console.log('💾 Firebase indisponível, usando sistema local');
      callback([]);
      return () => {}; // Retorna função vazia para cleanup
    }
    
    const q = query(productsCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(products);
    });
  },

  // Criar produto
  create: async (product: any) => {
    if (!db || !productsCollection) {
      throw new Error('Firebase indisponível');
    }
    const docRef = doc(productsCollection);
    const productData = {
      ...product,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(docRef, productData);
    return productData;
  },

  // Atualizar produto
  update: async (id: string, updates: any) => {
    if (!db || !productsCollection) {
      throw new Error('Firebase indisponível');
    }
    const docRef = doc(productsCollection, id);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    await updateDoc(docRef, updateData);
    return { id, ...updates };
  },

  // Deletar produto
  delete: async (id: string) => {
    if (!db || !productsCollection) {
      throw new Error('Firebase indisponível');
    }
    const docRef = doc(productsCollection, id);
    await deleteDoc(docRef);
    return true;
  },

  // Buscar todos os produtos (uma vez)
  getAll: async () => {
    if (!db || !productsCollection) {
      return [];
    }
    const q = query(productsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// Funções para categorias
export const firebaseCategories = {
  // Ouvir mudanças em tempo real
  onSnapshot: (callback: (categories: any[]) => void) => {
    return onSnapshot(categoriesCollection, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(categories);
    });
  },

  // Criar categoria
  create: async (category: any) => {
    const docRef = doc(categoriesCollection);
    const categoryData = {
      ...category,
      id: docRef.id,
      createdAt: new Date()
    };
    await setDoc(docRef, categoryData);
    return categoryData;
  },

  // Buscar todas as categorias (uma vez)
  getAll: async () => {
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

console.log('🔥 Firebase configurado para sincronização em tempo real!');