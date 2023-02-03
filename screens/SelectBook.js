import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Modal, Pressable, useWindowDimensions, ActivityIndicator, Alert, ImageBackground, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialIcons, FontAwesome, } from '@expo/vector-icons'; 
import { CardPreview, BlankCardFront, BlankCardChangable, AddBlankCardBack, BlankCardBack } from "../components/Card";
import { InputCard, InvisibleCard, DotInputCard, } from '../components';
import Api from "../lib/Api";
// import * as ImagePicker from 'expo-image-picker';
import bookCover from '../assets/images/steve.jpeg';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import iconCamera from '../assets/images/iconCamera.png';
import iconImage from '../assets/icons/iconImage.png';
import iconPlus from '../assets/images/iconPlus.png';
import iconPlusCircleOutline from '../assets/icons/iconPlusCircleOutline.png';
import iconBook from '../assets/icons/iconBook.png';
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
// import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import HTML from 'react-native-render-html';
import { UnTouchableBookmarkList, } from "../components/BookmarkList";
import { BookList, } from '../components';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import ImagePicker from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SelectBook = ({navigation, route}) => {
    const { index, isLib, } = route.params;
    const dispatch = useDispatch();
    const [keyword, setKeyword] = useState('');
    const [bookList, setBookList] = useState(null);
    const [recentRead, setRecentRead] = useState([]);
    const debounceVal = useDebounce(keyword);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        searchBook();
    }, [debounceVal]);

    useEffect(() => {
        fetchRecentRead();
    }, []);

    const onChangeKeyword = (payload) => {
        setKeyword(payload);
    }

    const fetchRecentRead = async() => {
        try {
            await Api
            .get("/api/v3/book/recent/")
            .then((res) => {
                console.log(res.data);
                setRecentRead(res.data);
            })
        } catch (error) {
            console.error(error);
        }
    }

    const searchBook = async() => {
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

    const onExit = () => {
        Alert.alert("북마크 생성을 취소하시겠습니까?", "확인 버튼을 누르면 취소됩니다.", [
            {
                text: "취소",
            },
            {
                text: "확인", 
                style: 'destructive',
                onPress: () => navigation.goBack()
            }
        ]);
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <Text style={{ fontSize: regWidth * 24, fontFamily: "NotoSansKR-Black", color: colors.textDark, }}>
                    What are you reading?
                </Text>
                <Pressable
                    onPress={onExit}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", color: colors.textNormal, }}>
                        Cancel
                    </Text>
                </Pressable>
            </View>

            <View 
                style={styles.searchInputContainer}
            >
                <Feather name="search" size={regWidth * 18} color={colors.textLight} />
                <TextInput 
                    placeholder="Search Books"
                    placeholderTextColor={colors.textLight}
                    style={styles.searchInput}
                    onChangeText={onChangeKeyword}
                />
            </View>
            {bookList ? 
                <ScrollView>
                    <Pressable
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            marginHorizontal: regWidth * 12,
                            paddingVertical: regHeight * 12,
                            borderBottomWidth: 0.5,
                            borderBottomColor: "#CBCBCB",
                        }}
                        onPress={() => navigation.navigate(`CreateBook${route.params.index}`, {index: route.params.index, isLib: route.params.isLib})}
                    >
                        <Image 
                            source={iconBook}
                            style={{
                                width: regWidth * 50,
                                height: regWidth * 50,
                                resizeMode: "contain",
                            }}
                        />
                        <View>
                            <Text 
                                style={{ 
                                    fontSize: regWidth * 20, 
                                    fontWeight: "700", 
                                    marginHorizontal: 12,
                                    lineHeight: regWidth * 28,
                                }}
                            >
                                New Book
                            </Text>
                            <Text 
                                style={{
                                    fontSize: regWidth*11, 
                                    fontWeight: "500", 
                                    marginHorizontal: regWidth*12, 
                                    color: "#606060",
                                }}
                            >
                                Add new Book
                            </Text>
                        </View>
                    </Pressable>

                    {bookList.map((book, index) => (
                        <Pressable
                            key={index}
                            onPress={() => {
                                navigation.navigate(`CreateBookmark${route.params.index}`, { selectedBook: book, });
                            }}
                            disabled={isLib ? true : false}
                            style={{ justifyContent: "center", }}
                        >
                            <BookList book={book} />
                            {isLib ? 
                                <Pressable
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        marginHorizontal: regWidth * 12,
                                    }}
                                    onPress={() => console.log("1")}
                                >
                                    <Image 
                                        source={iconPlusCircleOutline}
                                        style={{
                                            width: regWidth * 40,
                                            height: regWidth * 40,
                                        }}
                                    />
                                </Pressable>
                                :
                                null
                            }

                        </Pressable>
                    ))}
                </ScrollView>
                : 
                <>
                <Text 
                    style={{ 
                        fontSize: regWidth * 17, 
                        fontWeight: "700", 
                        marginHorizontal: regWidth * 12, 
                        marginTop: regHeight * 18, 
                    }}
                >
                    Recent
                </Text>
                <ScrollView>
                    {recentRead.map((book, index) => (
                        <Pressable
                            key={index}
                            onPress={() => {
                                navigation.navigate(`CreateBookmark${route.params.index}`, { selectedBook: book, });
                                // dispatch(addRecentRead(book));
                            }}
                            disabled={isLib ? true : false}
                            style={{ justifyContent: "center", }}
                        >
                            <BookList book={book} />
                            {isLib ? 
                                <Pressable
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        marginHorizontal: regWidth * 12,
                                    }}
                                    onPress={() => console.log("1")}
                                >
                                    <Image 
                                        source={iconPlusCircleOutline}
                                        style={{
                                            width: regWidth * 40,
                                            height: regWidth * 40,
                                        }}
                                    />
                                </Pressable>
                                :
                                null
                            }
                        </Pressable>
                    ))}
                </ScrollView>
                </>
            }

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "red",
        marginVertical: 10,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    searchInputContainer: {
        backgroundColor: colors.bgdLight,
        marginTop: regHeight * 31,
        marginHorizontal: regWidth * 12,
        borderRadius: 10,
        height: regHeight * 40,
        paddingHorizontal: regWidth * 6,
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        fontSize: regWidth * 14,
        fontWeight: "500",
        color: colors.textLight,
        marginHorizontal: regWidth * 6,
        width: "90%",
        height: "100%",
    }
})

export default SelectBook;