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

const BookmarkList = (props) => {
    const bookmark = props.bookmark;
    const date = bookmark.created_date.split('T')[0].split('-');
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
                {/* {bookmark.backgroundimg !== null ? 
                    <View style={styles.backgroungImageContainer}>
                        <Animated.Image 
                            source={{ uri: bookmark.backgroundimg }}
                            style={{
                                ...styles.backgroundImage,
                                opacity: backgroundImageValue,
                            }}
                            onLoadEnd={showBackgroundImage}
                        />
                    </View>
                    :
                    null
                } */}
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
                                source={ bookmark.book_cover !== null ? { uri: bookmark.book_cover } : blankBookCover} 
                                style={styles.bookmarkContentsBookCover}
                            />
                        </View>
                        <View style={{ justifyContent: "center" }}>
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
                        <Text style={{ fontSize: regWidth * 11, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }} >{`@${bookmark.user_tag}`}</Text>
                    </Pressable>
                    <Text style={{ fontSize: regWidth * 11, fontFamily: "NotoSansKR-Medium", color: "#606060", includeFontPadding: false, }} >{date.join('. ')}</Text>
                </View>
            </View>
            
        </View>
    );

}

const UnTouchableBookmarkList = (props) => {
    const bookmark = props.bookmark;
    const navigation = props.navigation;
    const { bookmarked, } = useSelector(bookmarkSelector);
    const backgroundImageValue = useRef(new Animated.Value(0)).current;
    const date = bookmark.created_date.split('T')[0].split('-');


    const showBackgroundImage = () => {
        Animated.timing(backgroundImageValue, {
            toValue: 0.2,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return (
        <View style={styles.bookmarkContentsScrollBox}>
            <MaskedView
                // style={styles.bookmarkContentsBox}
                style={{
                    flex:1,
                }}
                maskElement={
                    <LinearGradient 
                        style={{
                            flex: 1, 
                        }} 
                        start={{x: 0, y: 0}} 
                        end={{x: 1, y: 0}}
                        colors={[
                            // bookmark.hex === null ? "#D9D9D9" : `${bookmark.hex}`,
                            // bookmark.hex === null ? "#D9D9D9" : `${bookmark.hex}`,
                            "white",
                            "white",
                            "white",
                            // 'rgba(255, 255, 255, 1)',
                            'transparent'
                        ]}
                    />
                }
            >
                <View 
                    style={{
                        ...styles.bookmarkContentsBox,
                        backgroundColor: bookmark.hex === null ? "#D9D9D9" : `${bookmark.hex}`,
                    }}
                >
                    <View style={styles.bookmarkContentsBook}>
                        <View 
                            style={{ flexDirection: "row" }}
                        >
                            <View>
                                <Image 
                                    source={ bookmark.book_cover !== null ? { uri: bookmark.book_cover } : blankBookCover} 
                                    style={styles.bookmarkContentsBookCover}
                                />
                            </View>
                            <View>
                                <Text style={styles.bookmarkContentsBookTitle}>{bookmark.book_title}</Text>
                                <Text style={styles.bookmarkContentsBookChapter}>{bookmark.chapter_title}</Text>
                            </View>
                        </View>
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
                        <Text style={{ fontSize: regWidth * 11, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }} >{`@${bookmark.user_tag}`}</Text>
                        <Text style={{ fontSize: regWidth * 11, color: "#606060", fontFamily: "NotoSansKR-Medium", includeFontPadding: false, }} >{date.join('. ')}</Text>
                    </View>
                </View>
            </MaskedView>
            
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
        includeFontPadding: false,
    },
    bookmarkContentsBookChapterInput: {
        fontWeight: "400",
        fontSize: 15,
    },
    bookmarkContentsTextBox: {
        // backgroundColor: "pink",
        // flex: 1.5,
        height: regWidth * 100,
        // marginTop: regHeight * 8,
        justifyContent: "center", 
    },
    bookmarkContentsText: {
        // fontWeight: "500",
        fontSize: regWidth * 16,
        lineHeight: regWidth * 28,
        fontFamily: "NotoSansKR-Medium",
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
        height: regWidth * 24,
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: regWidth * 4,
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

export {UnTouchableBookmarkList, };
export default BookmarkList;