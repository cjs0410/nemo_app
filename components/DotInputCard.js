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

const DotInputCard = ({ color, selectedBook, onChangeChapter, whatChapter, onChangeFront, frontContent, watermark, setModalVisible, backgroundImage, contentsByLine, setContentsByLine, setContentsByCard, ocrLoading, setShowMenu, align, }) => {
    const [whatBook, setWhatBook] = useState('');
    const [bookList, setBookList] = useState(null);
    const debounceVal = useDebounce(whatBook);
    const editorRef = useRef();
    const [inputHeight, setInputHeight] = useState(0);
    const [inputContainerHeight, setInputContainerHeight] = useState(0);
    const [extraHeight, setExtraHeight] = useState(0);
    const [lineNum, setLineNum] = useState(0);
    const [isFocus, setIsFocus] = useState(false);
    const [cardFlag, setCardFlag] = useState([]);

    useEffect(() => {
        fetchBook();
    }, [debounceVal]);
    useEffect(() => {
        console.log(selectedBook);
    }, [selectedBook]);

    useEffect(() => {
        const cardNum = Math.floor(lineNum / 9);
        let copy = [];

        for ( let i = 0; i < cardNum; i++) {
            copy = [...copy, 1]
        }
        setCardFlag(copy);
    }, [lineNum]);

    // useEffect(() => {
    //     console.log(align);
    // }, [align]);

    // useEffect(() => {
    //     if (contentsByLine.length > 9) {
    //         setExtraHeight(regHeight * 28 * (contentsByLine.length - 9));
    //     }
        
    // }, [contentsByLine]);


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

    // const selectBook = (selected) => {
    //     setSelectedBook(selected);
    //     setBookTitle(selected.book_title);
    //     console.log(selected);
    // }

    // const deleteBook = () => {
    //     setBookList(null);
    //     setSelectedBook(null);
    //     setWhatBook('');
    // }

    const textInputLineNum = (e) => {
        // setLineNum(e.nativeEvent.lines.length);
        // console.log(e.nativeEvent.lines);
        const lines = e.nativeEvent.lines;
        // console.log(lines);
        setContentsByLine(
            lines.map((line) => line.text)
        )
        // console.log(e.nativeEvent.lines.length, frontContent[frontContent.length-1]);
    }

    return (
        <View
            style={{
                ...styles.bookmarkContentsScrollBox, 
                height: SCREEN_WIDTH + extraHeight,
            }}
            // onLayout={(e) => console.log(e.nativeEvent)}
        >
            <View 
                style={{
                    ...styles.bookmarkContentsBox,  
                    backgroundColor: color === null ? "#D9D9D9" : color, 
                }}
            >
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

                <View 
                    style={{
                        ...styles.bookmarkContentsBook,
                        // borderStyle: 'dashed', 
                        // borderWidth:  bookList !== null ? 0 : 0.5,
                    }}
                    
                >
                    {selectedBook === null ? 
                        <>
                            <Feather name="search" size={20} color="grey" />
                            <ScrollView
                                scrollEnabled={false}
                            >
                                <TextInput 
                                    style={{ fontSize: 18, }}
                                    placeholder="Choose your book"
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
                                    placeholder="Write Chapter"
                                    style={styles.bookmarkContentsBookChapterInput}
                                    onChangeText={onChangeChapter}
                                    value={whatChapter}
                                    maxLength={regWidth * 22}
                                />
                            </View>
                        </View>
                    }
                    {bookList !== null ? 
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
                                    // onPress={() => selectBook(book)}
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
                        // borderWidth: isFocus ? 0.5 : 0,
                        borderWidth: 0.5,
                        borderStyle: 'dashed',
                        // backgroundColor: "green",
                        height: regHeight * 284 + extraHeight,
                    }} 
                    onLayout={(e) => console.log(e.nativeEvent)}
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
                                    // borderStyle: 'dashed',
                                    // borderWidth: 0.5,
                                    // height: regHeight * 284 + extraHeight,

                                }} 
                                placeholder="Write anything from your reading"
                                multiline={true}
                                onChangeText={onChangeFront}
                                onFocus={() => {
                                    setIsFocus(true);
                                    setShowMenu(true);
                                }}
                                onBlur={() => {
                                    setIsFocus(false);
                                    setShowMenu(false);
                                }}
                                value={frontContent}
                                scrollEnabled="false"
                                onContentSizeChange={(e) => {
                                    console.log(e.nativeEvent);
                                    const contentHeight = e.nativeEvent.contentSize.height;
                                    const lineNum = parseInt(contentHeight / (regHeight * 28));
                                    setLineNum(lineNum);
                                    // if (regHeight * 284 < contentHeight + regHeight * 28) {
                                    //     setExtraHeight(contentHeight - regHeight * 284)
                                    // }
                                    if (lineNum > 9) {
                                        setExtraHeight(regHeight * 28 * (lineNum - 9));
                                    } else {
                                        setExtraHeight(0);
                                    }
                                }}
                                // textAlign={align === "center" ? "center" : "left"}
                            />
                            {cardFlag.map((flag, index) => (
                                <View
                                    style={{
                                        position: "absolute",
                                        width: "100%",
                                        borderStyle: 'dashed',
                                        borderWidth: 0.3,
                                        // backgroundColor: "black",
                                        // top: regHeight * 28 * 9 + regHeight * 12,
                                        top: regHeight * 28 * 9 * (index + 1) + regHeight * 4,
                                    }}
                                    key={index}
                                />
                            ))}

                            <ScrollView
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
                            </ScrollView>
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

export default DotInputCard;


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
        // flex: 0.6,
        height: regHeight * 43,
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
        // flex: 4,
        height: regHeight * 284,
        marginTop: regHeight * 8,
        // justifyContent: "center",
        justifyContent: "flex-start",
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
        // flex: 0.3,
        height: regHeight * 21,
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