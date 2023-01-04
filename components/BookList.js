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
                <Image 
                    source={book.book_cover !== null ? { uri: book.book_cover } : blankBookCover}
                    style={{
                        ...styles.bookCoverImage,
                        // opacity: bookCoverValue,
                    }}
                    // onLoadEnd={showBookCover}
                />
                <View style={{ width: "85.5%", }}>
                    <Text 
                        style={{ 
                            fontSize: regWidth * 20, 
                            fontWeight: "700", 
                            marginHorizontal: 12,
                            lineHeight: regWidth * 28,
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
                            style={{ ...styles.BookInfoText, width: "40%", marginHorizontal: regWidth*3, }}
                            // numberOfLines={1}
                            // ellipsizeMode="tail"
                        >
                            333 Nemos
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
        fontSize: regWidth*11, 
        fontWeight: "500", 
        marginHorizontal: regWidth*12, 
        color: "#606060",
        
    },

})

export default BookList;