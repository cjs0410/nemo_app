import { StyleSheet, View, SafeAreaView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator, Modal, Alert, RefreshControl, ImageBackground, Vibration, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, useMemo, } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankAvatar from '../assets/images/peopleicon.png';
import bookCover from '../assets/images/steve.jpeg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import { BookmarkList, } from '../components';
import { UnTouchableBookmarkList, } from "../components/BookmarkList";
import {colors, regWidth, regHeight} from '../config/globalStyles';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, setShouldNemolistRefresh, } from '../modules/user';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import iconEdit from '../assets/icons/iconEdit.png';
import iconTrash from '../assets/icons/iconTrash.png';
import iconAlert from '../assets/icons/iconAlert.png';
import iconFollow from '../assets/icons/iconFollow.png';
import iconEyeoff from '../assets/icons/iconEyeoff.png';
import iconThreeDot from '../assets/icons/iconThreeDot.png';
import vectorLeftImage from '../assets/icons/vector_left.png';
import likedNemos from '../assets/images/likedNemos.png';
import shadow from '../assets/images/shadow.png';
import iconHeart from '../assets/icons/iconHeart.png';
import iconHeartOutline from '../assets/icons/iconHeartOutline.png';
import iconPlusNemoDark from '../assets/icons/iconPlusNemoDark.png';
import iconPlusCircle from '../assets/icons/iconPlusCircle.png';

