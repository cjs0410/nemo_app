import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Pressable, Modal, Alert, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, useMemo, } from "react";
import { Entypo } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import Card from './Card';
import Api from '../lib/Api';
import blankAvatar from '../assets/images/peopleicon.png';
import BottomSheet, { BottomSheetView, BottomSheetFooter } from '@gorhom/bottom-sheet';
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector, scrapSelector } from '../modules/hooks';
import { addBookmark } from '../modules/bookmarks';
import { addScrap, deleteScrap } from '../modules/scraps';
import { setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';

import analytics from '@react-native-firebase/analytics';
import { unloadAsync } from "expo-font";
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

const BookmarkDetail = (props) => {
    const dispatch = useDispatch();
    const captureRef = useRef();
    const { isStaff, } = useSelector(userSelector);
    const bookmark = props.bookmark;
    const navigation = props.navigation;
    const [current, setCurrent] = useState(0);
    const [contentsByNum, setContentsByNum] = useState([]);
    const value = useRef(new Animated.Value(0)).current;
    const [isScrap, setIsScrap] = useState(bookmark.is_scrap);
    const [scrapCount, setScrapCount] = useState(bookmark.scraps);
    const [isLike, setIsLike] = useState(bookmark.is_like);
    const [likeCount, setLikeCount] = useState(bookmark.likes);
    const [userTag, setUserTag] = useState(null);
    
    const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportContents, setReportContents] = useState('');
    const [albumModalVisible, setAlbumModalVisible] = useState(false);
    const modalValue = useRef(new Animated.Value(0)).current;
    const [albums, setAlbums] = useState(null);

    const [pushLike, setPushLike] = useState(false);
    const [pushScrap, setPushScrap] = useState(false);

    useEffect(() => {
        // console.log(bookmark);
        fetchUserTag();
        // console.log(bookmark.is_like);
    }, [])

    useFocusEffect(
        useCallback(() => {
            // console.log("a");
            // setPushLike(false);
            // setIsLike(bookmark.is_like);
            // setLikeCount(bookmark.likes);
            fetchFactor();
        }, [])
    )

    // useEffect(() => {
    //     console.log(pushLike);
    // }, [pushLike]);

    // useEffect(() => {
    //     console.log(captureRef);
    // }, [captureRef]);

    const fetchUserTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setUserTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchFactor = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/detail/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                // console.log(res.data);
                setIsLike(res.data.is_like);
                setLikeCount(res.data.like);
                setIsScrap(res.data.is_scrap);
                setScrapCount(res.data.scrap);
            })
        } catch (err) {
            console.error(err);
        }
    }

    // useEffect(() => {
    //     const cardNum = parseInt(bookmark.contents.length / 200) + 1;
    //     let copy = [];

    //     for ( let i = 0; i < cardNum; i++) {
    //         copy = [...copy, bookmark.contents.substring(i * 200, (i + 1) * 200)]
    //     }
    //     setContentsByNum(copy);
    // }, [])


    const handleCurrentChange = (e) => {
        const nextCurrent = Math.floor(
            e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 26),
        );
        if (nextCurrent < 0) {
            return;
        }
        // console.log(nextCurrent);
        setCurrent(nextCurrent);
    };

    const showAvatar = () => {
        Animated.timing(value, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    // const showModal = () => {
    //     Animated.timing(value, {
    //         toValue: 1,
    //         duration: 1000,
    //         useNativeDriver: false,
    //     }).start();
    // }

    // const unShowModal = () => {
    //     Animated.timing(value, {
    //         toValue: 0,
    //         duration: 1000,
    //         useNativeDriver: false,
    //     }).start();
    // }

    // const showOrUnshow = () => {
    //     if (bookmarkModalVisible === false) {
    //         showModal();
    //     } else {
    //         unShowModal();
    //     }
    //     setBookmarkModalVisible(!bookmarkModalVisible);
    // }


    const onLike = async() => {
        setPushLike(true);
        try {
            await Api
            .post("/api/v2/bookmark/likes/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then(async(res) => {
                setIsLike(res.data.is_like);
                setLikeCount(res.data.count);
                // dispatch(setShouldHomeRefresh(true));
                dispatch(setShouldLibraryRefresh(true));
                dispatch(setShouldUserRefresh(true));
                if (res.data.is_like) {
                    await analytics().logEvent('like', {
                        writer_tag: bookmark.user_tag,
                        bookmark_id: bookmark.bookmark_id,
                        book_id: bookmark.book_id,
                    })
                }
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onScrap = async() => {
        setPushScrap(true);
        try {
            await Api
            .post("/api/v2/bookmark/scraps/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setIsScrap(res.data.is_scrap);
                setScrapCount(res.data.count);
                dispatch(setShouldLibraryRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onReport = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/report/", {
                bookmark_id: bookmark.bookmark_id,
                report: reportContents,
            })
            .then((res) => {
                setReportVisible(false);
                Alert.alert("?????? ??????", "????????? ?????????????????????.");
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchAlbumList = async() => {
        try {
            await Api
            .get("/api/v4/album/list/")
            .then((res) => {
                console.log(res.data);
                setAlbums(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const deleteBookmark = async() => {
        Alert.alert("???????????? ?????????????????????????", "?????? ????????? ????????? ???????????????.", [
            {
                text: "??????",
                // onPress: () => {
                //     setBookmarkModalVisible(false);
                //     setReportVisible(false);
                // }
            },
            {
                text: "??????", 
                onPress: async() => {
                    try {
                        // console.log(bookmark.bookmark_id);
                        await Api.post("/api/v2/bookmark/delete/", {
                            bookmark_id: bookmark.bookmark_id,
                        })
                        .then((res) => {
                            setBookmarkModalVisible(false);
                            setReportVisible(false);
                            dispatch(setShouldHomeRefresh(true));
                            dispatch(setShouldLibraryRefresh(true));
                            dispatch(setShouldUserRefresh(true));
                        })
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        ]);
    }

    const addToAlbum = async(albumId) => {
        console.log(albumId);
        try {
            await Api
            .post("/api/v4/album/addbookmark/", {
                album_id: albumId,
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setAlbumModalVisible(false);
                console.log("added!");
            })
        } catch (err) {
            if (err.response.status === 409) {
                Alert.alert(
                    "??????",
                    "?????? ?????? ????????? ???????????? ???????????? ????????????.",
                    [
                        { text: "OK!" }
                    ]
                )
            } else {
                console.error(err);
            }
        }
    }

    const onCapture = () => {
        captureRef.current.capture().then((uri) => {
        console.log("do something with ", uri);
        Sharing.shareAsync("file://" + uri);
        }),
        (error) => console.error("Oops, snapshot failed", error);
    };


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


    if (bookmark === null) {
        return;
    }


    return (
        <>
        {/* <BottomSheetModalProvider> */}
            <View style={styles.bookmarkContainer}>
                <View style={styles.bookmarkTop}>
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Animated.Image 
                            source={ bookmark.avatar !== null ? { uri: bookmark.avatar } : blankAvatar} 
                            style={{
                                ...styles.bookmarkWriterImage,
                                opacity: value,
                            }} 
                            // onLoadStart={}
                            onLoadEnd={showAvatar}
                        />
                        <Pressable 
                            activeOpacity={1} 
                            onPress={() => navigation.push('OtherProfile', { userTag: bookmark.user_tag, })} 
                            hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                        >
                            <Text style={styles.bookmakrWriterName}>{bookmark.writer_name}</Text>
                        </Pressable>
                        <Entypo name="dot-single" size={10} color="#808080" />
                        <View>
                            <Text style={styles.bookmarkDateText}>{bookmark.created_date.split('T')[0]}</Text>
                        </View>
                    </View>
                    <Pressable
                        hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                        // onPress={() => setBookmarkModalVisible(true)}
                        onPress={onPressMenu}
                        // onPress={showOrUnshow}
                        // onPress={handlePresentModalPress}
                        // onPress={() => {
                        //     setBookmarkModalVisible(true);
                        //     handleSnapPress(1);
                        // }}
                    >
                        <Entypo name="dots-three-horizontal" size={regWidth * 18} color="black" />
                    </Pressable>
                </View>
                <ViewShot
                            ref={captureRef}
                            options={{ fileName: "Your-File-Name", format: "jpg", quality: 0.9 }}
                            // key={index}
                        >
                <ScrollView
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    // onScrollEndDrag={handleCurrentChange}
                    onScroll={handleCurrentChange}
                    scrollEventThrottle={16}
                    scrollEnabled={bookmark.contents.length === 1 ? false : true}
                >
                    {/* {bookmark.nemos.map((nemo, index) => (
                        <Card 
                            bookmark={bookmark} 
                            nemo={nemo} 
                            navigation={navigation} 
                            key={index} 
                        />
                    ))} */}
                    {/* {contentsByNum.map((contents, index) => (
                        <Card 
                            bookmark={bookmark} 
                            // nemo={nemo} 
                            contents={contents}
                            navigation={navigation} 
                            key={index} 
                        />
                    ))} */}
                    {bookmark.contents.map((content, index) => (
                        // <ViewShot
                        //     ref={captureRef}
                        //     options={{ fileName: "Your-File-Name", format: "jpg", quality: 0.9 }}
                        //     key={index}
                        // >
                        <Card 
                            bookmark={bookmark} 
                            contents={content}
                            navigation={navigation} 
                            index={index}
                            captureRef={captureRef}
                            key={index} 
                        />
                        // </ViewShot>
                    ))}
                    
                </ScrollView>
                </ViewShot>
                {bookmark.contents.length === 1 ? 
                    null
                    :
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: -12, }}>
                        {bookmark.contents.map((contents, index) => {
                            if (index === current) {
                                return <Entypo name="dot-single" size={regWidth * 24} color="red" style={{ marginHorizontal: -regWidth * 6, }} key={index} />
                            }
                            return <Entypo name="dot-single" size={regWidth * 24} color="grey" style={{ marginHorizontal: -regWidth * 6, }} key={index} />
                        })}
                    </View>
                }


                <View style={styles.bookmarkInfo}>
                    {bookmark.text.length !== 0 ? 
                        <Text style={styles.bookmarkInfoText}>
                            {bookmark.text} 
                        </Text>
                        :
                        null
                    }
                    {bookmark.tags.length !== 0 ? 
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: regHeight * 15, }}>
                            {bookmark.tags.map((tag, index) => (
                                <Text style={styles.bookmarkHashtag} key={index}>
                                    {`#${tag.tag}`}
                                </Text>
                            ))}
                        </View>
                        :
                        null
                    }


                </View>

                <View style={styles.bookmarkLikes}>
                    <Pressable 
                        activeOpacity={1} 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            // width: regWidth * 35,
                            paddingRight: regWidth * 8,
                            paddingLeft: regWidth * 13,
                            paddingVertical: regHeight * 8,
                        }}
                        hitSlop={{ bottom: 20, left: 60, right: 60, top: 20 }}
                        onPress={onLike}
                    >
                        <Entypo 
                            // name={ !pushLike ? (bookmark.is_like ? "heart" : "heart-outlined") : (isLike ? "heart" : "heart-outlined") } 
                            name={isLike ? "heart" : "heart-outlined"}
                            size={regWidth * 26} 
                            color={isLike ? "red" : "black"}
                        />
                    </Pressable>
                    <Pressable 
                        activeOpacity={1} 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            width: regWidth * 60,
                            paddingVertical: regHeight * 8,
                        }}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                        onPress={() => navigation.push('LikeUsers', { bookmarkId: bookmark.bookmark_id, })}
                    >
                        <Text style={styles.bookmarkLikesText}>
                            {/* { !pushLike ? bookmark.likes : likeCount } */}
                            { `${likeCount}` }
                        </Text>
                    </Pressable>
                    <Pressable 
                        activeOpacity={1} 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            paddingVertical: regHeight * 8,

                        }}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        onPress={onScrap}
                        disabled={userTag === bookmark.user_tag}
                    >
                        <Feather 
                            name="download" 
                            size={regWidth * 25}
                            // color={ userTag === bookmark.user_tag ? "#008000" : (!pushScrap ? (bookmark.is_scrap ? "red" : "black") : (isScrap ? "red" : "black")) }
                            color={ userTag === bookmark.user_tag ? "#C9C9C9" : (isScrap ? "#298CFF" : "black") }
                            style={{
                                width: regWidth * 30,
                            }}
                            // color={scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id)) === -1 ? "black" : "red"} 
                        />
                        <Text 
                            style={{
                                ...styles.bookmarkLikesText, 
                                color: userTag === bookmark.user_tag ? "#C9C9C9" : "black",
                            }}
                        >
                            {/* { !pushScrap ? bookmark.scraps : scrapCount } */}
                            { scrapCount }
                        </Text>
                    </Pressable>

                    {/* { userTag !== bookmark.user_tag ? 
                        <Pressable 
                            activeOpacity={1} 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                            }}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={onScrap}
                        >
                            <Feather 
                                name="download" 
                                size={regWidth * 20}
                                color={isScrap ? "red" : "black" }
                                // color={scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id)) === -1 ? "black" : "red"} 
                            />
                            <Text style={styles.bookmarkLikesText}>{scrapCount}</Text>
                        </Pressable>
                        :
                        null
                    } */}


                    {/* {watermark === post.nickname ?
                        null
                        :
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                            }}
                            onPress={onScrap}
                        >
                            <Feather 
                                name="download" 
                                size={24} 
                                color={scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id)) === -1 ? "black" : "red"} 
                            />
                            <Text style={styles.bookmarkLikesText}>{scrapNum}</Text>
                        </TouchableOpacity>
                    } */}

                </View>
            </View>
            {/* <Modal
                transparent={true}
                visible={bookmarkModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setBookmarkModalVisible(false);
                            setReportVisible(false);
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
                            onPress={() => {
                                setBookmarkModalVisible(false);
                                setAlbumModalVisible(true);
                                fetchAlbumList();
                            }}
                        >
                            <AntDesign name="pluscircleo" size={24} color="black" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                ????????? ????????????
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => {
                                setBookmarkModalVisible(false);
                                onCapture();
                            }}
                        >
                            <Entypo name="share-alternative" size={24} color="black" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                ?????? ??? ????????????
                            </Text>
                        </TouchableOpacity>

                        {(bookmark.user_tag === userTag) || (isStaff === true) ? 
                            <>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    onPress={() => {
                                        setBookmarkModalVisible(false);
                                        setReportVisible(false);
                                        navigation.navigate('EditBookmark', { 
                                            bookmark: bookmark,
                                        });
                                    }}
                                >
                                    <AntDesign name="edit" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        ????????????
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    onPress={deleteBookmark}
                                >
                                    <Feather name="trash" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        ????????????
                                    </Text>
                                </TouchableOpacity>
                            </>
                            :
                            <TouchableOpacity 
                                style={styles.menu}
                                activeOpacity={1}
                                onPress={() => {
                                    setBookmarkModalVisible(false);
                                    setReportVisible(true);
                                }}
                            >
                                <Entypo name="warning" size={24} color="black" />
                                <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>??????</Text>
                            </TouchableOpacity>
                        }


                    </Animated.View>

            </Modal> */}

            {/* <Modal
                animationType="fade"
                transparent={true}
                visible={bookmarkModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setBookmarkModalVisible(false);
                            setReportVisible(false);
                        }
                    }
                />
                    <BottomSheet
                        ref={bottomSheetRef}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                    >
                    <BottomSheetView 
                        style={{
                            ...styles.modal,
                            // transform: [
                            //     {
                            //         translateY: modalValue.interpolate({
                            //             inputRange: [0, 1],
                            //             outputRange: [0, 300]
                            //         })
                            //     }
                            // ]
                        }}
                    >
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => {
                                setBookmarkModalVisible(false);
                                setReportVisible(true);
                            }}
                        >
                            <Entypo name="warning" size={24} color="red" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>??????</Text>
                        </TouchableOpacity>
                        {bookmark.user_tag === userTag ? 
                            <>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    onPress={() => {
                                        setBookmarkModalVisible(false);
                                        setReportVisible(false);
                                        navigation.navigate('EditBookmark', { 
                                            bookmark: bookmark,
                                        });
                                    }}
                                >
                                    <AntDesign name="edit" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        ????????????
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    // onPress={deletePost}
                                >
                                    <Feather name="trash" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        ????????????
                                    </Text>
                                </TouchableOpacity>
                            </>
                            :
                            null
                        }
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => {
                                setBookmarkModalVisible(false);
                                setAlbumModalVisible(true);
                                fetchAlbumList();
                            }}
                        >
                            <AntDesign name="pluscircleo" size={24} color="black" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                ????????? ????????????
                            </Text>
                        </TouchableOpacity>

                    </BottomSheetView>
                    </BottomSheet>
            </Modal> */}


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
                    {bookmark.user_tag !== userTag ? 
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
                                        {`Follow @${bookmark.user_tag}`}
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
                                        {`Block @${bookmark.user_tag}`}
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
                                        Edit your Nemo
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                                onPress={deleteBookmark}
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
                                        Delete Nemo from your library
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
                visible={reportVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setReportVisible(false);
                        }
                    }
                />
                <KeyboardAvoidingView
                    style={{
                        ...styles.modal, 
                        height: regHeight * 650, 
                    }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <Entypo name="warning" size={24} color="red" />
                        <TextInput 
                            style={styles.reportInput}
                            placeholder="?????? ????????? ???????????????."
                            onChangeText={(payload => setReportContents(payload))}
                            multiline={true}
                        />
                    <TouchableOpacity 
                        style={{...styles.menu, justifyContent: "center", backgroundColor: "red"}}
                        activeOpacity={1}
                        onPress={onReport}
                    >
                        <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "white", }}>????????????</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal> */}

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
                <View
                    style={{
                        ...styles.addModal, 
                        height: regHeight * 480, 
                        bottom: 0,
                    }}
                >
                    <View style={{ alignItems: "center", marginTop: regHeight * 28,}}>
                        <Text style={{ fontSize: 16, fontWeight: "700", }}>
                            ????????? ?????? ??????
                        </Text>
                    </View>
                    <View style={{ alignItems: "center", }}>
                        <ScrollView
                            style={styles.albumListContainer}
                        >
                            {albums !== null && albums.map((album, index) => (
                                <Pressable 
                                    style={styles.albumList}
                                    key={index}
                                    onPress={() => addToAlbum(album.album_id)}
                                >
                                    <Image 
                                        source={{ uri: album.album_cover }}
                                        style={styles.albumImage}
                                    />
                                    <Text style={{ fontSize: 15, fontWeight: "500", marginHorizontal: 8, }}>
                                        {album.album_title}
                                    </Text>
                                </Pressable>
                            ))}


                        </ScrollView>
                    </View>
                </View>
            </Modal> */}
            {/* </BottomSheetModalProvider> */}
        </>
    );
}

const styles = StyleSheet.create({
    bookmarkContainer: {
        // backgroundColor: "grey",
        flex: 1,
        paddingTop: regHeight * 8,
        paddingBottom: regHeight * 8,
        borderTopWidth: 0.3,
        borderTopColor: "#808080",
    },

    bookmarkTop: {
        flexDirection: "row",
        paddingTop: regHeight * 24,
        paddingHorizontal: regWidth * 13,
        alignItems: "center",
        justifyContent: "space-between",
    },
    bookmarkWriterImage: {
        width: regWidth * 25,
        height: regWidth * 25,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
    },
    bookmakrWriterName: {
        fontWeight: "700",
        fontSize: regWidth * 12.5,
        paddingHorizontal: regWidth * 5,
    },
    bookmarkDateText: {
        color: "#808080",
        fontWeight: "500",
        fontSize: regWidth * 10,
        paddingHorizontal: regWidth * 5,
    },

    bookmarkInfo: {
        marginTop: regHeight * 5,
        paddingHorizontal: regWidth * 13,
    },
    bookmarkInfoText: {
        fontWeight: "400",
        fontSize: regWidth * 14,
        marginTop: regHeight * 10,
    },
    bookmarkHashtag: {
        fontWeight: "400",
        fontSize: regWidth * 14,
        // marginTop: 15,
        marginRight: regWidth * 8,
        color: "#9250FF",
    },


    bookmarkLikes: {
        // backgroundColor: "pink",
        // width: "40%",
        marginTop: regHeight * 10,
        paddingVertical: regHeight * 4,
        // paddingHorizontal: regWidth * 13,
        flexDirection: "row",
        alignItems: "center",
        // justifyContent: "space-between",
    },
    bookmarkLikesText: {
        fontWeight: "700",
        fontSize: regWidth * 15,
        marginLeft: regWidth * 5,
    },

    modal: {
        position: "absolute",
        width: "100%",
        height: regHeight * 300,
        bottom: 0, 
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 12,
        alignItems: "center",
    },
    addModal: {
        width: '100%', 
        // height: '35%',
        height: regHeight * 180, 
        position: 'absolute', 
        // bottom: 0, 
        backgroundColor: 'white', 
        borderRadius: 10, 
        paddingTop: 10,
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
    reportInput: {
        width: SCREEN_WIDTH - regWidth * 40,
        height: regHeight * 170,
        backgroundColor: "#DDDDDD",
        borderWidth: 1,
        borderColor: "#FF4040",
        borderRadius: 10,
        marginTop: regHeight * 20,
        paddingHorizontal: regWidth * 10,
    },
    albumListContainer: {
        backgroundColor: "#EEEEEE",
        width: regWidth * 350,
        height: regHeight * 350,
        borderRadius: 10,
        marginTop: 18,
    },
    albumList: {
        borderBottomWidth: 0.3,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    albumImage: {
        width: 45,
        height: 45,
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
})

export default BookmarkDetail;