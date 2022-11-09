import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated, Pressable, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import RenderHtml from 'react-native-render-html';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetBookmarks, addBookmark, deleteBookmark } from '../modules/bookmarks';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkList = (props) => {
    const bookmark = props.bookmark;
    const navigation = props.navigation;
    const { bookmarked, } = useSelector(bookmarkSelector);
    const backgroundImageValue = useRef(new Animated.Value(0)).current;


    const showBackgroundImage = () => {
        Animated.timing(backgroundImageValue, {
            toValue: 0.2,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return (
        <View style={styles.bookmarkContentsScrollBox}>
            <View 
                style={{
                    ...styles.bookmarkContentsBox, 
                    backgroundColor: bookmark.hex === null ? "#D9D9D9" : bookmark.hex, 
                }} 
            >
                {bookmark.backgroundimg !== null ? 
                    <View style={styles.backgroungImageContainer}>
                        <Animated.Image 
                            source={{ uri: `http://3.38.62.105${bookmark.backgroundimg}` }}
                            style={{
                                ...styles.backgroundImage,
                                opacity: backgroundImageValue,
                            }}
                            onLoadEnd={showBackgroundImage}
                        />
                    </View>
                    :
                    null
                }
                <View style={styles.bookmarkContentsBook}>
                    <TouchableOpacity 
                        activeOpacity={1}
                        style={{ flexDirection: "row" }}
                        onPress={() => navigation.push('BookProfile', {
                            bookId: bookmark.book_id, 
                        })}
                    >
                        <View>
                            <Image 
                                source={ bookmark.book_cover !== null ? { uri: `http://3.38.62.105${bookmark.book_cover}`} : bookCover} 
                                style={styles.bookmarkContentsBookCover}
                            />
                        </View>
                        <View>
                            <Text style={styles.bookmarkContentsBookTitle}>{bookmark.book_title}</Text>
                            <Text style={styles.bookmarkContentsBookChapter}>{bookmark.chapter_title}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.bookmarkContentsTextBox}>
                    <Text 
                        style={styles.bookmarkContentsText}
                        numberOfLines={3} 
                        ellipsizeMode="tail"    
                    >
                        {bookmark.contents[0].join('')}
                    </Text>
                </View>
                <View style={styles.bookmarkContentsWatermark}>
                    <Pressable
                        onPress={() => navigation.push('OtherProfile', { userTag: bookmark.user_tag, })}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Text style={{ fontSize: regWidth * 11, fontWeight: "700", }} >{`@${bookmark.user_tag}`}</Text>
                    </Pressable>
                    <Text style={{ fontSize: regWidth * 11, fontWeight: "500", }} >{bookmark.created_date.split('T')[0]}</Text>
                </View>
            </View>
            
        </View>
    );

}

const styles = StyleSheet.create({
    bookmarkContentsScrollBox: {
        // flex: 1,
        height: SCREEN_WIDTH * 0.5,
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
    },
    bookmarkContentsBookCover: {
        // flex: 1,
        // backgroundColor: "red",
        width: regWidth * 40,
        height: regWidth * 40,
        resizeMode: "contain",
    },
    bookmarkContentsBook: {
        // backgroundColor: "pink",
        flex: 0.6,
        flexDirection: "row", 
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookmarkContentsBookTitle: {
        fontWeight: "700",
        fontSize: regWidth * 15,
        marginTop: regHeight * 8,
    },
    bookmarkContentsBookChapter: {
        fontWeight: "400",
        fontSize: regWidth * 10,
    },
    bookmarkContentsBookChapterInput: {
        fontWeight: "400",
        fontSize: 15,
    },
    bookmarkContentsTextBox: {
        // backgroundColor: "pink",
        flex: 1.5,
        marginTop: regHeight * 8,
        justifyContent: "center", 
    },
    bookmarkContentsText: {
        fontWeight: "500",
        // fontSize: 16,
        fontSize: regWidth * 16,
        lineHeight: regWidth * 28,
    },
    bookmarkContentsInput: {
        // backgroundColor: "pink",
        flex: 4,
        marginTop: 8,
        justifyContent: "center",
        textAlignVertical: "top",
    },
    bookmarkContentsWatermark: {
        // backgroundColor: "blue",
        flex: 0.3,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    backgroungImageContainer: {
        position: "absolute",
        width: SCREEN_WIDTH - regWidth * 26,
        height: SCREEN_WIDTH * 0.5 - regWidth * 10,
        borderRadius: 2,
        backgroundColor: "#D9D9D9", 
        // zIndex: 10,
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        opacity: 0.2,
        resizeMode: "cover",
    },
})

const tagsStyles = {
    div: {
        // color: 'green',
        fontWeight: "500",
        fontSize: 16,
    },
    span: {
        // color: 'green',
        fontWeight: "500",
        fontSize: 16,
    },
};

export default BookmarkList;