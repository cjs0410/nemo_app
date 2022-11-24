import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, ActivityIndicator, Modal, } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
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

const Card = (props) => {
    const dispatch = useDispatch();
    const navigation = props.navigation;
    const { bookmarked, } = useSelector(bookmarkSelector);
    const [isBookmark, setIsBookmark] = useState(false);
    const bookmark = props.bookmark;
    // const nemos = props.bookmark.nemos;
    // const nemo = props.nemo;
    const contents = props.contents;
    const index = props.index;
    const [bookmarking, setBookmarking] = useState(bookmark.bookmarking);
    const [watermark, setWatermark] = useState('');
    const backgroundImageValue = useRef(new Animated.Value(0)).current;
    const bookCoverValue = useRef(new Animated.Value(0)).current;

    const [lineList, setLineList] = useState([]);
    const [fontSize, setFontSize] = useState(16);

    // useEffect(() => {
    //     fetchBookmarking();
    // }, [bookmarked])
    useEffect(() => {
        fetchWatermark();
        // console.log(props.contents);
    }, [])

    useEffect(() => {
        if (lineList.length === contents.length && lineList.indexOf(2) !== -1) {
            setFontSize(fontSize - 1);
        }
    }, [lineList])

    const onReverse = () => {
        setIsReverse(!isReverse);
    }

    const onBookmark = async() => {
        try {
            await Api.post("/api/v2/bookmark/bookmarking/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                if (bookmarked.findIndex(marked => Number(marked.bookmark_id) === Number(bookmark.bookmark_id)) === -1) {
                    dispatch(addBookmark(bookmark));
                } else {
                    dispatch(deleteBookmark(bookmark));
                }
            })
        } catch (err) {
            console.error(err);
        }
        // dispatch(resetBookmarks());
    }
    const fetchWatermark = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setWatermark(jwt_decode(accessToken).watermark);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchBookmarking = async() => {
        try {
            await Api.post("/api/v2/bookmark/bookmarking_count/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setBookmarking(res.data.bookmarking);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const showBackgroundImage = () => {
        Animated.timing(backgroundImageValue, {
            toValue: 0.2,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const showBookCover = () => {
        Animated.timing(bookCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const textLineNum = (e) => {
        // console.log(e.nativeEvent.lines.length);
        const currentList = e.nativeEvent.lines.length;
        setLineList(
            [...lineList, currentList]
        );
        // console.log(lineList);

    }



    return (
        <View style={styles.postContentsScrollBox}>
            <View 
                style={{
                    ...styles.postContentsBox, 
                    // backgroundColor: bookmark.hex, 
                    backgroundColor: bookmark.hex === null ? "#D9D9D9" : bookmark.hex, 
                }} 
            >
                {bookmark.backgroundimg !== null ? 
                
                    <View style={styles.backgroungImageContainer}>
                        <Animated.Image 
                            source={{ uri: bookmark.backgroundimg }}
                            style={{
                                ...styles.backgroundImage,
                                opacity: backgroundImageValue,
                            }}
                            onLoadEnd={showBackgroundImage}
                            // onLoadEnd={() => console.log("end!")}
                        />
                    </View>
                    :
                    null
                }
                <View style={{
                    ...styles.postContentsBook,
                }}>
                    <TouchableOpacity 
                        activeOpacity={1}
                        style={{ flexDirection: "row" }}
                        onPress={() => navigation.push('BookProfile', {
                            bookId: bookmark.book_id, 
                        })}
                    >
                        <View>
                            <Animated.Image 
                                source={ bookmark.book_cover !== null ? { uri: bookmark.book_cover} : bookCover} 
                                style={{
                                    ...styles.postContentsBookCover,
                                    opacity: bookCoverValue,
                                }}
                                onLoadEnd={showBookCover}
                            />
                        </View>
                        <View>
                            <Text style={styles.postContentsBookTitle}>{bookmark.book_title}</Text>
                            <Text style={styles.postContentsBookChapter}>{bookmark.chapter_title}</Text>
                        </View>
                    </TouchableOpacity>
                    {/* <Pressable 
                        style={{ alignItems: "center", }}
                        activeOpacity={1}
                        onPress={onBookmark}
                        disabled={bookmark.watermark === watermark ? true : false}
                    >
                        {bookmark.watermark === watermark ? 
                            <FontAwesome 
                                name="bookmark"
                                size={30} 
                                color="black"
                            />
                            :
                            <FontAwesome 
                                name={!(bookmarked.findIndex(marked => Number(marked.bookmark_id) === Number(bookmark.bookmark_id)) === -1) ? "bookmark" : "bookmark-o"} 
                                size={30} 
                                color={!(bookmarked.findIndex(marked => Number(marked.bookmark_id) === Number(bookmark.bookmark_id)) === -1) ? "red" : "black"} 
                            />
                        }

                        <Text style={{fontSize: 13, fontWeight: "500", }}>
                            {bookmarking}
                        </Text>
                    </Pressable> */}
                </View>
                <View style={styles.postContentsTextBox}>
                    {/* <RenderHtml 
                        // style={styles.postContentsTextBox} 
                        contentWidth={SCREEN_WIDTH}
                        source={{ html: nemo.contents }}
                        tagsStyles={tagsStyles}
                    /> */}
                    {/* <Text style={styles.postContentsText}>
                        {contents.join()}
                    </Text> */}
                    {contents.map((line, index) => (
                        <Text 
                            style={{
                                ...styles.postContentsText,
                                fontSize: regWidth * fontSize,
                            }} 
                            onTextLayout={textLineNum}
                            key={index}
                        >
                            {line.replace(/\n/g, '')}
                        </Text> 
                    ))}
                </View>
                <View style={styles.postContentsWatermark}>
                    <Pressable
                        onPress={() => navigation.push('OtherProfile', { userTag: bookmark.user_tag, })}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Text style={{ fontSize: regWidth * 11, fontWeight: "700", }} >{`@${bookmark.user_tag}`}</Text>
                    </Pressable>
                </View>
            </View>
            
        </View>
    );
}

const CardPreview = (props) => {
    const { bookTitle, whatChapter, bookCover, contents, hex, backgroundImage, watermark, index } = props;
    useEffect(() => {
        // console.log(contents);
    }, [])

    return (
        <View style={styles.postContentsScrollBox}>
            <View 
                style={{
                    ...styles.postContentsBox, 
                    // backgroundColor: bookmark.hex, 
                    backgroundColor: hex === null ? "#D9D9D9" : hex, 
                }} 
            >
                {backgroundImage !== null ? 
                
                    <View style={styles.backgroungImageContainer}>
                        <Image 
                            source={{ uri: backgroundImage }}
                            style={styles.backgroundImage}
                            // onLoad={() => console.log("loading")}
                            // onLoadEnd={() => console.log("end!")}
                        />
                    </View>
                    :
                    null
                }
                <View style={{
                    ...styles.postContentsBook,
                    opacity: (index === 0) ? 1 : 0
                }}>
                    <TouchableOpacity 
                        activeOpacity={1}
                        style={{ flexDirection: "row" }}
                    >
                        <View>
                            <Image 
                                source={{ uri: bookCover }} 
                                // source={ selectedBook.book_cover !== null ? { uri: selectedBook.book_cover } : bookCover} 
                                style={styles.postContentsBookCover}
                            />
                        </View>
                        <View>
                            <Text style={styles.postContentsBookTitle}>{bookTitle}</Text>
                            <Text style={styles.postContentsBookChapter}>{whatChapter}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.postContentsTextBox}>
                    {/* <Text style={styles.postContentsText}>
                        {contents.join('')}
                    </Text> */}
                    {contents.map((line, index) => (
                        <Text style={styles.postContentsText} key={index}>
                            {line.replace(/\n/g, '')}
                        </Text> 
                    ))}
                </View>
                {/* <RenderHtml 
                    style={styles.postContentsTextBox} 
                    contentWidth={SCREEN_WIDTH}
                    source={{ html: nemo.contents }}
                    // tagsStyles={tagsStyles}
                /> */}
                <View style={styles.postContentsWatermark}>
                    <Text style={{ fontSize: regWidth * 11, fontWeight: "700", }} >{`@${watermark}`}</Text>
                </View>
            </View>
            
        </View>
    );
}

const BlankCardFront = ({ color, setBookTitle, selectedBook, setSelectedBook, onChangeChapter, onChangeFront, watermark, setModalVisible, richText, setIsFocused, setRichText, setFocusNum, setFirstContents, backgroundImage, }) => {
    const [whatBook, setWhatBook] = useState('');
    const [bookList, setBookList] = useState(null);
    // const [selectedBook, setSelectedBook] = useState(null);
    const debounceVal = useDebounce(whatBook);
    const editorRef = useRef();

    useEffect(() => {
        fetchBook();
    }, [debounceVal]);

    // useEffect(() => {
    //     editorRef.current.setFontSize(16);
    // }, []);

    // useEffect(() => {
    //     setRichText([
    //         ...richText,
    //         editorRef,
    //     ])
    //     console.log(editorRef);
    // }, []);

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
                    console.log(res.data);
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
                    console.log(res.data);
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
        console.log(selected.book_id);
    }

    const deleteBook = () => {
        setBookList(null);
        setSelectedBook(null);
        setWhatBook('');
    }

    return (
        <Pressable
            style={{...styles.postContentsScrollBox, }}
            onPress={() => {
                editorRef.current.dismissKeyboard();
                // setIsFocused(false);
            }}
        >
            <View style={{
                ...styles.postContentsBox,  
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

                <View style={styles.postContentsBook}>
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
                                />
                            </ScrollView>
                        </>
                        :
                        <View style={{ flexDirection: "row" }}>
                            <View>
                                <Image 
                                    source={ selectedBook.book_cover !== null ? { uri: selectedBook.book_cover } : bookCover} 
                                    style={styles.postContentsBookCover} 
                                />
                            </View>
                            <View>
                                <Text style={styles.postContentsBookTitle}>{selectedBook.book_title}</Text>
                                <TextInput 
                                    placeholder="챕터를 입력하세요"
                                    style={styles.postContentsBookChapterInput}
                                    onChangeText={onChangeChapter}
                                />
                            </View>
                        </View>
                    }
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={deleteBook}
                    >
                        <Feather name="x" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                {bookList !== null && selectedBook === null ? 
                    <>
                    {bookList.length === 0 ? 
                        <View style={{...styles.searchList, backgroundColor: color, }}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{...styles.searchBlock, justifyContent: "center", }}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={{color: "green", fontSize: 20, fontWeight: "700", }}>
                                    책 등록하기
                                </Text>
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
                                        source={ book.book_cover !== null ? { uri: book.book_cover} : bookCover} 
                                        style={styles.postContentsBookCover} 
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
                        </ScrollView>
                    }
                    

                    </>
                    :
                    null
                }
                <View 
                    style={styles.postContentsInput} 
                >
                    {/* text input만 사용하는 코드(가변) */}
                    {/* <ScrollView
                        scrollEnabled={false}
                    > */}
                        <TextInput 
                            style={{         
                                fontWeight: "500",
                                // fontSize: SCREEN_0.041,
                                fontSize: regWidth * 16,
                                lineHeight: 28,
                                backgroundColor: "yellow"
                            }} 
                            placeholder="북마크를 입력하세요 (최대 200자)"
                            multiline={true}
                            // maxLength={200}
                            onChangeText={onChangeFront}
                        />
                    {/* </ScrollView> */}

                    {/* rich text editor 넣는 코드 */}
                    {/* <View 
                        style={{flexDirection: "column-reverse"}}
                    >
                        <RichEditor
                            ref={editorRef}
                            onChange={ descriptionText => {
                                setFirstContents(descriptionText);
                            }}
                            placeholder="북마크를 입력하세요 (최대 200자)"
                            androidHardwareAccelerationDisabled={true}
                            editorStyle={{
                                backgroundColor: '(0, 0, 0, 0.5)',
                                contentCSSText: `font-size: ${SCREEN_0.04}px;`,
                            }}
                            
                            style={styles.richTextEditorStyle}
                            initialHeight={250}
                        />
                        <RichToolbar
                            editor={editorRef}
                            selectedIconTint="#873c1e"
                            iconTint="#312921"
                            actions={[
                                actions.setBold,
                                actions.setStrikethrough,
                                actions.setUnderline,
                                actions.alignLeft,
                                actions.alignCenter,
                                actions.alignRight,
                                actions.keyboard,
                            ]}
                            style={{...styles.richTextToolbarStyle, backgroundColor: "color", }}
                        />
                    </View> */}
                </View>
                <View style={styles.postContentsWatermark}>
                    <Text style={{ fontSize: 11, fontWeight: "700", }} >{`@${watermark}`}</Text>
                </View>
            </View>
        </Pressable>
    )
}

const BlankCardChangable = ({ color, setBookTitle, selectedBook, setSelectedBook, onChangeChapter, whatChapter, onChangeFront, frontContent, watermark, setModalVisible, backgroundImage, setLineNum, contentsByLine, setContentsByLine, setContentsByCard, ocrLoading, }) => {
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

    // const textInputHeight = (e) => {
    //     console.log(e.nativeEvent.lines.length);
    //     // console.log(SCREEN_0.041);
    //     // const newHeight = e.nativeEvent.layout.height;

    //     // console.log(newHeight, inputContainerHeight);

    //     // setInputHeight(newHeight);
    //     // if ((inputContainerHeight !== 0) && ((newHeight + 28) > inputContainerHeight)) {
    //     //     console.log("over!");
    //     //     setExtraHeight(extraHeight + 28)
    //     // }
    // }
    // const textInputContainterHeight = (e) => {
    //     // console.log(e.nativeEvent.layout);
    //     setInputContainerHeight(e.nativeEvent.layout.height);
    // }

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
                ...styles.postContentsScrollBox, 
                // height: extraHeight,
            }}
        >
            <View style={{
                ...styles.postContentsBox,  
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

                <View style={styles.postContentsBook}>
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
                                />
                            </ScrollView>
                        </>
                        :
                        <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <View>
                                <Image 
                                    source={ selectedBook.book_cover !== null ? { uri: selectedBook.book_cover } : bookCover} 
                                    style={styles.postContentsBookCover} 
                                />
                            </View>
                            <View>
                                <Text style={styles.postContentsBookTitle}>{selectedBook.book_title}</Text>
                                <TextInput 
                                    placeholder="챕터를 입력하세요"
                                    style={styles.postContentsBookChapterInput}
                                    onChangeText={onChangeChapter}
                                    value={whatChapter}
                                />
                            </View>
                        </View>
                    }
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={deleteBook}
                    >
                        <Feather name="x" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                {bookList !== null && selectedBook === null ? 
                    <>
                    {bookList.length === 0 ? 
                        <View style={{...styles.searchList, backgroundColor: color, }}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{...styles.searchBlock, justifyContent: "center", }}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={{color: "green", fontSize: 20, fontWeight: "700", }}>
                                    책 등록하기
                                </Text>
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
                                        source={ book.book_cover !== null ? { uri: book.book_cover } : bookCover} 
                                        style={styles.postContentsBookCover} 
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
                        </ScrollView>
                    }
                    </>
                    :
                    null
                }
                <View 
                    style={{
                        ...styles.postContentsInput,
                        borderWidth: isFocus ? 0.5 : 0
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
                                    // fontSize: SCREEN_0.041,
                                    fontSize: regWidth * 16,
                                    lineHeight: regWidth * 28,
                                    // paddingHorizontal: 8,
                                }} 
                                placeholder="북마크를 입력하세요"
                                multiline={true}
                                onChangeText={onChangeFront}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                value={frontContent}
                            />
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

const AddBlankCardBack = ({ color, backgroundImage}) => {
    return (
        <View style={{...styles.postContentsScrollBox, height: 76,}}>
            <View style={{
                ...styles.postContentsBox, 
                justifyContent: "center", 
                alignItems: "center", 
                backgroundColor: color === null ? "#D9D9D9" : color, 
            }}>
                {backgroundImage !== null ? 
                    <View style={{...styles.backgroungImageContainer, height: 50,}}>
                        <Image 
                            source={{ uri: backgroundImage }}
                            style={styles.backgroundImage}
                        />
                    </View>
                    :
                    null
                }
                <Feather name="plus" size={30} color="black" />
            </View>
        </View>
    )
}

const BlankCardBack = ({ color, onChangeBack, watermark, richText, setIsFocused, setRichText, setFocusNum, contents, index, writeCard, deleteCard, addedContents, backgroundImage }) => {
    const [addBack, setAddBack] = useState(false);
    const editorRef = useRef();

    useEffect(() => {
        // setRichText([
        //     ...richText,
        //     editorRef,
        // ])
        // console.log(richText);

        if (contents.length > 0) {
            editorRef.current.setContentHTML(contents);
        }
    }, [addedContents.length]);

    const onAddBack = () => {
        setAddBack(!addBack);
    }

    return (
        <Pressable
            style={{...styles.postContentsScrollBox, }}
            onPress={() => {
                editorRef.current.dismissKeyboard();
                // setIsFocused(false);
            }}
        >
        <View style={{
            ...styles.postContentsBox, 
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
            <View style={{...styles.postContentsBook, justifyContent: "flex-end", alignItems: "center" }}>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={() => {
                        console.log(index);
                        deleteCard(index);
                    }} 
                >
                    <Text style={{ fontSize: 15, fontWeight: "500", }}>취소</Text>
                </TouchableOpacity>
            </View>
            <View 
                style={styles.postContentsInput} 
            >
                <View 
                    style={{flexDirection: "column-reverse"}}
                >
                    <RichEditor
                        // initialFocus={false}
                        ref={editorRef}
                        // onChange={richTextHandle}
                        onChange={ descriptionText => {
                            writeCard(descriptionText, index);
                            // console.log("descriptionText:", descriptionText);
                        }}
                        placeholder="추가 내용을 입력하세요 (최대 200자)"
                        // initialContentHTML={"<div>ㅂㅈㄷㄱ쇼</div>"}
                        androidHardwareAccelerationDisabled={true}
                        editorStyle={{
                            backgroundColor: '(0, 0, 0, 0.5)',
                            contentCSSText: `font-size: ${SCREEN_WIDTH * 0.04}px;`,
                        }}
                        style={styles.richTextEditorStyle}
                        initialHeight={250}
                        // editorInitializedCallback={() => {
                        //     setRichText([
                        //         ...richText,
                        //         editorRef,
                        //     ]);
                        //     setFocusNum(1);
                        // }}
                        // onFocus={() => {
                        //     // console.log("added!");
                        //     // console.log(editorRef);
                        //     // setIsFocused(true);
                        //     setFocusNum(1);
                        //     // setRichText(editorRef);
                        // }}
                    />
                    <RichToolbar
                        editor={editorRef}
                        selectedIconTint="#873c1e"
                        iconTint="#312921"
                        actions={[
                            actions.setBold,
                            // actions.setItalic,
                            // actions.insertBulletsList,
                            // actions.insertOrderedList,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.alignLeft,
                            actions.alignCenter,
                            actions.alignRight,
                            actions.keyboard,
                        ]}
                        style={{...styles.richTextToolbarStyle, backgroundColor: "color", }}
                    />
                </View>
            </View>

            <View style={styles.postContentsWatermark}>
                <Text style={{ fontSize: 11, fontWeight: "700", }} >{`@${watermark}`}</Text>
            </View>
        </View>
    </Pressable>
        // <>
        // {!addBack ? 
        //     <TouchableOpacity activeOpacity={0.8} onPress={onAddBack} >
        //         <AddBlankCardBack color={color} />
        //     </TouchableOpacity>
        //     :
        //     <Pressable 
        //         style={{...styles.postContentsScrollBox, }}
        //         onPress={() => richText.current.dismissKeyboard()}
        //     >
        //         <View style={{...styles.postContentsBox, backgroundColor: color, }}>
        //             <View style={{...styles.postContentsBook, justifyContent: "flex-end", alignItems: "center" }}>
        //                 <TouchableOpacity activeOpacity={0.8} onPress={onAddBack} >
        //                     <Text style={{ fontSize: 15, fontWeight: "500", }}>취소</Text>
        //                 </TouchableOpacity>
        //             </View>
        //             <View 
        //                 style={styles.postContentsInput} 
        //             >
        //                 <View style={{flexDirection: "column-reverse"}}>
        //                     <RichEditor
        //                         ref={richText}
        //                         // onChange={richTextHandle}
        //                         onChange={ descriptionText => {
        //                             console.log("descriptionText:", descriptionText);
        //                         }}
        //                         placeholder="북마크를 입력하세요 (최대 200자)"
        //                         androidHardwareAccelerationDisabled={true}
        //                         style={styles.richTextEditorStyle}
        //                         initialHeight={250}
        //                     />
        //                     <RichToolbar
        //                         editor={richText}
        //                         selectedIconTint="#873c1e"
        //                         iconTint="#312921"
        //                         actions={[
        //                             actions.setBold,
        //                             actions.setItalic,
        //                             actions.insertBulletsList,
        //                             actions.insertOrderedList,
        //                             actions.setStrikethrough,
        //                             actions.setUnderline,
        //                             actions.keyboard,
        //                         ]}
        //                         style={{...styles.richTextToolbarStyle, backgroundColor: "color", }}
        //                     />
        //                 </View>
        //             </View>

        //             <View style={styles.postContentsWatermark}>
        //                 <Text style={{ fontSize: 11, fontWeight: "700", }} >{`@${watermark}`}</Text>
        //             </View>
        //         </View>
        //     </Pressable>
        // }

        // </>
    )
}

const CardForCreate = (props) => {
    const dispatch = useDispatch();
    const navigation = props.navigation;
    const { bookmarked, } = useSelector(bookmarkSelector);
    const [isReverse, setIsReverse] = useState(false);
    const [isBookmark, setIsBookmark] = useState(false);
    const bookmark = props.bookmark;
    const [bookmarking, setBookmarking] = useState(bookmark.bookmarking);
    const [watermark, setWatermark] = useState('');
    

    useEffect(() => {
        fetchBookmarking();
    }, [bookmarked])
    useEffect(() => {
        // console.log(bookmark.book_id)
        fetchWatermark();
    }, [])

    const onReverse = () => {
        setIsReverse(!isReverse);
    }

    const onBookmark = async() => {
        try {
            await Api.post("/api/v2/bookmark/bookmarking/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                if (bookmarked.findIndex(marked => Number(marked.bookmark_id) === Number(bookmark.bookmark_id)) === -1) {
                    dispatch(addBookmark(bookmark));
                } else {
                    dispatch(deleteBookmark(bookmark));
                }
            })
        } catch (err) {
            console.error(err);
        }
        // dispatch(resetBookmarks());
    }
    const fetchWatermark = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setWatermark(jwt_decode(accessToken).watermark);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchBookmarking = async() => {
        try {
            await Api.post("/api/v2/bookmark/bookmarking_count/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setBookmarking(res.data.bookmarking);
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.postContentsScrollBox}>
            <TouchableOpacity 
                activeOpacity={1} 
                style={{...styles.postContentsBox, backgroundColor: bookmark.hex, }} 
                onPress={onReverse}
            >
                <View style={styles.postContentsBook}>
                    <View
                        style={{ flexDirection: "row" }}
                    >
                        <View>
                            <Image 
                                source={ bookmark.book_cover !== null ? { uri: `http://3.38.228.24${bookmark.book_cover}`} : bookCover} 
                                style={styles.postContentsBookCover}
                            />
                        </View>
                        <View>
                            <Text style={styles.postContentsBookTitle}>{bookmark.book_title}</Text>
                            <Text style={styles.postContentsBookChapter}>{bookmark.chapter_title}</Text>
                        </View>
                    </View>
                    <View 
                        style={{ alignItems: "center", }}
                    >
                        <FontAwesome 
                            name="bookmark"
                            size={30} 
                            color="black"
                        />

                        <Text style={{fontSize: 13, fontWeight: "500", }}>
                            {bookmarking}
                        </Text>
                    </View>
                </View>
                <View style={styles.postContentsTextBox}>
                    <Text style={styles.postContentsText}>
                        {bookmark.contents}
                    </Text>
                </View>
                <View style={styles.postContentsWatermark}>
                    <Text style={{ fontSize: 11, fontWeight: "700", }} >{`@${bookmark.watermark}`}</Text>
                </View>
            </TouchableOpacity>

            {isReverse ? 
                <TouchableOpacity activeOpacity={1} style={{...styles.backCard, backgroundColor: bookmark.hex, }} onPress={onReverse} >
                    <View style={styles.postContentsBook}>
                    </View>
                    <View style={styles.postContentsTextBox}>
                        <Text style={styles.postContentsText}>
                            {bookmark.back_contents}
                        </Text>
                    </View>
                    <View style={styles.postContentsWatermark}>
                        <Text style={{ fontSize: 11, fontWeight: "700", }} >{`@${bookmark.watermark}`}</Text>
                    </View>
                </TouchableOpacity>
                :
                <View style={styles.backFold}>
                    <Svg height="36" width="36">
                        <Line />
                        <Polygon />
                        <Polygon
                            points="36,0 0,0 0,36"
                            fill="#AAAAAA"
                        />
                    </Svg>
                </View>
            }
            
        </View>
    );
}

export {CardPreview, BlankCardFront, BlankCardChangable, AddBlankCardBack, BlankCardBack, CardForCreate, };
export default Card;

const styles = StyleSheet.create({
    postContentsScrollBox: {
        // flex: 1,
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
    },
    postContentsBox: {
        flex: 1,
        // backgroundColor: "#D9D9D9",
        marginVertical: regWidth * 13,
        marginHorizontal: regWidth * 13,
        paddingVertical: regWidth * 5,
        borderRadius: 2,
        paddingHorizontal: regWidth * 10,
    },
    postContentsBookCover: {
        // flex: 1,
        // backgroundColor: "red",
        width: regWidth * 40,
        height: regWidth * 40,
        resizeMode: "contain",
    },
    postContentsBook: {
        // backgroundColor: "pink",
        flex: 0.6,
        flexDirection: "row", 
        justifyContent: "space-between",
        alignItems: "center",
    },
    postContentsBookTitle: {
        fontWeight: "700",
        fontSize: regWidth * 15,
        marginTop: regWidth * 8,
    },
    postContentsBookChapter: {
        fontWeight: "400",
        fontSize: regWidth * 10,
    },
    postContentsBookChapterInput: {
        fontWeight: "400",
        fontSize: regWidth * 15,
    },
    postContentsTextBox: {
        // backgroundColor: "pink",
        flex: 4,
        marginTop: regHeight * 8,
        justifyContent: "center", 
    },
    postContentsText: {
        fontWeight: "500",
        // fontSize: SCREEN_WIDTH * 0.041,
        fontSize: regWidth * 16,
        lineHeight: regWidth * 28,
    },
    postContentsInput: {
        // backgroundColor: "pink",
        flex: 4,
        marginTop: regWidth * 8,
        justifyContent: "center",
        textAlignVertical: "top",
        
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

const tagsStyles = {
    div: {
        // color: 'green',
        fontWeight: "500",
        // fontSize: SCREEN_0.041,
        fontSize: 16,
    },
    span: {
        // color: 'green',
        fontWeight: "500",
        // fontSize: SCREEN_0.041,
        fontSize: 16,
    },
};