import LinearGradient from 'react-native-linear-gradient';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const AlbumProfile = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { albumId, } = route.params;
    const [loading, setLoading] = useState(false);
    const [albumInfo, setAlbumInfo] = useState(null);
    const albumCoverValue = useRef(new Animated.Value(0)).current;
    const avatarValue = useRef(new Animated.Value(0)).current;

    const [albumModalVisible, setAlbumModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [bookmarks, setBookmarks] = useState(null);
    const [selectedBookmarks, setSelectedBookmarks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userTag, setUserTag] = useState(null);

    const [bookmarkNumbering, setBookmarkNumbering] = useState(null);
    const [orderedBookmarks, setOrderedBookmarks] = useState(null);

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectToDelete, setSelectToDelete] = useState([]);

    const [headerHeight, setHeaderHeight] = useState(0);
    const [isLike, setIsLike] = useState(false);
    const [isFollow, setIsFollow] = useState(false);
    const [isDefault, setIsDefault] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const insets = useSafeAreaInsets();
    const [rgb, setRgb] = useState(null);

    useEffect(() => {
        fetchUserTag();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAlbum();
        }, []),
    )

    const fetchAlbum = async() => {
        try {
            setLoading(true);
            console.log(albumId);
            await Api.post("/api/v4/album/view/", {
                nemolist_id: albumId,
            })
            .then((res) => {
                const bgdColor = res.data.background;
                if (bgdColor) {
                    setRgb(bgdColor.replace(/^#/, '').match(/.{2}/g).map(replacer => parseInt(replacer, 16) || 0));
                }
                console.log(res.data.bookmarks);
                setAlbumInfo(res.data);
                setIsLike(res.data.is_like);
                setLikeCount(res.data.likes);
                setIsFollow(res.data.is_follow);
                setIsDefault(res.data.default);

                setBookmarkNumbering(
                    (res.data.bookmarks.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a)
                )
                const orderedNumbering = (res.data.bookmarks.map((bookmark) => (Number(bookmark.numbering)))).sort((a, b) => b - a);
                setOrderedBookmarks(
                    orderedNumbering.map((number) => res.data.bookmarks.find(bookmark => Number(bookmark.numbering) === Number(number)))
                )
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const fetchUserTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setUserTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

    const onLike = async() => {
        try {
            await Api
            .post("api/v4/album/like/", {
                nemolist_id: albumId,
            })
            .then((res) => {
                // console.log(res.data);
                setIsLike(res.data.is_like);
                setLikeCount(res.data.likes);
                if (res.data.is_like) {
                    Alert.alert(albumInfo.nemolist_title, "is added to your library");
                    Vibration.vibrate(30);
                } else {
                    Alert.alert(albumInfo.nemolist_title, "is deleted from your library");
                }
                dispatch(setShouldNemolistRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onFollow = async() => {
        // setIsFollow(!isFollow);
        try {
            await Api
            .post("api/v1/user/follow/", {
                user_tag: albumInfo.user_tag,
            })
            .then((res) => {
                // console.log(res.data);
                setIsFollow(res.data.is_follow);
                // setFollowers(res.data.count);
                // dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const showAlbumCover = () => {
        Animated.timing(albumCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const showAvatar = () => {
        Animated.timing(avatarValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

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
                fetchAlbum();
                onCloseAddNemos();
                // dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);
        await fetchAlbum()
        .then(() => setRefreshing(false));
        // wait(2000).then(() => setRefreshing(false));
    }, []);

    const deleteAlbum = async() => {
        Alert.alert("Are you sure?", "Once you delete your Nemolist, it can't be restored.", [
            {
                text: "Yes",
                style: 'destructive',
                onPress: async() => {
                    try {
                        await Api.post("/api/v4/album/delete/", {
                            nemolist_id: albumId,
                        })
                        .then((res) => {
                            setAlbumModalVisible(false);
                            navigation.goBack();
                            dispatch(setShouldUserRefresh(true));
                        })
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            {
                text: "Cancel", 
            }
        ]);
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
                    album_id: albumId,
                    bookmark_id: bookmarkIds,
                })
                .then((res) => {
                    console.log("delete");
                    fetchAlbum();
                    dispatch(setShouldUserRefresh(true));
                })
            } catch (err) {
                console.error(err);
            }
        }

    }

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                // animatedIndex={{
                //     value: 0,
                // }}
            />
        ),
        []
    );

    const menuModalRef = useRef();
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const onPressMenu = useCallback(() => {
        menuModalRef.current.present();
    }, [menuModalRef]);

    const onPressClose = useCallback(() => {
        menuModalRef.current.dismiss();
    }, [menuModalRef]);

    const addModalRef = useRef();
    const addSnapPoints = useMemo(() => [regHeight * 765], []);
    const onPressAddNemos = useCallback(() => {
        addModalRef.current.present();
    }, [addModalRef]);
    const onCloseAddNemos = useCallback(() => {
        addModalRef.current.dismiss();
    }, [addModalRef]);



    return (
        <View 
            style={{
                ...styles.container,
            }}
        >
            {albumInfo !== null ? 
                <>
                    <View 
                        style={{
                            backgroundColor: albumInfo.background ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)` : "#baa2ff",
                            paddingTop: insets.top,
                            paddingBottom: 0,
                            paddingLeft: insets.left,
                            paddingRight: insets.right,
                        }}
                    >
                        <View style={styles.header}>
                            <Pressable
                                onPress={() => navigation.goBack()}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Image 
                                    source={vectorLeftImage} 
                                    style={{ width: regWidth*30, height: regWidth*30 }}
                                />
                            </Pressable>
                            <Text
                                style={{
                                    fontSize: regWidth * 17,
                                    fontFamily: "NotoSansKR-Bold",
                                }}
                            >
                                {albumInfo.nemolist_title}
                            </Text>
                            <Pressable
                                onPress={onPressMenu}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Image 
                                    source={iconThreeDot} 
                                    style={{ width: regWidth*35, height: regWidth*35 }}
                                />
                            </Pressable>
                        </View>
                    </View>
                    <ScrollView
                        style={{
                            // marginTop: -headerHeight,
                            zIndex: 0,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View
                            style={{
                                backgroundColor: albumInfo.background ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)` : "#baa2ff",
                                width: "100%",
                                height: regHeight * 500,
                                marginTop: -regHeight * 500,
                            }}
                        />
                        <LinearGradient 
                            colors={[
                                albumInfo.background ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)` : "#baa2ff", 
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
                            {/* <ImageBackground
                                source={shadow}
                                style={{
                                    width: regWidth * 220,
                                    height: regWidth * 220,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    // marginTop: headerHeight + regHeight * 40,
                                    marginTop: regHeight * 40,
                                }}
                            > */}
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
                                    source={ albumInfo.nemolist_cover !== null ? { uri: albumInfo.nemolist_cover} : likedNemos} 
                                    style={{
                                        ...styles.albumCover,
                                        opacity: albumCoverValue,
                                        marginTop: -regWidth * 10,
                                    }}
                                    onLoadEnd={showAlbumCover}
                                />
                            {/* </ImageBackground> */}
                            </View>
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
                                    <Pressable
                                        onPress={() => navigation.navigate("OtherProfile", { userTag: albumInfo.user_tag,  })}
                                    >
                                        <Text
                                            style={{
                                                fontSize: regWidth * 14,
                                                fontWeight: "700",
                                                color: colors.nemoDark,
                                            }}
                                        >
                                            {`@${albumInfo.user_tag}`}
                                        </Text>
                                    </Pressable>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 5, }}>
                                        {isDefault ? 
                                            null
                                        : 
                                            <Pressable
                                                onPress={() => navigation.push('LikeUsers', { ctg: "nemolist", })}
                                                style={{ flexDirection: "row", alignItems: "center", }}
                                            >
                                                <Text style={styles.albumInfoTxt}>
                                                    {likeCount}
                                                </Text>
                                                <Text style={styles.albumInfoTxt}>
                                                    {' likes'}
                                                </Text>
                                                <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
                                            </Pressable>
                                        }

                                        
                                        <Text style={styles.albumInfoTxt}>
                                            {albumInfo.nemos}
                                        </Text>
                                        <Text style={styles.albumInfoTxt}>
                                            {' Nemos'}
                                        </Text>
                                    </View>

                                </View>
                                {albumInfo.user_tag === userTag ? 
                                    <>
                                        {isDefault ? 
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
                                    </>

                                    :
                                    <Pressable
                                        onPress={onLike}
                                    >
                                        <Image 
                                            source={isLike ? iconHeart : iconHeartOutline}
                                            style={{
                                                width: regWidth * 35,
                                                height: regWidth * 35,
                                            }}
                                        />
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
                                {albumInfo.bookmarks !== null && orderedBookmarks.map((bookmark, index) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={() => navigation.push('BookmarkNewDetail', {bookmarks: orderedBookmarks, subTitle: albumInfo.nemolist_title, title: "Bookmarks", index: index, })} 
                                        key={index}
                                    >
                                        <BookmarkList bookmark={bookmark} navigation={navigation} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        }

                    </ScrollView>
                </>
                :
                null
            }
            <BottomSheetModal
                index={0}
                ref={menuModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Pressable
                        onPress={onPressClose}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                            Cancel
                        </Text>
                    </Pressable>
                    {albumInfo && albumInfo.user_tag !== userTag ? 
                        <>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}
                                onPress={onFollow}
                            >
                                <Image 
                                    source={iconFollow}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        {isFollow ? `Unfollow @${albumInfo.user_tag}` : `Follow @${albumInfo.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconEyeoff}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        {`Block @${albumInfo.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Report your issue
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                        :
                        <>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}
                                onPress={() => {
                                    navigation.navigate("EditAlbum", { albumInfo: albumInfo, albumId: albumId, });
                                    onPressClose();
                                }}
                            >
                                <Image 
                                    source={iconEdit}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Edit
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Edit your Nemolist
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                                onPress={deleteAlbum}
                            >
                                <Image 
                                    source={iconTrash}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Delete
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Delete Nemolist from your library
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Report your issue
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                    }

                </View>
            </BottomSheetModal>
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
                                    // opacity: selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ? 1 : 0.5,
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

    return (
        <View style={styles.container}>
            {albumInfo !== null ? 
                <>
                    <View style={styles.header}>
                        {isDeleteMode ? 
                            <Pressable 
                                onPress={() => {
                                    setIsDeleteMode(false);
                                    setSelectToDelete([]);
                                }}
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "red", }}>
                                    취소
                                </Text>
                            </Pressable>
                            :
                            <Pressable 
                                onPress={() => navigation.goBack()}
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            >
                                <Ionicons name="chevron-back" size={28} color="black" />
                            </Pressable>
                        }

                        <View style={{ alignItems: "center", }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>
                                {albumInfo.album_title}
                            </Text>
                        </View>
                        {isDeleteMode ? 
                            <Pressable 
                                onPress={() => {
                                    setIsDeleteMode(false);
                                    setSelectToDelete([]);
                                    onDeleteBookmarks();
                                }}
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#008000", }}>
                                    완료
                                </Text>
                            </Pressable>
                            :
                            <Pressable
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                // onPress={() => setAlbumModalVisible(true)}
                                onPress={onPressMenu}
                                // style={{
                                //     opacity: albumInfo.user_tag !== userTag ? 0 : 1,
                                // }}
                                // disabled={albumInfo.user_tag !== userTag ? true : false}
                            >
                                <Entypo name="dots-three-horizontal" size={24} color="black" />
                            </Pressable>
                        }
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                              refreshing={refreshing}
                              onRefresh={onRefresh}
                            />
                        }
                    >
                        <View style={{ alignItems: "center", }}>
                            <Animated.Image 
                                source={ albumInfo.album_cover !== null ? { uri: albumInfo.album_cover} : bookCover} 
                                style={{
                                    ...styles.AlbumCover,
                                    opacity: albumCoverValue,
                                }}
                                onLoadEnd={showAlbumCover}
                            />
                            <Text style={{ fontSize: 20, fontWeight: "700", marginVertical: 20,}}>
                                {albumInfo.album_title}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 3,}}>
                                <Animated.Image 
                                    source={ albumInfo.user_avatar !== null ? { uri: albumInfo.user_avatar} : blankAvatar} 
                                    style={{
                                        ...styles.profileImage,
                                        opacity: avatarValue,
                                    }}
                                    onLoadEnd={showAvatar}
                                />
                                <Pressable
                                    onPress={() => navigation.push('OtherProfile', { userTag: albumInfo.user_tag, })}
                                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: "500", marginHorizontal: 8, }}>
                                        {albumInfo.name}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 15, marginVertical: 12, }} >
                            <View style={{ flexDirection: "row", alignItems: "center", }}>
                                {/* <Feather name="bookmark" size={30} color="#606060" /> */}
                                <FontAwesome name="bookmark" size={30} color="#606060" />
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", marginHorizontal: 8, }}>
                                    {albumInfo.bookmark_count}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: "#606060", }}>
                                    {albumInfo.created_date.split('T')[0]}
                            </Text>
                            {/* <TouchableOpacity activeOpacity={1} onPress={selectBookmark}>
                                <View style={{...styles.bookmarkOrPost, borderBottomColor: isBookmark ? "red" : "white" }}>
                                    <Feather name="bookmark" size={24} color={isBookmark ? "red" : "black"} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        marginHorizontal: 4,
                                        color: isBookmark ? "red" : "black"
                                    }}>
                                        {bookInfo.bookmarks ? bookInfo.bookmarks.length : null}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} onPress={selectPost}>
                                <View style={{...styles.bookmarkOrPost, borderBottomColor: !isBookmark ? "red" : "white" }}>
                                    <Feather name="folder" size={24} color={!isBookmark ? "red" : "black"} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        marginHorizontal: 4,
                                        color: !isBookmark ? "red" : "black"
                                    }}>
                                        {bookInfo.albums ? bookInfo.albums.length : null}
                                    </Text>
                                </View>
                            </TouchableOpacity> */}
                        </View>

                        {loading ? 
                            <ActivityIndicator 
                                color="black" 
                                style={{marginTop: 100}} 
                                size="large"
                            />
                            : 
                            <>
                                {isDeleteMode ? 
                                    <View>
                                        {albumInfo.bookmarks !== null && orderedBookmarks.map((bookmark, index) => (
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={() => onSelectToDelete(bookmark)}
                                                style={{ opacity: selectToDelete.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ? 1 : 0.5 }}
                                                key={index}
                                            >
                                                <UnTouchableBookmarkList bookmark={bookmark} navigation={navigation} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    :
                                    <View>
                                        {albumInfo.bookmarks !== null && orderedBookmarks.map((bookmark, index) => (
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={() => navigation.push('BookmarkNewDetail', {bookmarks: orderedBookmarks, subTitle: albumInfo.album_title, title: "북마크", index: index, })} 
                                                key={index}
                                            >
                                                <BookmarkList bookmark={bookmark} navigation={navigation} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                }

                            </>
                        }

                    </ScrollView>
                </>
                : 
                null
            }

            <BottomSheetModal
                index={0}
                ref={menuModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Pressable
                        onPress={onPressClose}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                            Cancel
                        </Text>
                    </Pressable>
                    {albumInfo && albumInfo.user_tag !== userTag ? 
                        <>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}>
                                <Image 
                                    source={iconFollow}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        {`Follow @${albumInfo.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconEyeoff}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        {`Block @${albumInfo.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Report your issue
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                        :
                        <>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}>
                                <Image 
                                    source={iconEdit}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Edit
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Edit your Nemolist
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                                onPress={deleteAlbum}
                            >
                                <Image 
                                    source={iconTrash}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Delete
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Delete Nemolist from your library
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Report your issue
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                    }

                </View>
            </BottomSheetModal>

            {/* <Modal
                // animationType="fade"
                transparent={true}
                visible={albumModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setAlbumModalVisible(false);
                        }
                    }
                />
                    <Animated.View 
                        style={{
                            ...styles.modal,
                        }}
                    >
                            <TouchableOpacity 
                                style={styles.menu}
                                activeOpacity={1}
                                onPress={deleteAlbum}
                            >
                                <Feather name="trash" size={24} color="black" />
                                <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                    앨범 삭제하기
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.menu}
                                activeOpacity={1}
                                onPress={() => {
                                    setIsDeleteMode(true);
                                    setAlbumModalVisible(false);
                                }}
                            >
                                <Feather name="trash" size={24} color="black" />
                                <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                    북마크 삭제하기
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.menu}
                                activeOpacity={1}
                                onPress={() => {
                                    setAddModalVisible(true);
                                    setAlbumModalVisible(false);
                                    fetchBookmarks();
                                }}
                            >
                                <AntDesign name="pluscircleo" size={24} color="black" />
                                <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                    북마크 추가하기
                                </Text>
                            </TouchableOpacity>

                    </Animated.View>
            </Modal>
            <Modal
                // animationType="fade"
                transparent={true}
                visible={addModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setAddModalVisible(false);
                        }
                    }
                />
                    <Animated.View 
                        style={{
                            ...styles.addModal,
                            height: regHeight * 650
                        }}
                    >
                        <View style={styles.modalHeader}>
                            <Pressable
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                onPress={() => {
                                    setAddModalVisible(false);
                                }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", }}>
                                    취소
                                </Text>
                            </Pressable>
                            <Text style={{ fontSize: 16, fontWeight: "700", }}>
                                북마크 추가하기
                            </Text>
                            <Pressable
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                onPress={onAddBookmark}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#008000" }}>
                                    완료
                                </Text>
                            </Pressable>
                        </View>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                        >
                            {bookmarks !== null && bookmarks.map((bookmark, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => selectBookmark(bookmark)}
                                    style={{ opacity: selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ? 1 : 0.5 }}
                                >
                                    <UnTouchableBookmarkList bookmark={bookmark} navigation={navigation} />
                                    {selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ?
                                        null
                                        :
                                        <View style={styles.numbering}>
                                            <Text style={{ fontSize: 16, fontWeight: "500", color: "white", }}>
                                                {Number(selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id)) + 1}
                                            </Text>
                                        </View>
                                    }
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Animated.View>
            </Modal> */}
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

export default AlbumProfile;