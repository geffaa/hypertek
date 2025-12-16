// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./AdminSlice"

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// Persist config
const persistConfig = {
  key: "admin",
  storage,
  whitelist: ["admin", "isLoggedIn"], // state keys to persist
};

// Wrap reducer with persist
const persistedAdminReducer = persistReducer(persistConfig, adminReducer);

export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor (needed for PersistGate)
export const persistor = persistStore(store);
