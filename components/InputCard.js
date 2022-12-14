import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, ActivityIndicator, Modal, } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankBookCover from '../assets/images/blankBookImage.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import RenderHtml from 'react-native-render-html';
import FastImage from 'react-native-fast-image'

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetBookmarks, addBookmark, deleteBookmark } from '../modules/bookmarks';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const InputCard = ({ color, setBookTitle, selectedBook, setSelectedBook, onChangeChapter, whatChapter,  watermark, setModalVisible, backgroundImage, setContentsByLine, ocrLoading, onChangeTotalContents, cardContents, totalContents, contentsByCard2, onNextCard, onKeyPress, inputRef, index, }) => {
    const [whatBook, setWhatBook] = useState('');
    const [bookList, setBookList] = useState(null);
    // const [selectedBook, setSelectedBook] = useState(null);
    const debounceVal = useDebounce(whatBook);
    const editorRef = useRef();
    const [inputHeight, setInputHeight] = useState(0);
    const [inputContainerHeight, setInputContainerHeight] = useState(0);
    const [extraHeight, setExtraHeight] = useState(SCREEN_WIDTH);
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        fetchBook();
    }, [debounceVal]);

    // useEffect(() => {
    //     console.log(align);
    // }, [align]);


    const onChangeWhatBook = (payload) => {
        setWhatBook(payload);
    }

    const fetchBook = async() => {
        if (debounceVal.length > 0) {
            try {
                await Api.post("/api/v3/book/select/", {
                    keyword: debounceVal,
                })
                .then((res) => {
                    // console.log(res.data);
                    setBookList(res.data);
                })
            } catch (err) {
                console.error(err);
            }
        }
    };

    const bookSearch = async() => {
        if (debounceVal.length > 0) {
            try {
                await Api.post("/api/v3/book/select/", {
                    keyword: debounceVal,
                })
                .then((res) => {
                    // console.log(res.data);
                    setBookList(res.data);
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    const selectBook = (selected) => {
        setSelectedBook(selected);
        setBookTitle(selected.book_title);
        console.log(selected);
    }

    const deleteBook = () => {
        setBookList(null);
        setSelectedBook(null);
        setWhatBook('');
    }

    const textInputLineNum = (e) => {
        // setLineNum(e.nativeEvent.lines.length);
        // console.log(e.nativeEvent.lines);
        const lines = e.nativeEvent.lines;
        setContentsByLine(
            lines.map((line) => line.text)
        )
        // console.log(e.nativeEvent.lines.length, frontContent[frontContent.length-1]);
    }

    return (
        <View
            style={{
                ...styles.bookmarkContentsScrollBox, 
                // height: extraHeight,
            }}
        >
            <View style={{
                ...styles.bookmarkContentsBox,  
                // backgroundColor: color
                backgroundColor: color === null ? "#D9D9D9" : color, 
            }}>
                {backgroundImage !== null ? 
                    <View style={styles.backgroungImageContainer}>
                        <Image 
                            source={{ uri: backgroundImage }}
                            style={styles.backgroundImage}
                        />
                    </View>
                    :
                    null
                }

                <View style={styles.bookmarkContentsBook}>
                    {selectedBook === null ? 
                        <>
                            <Feather name="search" size={20} color="grey" />
                            <ScrollView
                                scrollEnabled={false}
                            >
                                <TextInput 
                                    style={{ fontSize: 18, }}
                                    placeholder="책을 검색하세요"
                                    onChangeText={onChangeWhatBook}
                                    onSubmitEditing={bookSearch}
                                    value={whatBook}
                                    // multiline={true}
                                    // textAlign={align === "center" ? "center" : "left"}
                                />
                            </ScrollView>
                        </>
                        :
                        <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <View>
                                <Image 
                                    source={ selectedBook.book_cover !== null ? { uri: selectedBook.book_cover } : blankBookCover} 
                                    style={styles.bookmarkContentsBookCover} 
                                />
                            </View>
                            <View>
                                <Text 
                                    style={styles.bookmarkContentsBookTitle}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {selectedBook.book_title}
                                </Text>
                                <TextInput 
                                    placeholder="챕터를 입력하세요"
                                    style={styles.bookmarkContentsBookChapterInput}
                                    onChangeText={onChangeChapter}
                                    value={whatChapter}
                                    maxLength={regWidth * 22}
                                />
                            </View>
                        </View>
                    }
                    {bookList !== null && selectedBook === null ? 
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={deleteBook}
                        >
                            <Feather name="x" size={24} color="black" />
                        </TouchableOpacity>
                        :
                        null
                    }

                </View>
                {bookList !== null && selectedBook === null ? 
                    <>
                    {bookList.length === 0 ? 
                        <View style={{...styles.searchList, backgroundColor: color, }}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{
                                    ...styles.searchBlock,
                                    justifyContent: "center",
                                    paddingTop: 18,
                                }}
                                onPress={() => setModalVisible(true)}
                            >
                                <AntDesign name="pluscircleo" size={24} color="black" />
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "700", marginHorizontal: 12, }}>
                                        책 등록하기
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        :
                        <ScrollView
                        style={{...styles.searchList, backgroundColor: color, }}
                        showsVerticalScrollIndicator={false}
                        >
                            {bookList.map((book, index) => (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.searchBlock}
                                    onPress={() => selectBook(book)}
                                    key={index}
                                >
                                    <Image 
                                        source={ book.book_cover !== null ? { uri: book.book_cover } : blankBookCover} 
                                        style={styles.bookmarkContentsBookCover} 
                                    />
                                    <View>
                                        <Text style={{ fontSize: 16, fontWeight: "700", }}>
                                            {book.book_title}
                                        </Text>
                                        <Text style={{ fontSize: 10, fontWeight: "400", }}>
                                            {book.book_author}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{
                                    ...styles.searchBlock,
                                    justifyContent: "center",
                                    paddingTop: 18,
                                }}
                                onPress={() => setModalVisible(true)}
                            >
                                <AntDesign name="pluscircleo" size={24} color="black" />
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "700", marginHorizontal: 12, }}>
                                        새로운 책 등록하기
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    }
                    </>
                    :
                    null
                }
                <View 
                    style={{
                        ...styles.bookmarkContentsInput,
                        borderWidth: isFocus ? 0.5 : 0,
                    }} 
                >
                    {ocrLoading ? 
                        <ActivityIndicator 
                            color="white" 
                            style={{marginTop: 10}} 
                            size="large"
                        />
                        : 
                        <>
                        {/* text input만 사용하는 코드(가변) */}
                        {/* <ScrollView
                            scrollEnabled={false}
                        > */}
                            <TextInput 
                                style={{         
                                    fontWeight: "500",
                                    fontSize: regWidth * 16,
                                    lineHeight: regWidth * 28,
                                    // paddingHorizontal: 8,
                                    // backgroundColor: "pink",
                                    // width: "100%",
                                    // height: "100%",
                                    // textAlign: align === "center" ? "center" : "left",
                                    // alignSelf: align === "center" ? "center" : "flex-start",
                                }} 
                                placeholder="북마크를 입력하세요"
                                multiline={true}
                                numberOfLines={9}
                                scrollEnabled="false"
                                onChangeText={(text) => onChangeTotalContents(text, index)}
                                onSubmitEditing={() => onNextCard(index)}
                                onKeyPress={(e) => onKeyPress(e, index)}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                // value={cardContents}
                                // value={contentsByCard2[index].join('')}
                                value={totalContents[index]}
                                // defaultValue={contentsByCard2[index].join('')}
                                ref={el => inputRef.current[index] = el}
                                // textAlign={align === "center" ? "center" : "left"}
                            />
                            {/* <ScrollView
                                style={{
                                    position: "absolute",
                                    // backgroundColor: "pink",
                                    width: "100%",
                                    height: "100%",
                                    zIndex: -10,
                                    opacity: 0,
                                }}
                                scrollEnabled={false}
                            >
                                <Text
                                    style={{         
                                        fontWeight: "500",
                                        color: "blue",
                                        fontSize: regWidth * 16,
                                        lineHeight: 28,
                                    }} 
                                    onTextLayout={textInputLineNum}
                                >
                                    {frontContent}
                                </Text>
                            </ScrollView> */}
                        {/* </ScrollView> */}
                        </>
                    }


                </View>
                <View style={styles.postContentsWatermark}>
                    <Text style={{ fontSize: regWidth * 11, fontWeight: "700", }} >{`@${watermark}`}</Text>
                </View>
            </View>
        </View>
    )
}

