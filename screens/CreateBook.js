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
import addBookCover from '../assets/images/addBookCover.png';
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
import { resetUserInfo, setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, setShouldBookRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import ImagePicker from 'react-native-image-crop-picker';
import { color } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CreateBook = ({navigation, route}) => {
    const dispatch = useDispatch();
    const { index, isLib, } = route.params;
    const [keyword, setKeyword] = useState('');
    const [bookList, setBookList] = useState(null);
    const debounceVal = useDebounce(keyword);
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookCover, setBookCover] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    const pickBookCover = async () => {
        try {
          ImagePicker.openPicker({
            width: 1000,
            height: 1300,
            cropping: true,
            freeStyleCropEnabled: true,
          }).then(image => {
            console.log(image);
            setBookCover(`file://${image.path}`);
          });
    
        } catch (error) {
          console.error(error);
        }
    };

    const onExit = () => {
        Alert.alert("책 생성을 취소하시겠습니까?", "확인 버튼을 누르면 취소됩니다.", [
            {
                text: "취소",
            },
            {
                text: "확인", 
                onPress: () => navigation.goBack()
            }
        ]);
    }

    const onAddBook = async() => {
        const formData = new FormData();
        if (bookCover !== null) {
            const filename = bookCover.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('book_cover', {
                uri: bookCover,
                type: type,
                name: filename
            });
        }
        formData.append('book_title', bookTitle);
        formData.append('book_author', bookAuthor);

        try {
            setLoading(true);
            await Api
            .put("/api/v3/book/add/", formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
            )
            .then((res) => {
                console.log(res.data);
                dispatch(setShouldBookRefresh(true));
                if (!isLib) {
                    navigation.navigate(`CreateBookmark${route.params.index}`, { selectedBook: res.data, normal: true, });
                }
                if (isLib) {
                    navigation.popToTop();
                }
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Image 
                        source={iconBook}
                        style={{
                            width: regWidth * 42,
                            height: regWidth * 42,
                            resizeMode: "contain",
                        }}
                    />
                    <Text 
                        style={{ 
                            fontSize: regWidth * 24, 
                            fontFamily: "NotoSansKR-Black",
                            color: colors.textDark, 
                            marginHorizontal: regWidth * 5, 
                            includeFontPadding: false,
                        }}
                    >
                        Add new Book
                    </Text>
                </View>
                <Pressable
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ fontSize: regWidth * 15, fontWeight: "500", color: colors.textNormal, includeFontPadding: false,}}>
                        Cancel
                    </Text>
                </Pressable>
            </View>
            <ScrollView>
                <View style={{ alignItems: "center", marginTop: regHeight * 45, }}>
                    <Pressable
                        style={{ alignItems: "center", }}
                        onPress={pickBookCover}
                    >
                        <Image 
                            source={bookCover === null ? addBookCover : {uri: bookCover}}
                            style={{
                                width: regWidth * 120,
                                height: regWidth * 160,
                                resizeMode: "contain",
                            }}
                        />
                        <Text
                            style={{
                                fontSize: regWidth * 13,
                                fontFamily: "NotoSansKR-Regular",
                                marginTop: regHeight * 5,
                                color: colors.nemoNormal,
                                includeFontPadding: false,
                            }}
                        >
                            Choose Book Cover
                        </Text>
                    </Pressable>
                </View>
                <View style={{ marginHorizontal: regWidth * 38, marginTop: regHeight * 35, }}>
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontFamily: "NotoSansKR-Regular",
                            marginTop: regHeight * 5,
                            color: colors.nemoNormal,
                            includeFontPadding: false,
                        }}
                    >
                        Book Title
                    </Text>
                    <TextInput 
                        style={{
                            borderBottomWidth: 1,
                            fontSize: regWidth * 18,
                            fontFamily: "NotoSansKR-Medium",
                            marginTop: 18,
                            includeFontPadding: false,
                        }}
                        onChangeText={(payload) =>  setBookTitle(payload)}
                    />
                </View>
                <View style={{ marginHorizontal: regWidth * 38, marginTop: regHeight * 35, }}>
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontFamily: "NotoSansKR-Regular",
                            marginTop: regHeight * 5,
                            color: colors.nemoNormal,
                            includeFontPadding: false,
                        }}
                    >
                        Author
                    </Text>
                    <TextInput 
                        style={{
                            borderBottomWidth: 1,
                            fontSize: regWidth * 18,
                            fontFamily: "NotoSansKR-Medium",
                            marginTop: 18,
                            includeFontPadding: false,
                        }}
                        onChangeText={(payload) =>  setBookAuthor(payload)}
                    />
                </View>
                <Pressable
                    style={styles.addBtn}
                    onPress={onAddBook}
                >
                    {loading ? 
                        <ActivityIndicator 
                            color="white"
                            // style={{ marginTop: 100, }} 
                            size="small"
                        />
                        : 
                        <Text
                            style={{
                                fontSize: regWidth * 18,
                                fontFamily: "NotoSansKR-Black",
                                color: "#FFFFFF",
                                includeFontPadding: false,
                            }}
                        >
                            {isLib ? 
                                "Add to my library"
                                :
                                "Add"
                            }
                        </Text>
                    }

                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
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
    addBtn: {
        marginTop: regHeight * 65,
        marginHorizontal: regWidth * 38,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.nemoDark,
        borderRadius: 30,
        height: regHeight * 60,
    }
})

export default CreateBook;