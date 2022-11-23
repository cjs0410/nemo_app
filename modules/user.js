import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
    logged: false,
    accessToken: null,
    refreshToken: null,
    decodedAccess: null,
    decodedRefresh: null,
    avatar: null,
    isAlarm: false,
    shouldHomeRefresh: false,
    shouldStorageRefresh: false,
    shouldUserRefresh: false,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.logged = true;
            state.accessToken = action.payload.access;
            state.refreshToken = action.payload.refresh;
            state.decodedAccess = jwt_decode(action.payload.access);
            state.decodedRefresh = jwt_decode(action.payload.refresh);
        },
        resetUserInfo: (state) => {
            state.logged = false;
            state.accessToken = null;
            state.refreshToken = null;
            state.decodedAccess = null;
            state.decodedRefresh = null;
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
            state.decodedAccess = jwt_decode(action.payload);
        },
        setRefreshToken: (state, action) => {
            state.refreshToken = action.payload;
            state.decodedRefresh = jwt_decode(action.payload);
        },
        resetRefreshToken: (state) => {
            state.refreshToken = null;
            state.decodedRefresh = null;
        },
        setAvatar: (state, action) => {
            state.avatar = action.payload;
        },
        resetAvatar: (state, action) => {
            state.avatar = null;
        },
        setIsAlarm: (state, action) => {
            state.isAlarm = action.payload;
        },
        setShouldHomeRefresh: (state, action) => {
            state.shouldHomeRefresh = action.payload;
        },
        setShouldStorageRefresh: (state, action) => {
            state.shouldStorageRefresh = action.payload;
        },
        setShouldUserRefresh: (state, action) => {
            state.shouldUserRefresh = action.payload;
        },
    }
})

export const {
    setUserInfo, resetUserInfo, setAccessToken, setRefreshToken, resetRefreshToken,
    setAvatar, resetAvatar, setIsAlarm, setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh,
} = userSlice.actions;

export default userSlice.reducer;