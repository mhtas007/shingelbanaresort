import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db as localData } from "./data.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqpd9OH1Bl7oVtHf9SQNCTt5o7c4oHmRc",
  authDomain: "shingelbanarest.firebaseapp.com",
  projectId: "shingelbanarest",
  storageBucket: "shingelbanarest.firebasestorage.app",
  messagingSenderId: "705453097742",
  appId: "1:705453097742:web:4cb7c3a3395bd23041cd5f"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

async function seed() {
  console.log("Starting seed process...");

  // 1. Create Admin User
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@shingelbana.com", "Admin@1234");
    console.log("Admin user created successfully:", userCredential.user.uid);
    // Add to admins collection for role-based access if needed
    await setDoc(doc(firestore, "admins", userCredential.user.uid), {
      email: "admin@shingelbana.com",
      role: "admin",
      createdAt: new Date().toISOString()
    });
    console.log("Admin role assigned in Firestore.");
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Admin user already exists. Skipping creation.");
    } else {
      console.error("Error creating admin user:", error);
    }
  }

  // 2. Upload Menu Items
  console.log("Uploading menu items...");
  const menuCollection = collection(firestore, "menuItems");
  const batch1 = writeBatch(firestore);
  let count1 = 0;
  
  for (const item of localData.menu) {
    const docRef = doc(menuCollection, item.id.toString());
    batch1.set(docRef, item);
    count1++;
    if (count1 === 400) { // Firestore batch limit is 500
      await batch1.commit();
      console.log("Committed batch 1 of menu items.");
    }
  }
  if (count1 > 0 && count1 <= 400) {
    await batch1.commit();
    console.log(`Committed ${count1} menu items.`);
  }

  // 3. Upload Settings (Translations & Category Images)
  console.log("Uploading settings (translations, categoryImages)...");
  await setDoc(doc(firestore, "settings", "translations"), localData.translations);
  await setDoc(doc(firestore, "settings", "categoryImages"), localData.categoryImages);
  
  console.log("Seed process completed successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
