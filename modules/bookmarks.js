import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bookmarked: [],
}

export const bookmarkSlice = createSlice({
    name: 'bookmarks',
    initialState,
    reducers: {
        resetBookmarks: (state) => {
            state.bookmarked = [];
        },
        loadBookmarks: (state, action) => {
            state.bookmarked = action.payload;
        },
        addBookmark: (state, action) => {
            state.bookmarked = [...state.bookmarked, action.payload];
            // console.log(state.bookmarked);
        },
        deleteBookmark: (state, action) => {
            state.bookmarked = state.bookmarked.filter((bookmark) => (
                bookmark.bookmark_id !== action.payload.bookmark_id
            ));
            // console.log(state.bookmarked);
        }
    }
})

export const {
    resetBookmarks, loadBookmarks, addBookmark, deleteBookmark
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;