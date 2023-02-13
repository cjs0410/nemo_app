import { Animated, } from "react-native";
import React, { useRef, } from "react";
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
    isStaff: false,
    shouldHomeRefresh: false,
    shouldLibraryRefresh: false,
    shouldUserRefresh: false,
    shouldNemoRefresh: false,
    shouldNemolistRefresh: false,
    shouldBookRefresh: false,
    shouldFollowingRefresh: false,
    recentSearch: [],
    searchKeyword: '',
    isAlbumTile: false,
    isBookTile: false,
    fcmToken: null,
    // scrollY: useRef(new Animated.Value(0)).current,
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
            state.isStaff = false;
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
        setShouldLibraryRefresh: (state, action) => {
            state.shouldLibraryRefresh = action.payload;
        },
        setShouldUserRefresh: (state, action) => {
            state.shouldUserRefresh = action.payload;
        },
        setShouldNemoRefresh: (state, action) => {
            state.shouldNemoRefresh = action.payload;
        },
        setShouldNemolistRefresh: (state, action) => {
            state.shouldNemolistRefresh = action.payload;
        },
        setShouldBookRefresh: (state, action) => {
            state.shouldBookRefresh = action.payload;
        },
        setShouldFollowingRefresh: (state, action) => {
            state.shouldFollowingRefresh = action.payload;
        },
        setIsStaff: (state, action) => {
            state.isStaff = action.payload;
        },
        resetRecentSearch: (state, action) => {
            state.recentSearch = [];
        },
        addRecentSearch: (state, action) => {
            if (state.recentSearch) {
                if (state.recentSearch.length === 20) {
                    state.recentSearch.splice(0, 1);
                }

                const dupIndex = state.recentSearch.findIndex((item) => {
                    if (action.payload.ctg === "book") {
                        return (Number(item.book_id) === Number(action.payload.book_id))
                    }
                    if (action.payload.ctg === "album") {
                        return (Number(item.nemolist_id) === Number(action.payload.nemolist_id))
                    }
                    if (action.payload.ctg === "user") {
                        return (item.user_tag === action.payload.user_tag)
                    }
                })
                if (dupIndex !== -1) {
                    console.log(dupIndex);
                    state.recentSearch.splice(dupIndex, 1);
                    state.recentSearch = state.recentSearch.concat(action.payload);
                } else {
                    state.recentSearch = state.recentSearch.concat(action.payload);
                }
            } else {
                state.recentSearch = [];
                state.recentSearch = state.recentSearch.concat(action.payload);
            }
            console.log(state.recentSearch);
        },
        deleteRecentSearch: (state, action) => {
            state.recentSearch.splice(action.payload, 1);
        },
        setSearchKeyword: (state, action) => {
            state.searchKeyword = action.payload;
        },
        toggleAlbumTile: (state, action) => {
            state.isAlbumTile = !state.isAlbumTile;
        },
        toggleBookTile: (state, action) => {
            state.isBookTile = !state.isBookTile;
        },
        setFcmToken: (state, action) => {
            state.fcmToken = action.payload;
        },
        resetFcmToken: (state, action) => {
            state.fcmToken = null;
        }
    }
})

export const {
    setUserInfo, resetUserInfo, setAccessToken, setRefreshToken, resetRefreshToken,
    setAvatar, resetAvatar, setIsAlarm, 
    setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, 
    setShouldNemoRefresh, setShouldNemolistRefresh, setShouldBookRefresh,
    setShouldFollowingRefresh,
    setIsStaff,
    addRecentSearch, deleteRecentSearch,
    setSearchKeyword,
    toggleAlbumTile, toggleBookTile,
    setFcmToken, resetFcmToken,
} = userSlice.actions;

export default userSlice.reducer;