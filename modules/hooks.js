import { createSelector } from '@reduxjs/toolkit'; 

export const userSelector = state => state.user;
export const bookmarkSelector = state => state.bookmarks;
export const scrapSelector = state => state.scraps;