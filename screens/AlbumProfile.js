import { StyleSheet, View, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator, Modal, Alert, RefreshControl, } from "react-native";
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
import { setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, } from '../modules/user';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import iconEdit from '../assets/icons/iconEdit.png';
import iconTrash from '../assets/icons/iconTrash.png';
import iconAlert from '../assets/icons/iconAlert.png';
import iconFollow from '../assets/icons/iconFollow.png';
import iconEyeoff from '../assets/icons/iconEyeoff.png';

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


    useEffect(() => {
        fetchAlbum();
        fetchUserTag();
    }, [])

    const fetchAlbum = async() => {
        // console.log(albumId);
        try {
            setLoading(true)
            await Api.post("/api/v4/album/view/", {
                album_id: albumId,
            })
            .then((res) => {
                // console.log(res.data);
                // console.log(res.data.bookmarks);
                setAlbumInfo(res.data);
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
                album_id: albumId,
            })
            .then((res) => {
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
                album_id: albumId,
            })
            .then((res) => {
                setAddModalVisible(false);
                setSelectedBookmarks([]);
                fetchAlbum();
                dispatch(setShouldUserRefresh(true));
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
        Alert.alert("앨범을 삭제하시겠습니까?", "확인 버튼을 누르면 삭제됩니다.", [
            {
                text: "취소",
            },
            {
                text: "확인", 
                onPress: async() => {
                    try {
                        await Api.post("/api/v4/album/delete/", {
                            album_id: albumId,
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
        // @ts-ignore
        menuModalRef.current.dismiss();
    }, [menuModalRef]);

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
    },
    header: {
        // backgroundColor: "pink",
        marginTop: 60,
        marginHorizontal: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    AlbumCover: {
        width: 200,
        height: 200,
        resizeMode: "contain",

        ...Platform.select({
            ios: {
              shadowColor: "black",
              shadowOffset: {
                width: 5,
                // height: 5,
              },
              shadowOpacity: 0.5,
            //   shadowRadius: 10,
            },
            android: {
              elevation: 3,
            },
        }),
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
        marginVertical: regHeight * 12,
        marginHorizontal: regWidth * 18, 
    },
    numbering: {
        position: "absolute",
        backgroundColor: "#008000",
        width: SCREEN_WIDTH * 0.1,
        height: SCREEN_WIDTH * 0.1,
        marginTop: 18,
        right: 0,
        marginRight: 22,
        // marginLeft: SCREEN_WIDTH * 0.5 - 55,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "white",
        opacity: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
})

export default AlbumProfile;