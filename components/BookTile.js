import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import blankBookCover from '../assets/images/blankBookImage.png';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const BookTile = (props) => {
    const book = props.book;
    const bookCoverValue = useRef(new Animated.Value(0)).current;

    const showBookCover = () => {
        Animated.timing(bookCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return (
        <View style={styles.resultList}>
            <View style={{ alignItems: "center", }}>
                <Animated.Image 
                    source={book.book_cover !== null ? { uri: book.book_cover } : blankBookCover}
                    style={{
                        ...styles.bookCoverImage,
                        opacity: bookCoverValue,
                    }}
                    onLoadEnd={showBookCover}
                />
                <View 
                    style={{ 
                        width: regWidth * 165, 
                        marginTop: regHeight * 8,
                    }}
                >
                    <Text 
                        style={{ 
                            fontSize: regWidth * 15, 
                            fontFamily: "NotoSansKR-Bold",
                            lineHeight: regWidth * 18,
                        }}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                    >
                        {book.book_title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", width: "70%", }}>
                        <Text 
                            style={{ 
                                ...styles.BookInfoText, marginRight: regWidth*3
                            }}
                            numberOfLines={1}
                            ellipsizeMode='tail'
                        >
                            {book.book_author}
                        </Text>
                        <Entypo name="dot-single" size={16} color="#808080" />
                        <Text 
                            style={{ ...styles.BookInfoText, marginHorizontal: regWidth*3, }}
                            // numberOfLines={1}
                            // ellipsizeMode="tail"
                        >
                            {`${book.nemos} Nemos`}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    resultList: {
        // borderBottomWidth: 0.5,
        // borderBottomColor: "#CBCBCB",
        flexDirection: "row",
        // alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: regWidth * 12,
        paddingVertical: regHeight * 12,
    },
    bookCoverImage: {
        width: regWidth * 165,
        height: regWidth * 165,
        resizeMode: "contain",
    },
    BookInfoText: {
        fontSize: regWidth*10, 
        fontFamily: "NotoSansKR-Medium",
        color: colors.textLight,
        
    },

})

export default BookTile;