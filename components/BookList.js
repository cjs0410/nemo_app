import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import blankBookCover from '../assets/images/blankBookImage.png';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const BookList = (props) => {
    const book = props.book;
    const bookCoverValue = useRef(new Animated.Value(0)).current;

    const showBookCover = () => {
        Animated.timing(bookCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return(
        <View 
            style={{...styles.resultList}} 
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Animated.Image 
                    source={book.book_cover !== null ? { uri: book.book_cover } : blankBookCover}
                    style={{
                        ...styles.bookCoverImage,
                        opacity: bookCoverValue,
                    }}
                    onLoadEnd={showBookCover}
                />
                <View style={{ width: "73%", marginHorizontal: regWidth * 12,}}>
                    <Text 
                        style={{ 
                            fontSize: regWidth * 20, 
                            fontFamily: "NotoSansKR-Bold",
                            includeFontPadding: false,
                        }}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                    >
                        {book.book_title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Text 
                            style={{ 
                                ...styles.BookInfoText, 
                                marginRight: regWidth * 3,
                                maxWidth: "50%",
                            }}
                            numberOfLines={1}
                            ellipsizeMode='tail'
                        >
                            {book.book_author}
                        </Text>
                        <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
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
        width: regWidth * 50,
        height: regWidth * 50,
        resizeMode: "contain",
    },
    BookInfoText: {
        fontSize: regWidth * 11, 
        fontFamily: "NotoSansKR-Regular",
        color: "#606060",
        includeFontPadding: false,
    },

})

export default BookList;