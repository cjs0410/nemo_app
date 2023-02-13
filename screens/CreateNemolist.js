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
    FlatList,
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
import blankNemolistCover from '../assets/images/blankNemolistCover.png';
import shadow from '../assets/images/shadow.png';
import iconPlusCircle from '../assets/icons/iconPlusCircle.png';

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
import { resetUserInfo, setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, setShouldNemolistRefresh, } from '../modules/user';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CreateNemolist1 = ({navigation}) => {
    const [albumTitle, setAlbumTitle] = useState('');

    const onExit = () => {
        Alert.alert("Discard changes?", "If you go back now, you’ll lose your changes.", [
            {
                text: "Discard",
                style: 'destructive',
                onPress: () => navigation.goBack()
            },
            {
                text: "Keep editing", 
            }
        ]);
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable
                    onPress={onExit}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontWeight: "700",
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </SafeAreaView>
            <View 
                style={{ 
                    alignItems: "center", 
                    marginTop: regHeight * 28, 
                    marginHorizontal: regWidth * 12, 
                }}
            >
                <Text
                    style={{
                        fontSize: regWidth * 17,
                        fontWeight: "700",
                    }}
                >
                    Give your Nemolist a name
                </Text>
                <TextInput 
                    style={styles.nameIpt}
                    onChangeText={(payload) => setAlbumTitle(payload)}
                />
                <Pressable
                    style={{
                        marginTop: regHeight * 102,
                        backgroundColor: colors.nemoDark,
                        width: "80%",
                        alignItems: "center",
                        justifyContent: "center",
                        height: regWidth * 60,
                        borderRadius: 30,
                    }}
                    onPress={() => navigation.navigate('CreateNemolist2', { albumTitle: albumTitle, })}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 18,
                            fontWeight: "900",
                            color: "white",
                        }}
                    >
                        Next
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const CreateNemolist2 = ({navigation, route}) => {
    const dispatch = useDispatch();
    const [albumCover, setAlbumCover] = useState(null);
    const { albumTitle, } = route.params;
    const [loading, setLoading] = useState(null);

    const onExit = () => {
        Alert.alert("Discard changes?", "If you go back now, you’ll lose your changes.", [
            {
                text: "Discard",
                style: 'destructive',
                onPress: () => navigation.goBack()
            },
            {
                text: "Keep editing", 
            }
        ]);
    }

    const pickAlbumCover = async () => {
        try {
          ImagePicker.openPicker({
            width: 1300,
            height: 1300,
            cropping: true,
          }).then(image => {
            console.log(image);
            setAlbumCover(`file://${image.path}`);
          });
    
        } catch (error) {
          console.error(error);
        }
    };

    const makeAlbum = async() => {
        const formData = new FormData();
        if (albumCover) {
            const filename = albumCover.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('nemolist_cover', {
                uri: albumCover,
                type: type,
                name: filename,
            });
        }

    
        formData.append('nemolist_title', albumTitle)
        
        try {
            setLoading(true);
            await Api
            .post("api/v4/album/add/", formData,
                {
                headers: {
                    'content-type': 'multipart/form-data',
                },
                }
            )
            .then((res) => {
                console.log(res.data);
                dispatch(setShouldNemolistRefresh(true));
                navigation.navigate('CreateNemolist3', { albumTitle: albumTitle, albumCover: albumCover, hex: res.data.hex ? res.data.hex : colors.bgdNormal, albumId: res.data.nemolist_id, })
            })
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable
                    onPress={onExit}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontWeight: "700",
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </SafeAreaView>
            <View 
                style={{ 
                    alignItems: "center", 
                    marginTop: regHeight * 28, 
                    marginHorizontal: regWidth * 12, 
                }}
            >
                <Text
                    style={{
                        fontSize: regWidth * 17,
                        fontWeight: "700",
                    }}
                >
                    Select your cover
                </Text>
                <Pressable
                    onPress={pickAlbumCover}
                    style={{
                        marginTop: regHeight * 22,
                    }}
                >
                    <Image 
                        source={albumCover ? {uri: albumCover} : addAlbumCover}
                        style={{
                            width: regWidth * 180,
                            height: regWidth * 180,
                            resizeMode: "contain",
                            borderRadius: 5,
                        }}
                    />
                </Pressable>
                <Pressable
                    style={{
                        marginTop: regHeight * 23,
                        backgroundColor: colors.nemoDark,
                        width: "80%",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 30,
                        height: regWidth * 60,
                    }}
                    onPress={makeAlbum}
                    disabled={loading ? true : false}
                >
                    {loading ? 
                        <ActivityIndicator 
                            color="white" 
                            // style={{marginTop: 100}} 
                            size="small"
                        />
                        :
                        <Text
                            style={{
                                fontSize: regWidth * 18,
                                fontWeight: "900",
                                color: "white",
                            }}
                        >
                            Create
                        </Text>
                    }

                </Pressable>
                <Pressable
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.textNormal,
                        marginTop: regHeight * 7,
                    }}
                    disabled={loading ? true : false}
                >
                    <Text style={{ fontSize: regWidth * 18, fontWeight: "700", color: colors.textNormal, }}>
                        Skip for now
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const CreateNemolist3 = ({navigation, route}) => {
    const dispatch = useDispatch();
    const { albumTitle, albumCover, hex, albumId, } = route.params;
    const albumCoverValue = useRef(new Animated.Value(0)).current;
    const [userTag, setUserTag] = useState(null);
    const [addTextMode, setAddTextMode] = useState(false);
    const [text, setText] = useState(null);
    const [bookmarks, setBookmarks] = useState(null);
    const [selectedBookmarks, setSelectedBookmarks] = useState([]);
    const [albumInfo, setAlbumInfo] = useState(null);
    const [bookmarkNumbering, setBookmarkNumbering] = useState(null);
    const [orderedBookmarks, setOrderedBookmarks] = useState(null);
    const [newBookmarkNum, setNewBookmarkNum] = useState(0);
    const [loading, setLoading] = useState(false);
    const [rgb, setRgb] = useState(null);
    const insets = useSafeAreaInsets();
    const [scrollLoading, setScrollLoading] = useState(false);

    useEffect(() => {
        fetchUserTag();
        const rgbList = hex.replace(/^#/, '').match(/.{2}/g).map(replacer => parseInt(replacer, 16) || 0);
        console.log(rgbList);
        setRgb(`rgba(${rgbList[0]}, ${rgbList[1]}, ${rgbList[2]}, 0.6)`);
    }, [])

    const showAlbumCover = () => {
        Animated.timing(albumCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const fetchUserTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setUserTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchAlbum = async() => {
        try {
            setLoading(true)
            await Api.post("/api/v4/album/view/", {
                nemolist_id: albumId,
            })
            .then((res) => {
                console.log(res.data);
                // console.log(res.data.bookmarks);
                setAlbumInfo(res.data);

                setBookmarkNumbering(
                    (res.data.bookmarks.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a)
                )
                // const orderedNumbering = (res.data.bookmarks.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a);
                // setOrderedBookmarks(
                //     orderedNumbering.map((number) => res.data.bookmarks.find(bookmark => Number(bookmark.numbering) === Number(number)))
                // )
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const renderBookmark = ({ item, index }) => (
        <BookmarkList bookmark={item} navigation={navigation} />
    )

    const fetchNemo = async() => {
        try {
            await Api
            .post("/api/v4/album/scroll/", {
                nemolist_id: albumId,
                items: 0,
            })
            .then((res) => {
                console.log(res.data);
                const orderedNumbering = (res.data.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a);
                setOrderedBookmarks(
                    orderedNumbering.map((number) => res.data.find(bookmark => Number(bookmark.numbering) === Number(number)))
                )
                setNewBookmarkNum(res.data.length);
            })
        } catch (err) {
            console.error(err)
        }
    }

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getNemo();
        }
    };

    const getNemo = async() => {
        if (orderedBookmarks.length >= 4 && newBookmarkNum >= 4) {
            // console.log(bookmarks[bookmarks.length - 1].nemo_num);
            try {
                setScrollLoading(true);
                await Api
                .post("/api/v4/album/scroll/", {
                    nemolist_id: albumId,
                    items: orderedBookmarks.length,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    const orderedNumbering = (res.data.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a);
                    const newBookmarks = orderedNumbering.map((number) => res.data.find(bookmark => Number(bookmark.numbering) === Number(number)));
                    setOrderedBookmarks(
                        [...orderedBookmarks, ...newBookmarks]
                    )
                    setNewBookmarkNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
            // setCursor(bookmarks.at(-1).cursor);
        }
    };

    const fetchBookmarks = async() => {
        try {
            await Api
            .post("/api/v4/album/bookmarklist/", {
                nemolist_id: albumId,
            })
            .then((res) => {
                console.log(res.data);
                setBookmarks(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const selectBookmark = (bookmark) => {
        if (selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1) {
            setSelectedBookmarks([
                ...selectedBookmarks,
                bookmark,
            ]);
        } else {
            setSelectedBookmarks(
                selectedBookmarks.filter(selectedBookmark => selectedBookmark.bookmark_id !== bookmark.bookmark_id)
            )
        }
    }

    const onAddBookmark = async() => {
        const bookmarkIds = selectedBookmarks.map((selectedBookmark) => (selectedBookmark.bookmark_id));

        try {
            console.log(bookmarkIds);
            console.log(albumId);
            await Api
            .post("/api/v4/album/insertbookmark/", {
                bookmark_id: bookmarkIds,
                nemolist_id: albumId,
            })
            .then((res) => {
                setSelectedBookmarks([]);
                // fetchAlbum();
                fetchNemo();
                dispatch(setShouldNemolistRefresh(true));
                // dispatch(setShouldLibraryRefresh(true));
                onCloseAddNemos();
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onAddDesc = async() => {
        try {
            await Api
            .post("/api/v4/album/edit_description/", {
                nemolist_id: albumId,
                description: text,
            })
            .then((res) => {
                setAddTextMode(false);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    const addModalRef = useRef();
    const addSnapPoints = useMemo(() => [regHeight * 780], []);
    const onPressAddNemos = useCallback(() => {
        addModalRef.current.present();
    }, [addModalRef]);
    const onCloseAddNemos = useCallback(() => {
        addModalRef.current.dismiss();
    }, [addModalRef]);

    return (
        <View style={styles.container}>
            <View 
                style={{
                    backgroundColor: rgb ? rgb : colors.nemoLight,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }}
            >
                <View style={styles.albumHeader}>
                    <Pressable
                        style={{ opacity: addTextMode ? 1 : 0, }}
                        disabled={addTextMode ? false : true}
                        onPress={() => {
                            setAddTextMode(false);
                            setText(null);
                        }}
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
                        {albumTitle}
                    </Text>
                    <Pressable
                        onPress={addTextMode ? onAddDesc : () => navigation.popToTop()}
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
            </View>

            <FlatList 
                data={orderedBookmarks}
                renderItem={renderBookmark}
                keyExtractor={bookmark => bookmark.bookmark_id}
                showsVerticalScrollIndicator={false}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={scrollLoading && <ActivityIndicator />}
                ListHeaderComponent={
                    <>
                        <View
                            style={{
                                backgroundColor: rgb ? rgb : colors.nemoLight,
                                width: "100%",
                                height: regHeight * 500,
                                marginTop: -regHeight * 500,
                            }}
                        />
                        <LinearGradient 
                            colors={[
                                rgb ? rgb : colors.nemoLight,
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
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: regHeight * 40,
                                    // backgroundColor:"pink"
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: "black",
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 8,
                                        },
                                        android: {
                                            elevation: 3,
                                        },
                                    }),
                                }}
                            >
                                <Animated.Image 
                                    source={albumCover ? {uri: albumCover} : blankNemolistCover} 
                                    style={{
                                        ...styles.albumCover,
                                        opacity: albumCoverValue,
                                        marginTop: -regWidth * 10,
                                    }}
                                    onLoadEnd={showAlbumCover}
                                />
                            </View>
                        </View>
                        <View
                            style={{
                                marginTop: regHeight * 18,
                                marginHorizontal: regWidth * 18,
                                marginBottom: regHeight * 25,
                            }}
                        >
                            {addTextMode ? 
                                <View>
                                    <Text style={{ fontSize: regWidth * 13, fontWeight: "500", color: colors.nemoDark, }}>
                                        Description
                                    </Text>
                                    <TextInput 
                                        style={{
                                            borderBottomWidth: 1,
                                            fontSize: regWidth * 14,
                                            fontFamily: "NotoSansKR-Medium",
                                            marginTop: regHeight * 8,
                                        }}
                                        onChangeText={(payload) => setText(payload)}
                                        multiline={true}
                                    />
                                </View>
                                :
                                <>
                                    {text ? 
                                        <Text
                                            style={{
                                                fontSize: regWidth * 14,
                                                fontWeight: "500",
                                                lineHeight: regWidth * 21,
                                            }}
                                        >
                                            {text}
                                        </Text>
                                        : 
                                        <View style={{ alignItems: "center", }}>
                                            <Pressable
                                                style={{
                                                    marginVertical: regHeight * 8,
                                                    borderWidth: 1,
                                                    borderColor: colors.nemoNormal,
                                                    borderRadius: 20,
                                                    paddingHorizontal: regWidth * 14,
                                                    paddingVertical: regWidth * 6,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                                onPress={() => setAddTextMode(true)}
                                            >
                                                <Image 
                                                    source={iconPlusNemoNormal}
                                                    style={{
                                                        width: regWidth * 25,
                                                        height: regWidth * 25,
                                                    }}
                                                />
                                                <Text
                                                    style={{
                                                        fontSize: regWidth * 17,
                                                        fontWeight: "700",
                                                        color: colors.nemoNormal,
                                                    }}
                                                >
                                                    Add Description
                                                </Text>
                                            </Pressable>
                                        </View>
                                    }
                                </>

                            }

                            <View
                                style={{ 
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
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
                                        {`@${userTag}`}
                                    </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 5, }}>
                                        <Text style={styles.albumInfoTxt}>
                                            0
                                        </Text>
                                        <Text style={styles.albumInfoTxt}>
                                            {' likes'}
                                        </Text>
                                        <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
                                        <Text style={styles.albumInfoTxt}>
                                            0
                                        </Text>
                                        <Text style={styles.albumInfoTxt}>
                                            {' Nemos'}
                                        </Text>
                                    </View>

                                </View>
                            </View>
                        </View>
                        {orderedBookmarks === null ? 
                            <View style={{ alignItems: "center", marginTop: regHeight * 80, }}>
                                <Pressable
                                    style={{
                                        marginVertical: regHeight * 8,
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
                                <Text
                                    style={{
                                        fontSize: regWidth * 17,
                                        fontWeight: "700",
                                        color: colors.nemoDark,
                                    }}
                                >
                                    Add Nemos to your Nemolist
                                </Text>
                            </View>
                            :
                            null
                        }
                    </>
                }
            />
            {/* <ScrollView
                style={{
                    // marginTop: -headerHeight,
                    zIndex: 0,
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient 
                    colors={[
                        rgb ? rgb : colors.nemoLight,
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
                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: regHeight * 40,
                            // backgroundColor:"pink"
                            ...Platform.select({
                                ios: {
                                    shadowColor: "black",
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 8,
                                },
                                android: {
                                    elevation: 3,
                                },
                            }),
                        }}
                    >
                        <Animated.Image 
                            source={albumCover ? {uri: albumCover} : blankNemolistCover} 
                            style={{
                                ...styles.albumCover,
                                opacity: albumCoverValue,
                                marginTop: -regWidth * 10,
                            }}
                            onLoadEnd={showAlbumCover}
                        />
                    </View>
                </View>
                <View
                    style={{
                        marginTop: regHeight * 18,
                        marginHorizontal: regWidth * 18,
                    }}
                >
                    {addTextMode ? 
                        <View>
                            <Text style={{ fontSize: regWidth * 13, fontWeight: "500", color: colors.nemoDark, }}>
                                Description
                            </Text>
                            <TextInput 
                                style={{
                                    borderBottomWidth: 1,
                                    fontSize: regWidth * 14,
                                    fontFamily: "NotoSansKR-Medium",
                                    marginTop: regHeight * 8,
                                }}
                                onChangeText={(payload) => setText(payload)}
                                multiline={true}
                            />
                        </View>
                        :
                        <>
                            {text ? 
                                <Text
                                    style={{
                                        fontSize: regWidth * 14,
                                        fontWeight: "500",
                                        lineHeight: regWidth * 21,
                                    }}
                                >
                                    {text}
                                </Text>
                                : 
                                <View style={{ alignItems: "center", }}>
                                    <Pressable
                                        style={{
                                            marginVertical: regHeight * 8,
                                            borderWidth: 1,
                                            borderColor: colors.nemoNormal,
                                            borderRadius: 20,
                                            paddingHorizontal: regWidth * 14,
                                            paddingVertical: regWidth * 6,
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                        onPress={() => setAddTextMode(true)}
                                    >
                                        <Image 
                                            source={iconPlusNemoNormal}
                                            style={{
                                                width: regWidth * 25,
                                                height: regWidth * 25,
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: regWidth * 17,
                                                fontWeight: "700",
                                                color: colors.nemoNormal,
                                            }}
                                        >
                                            Add Description
                                        </Text>
                                    </Pressable>
                                </View>
                            }
                        </>

                    }

                    <View
                        style={{ 
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
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
                                {`@${userTag}`}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 5, }}>
                                <Text style={styles.albumInfoTxt}>
                                    0
                                </Text>
                                <Text style={styles.albumInfoTxt}>
                                    {' likes'}
                                </Text>
                                <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
                                <Text style={styles.albumInfoTxt}>
                                    0
                                </Text>
                                <Text style={styles.albumInfoTxt}>
                                    {' Nemos'}
                                </Text>
                            </View>

                        </View>
                    </View>
                </View>
                {albumInfo === null ? 
                    <View style={{ alignItems: "center", marginTop: regHeight * 80, }}>
                        <Pressable
                            style={{
                                marginVertical: regHeight * 8,
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
                        <Text
                            style={{
                                fontSize: regWidth * 17,
                                fontWeight: "700",
                                color: colors.nemoDark,
                            }}
                        >
                            Add Nemos to your Nemolist
                        </Text>
                    </View>
                    :
                    <>
                        {loading ? 
                            <ActivityIndicator 
                                color="black" 
                                style={{marginTop: 100}} 
                                size="large"
                            />
                            :
                            <View style={{ marginTop: regHeight * 25, }}>
                                {albumInfo.bookmarks !== null && orderedBookmarks.map((bookmark, index) => (
                                    <BookmarkList bookmark={bookmark} navigation={navigation} key={index} />
                                ))}
                            </View>
                        }
                    </>
                }

            </ScrollView> */}
            <BottomSheetModal
                index={0}
                ref={addModalRef}
                snapPoints={addSnapPoints}
                backdropComponent={renderBackdrop}
                // backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                {/* <View 
                    // style={{ 
                    //     paddingBottom: 45, 
                    // }}
                > */}
                    <View style={styles.modalHeader}>
                        <Pressable
                            onPress={onCloseAddNemos}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: colors.textLight, }}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Text style={{ fontSize: regWidth * 19, fontWeight: "900", }}>
                            Add Nemos
                        </Text>
                        <Pressable
                            onPress={onAddBookmark}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: colors.textLight, }}>
                                Done
                            </Text>
                        </Pressable>
                    </View>
                    <BottomSheetScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        {bookmarks !== null && bookmarks.map((bookmark, index) => (
                            <Pressable
                                key={index}
                                onPress={() => selectBookmark(bookmark)}
                                style={{ 
                                    opacity: selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ? 1 : 0.5,
                                    justifyContent: "center",
                                }}
                            >
                                <UnTouchableBookmarkList bookmark={bookmark} navigation={navigation} />
                                {selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ?
                                    <Image 
                                        source={iconPlusCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 50,
                                            height: regWidth * 50,
                                            right: 0,
                                            marginRight: 22,
                                        }}
                                    />
                                    :
                                    <View style={styles.numbering}>
                                        <Text style={{ fontSize: 16, fontWeight: "500", color: "white", }}>
                                            {Number(selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id)) + 1}
                                        </Text>
                                    </View>
                                }
                            </Pressable>
                        ))}
                    </BottomSheetScrollView>
                {/* </View> */}
            </BottomSheetModal>
        </View>
    )
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
    albumHeader: {
        paddingHorizontal: regWidth * 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: regHeight * 8,
    },
    nameIpt: {
        fontSize: regWidth * 17,
        fontWeight: "500",
        borderBottomWidth: 1,
        borderBottomColor: colors.nemoDark,
        width: "100%",
        marginTop: regHeight * 68,
        // lineHeight: regWidth * 28,
        paddingHorizontal: regWidth * 4,
    },
    albumCover: {
        width: regWidth * 200,
        height: regWidth * 200,
        resizeMode: "contain",
        borderRadius: 5,
    },
    albumInfoTxt: {
        fontSize: regWidth * 14,
        fontWeight: "700",
        lineHeight: regWidth * 20,
        color: colors.textLight,
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
})

export {CreateNemolist1, CreateNemolist2, CreateNemolist3};