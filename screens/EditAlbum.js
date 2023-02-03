import { 
    StyleSheet, 
    View, 
    SafeAreaView, 
    ScrollView, 
    Text, TextInput, 
    Image, 
    Animated, 
    Pressable, 
    useWindowDimensions, 
    ActivityIndicator, 
    Alert, 
    ImageBackground, 
    Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo, } from "react";
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
import iconPlusNemoNormal from '../assets/icons/iconPlusNemoNormal.png';
import iconPlusNemoDark from '../assets/icons/iconPlusNemoDark.png';
import addBookCover from '../assets/images/addBookCover.png';
import iconBook from '../assets/icons/iconBook.png';
import addAlbumCover from '../assets/images/addAlbumCover.png';
import shadow from '../assets/images/shadow.png';
import iconPlusCircle from '../assets/icons/iconPlusCircle.png';
import iconDeleteCircle from '../assets/icons/iconDeleteCircle.png';

import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
// import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import HTML from 'react-native-render-html';
import { BookmarkList, } from '../components';
import { UnTouchableBookmarkList, } from "../components/BookmarkList";
import { BookList, } from '../components';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetUserInfo, setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import ImagePicker from 'react-native-image-crop-picker';
import { color } from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const EditAlbum = ({route, navigation}) => {
    const { albumInfo, albumId, } = route.params;
    const albumCoverValue = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);
    const [orderedBookmarks, setOrderedBookmarks] = useState(null);
    const [selectToDelete, setSelectToDelete] = useState([]);

    useEffect(() => {
        const orderedNumbering = (albumInfo.bookmarks.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a);
        setOrderedBookmarks(
            orderedNumbering.map((number) => albumInfo.bookmarks.find(bookmark => Number(bookmark.numbering) === Number(number)))
        )
        console.log(albumInfo);
    }, [])

    const showAlbumCover = () => {
        Animated.timing(albumCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const onSelectToDelete = (bookmark) => {
        if (selectToDelete.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1) {
            setSelectToDelete([
                ...selectToDelete,
                bookmark,
            ]);
        } else {
            setSelectToDelete(
                selectToDelete.filter(selectedBookmark => selectedBookmark.bookmark_id !== bookmark.bookmark_id)
            )
        }
    }

    const onDeleteBookmarks = async() => {
        const bookmarkIds = selectToDelete.map((selectedBookmark) => (selectedBookmark.bookmark_id));
        console.log(selectToDelete);

        if (selectToDelete.length > 0) {
            try {
                await Api
                .post("api/v4/album/deletebookmark/", {
                    nemolist_id: albumId,
                    bookmark_id: bookmarkIds,
                })
                .then((res) => {
                    console.log("delete");
                    // fetchAlbum();
                    // dispatch(setShouldUserRefresh(true));
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    const onEdit = async() => {
        onDeleteBookmarks();
        navigation.goBack();
    }

    return (
        <View 
            style={{
                ...styles.container,
            }}
        >
            {albumInfo !== null ? 
                <>
                    <SafeAreaView 
                        style={{
                            backgroundColor: albumInfo.background ? albumInfo.background : colors.nemoLight,
                        }}
                    >
                        <View style={styles.header}>
                            <Pressable
                                onPress={() => navigation.goBack()}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Text
                                    style={{
                                        fontSize: regWidth* 13,
                                        fontWeight: "700",
                                        color: colors.textLight,
                                    }}
                                >
                                    Cancel
                                </Text>
                            </Pressable>
                            <Text
                                style={{
                                    fontSize: regWidth * 17,
                                    fontWeight: "700",
                                }}
                            >
                                {albumInfo.nemolist_title}
                            </Text>
                            <Pressable
                                onPress={onEdit}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Text
                                    style={{
                                        fontSize: regWidth* 13,
                                        fontWeight: "700",
                                        color: colors.textLight,
                                    }}
                                >
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                    </SafeAreaView>
                    <ScrollView
                        style={{
                            // marginTop: -headerHeight,
                            zIndex: 0,
                        }}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <LinearGradient 
                            colors={[
                                albumInfo.background ? albumInfo.background : colors.nemoLight, 
                                // 'white',
                                'white'
                            ]} 
                            style={{
                                width: "100%",
                                height: regHeight * 400,
                                // height: "100%",
                                position: "absolute",
                                // backgroundColor: "pink"
                            }}
                        />
                        <View style={{ alignItems: "center", }}>
                            <ImageBackground
                                source={shadow}
                                style={{
                                    width: regWidth * 220,
                                    height: regWidth * 220,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    // marginTop: headerHeight + regHeight * 40,
                                    marginTop: regHeight * 40,
                                }}
                            >
                                <Animated.Image 
                                    source={ albumInfo.nemolist_cover !== null ? { uri: albumInfo.nemolist_cover} : likedNemos} 
                                    style={{
                                        ...styles.albumCover,
                                        opacity: albumCoverValue,
                                        marginTop: -regWidth * 10,
                                    }}
                                    onLoadEnd={showAlbumCover}
                                />
                            </ImageBackground>
                        </View>
                        <View
                            style={{
                                marginTop: regHeight * 8,
                                marginHorizontal: regWidth * 18,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: regWidth * 14,
                                    fontWeight: "500",
                                    lineHeight: regWidth * 21,
                                }}
                            >
                                {albumInfo.description}
                            </Text>
                            <View
                                style={{ 
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    marginTop: regHeight * 9,
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: regWidth * 14,
                                            fontWeight: "700",
                                            color: colors.nemoDark,
                                        }}
                                    >
                                        {`@${albumInfo.user_tag}`}
                                    </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 5, }}>
                                        <Text style={styles.albumInfoTxt}>
                                            {albumInfo.likes}
                                        </Text>
                                        <Text style={styles.albumInfoTxt}>
                                            {' likes'}
                                        </Text>
                                        <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
                                        <Text style={styles.albumInfoTxt}>
                                            {albumInfo.nemos}
                                        </Text>
                                        <Text style={styles.albumInfoTxt}>
                                            {' Nemos'}
                                        </Text>
                                    </View>

                                </View>
                                        {albumInfo.default ? 
                                            <Text
                                                style={{
                                                    fontSize: regWidth * 14,
                                                    fontFamily: "NotoSansKR-Bold"
                                                }}
                                            >
                                                Nemos that you liked
                                            </Text>
                                            :
                                            <Pressable
                                                style={{
                                                    borderWidth: 2,
                                                    borderColor: colors.nemoDark,
                                                    borderRadius: 20,
                                                    paddingHorizontal: regWidth * 14,
                                                    paddingVertical: regWidth * 4,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                                onPress={() => {
                                                    onPressAddNemos();
                                                    fetchBookmarks();
                                                }}
                                            >
                                                <Image 
                                                    source={iconPlusNemoDark}
                                                    style={{
                                                        width: regWidth * 28,
                                                        height: regWidth * 28,
                                                    }}
                                                />
                                                <Text
                                                    style={{
                                                        fontSize: regWidth * 19,
                                                        fontWeight: "900",
                                                        color: colors.nemoDark,
                                                    }}
                                                >
                                                    Add Nemos
                                                </Text>
                                            </Pressable>
                                        }
                            </View>
                        </View>
                        {loading ? 
                            <ActivityIndicator 
                                color="black" 
                                style={{marginTop: 100}} 
                                size="large"
                            />
                            :
                            <View style={{ marginTop: regHeight * 25, }}>
                                {orderedBookmarks !== null && orderedBookmarks.map((bookmark, index) => (
                                    <View
                                        style={{
                                            justifyContent: "center",
                                            opacity: selectToDelete.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ? 1 : 0.5
                                        }}
                                        key={index}
                                    >
                                        <UnTouchableBookmarkList bookmark={bookmark} navigation={navigation} />
                                        <Pressable
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                marginRight: 22,
                                            }}
                                            onPress={() => onSelectToDelete(bookmark)}
                                        >
                                            <Image 
                                                source={iconDeleteCircle}
                                                style={{
                                                    width: regWidth * 50,
                                                    height: regWidth * 50,
                                                }}
                                            />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        }

                    </ScrollView>
                </>
                :
                null
            }
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        // backgroundColor: '(0, 0, 0, 0.5)',
    },
    header: {
      paddingHorizontal: regWidth * 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: regHeight * 8,
    },
    albumCover: {
        width: regWidth * 200,
        height: regWidth * 200,
        resizeMode: "contain",
        borderRadius: 5,
    },
    profileImage: {
        width: regWidth * 25,
        height: regWidth * 25,
        resizeMode: "cover",
        borderRadius: 50,
    },
    bookmarkOrPost: {
        width: SCREEN_WIDTH * 0.5,
        alignItems: "center",
        borderBottomWidth: 1,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
    },
    modal: {
        position: "absolute",
        width: "100%",
        height: regHeight * 250,
        bottom: 0, 
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 12,
        alignItems: "center",
    },
    menu: {
        backgroundColor: "#DDDDDD",
        width: SCREEN_WIDTH - regWidth * 40,
        height: regHeight * 40,
        borderRadius: 5,
        // paddingVertical: 8,
        paddingHorizontal: regWidth * 13,
        marginTop: regHeight * 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    addModal: {
        width: '100%', 
        // height: '35%',
        height: regHeight * 180, 
        position: 'absolute', 
        bottom: 0, 
        backgroundColor: 'white', 
        borderRadius: 10, 
        paddingTop: 10,
        paddingBottom: 28,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: regHeight * 8,
        alignItems: "center",
        marginHorizontal: regWidth * 20,
        // marginHorizontal: regWidth * 18, 
    },
    numbering: {
        position: "absolute",
        backgroundColor: "#008000",
        width: regWidth * 45,
        height: regWidth * 45,
        right: 0,
        marginRight: 22,
        borderRadius: 50,
        // borderWidth: 1,
        // borderColor: "white",
        opacity: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
    albumInfoTxt: {
        fontSize: regWidth * 14,
        fontWeight: "700",
        lineHeight: regWidth * 20,
        color: colors.textLight,
    },
})

export default EditAlbum;