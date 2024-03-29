import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Pressable, Modal, Alert, Vibration, FlatList, ActivityIndicator, } from "react-native";
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
import blankAvatar from '../assets/images/blankAvatar.png';
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
import { setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, setShouldNemoRefresh, setShouldNemolistRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';

import analytics from '@react-native-firebase/analytics';
import { unloadAsync } from "expo-font";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import iconEdit from '../assets/icons/iconEdit.png';
import iconTrash from '../assets/icons/iconTrash.png';
import iconAlert from '../assets/icons/iconAlert.png';
import iconFollow from '../assets/icons/iconFollow.png';
import iconUnfollow from '../assets/icons/iconUnfollow.png';
import iconEyeoff from '../assets/icons/iconEyeoff.png';
import iconLayers from '../assets/icons/iconLayers.png';
import iconHeart from '../assets/icons/iconHeart.png';
import iconRepeat from '../assets/icons/iconRepeat.png';
import iconHeartOutline from '../assets/icons/iconHeartOutline.png';
import sortCheck from '../assets/images/sortCheck.png';
import iconPlus from '../assets/images/iconPlus.png';
import iconPlusCircleOutline from '../assets/icons/iconPlusCircleOutline.png';
import iconPlusCirclePurple from '../assets/icons/iconPlusCirclePurple.png';
import iconShare from '../assets/icons/iconShare.png';
import AlbumList from './AlbumList';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkDetail = (props) => {
    const dispatch = useDispatch();
    const captureRef = useRef();
    const { isStaff, } = useSelector(userSelector);
    const bookmark = props.bookmark;
    // const date = bookmark.created_date.split('T')[0].split('-');
    const [date, setDate] = useState('');
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
    

    const [pushLike, setPushLike] = useState(false);
    const [pushScrap, setPushScrap] = useState(false);

    const [isFollow, setIsFollow] = useState(bookmark.is_follow);

    const sortList = [ "recents", "alphabetical", "creator", ];
    const [sort, setSort] = useState(0);

    const [nemolists, setNemolists] = useState(null);
    const [newNemolistNum, setNewNemolistNum] = useState(0);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [selectedNemolists, setSelectedNemolists] = useState([]);

    const [includeNLs, setIncludeNLs] = useState(null);


    useEffect(() => {
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

    useEffect(() => {
        const format = bookmark.created_date.split('T')[0].split('-');
        const monthName = getMonthName(Number(format[1]));
        setDate(`${monthName} ${format[2]}, ${format[0]}`);
        // if (profile && profile.birth) {
        //     console.log(profile.birth.split("-"));
        //     const format = profile.birth.split("-");
        //     const monthName = getMonthName(Number(format[1]))
        //     console.log(`${monthName} ${format[2]}, ${format[0]}`);
        //     setDate(`${monthName} ${format[2]}, ${format[0]}`);
        // }
    }, []);

    const getMonthName = (month) => {
        var monthWord = month;

        if (monthWord === 1) {
            monthWord = "Jan"
        } else if (monthWord === 2) {
            monthWord = "Feb"
        } else if (monthWord === 3) {
            monthWord = "Mar"
        } else if (monthWord === 4) {
            monthWord = "Apr"
        } else if (monthWord === 5) {
            monthWord = "May"
        } else if (monthWord === 6) {
            monthWord = "Jun"
        } else if (monthWord === 7) {
            monthWord = "Jul"
        } else if (monthWord === 8) {
            monthWord = "Aug"
        } else if (monthWord === 9) {
            monthWord = "Sep"
        } else if (monthWord === 10) {
            monthWord = "Oct"
        } else if (monthWord === 11) {
            monthWord = "Nov"
        } else if (monthWord === 12) {
            monthWord = "Dec"
        }

        return monthWord;
    }

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
                // dispatch(setShouldLibraryRefresh(true));
                // dispatch(setShouldUserRefresh(true));
                dispatch(setShouldNemolistRefresh(true));
                if (res.data.is_like) {
                    await analytics().logEvent('like', {
                        writer_tag: bookmark.user_tag,
                        bookmark_id: bookmark.bookmark_id,
                        book_id: bookmark.book_id,
                    })
                }
                if (res.data.is_like) {
                    Alert.alert("Added to your library");
                    Vibration.vibrate(100);
                } else {
                    Alert.alert("Deleted from your library");
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
                dispatch(setShouldNemolistRefresh(true));
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

    const fetchNemolist = async(sortNum) => {
        try {
            console.log(bookmark.bookmark_id)
            await Api
            .post("/api/v4/album/list/", {
                bookmark_id: bookmark.bookmark_id,
                sort: sortList[sortNum],
                items: 0,
            })
            .then((res) => {
                console.log(res.data);
                setNemolists(res.data);
                setNewNemolistNum(res.data.length);
                onPressScrap();
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getNemolist();
        }
    };

    const getNemolist = async() => {
        if (nemolists.length >= 16 && newNemolistNum >= 16) {
            try {
                setScrollLoading(true);
                await Api
                .post("/api/v4/album/list/", {
                    sort: sortList[sort],
                    items: nemolists.length,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setNemolists([...nemolists, ...res.data.Nemolists, ]);
                    setNewNemolistNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
        }
    }

    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressSortClose();
        fetchNemolist(sortNum);
    }

    const selectNemolist = (nemolist) => {
        if (selectedNemolists.findIndex(selectedNemolist => selectedNemolist.nemolist_id === nemolist.nemolist_id) === -1) {
            setSelectedNemolists([
                ...selectedNemolists,
                nemolist,
            ]);
        } else {
            setSelectedNemolists(
                selectedNemolists.filter(selectedNemolist => selectedNemolist.nemolist_id !== nemolist.nemolist_id)
            )
        }
    }



    const renderAlbum = ({ item, index }) => (
        <View
            onPress={() => selectNemolist(item)}
            style={{ justifyContent: "center",  }}
        >
            <AlbumList album={item} navigation={navigation} isDefault={false} />
            <Pressable
                onPress={() => selectNemolist(item)}
                style={{
                    position: "absolute",
                    right: 0,
                    marginHorizontal: regWidth * 12,
                }}
            >
                <Image 
                    source={selectedNemolists.findIndex(selectedNemolist => selectedNemolist.nemolist_id === item.nemolist_id) === -1 ? iconPlusCircleOutline : iconPlusCirclePurple}
                    style={{
                        width: regWidth * 40,
                        height: regWidth * 40,
                    }}
                />
            </Pressable>
        </View>
    )

    const fetchIncludeNL = async(sortNum) => {
        try {
            console.log(bookmark.bookmark_id)
            await Api
            .post("/api/v2/bookmark/scraping_nemolist/", {
                bookmark_id: bookmark.bookmark_id,
                // sort: sortList[sortNum],
                // items: 0,
            })
            .then((res) => {
                console.log(res.data);
                setIncludeNLs(res.data);
                // setNewNemolistNum(res.data.length);
                onPressInclude();
            })
        } catch (err) {
            console.error(err);
        }
    }

    const renderInclude = ({ item, index }) => (
        <Pressable
            onPress={() => {
                onPressIncludeClose();
                navigation.push('AlbumProfile', { albumId: item.nemolist_id, })
            }}
            style={{ justifyContent: "center",  }}
        >
            <AlbumList album={item} navigation={navigation} isDefault={false} />
        </Pressable>
    )

    const deleteBookmark = async() => {
        Alert.alert("Are you sure", "Once you delete your Nemo, it can't be restored.", [
            {
                text: "Yes",
                style: 'destructive',
                onPress: async() => {
                    try {
                        // console.log(bookmark.bookmark_id);
                        await Api.post("/api/v2/bookmark/delete/", {
                            bookmark_id: bookmark.bookmark_id,
                        })
                        .then((res) => {
                            onPressClose();
                            dispatch(setShouldHomeRefresh(true));
                            dispatch(setShouldLibraryRefresh(true));
                            dispatch(setShouldUserRefresh(true));
                            dispatch(setShouldNemoRefresh(true));
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

    const addToAlbum = async(albumId) => {
        // console.log(albumId);
        const nemolistIds = selectedNemolists.map((selectedNemolist) => (selectedNemolist.nemolist_id));
        console.log(nemolistIds);
        try {
            await Api
            .post("/api/v4/album/addbookmark/", {
                nemolist_id: nemolistIds,
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                onPressScrapClose();
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

    const onCapture = () => {
        captureRef.current.capture().then((uri) => {
        console.log("do something with ", uri);
        Sharing.shareAsync("file://" + uri);
        }),
        (error) => console.error("Oops, snapshot failed", error);
    };

    const onFollow = async() => {
        // setIsFollow(!isFollow);
        try {
            await Api
            .post("api/v1/user/follow/", {
                user_tag: bookmark.user_tag,
            })
            .then((res) => {
                // console.log(res.data);
                setIsFollow(res.data.is_follow);
                // setFollowers(res.data.count);
                // dispatch(setShouldUserRefresh(true));
                if (res.data.is_follow) {
                    Alert.alert(bookmark.user_tag, `You followed ${bookmark.user_tag}.`);
                    Vibration.vibrate(30);
                } else {
                    Alert.alert(bookmark.user_tag, `You unfollowed ${bookmark.user_tag}.`);
                }
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

    const scrapModalRef = useRef();
    const scrapSnapPoints = useMemo(() => [regHeight * 765], []);
    const onPressScrap = useCallback(() => {
        scrapModalRef.current.present();
    }, [scrapModalRef]);

    const onPressScrapClose = useCallback(() => {
        // @ts-ignore
        scrapModalRef.current.dismiss();
    }, [scrapModalRef]);

    const includeModalRef = useRef();
    const includeSnapPoints = useMemo(() => [regHeight * 765], []);
    const onPressInclude = useCallback(() => {
        includeModalRef.current.present();
    }, [includeModalRef]);

    const onPressIncludeClose = useCallback(() => {
        // @ts-ignore
        includeModalRef.current.dismiss();
    }, [includeModalRef]);

    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressSortClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);


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
                        <Entypo name="dot-single" size={regWidth * 10} color="#808080" />
                        <View>
                            <Text style={styles.bookmarkDateText}>{date}</Text>
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
                            // captureRef={captureRef}
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
                                return <Entypo name="dot-single" size={regWidth * 24} color={colors.nemoDark} style={{ marginHorizontal: -regWidth * 6, }} key={index} />
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
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Pressable 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                                // width: regWidth * 35,
                                paddingRight: regWidth * 8,
                                paddingVertical: regHeight * 8,
                            }}
                            hitSlop={{ bottom: 20, left: 60, right: 60, top: 20 }}
                            onPress={onLike}
                        >
                            {/* <Entypo 
                                name={isLike ? "heart" : "heart-outlined"}
                                size={regWidth * 26} 
                                color={isLike ? "red" : "black"}
                            /> */}
                            <Image 
                                source={isLike ? iconHeart : iconHeartOutline}
                                style={{
                                    width: regWidth * 25,
                                    height: regWidth * 25,
                                }}
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
                            onPress={() => navigation.push('LikeUsers', { ctg: "nemo", id: bookmark.bookmark_id, })}
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
                                paddingRight: regWidth * 8,
                                paddingVertical: regHeight * 8,

                            }}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={() => {
                                fetchNemolist();
                            }}
                            // disabled={userTag === bookmark.user_tag}
                        >
                            {/* <Feather 
                                name="download" 
                                size={regWidth * 25}
                                color={ userTag === bookmark.user_tag ? "#C9C9C9" : (isScrap ? "#298CFF" : "black") }
                                style={{
                                    width: regWidth * 30,
                                }} 
                            /> */}
                            <Image 
                                source={iconLayers}
                                style={{
                                    width: regWidth * 25,
                                    height: regWidth * 25,
                                }}
                            />
                            {/* <Text 
                                style={{
                                    ...styles.bookmarkLikesText, 
                                }}
                            >
                                { scrapCount }
                            </Text> */}
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
                            onPress={() => {
                                fetchIncludeNL();
                            }}
                        >
                            <Text 
                                style={{
                                    ...styles.bookmarkLikesText, 
                                }}
                            >
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
                <Pressable
                    onPress={() => onCapture()}
                >
                    <Image 
                        source={iconShare}
                        style={{
                            width: regWidth * 25,
                            height: regWidth * 25,
                        }}
                    />
                </Pressable>
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
                                fetchNemolist();
                            }}
                        >
                            <AntDesign name="pluscircleo" size={24} color="black" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                앨범에 추가하기
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
                                캡쳐 후 공유하기
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
                            <TouchableOpacity 
                                style={styles.menu}
                                activeOpacity={1}
                                onPress={() => {
                                    setBookmarkModalVisible(false);
                                    setReportVisible(true);
                                }}
                            >
                                <Entypo name="warning" size={24} color="black" />
                                <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>신고</Text>
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
                                fetchNemolist();
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
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: "#606060", includeFontPadding: false, }}>
                            Cancel
                        </Text>
                    </Pressable>
                    {bookmark.user_tag !== userTag ? 
                        <>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}
                                onPress={onFollow}
                            >
                                <Image 
                                    source={isFollow ? iconUnfollow : iconFollow}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Bold", color: "#202020", includeFontPadding: false, }}>
                                        {isFollow ? `Unfollow @${bookmark.user_tag}` : `Follow @${bookmark.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            {/* <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
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
                            </Pressable> */}
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                                onPress={() => {
                                    onPressClose();
                                    navigation.navigate('Report', {ctg: "nemo", id: bookmark.bookmark_id});
                                }}
                            >
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Bold", color: "#202020", includeFontPadding: false, }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontFamily: "NotoSansKR-Medium", color: "#606060", includeFontPadding: false, }}>
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
                                    onPressClose();
                                    navigation.navigate('EditBookmark', { 
                                        bookmark: bookmark,
                                    });
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
                                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Bold", color: "#202020", includeFontPadding: false, }}>
                                        Edit
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontFamily: "NotoSansKR-Medium", color: "#606060", includeFontPadding: false, }}>
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
                                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Bold", color: "#202020", includeFontPadding: false, }}>
                                        Delete
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontFamily: "NotoSansKR-Medium", color: "#606060", includeFontPadding: false, }}>
                                        Delete Nemo from your library
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                    }

                </View>
            </BottomSheetModal>
            <BottomSheetModal
                index={0}
                ref={scrapModalRef}
                snapPoints={scrapSnapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={{ flex: 1, }}
                >
                    <View style={styles.modalHeader}>
                        <Pressable
                            onPress={onPressScrapClose}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Black", color: "#606060", includeFontPadding: false,}}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Text style={{ fontSize: regWidth * 19, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                            Add Nemos
                        </Text>
                        <Pressable
                            onPress={addToAlbum}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Black", color: colors.textLight, includeFontPadding: false,}}>
                                Done
                            </Text>
                        </Pressable>
                    </View>
                    {nemolists && nemolists.length !== 0 ?
                        <BottomSheetFlatList 
                            data={nemolists}
                            renderItem={renderAlbum}
                            // key={isTile ? '_' : "#"}
                            // keyExtractor={isTile ? nemolist => "_" + nemolist.nemolist_id : nemolist => "#" + nemolist.nemolist_id}
                            keyExtractor={nemolist => nemolist.nemolist_id}
                            showsVerticalScrollIndicator={false}
                            onEndReached={onEndReached}
                            onEndReachedThreshold={0.3}
                            ListFooterComponent={scrollLoading && <ActivityIndicator />}
                        />
                        :
                        <View style={{ alignItems: "center", marginTop: regHeight * 38, }}>
                            <Text
                                style={{
                                fontSize: regWidth * 17,
                                fontFamily: "NotoSansKR-Medium",
                                color: colors.textDark,
                                includeFontPadding: false,
                                }}
                            >
                                There are no Nemolist you created.
                            </Text>
                            <Text
                                style={{
                                fontSize: regWidth * 17,
                                fontFamily: "NotoSansKR-Medium",
                                color: colors.textDark,
                                includeFontPadding: false,
                                marginTop: regHeight * 8,
                                }}
                            >
                                Let's create it first!
                            </Text>
                        </View>
                    }

                </View>
            </BottomSheetModal>


            <BottomSheetModal
                index={0}
                ref={includeModalRef}
                snapPoints={includeSnapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={{ flex: 1, }}
                >
                    <View style={styles.modalHeader}>
                        <Pressable
                            onPress={onPressIncludeClose}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Black", color: "#606060", includeFontPadding: false,}}>
                                Close
                            </Text>
                        </Pressable>
                        <Text style={{ fontSize: regWidth * 19, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                            Add Nemos
                        </Text>
                        <Pressable style={{opacity: 0, }}>
                            <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Black", color: colors.textLight, includeFontPadding: false,}}>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                    {includeNLs && includeNLs.length !== 0 ?
                        <BottomSheetFlatList 
                            data={includeNLs}
                            renderItem={renderInclude}
                            // key={isTile ? '_' : "#"}
                            // keyExtractor={isTile ? nemolist => "_" + nemolist.nemolist_id : nemolist => "#" + nemolist.nemolist_id}
                            keyExtractor={includeNL => includeNL.nemolist_id}
                            showsVerticalScrollIndicator={false}
                            // onEndReached={onEndReached}
                            // onEndReachedThreshold={0.3}
                            // ListFooterComponent={scrollLoading && <ActivityIndicator />}
                        />
                        :
                        <View style={{ alignItems: "center", marginTop: regHeight * 38, }}>
                            <Text
                                style={{
                                fontSize: regWidth * 17,
                                fontFamily: "NotoSansKR-Medium",
                                color: colors.textDark,
                                includeFontPadding: false,
                                }}
                            >
                                No nemolists contain that nemo.
                            </Text>
                        </View>
                    }

                </View>
            </BottomSheetModal>

            <BottomSheetModal
                index={0}
                ref={sortModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontFamily: "NotoSansKR-Bold",
                                color: sort === 0 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Recents
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 0 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(1)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontFamily: "NotoSansKR-Bold",
                                color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Alphabetical
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 1 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(2)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 2 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Creator
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 2 ? 1 : 0,
                            }}
                        />
                    </Pressable>
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
        borderBottomWidth: 0.3,
        borderBottomColor: "#808080",
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
        fontFamily: "NotoSansKR-Bold",
        fontSize: regWidth * 12.5,
        paddingHorizontal: regWidth * 5,
        includeFontPadding: false,
    },
    bookmarkDateText: {
        color: "#808080",
        fontFamily: "NotoSansKR-Medium",
        fontSize: regWidth * 10,
        paddingHorizontal: regWidth * 5,
        includeFontPadding: false,
    },

    bookmarkInfo: {
        marginTop: regHeight * 5,
        paddingHorizontal: regWidth * 13,
    },
    bookmarkInfoText: {
        fontFamily: "NotoSansKR-Regular",
        fontSize: regWidth * 14,
        marginTop: regHeight * 10,
        includeFontPadding: false,
    },
    bookmarkHashtag: {
        fontFamily: "NotoSansKR-Regular",
        fontSize: regWidth * 14,
        // marginTop: 15,
        marginRight: regWidth * 8,
        color: "#9250FF",
        includeFontPadding: false,
    },
    bookmarkLikes: {
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginTop: regHeight * 10,
        paddingVertical: regHeight * 4,
        marginHorizontal: regWidth * 13,
    },
    bookmarkLikesText: {
        fontFamily: "NotoSansKR-Bold",
        fontSize: regWidth * 15,
        marginLeft: regWidth * 5,
        includeFontPadding: false,
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
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: regHeight * 8,
        alignItems: "center",
        marginHorizontal: regWidth * 20,
        // marginHorizontal: regWidth * 18, 
    },
    sortBtn: {
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: regHeight * 24, 
        justifyContent: "space-between",
    },
})

export default BookmarkDetail;