function useDebounce(value, delay = 500) {
    const [debounceVal, setDebounceVal] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceVal(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debounceVal;
}

export default InputCard;

const styles = StyleSheet.create({
    bookmarkContentsScrollBox: {
        // flex: 1,
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
        backgroundColor: "white",
    },
    bookmarkContentsBox: {
        flex: 1,
        // backgroundColor: "#D9D9D9",
        marginVertical: regWidth * 13,
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
        marginTop: regWidth * 8,
        width: regWidth * 250,
    },
    bookmarkContentsBookChapter: {
        fontWeight: "400",
        fontSize: regWidth * 10,
        width: regWidth * 230,
    },
    bookmarkContentsBookChapterInput: {
        fontWeight: "400",
        fontSize: regWidth * 15,
    },
    bookmarkContentsTextBox: {
        // backgroundColor: "pink",
        flex: 4,
        marginTop: regHeight * 8,
        justifyContent: "center", 
    },
    bookmarkContentsText: {
        fontWeight: "500",
        // fontSize: SCREEN_WIDTH * 0.041,
        fontSize: regWidth * 16,
        lineHeight: regWidth * 28,
    },
    bookmarkContentsInput: {
        // backgroundColor: "pink",
        flex: 4,
        marginTop: regWidth * 8,
        justifyContent: "center",
        // textAlignVertical: "top",
        
    },
    richTextEditorStyle: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,

        fontWeight: "500",
        fontSize: 16,
        lineHeight: 28,
    },
    richTextToolbarStyle: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: "10%"
    },
    postContentsWatermark: {
        // backgroundColor: "blue",
        flex: 0.3,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    searchList: {
        backgroundColor: "#D9D9D9",
        position: "absolute",
        width: SCREEN_WIDTH - regWidth * 26,
        height: "91%",
        marginTop: "12%",
        // height: SCREEN_WIDTH - 26 - 55,
        // marginTop: 55,
        zIndex: 10,
    },
    searchBlock: {
        borderTopWidth: 0.5, 
        flexDirection: "row", 
        alignItems: "center", 
        paddingVertical: regHeight * 6,
        paddingHorizontal: regWidth * 8,
    },
    backgroungImageContainer: {
        position: "absolute",
        width: SCREEN_WIDTH - regWidth * 26,
        height: SCREEN_WIDTH - regWidth * 26,
        // width: 300,
        // height: 300,
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
