import React, { useState } from 'react';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db as firestoreDb } from './firebase';
import { UploadCloud, Check, AlertCircle } from 'lucide-react';
import { MenuItem, Category } from './types';

interface FirebaseSyncProps {
  menuItems: MenuItem[];
  categories: Category[];
}

export default function FirebaseSync({ menuItems, categories }: FirebaseSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('Starting sync process...');
    setError(null);
    try {
      // 1. Sync Menu Items
      setSyncStatus('Syncing menu items to Firebase...');
      const menuCollection = collection(firestoreDb, 'menuItems');
      const batch = writeBatch(firestoreDb);
      let count = 0;
      
      for (const item of menuItems) {
        const docRef = doc(menuCollection, item.id.toString());
        batch.set(docRef, item);
        count++;
        if (count === 400) {
          await batch.commit();
        }
      }
      if (count > 0 && count <= 400) {
        await batch.commit();
      }

      // 2. Sync Categories (as a single document for simplicity)
      setSyncStatus('Syncing categories...');
      await setDoc(doc(firestoreDb, 'settings', 'categories'), { data: categories });

      setSyncStatus('Success! Database is now populated with all current data.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during synchronization. Did you create the Firestore Database in your Firebase Console?');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-purewhite p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200/50">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-deepblue font-sans">Firebase Database Sync</h2>
          <p className="text-sm text-gray-500 font-sans mt-1">Upload the initial code data into your Firebase Firestore.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6">
        <h3 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Important Instructions
        </h3>
        <p className="text-sm text-amber-700/80 mb-3">
          Before clicking sync, ensure you have gone to your <strong>Firebase Console</strong> and clicked <strong>"Create Database"</strong> under the Firestore Database section.
          Also, ensure the rules are set to allow read/write (e.g. Test Mode) during development.
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-deepblue px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none text-sm"
        >
          {syncing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-deepblue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Push Code Data to Firebase
            </span>
          )}
        </button>
      </div>

      {syncStatus && !error && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
          <Check className="w-5 h-5 text-green-500" />
          {syncStatus}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Sync Failed
          </div>
          <p className="font-normal text-red-600/80">{error}</p>
        </div>
      )}
    </div>
  );
}
