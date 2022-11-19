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

import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

import { useSelector, useDispatch } from 'react-redux';
import { bookmarkSelector, scrapSelector } from '../modules/hooks';
import { addBookmark } from '../modules/bookmarks';
import { addScrap, deleteScrap } from '../modules/scraps';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkDetail = (props) => {
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

    useEffect(() => {
        // console.log(bookmark);
        fetchUserTag();
    }, [])

    const fetchUserTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setUserTag(jwt_decode(accessToken).user_tag);
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
        try {
            await Api
            .post("/api/v2/bookmark/likes/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setIsLike(res.data.is_like);
                setLikeCount(res.data.count);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onScrap = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/scraps/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setIsScrap(res.data.is_scrap);
                setScrapCount(res.data.count);
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
                Alert.alert("신고 접수", "신고가 접수되었습니다.");
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
        Alert.alert("북마크를 삭제하시겠습니까?", "확인 버튼을 누르면 삭제됩니다.", [
            {
                text: "취소",
                // onPress: () => {
                //     setBookmarkModalVisible(false);
                //     setReportVisible(false);
                // }
            },
            {
                text: "확인", 
                onPress: async() => {
                    try {
                        console.log(bookmark.bookmark_id);
                        await Api.post("/api/v2/bookmark/delete/", {
                            bookmark_id: bookmark.bookmark_id,
                        })
                        .then((res) => {
                            setBookmarkModalVisible(false);
                            setReportVisible(false);
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
                    "알림",
                    "이미 해당 앨범에 북마크가 추가되어 있습니다.",
                    [
                        { text: "OK!" }
                    ]
                )
            } else {
                console.error(err);
            }
        }
    }

    // // ref
    // const bottomSheetModalRef = useRef();

    // // variables
    // const snapPoints = useMemo(() => ['25%', '50%'], []);

    // // callbacks
    // const handlePresentModalPress = useCallback(() => {
    //     bottomSheetModalRef.current.present();
    // }, []);
    // const handleSheetChanges = useCallback((index) => {
    //     console.log('handleSheetChanges', index);
    // }, []);

    // const bottomSheetRef = useRef(null);

    // const handleSnapPress = useCallback((index) => {
    //     bottomSheetRef.current.present();
    // }, []);

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
                        onPress={() => setBookmarkModalVisible(true)}
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
                <ScrollView
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    // onScrollEndDrag={handleCurrentChange}
                    onScroll={handleCurrentChange}
                    scrollEventThrottle={16}
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
                        <Card 
                            bookmark={bookmark} 
                            contents={content}
                            navigation={navigation} 
                            index={index}
                            key={index} 
                        />
                    ))}
                    
                </ScrollView>

                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: -12, }}>
                    {/* {bookmark.nemos.map((nemo, index) => {
                        if ((nemo.numbering - 1) === current) {
                            return <Entypo name="dot-single" size={24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                        }
                        return <Entypo name="dot-single" size={24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                    })} */}
                    {/* {contentsByNum.map((contents, index) => {
                        if (index === current) {
                            return <Entypo name="dot-single" size={24} color="#FF4040" style={{ marginHorizontal: -4, }} key={index} />
                        }
                        return <Entypo name="dot-single" size={24} color="#808080" style={{ marginHorizontal: -4, }} key={index} />
                    })} */}
                    {bookmark.contents.map((contents, index) => {
                        if (index === current) {
                            return <Entypo name="dot-single" size={regWidth * 24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                        }
                        return <Entypo name="dot-single" size={regWidth * 24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                    })}
                </View>

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
                            width: regWidth * 80,
                        }}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        onPress={onLike}
                    >
                        <Entypo 
                            name={isLike ? "heart" : "heart-outlined"} 
                            // name="heart-outlined"
                            size={regWidth * 20} 
                            color="red" 
                        />
                        <Text style={styles.bookmarkLikesText}>{likeCount}</Text>
                    </Pressable>
                    { userTag !== bookmark.user_tag ? 
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
                    }

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
            <Modal
                // animationType="fade"
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
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
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
                                        수정하기
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    onPress={deleteBookmark}
                                >
                                    <Feather name="trash" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        삭제하기
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
                                앨범에 추가하기
                            </Text>
                        </TouchableOpacity>

                    </Animated.View>

            </Modal>

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
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
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
                                        수정하기
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    // onPress={deletePost}
                                >
                                    <Feather name="trash" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        삭제하기
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
                                앨범에 추가하기
                            </Text>
                        </TouchableOpacity>

                    </BottomSheetView>
                    </BottomSheet>
            </Modal> */}


                {/* <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                >
                    <View
                        style={styles.modal}
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
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
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
                                        수정하기
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    // onPress={deletePost}
                                >
                                    <Feather name="trash" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        삭제하기
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
                                앨범에 추가하기
                            </Text>
                        </TouchableOpacity>

                    </View>
                </BottomSheetModal> */}

            <Modal
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
                            placeholder="신고 내용을 적어주세요."
                            onChangeText={(payload => setReportContents(payload))}
                            multiline={true}
                        />
                    <TouchableOpacity 
                        style={{...styles.menu, justifyContent: "center", backgroundColor: "red"}}
                        activeOpacity={1}
                        onPress={onReport}
                    >
                        <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "white", }}>신고하기</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
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
                            저장할 앨범 찾기
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
            </Modal>
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
        paddingVertical: regHeight * 10,
        paddingHorizontal: regWidth * 13,
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
})

export default BookmarkDetail;