import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from 'redux';
import { persistReducer } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';
import user from './user';
import bookmarks from "./bookmarks";
import scraps from "./scraps";


const persistConfig = {
  key: 'root',
  storage: AsyncStorage, 
}

const rootReducer = combineReducers({
  user,
  bookmarks,
  scraps,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [thunk],
});

export default store;


// const store = configureStore({
//   reducer: {
//     user: user,
//   },
// });

// export default store;