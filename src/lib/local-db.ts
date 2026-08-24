"use client";

import type { HistoryEntry, LocalProfile, SceneFeedback } from "./schemas";

const DB_NAME = "what-mom-meant-to-say";
const DB_VERSION = 2;
const PROFILE_STORE = "profiles";
const HISTORY_STORE = "history";
const FEEDBACK_STORE = "feedback";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROFILE_STORE)) database.createObjectStore(PROFILE_STORE, { keyPath: "profileId" });
      if (!database.objectStoreNames.contains(HISTORY_STORE)) {
        const store = database.createObjectStore(HISTORY_STORE, { keyPath: "historyId" });
        store.createIndex("profileId", "profileId", { unique: false });
      }
      if (!database.objectStoreNames.contains(FEEDBACK_STORE)) {
        const store = database.createObjectStore(FEEDBACK_STORE, { keyPath: "feedbackId" });
        store.createIndex("historyId", "historyId", { unique: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local storage could not open."));
  });
}

async function transact<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local storage operation failed."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error ?? new Error("Local storage transaction failed."));
  });
}

export async function listProfiles(): Promise<LocalProfile[]> {
  const profiles = await transact<LocalProfile[]>(PROFILE_STORE, "readonly", (store) => store.getAll());
  return profiles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export function saveProfile(profile: LocalProfile): Promise<IDBValidKey> { return transact(PROFILE_STORE, "readwrite", (store) => store.put(profile)); }
export function deleteProfile(profileId: string): Promise<undefined> { return transact(PROFILE_STORE, "readwrite", (store) => store.delete(profileId)); }
export async function listHistory(): Promise<HistoryEntry[]> {
  const entries = await transact<HistoryEntry[]>(HISTORY_STORE, "readonly", (store) => store.getAll());
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function saveHistory(entry: HistoryEntry): Promise<IDBValidKey> { return transact(HISTORY_STORE, "readwrite", (store) => store.put(entry)); }
export function deleteHistory(historyId: string): Promise<undefined> { return transact(HISTORY_STORE, "readwrite", (store) => store.delete(historyId)); }
export async function listFeedback(): Promise<SceneFeedback[]> {
  const entries = await transact<SceneFeedback[]>(FEEDBACK_STORE, "readonly", (store) => store.getAll());
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function saveFeedback(feedback: SceneFeedback): Promise<IDBValidKey> { return transact(FEEDBACK_STORE, "readwrite", (store) => store.put(feedback)); }
export async function deleteFeedbackForHistory(historyId: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FEEDBACK_STORE, "readwrite");
    const store = transaction.objectStore(FEEDBACK_STORE);
    const request = store.index("historyId").getKey(historyId);
    request.onsuccess = () => { if (request.result !== undefined) store.delete(request.result); };
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error ?? new Error("Feedback could not be deleted."));
  });
}
export async function clearAllLocalData(): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([PROFILE_STORE, HISTORY_STORE, FEEDBACK_STORE], "readwrite");
    transaction.objectStore(PROFILE_STORE).clear(); transaction.objectStore(HISTORY_STORE).clear(); transaction.objectStore(FEEDBACK_STORE).clear();
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error ?? new Error("Local data could not be cleared."));
  });
}
export function supportsLocalDatabase(): boolean { return typeof indexedDB !== "undefined"; }
