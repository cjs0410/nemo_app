import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated, Pressable, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import blankBookCover from '../assets/images/blankBookImage.png';
import RenderHtml from 'react-native-render-html';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetBookmarks, addBookmark, deleteBookmark } from '../modules/bookmarks';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkSimple = (props) => {
    const bookmark = props.bookmark;
    const date = bookmark.created_date.split('T')[0].split('-');
    const navigation = props.navigation;

    return (
        <View style={styles.bookmarkContentsScrollBox}>
            <View 
                style={{
                    ...styles.bookmarkContentsBox, 
                    backgroundColor: bookmark.hex === null ? "#D9D9D9" : bookmark.hex, 
                }} 
            >
                <View style={styles.bookmarkContentsBook}>
                    <Pressable 
                        style={{ flexDirection: "row" }}
                        onPress={() => navigation.push('BookProfile', {
                            bookId: bookmark.book_id, 
                        })}
                        disabled={true}
                    >
                        <View>
                            <Image 
                                source={ bookmark.book_cover !== null ? { uri: bookmark.book_cover } : blankBookCover} 
                                style={styles.bookmarkContentsBookCover}
                            />
                        </View>
                        <View style={{ justifyContent: "center" }}>
                            <Text style={styles.bookmarkContentsBookTitle}>{bookmark.book_title}</Text>
                            <Text style={styles.bookmarkContentsBookChapter}>{bookmark.chapter_title}</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bookmarkContentsScrollBox: {
        // flex: 1,
        // height: SCREEN_WIDTH * 0.5,
        width: SCREEN_WIDTH,
    },
    bookmarkContentsBox: {
        flex: 1,
        backgroundColor: "#D9D9D9",
        marginVertical: regWidth * 5,
        marginHorizontal: regWidth * 13,
        paddingVertical: regWidth * 5,
        borderRadius: 2,
        paddingHorizontal: regWidth * 10,
        // backgroundColor: 'red',
    },
    bookmarkContentsBookCover: {
        // flex: 1,
        // backgroundColor: "red",
        width: regWidth * 40,
        height: regWidth * 40,
        resizeMode: "contain",
    },
    bookmarkContentsBook: {
        marginLeft: -5,
        // flex: 0.6,
        height: regWidth * 44,
        flexDirection: "row", 
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookmarkContentsBookTitle: {
        // fontWeight: "400",
        fontSize: regWidth * 10,
        fontFamily: "NotoSansKR-Regular",
        includeFontPadding: false,
    },
    bookmarkContentsBookChapter: {
        // fontWeight: "700",
        fontSize: regWidth * 15,
        fontFamily: "NotoSansKR-Bold",
        width: regWidth * 290,
        includeFontPadding: false,
    },
})

export default BookmarkSimple;