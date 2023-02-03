import { 
    View, 
    SafeAreaView,
    Text, 
    Button, 
    StyleSheet, 
    Image, 
    ScrollView, 
    Dimensions, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl,
    Pressable,
    Animated,
    FlatList,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, createRef, useMemo, forwardRef, Suspense, } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SelectDropdown from 'react-native-select-dropdown';
import { Card, BookmarkTile, BookmarkList, AlbumList, BookList, AlbumTile, BookTile, } from '../components';
import Api from "../lib/Api";
import AsyncStorage from '@react-native-async-storage/async-storage';

import blankBookCover from '../assets/images/blankBookImage.png';
import userImage from '../assets/images/userImage.jpeg';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { 
    resetUserInfo, 
    setRefreshToken, 
    resetRefreshToken, 
    setShouldHomeRefresh, 
    setShouldLibraryRefresh, 
    setShouldUserRefresh, 
    setShouldNemoRefresh,
    setShouldNemolistRefresh,
    setShouldBookRefresh,
    setIsAlarm, 
    resetAvatar, 
    setAvatar, 
    setIsStaff, 
} from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';
import blankAvatar from '../assets/images/peopleicon.png';
import sortCheck from '../assets/images/sortCheck.png';
import longLikedNemos from '../assets/images/longLikedNemos.png';
import iconRepeat from '../assets/icons/iconRepeat.png';
import iconGrid from '../assets/icons/iconGrid.png';
import iconList from '../assets/icons/iconList.png';
import iconNemolist from '../assets/icons/iconNemolist.png';
import iconBook from '../assets/icons/iconBook.png';
import iconAlarm from '../assets/icons/iconAlarm.png';
import { colors, regHeight, regWidth } from "../config/globalStyles";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
// import BottomSheet from '@gorhom/bottom-sheet';
import { Portal, PortalHost } from '@gorhom/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const {width:SCREEN_WIDTH} = Dimensions.get('window');

const TopTab = createMaterialTopTabNavigator();

const UserLibrary = ({navigation, route }) => {
    const dispatch = useDispatch();
    const { isAlarm, avatar, } = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const insets = useSafeAreaInsets();
    // const snapPoints = useMemo(() => ['25%','65%'], []);


    useEffect(() => {
        fetchRefreshToken();
    }, []);

    useEffect(() => {
        if (route.params) {
            console.log(route.params.test);
        }
    }, [route.params])

    const fetchRefreshToken = async() => {
        const refreshToken = await AsyncStorage.getItem('refresh');
        if (refreshToken !== null) {
            setLoading(true);
            try {
            await Api.post("/api/v1/user/reissue/", {
                refresh_token: refreshToken,
            })
            .then(async(res) => {
                try {
                    // console.log("reissue!");
                    // console.log(res.data);
                    await AsyncStorage.setItem('refresh', res.data.refresh)
                    .then(async() => await AsyncStorage.setItem('access', res.data.access))
                    .then(() => {
                        fetchAvatar();
                        fetchNewAlarm();
                    })
                    dispatch(setRefreshToken(res.data.refresh));
                    // console.log(res.data.is_staff);
                    dispatch(setIsStaff(res.data.is_staff));
                } catch (err) {
                    console.error(err);
                }
            })
            } catch (err) {
                if (err.response.status === 404) {
                    await AsyncStorage.removeItem('access');
                    await AsyncStorage.removeItem('refresh');
                    dispatch(resetRefreshToken());
                    dispatch(resetAvatar());
                } else {
                    console.error(err);
                }
            }
            setLoading(false);
        }
    }

    const fetchAvatar = async() => {
        const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .get("/api/v1/user/avatar/")
            .then((res) => {
                // console.log("avatar!");
                // console.log(res.data);
                dispatch(setAvatar(res.data.avatar));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchNewAlarm = async() => {
        const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .get("/api/v1/user/new_alarm/")
            .then((res) => {
                // console.log("alarm!");
                dispatch(setIsAlarm(res.data.alarm));
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
    const plusModalRef = useRef();
    const sortModalRef = useRef();

    const onPressPlus = useCallback(() => {
        plusModalRef.current.present();
    }, [plusModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        plusModalRef.current.dismiss();
    }, [plusModalRef]);


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
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable
                        onPress={() => navigation.navigate('UserStorage')}
                    >
                        <Image 
                            source={ avatar !== null ? { uri: avatar } : blankAvatar} 
                            style={{        
                                width: regWidth * 32,
                                height: regWidth * 32,
                                resizeMode: "cover",
                                borderRadius: 50,
                                borderColor: "black",
                            }} 
                        />
                    </Pressable>
                    <Text style={{
                        fontSize: 24,
                        fontFamily: "NotoSansKR-Black",
                        marginHorizontal: regWidth * 10,
                        lineHeight: regWidth * 34,
                    }}>
                        My Library
                    </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        onPress={onPressPlus}
                    >
                        <Feather name="plus" size={regWidth * 35} color="black" style={{ marginRight: 24, }}/>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('AlarmScreen')}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        // style={{ backgroundColor: "pink"}}
                    >
                        {/* <Feather name="bell" size={28} color="black" /> */}
                        <Image 
                            source={iconAlarm}
                            style={{
                                width: regWidth * 35,
                                height: regWidth * 35,
                                resizeMode: 'contain',
                            }}
                        />
                        {isAlarm ? 
                            <View
                                style={{
                                    position: "absolute",
                                    backgroundColor: "#7341ffcc",
                                    borderRadius: 50,
                                    height: regWidth * 8,
                                    width: regWidth * 8,
                                    right: 0,
                                }}
                            >
                            </View>
                            : 
                            null
                        }
                    </Pressable>
                </View>
            </View>
            {loading ? 
                null
                :
                <TopTab.Navigator
                    tabBar={(props) => <MyTabBar {...props} />}
                >
                    <TopTab.Screen 
                        name="Nemos" 
                        component={NemoScreen} 
                        // initialParams={{ sortModalRef: sortModalRef, }}
                    />
                    <TopTab.Screen name="NemoLists" component={NemoListScreen} />
                    <TopTab.Screen name="Books" component={BookScreen} />
                </TopTab.Navigator>
            }

            <BottomSheetModal
                index={0}
                ref={plusModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                        Create
                    </Text>
                    <Pressable 
                        style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                        onPress={() => {
                            navigation.navigate('CreateNemolist1');
                            onPressClose();
                        }}    
                    >
                        <Image 
                            source={iconNemolist}
                            style={{
                                height: regWidth * 39,
                                width: regWidth * 39,
                                resizeMode: "contain",
                            }}
                        />
                        <View>
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                New Nemolist
                            </Text>
                            <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                Add Nemos to a new Nemolist
                            </Text>
                        </View>
                    </Pressable>
                    <Pressable 
                        style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                        onPress={() => {
                            navigation.navigate('SelectBook0', { index: 0, isLib: true, });
                            onPressClose();
                        }}  
                    >
                        <Image 
                            source={iconBook}
                            style={{
                                height: regWidth * 39,
                                width: regWidth * 39,
                                resizeMode: "contain",
                            }}
                        />
                        <View>
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                New Book
                            </Text>
                            <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                Add new Book to your library
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    )
}

const NemoScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    // const { sortModalRef, } = route.params;
    const [loading, setLoading] = useState(false);
    const [bookmarks, setBookmarks] = useState(null);
    const [newBookmarkNum, setNewBookmarkNum] = useState(0);
    const { shouldNemoRefresh } = useSelector(userSelector);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const sortList = [ "recents", "book", ];
    const [sort, setSort] = useState(0);
    const [scrollLoading, setScrollLoading] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBookmarkList(sort);
    }, []);

    useEffect(() => {
        if (shouldNemoRefresh === true) {
            console.log("auto");
            fetchBookmarkList(sort);
            dispatch(setShouldNemoRefresh(false));
        }
    }, [shouldNemoRefresh]);

    const renderBookmark = ({ item, index }) => (
        <Pressable
            onPress={() => navigation.navigate('BookmarkNewDetail', { bookmarks: bookmarks, subTitle: "My Library", title: "Bookmarks", index: index, })} 
        >
            <BookmarkList bookmark={item} navigation={navigation} />
        </Pressable>
    )

    const fetchBookmarkList = async(sortNum) => {
        try {
            // console.log(sortList[sortNum])
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemos",
                sort: sortList[sortNum],
                items: 0,
            })
            .then((res) => {
                // console.log(res.data);
                // console.log("fetch Nemos");
                // setBookmarks(res.data.reverse());
                setBookmarks(res.data);
                setNewBookmarkNum(res.data.length);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchBookmarkList(sort)
        .then(() => setRefreshing(false));
    }, []);


    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchBookmarkList(sortNum)
    }

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getBookmarks();
        }
    };

    const getBookmarks = async() => {
        if (bookmarks.length >= 4 && newBookmarkNum >= 4) {
            // console.log(bookmarks[bookmarks.length - 1].nemo_num);
            try {
                setScrollLoading(true);
                await Api
                .post("api/v1/user/library/", {
                    ctg: "nemos",
                    sort: sortList[sort],
                    items: bookmarks.length,
                    // cursor: bookmarks[bookmarks.length - 1].nemo_num,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setBookmarks([...bookmarks, ...res.data, ]);
                    setNewBookmarkNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
            // setCursor(bookmarks.at(-1).cursor);
        }
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
    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);


    return (
        <View style={styles.container}>
            { bookmarks && bookmarks.length !== 0 ? 
                <>
                    <FlatList 
                        data={bookmarks}
                        renderItem={renderBookmark}
                        keyExtractor={bookmark => bookmark.bookmark_id}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ref={ref}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={scrollLoading && <ActivityIndicator />}
                        ListHeaderComponent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginHorizontal: regWidth * 13,
                                    marginVertical: regHeight * 10,
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Pressable
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                    // onPress={() => navigation.navigate('UserLibrary', { test: "test", })}
                                    onPress={onPressSort}
                                >
                                    <Image 
                                        source={iconRepeat}
                                        style={{
                                            width: regWidth * 15,
                                            height: regWidth * 15,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "700",
                                            marginHorizontal: regWidth * 5,
                                        }}
                                    >
                                        {sort === 0 ? "Recents" : "Book"}
                                    </Text>
                                </Pressable>
                            </View>
                        }
                    />
                </>
                :
                <View
                    style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: regHeight * 200,
                    }}
                >
                    <Text
                        style={{
                        fontSize: regWidth * 20,
                        fontWeight: "500",
                        color: "grey",
                        }}
                    >
                        북마크를 생성해보세요
                    </Text>
                </View>
            }
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
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
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
                                fontWeight: "700", 
                                color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Book
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
                </View>
            </BottomSheetModal>
        </View>
    )
}

const NemoListScreen = ({navigation}) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [likedNemos, setLikedNemos] = useState(null);
    const [nemolists, setNemolists] = useState(null);
    const [newNemolistNum, setNewNemolistNum] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const sortList = [ "recents", "alphabetical", "creator", ];
    const [sort, setSort] = useState(0);
    const { shouldNemolistRefresh } = useSelector(userSelector);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [isTile, setIsTile] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchNemoList(sort);
    }, []);

    useEffect(() => {
        if (shouldNemolistRefresh === true) {
            fetchNemoList(sort);
            dispatch(setShouldNemolistRefresh(false));
        }
    }, [shouldNemolistRefresh]);

    const renderAlbum = ({ item, index }) => (
        <Pressable
            activeOpacity={1}
            onPress={() => navigation.navigate('AlbumProfile', { albumId: item.nemolist_id, })} 
        >
            {isTile ? 
                <AlbumTile album={item} navigation={navigation} isDefault={false} />
                :
                <AlbumList album={item} navigation={navigation} isDefault={false} />
            }
            
        </Pressable>
    )

    const fetchNemoList = async(sortNum) => {
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemolists",
                sort: sortList[sortNum],
                items: 0,
            })
            .then((res) => {
                // console.log(res.data);
                // console.log("fetch Nemolists");
                setLikedNemos(res.data.Liked_Nemos);
                setNemolists(res.data.Nemolists);
                setNewNemolistNum(res.data.Nemolists.length);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

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
                .post("api/v1/user/library/", {
                    ctg: "nemolists",
                    sort: sortList[sort],
                    items: nemolists.length,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setNemolists([...nemolists, ...res.data.Nemolists, ]);
                    setNewNemolistNum(res.data.Nemolists.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
        }
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchNemoList(sort)
        .then(() => setRefreshing(false));
    }, []);

    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchNemoList(sortNum);
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
    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);

    return (
        <View style={styles.container}>
            <FlatList 
                data={nemolists}
                renderItem={renderAlbum}
                key={isTile ? '_' : "#"}
                keyExtractor={isTile ? nemolist => "_" + nemolist.nemolist_id : nemolist => "#" + nemolist.nemolist_id}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ref={ref}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={scrollLoading && <ActivityIndicator />}
                numColumns={isTile ? 2 : 1}
                ListHeaderComponent={
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                marginHorizontal: regWidth * 13,
                                marginVertical: regHeight * 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                                // backgroundColor:"pink"
                            }}
                        >
                            <Pressable
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                                onPress={onPressSort}
                            >
                                <Image 
                                    source={iconRepeat}
                                    style={{
                                        width: regWidth * 15,
                                        height: regWidth * 15,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "700",
                                        marginHorizontal: regWidth * 5,
                                    }}
                                >
                                    {sort === 0 ? "Recents" : (sort === 1 ? "Alphabetical" : "Creator")}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setIsTile(!isTile)}
                            >
                                <Image 
                                    source={isTile ? iconList : iconGrid}
                                    style={{
                                        width: regWidth * 20,
                                        height: regWidth * 20,
                                    }}
                                />
                            </Pressable>
                        </View>
                        {likedNemos ? 
                            <Pressable
                                activeOpacity={1}
                                onPress={() => navigation.navigate('AlbumProfile', { albumId: likedNemos.nemolist_id, })} 
                            >
                                {isTile ? 
                                    <AlbumTile album={likedNemos} navigation={navigation} isDefault={true} />
                                    :
                                    <AlbumList album={likedNemos} navigation={navigation} isDefault={true} />
                                }
                                
                            </Pressable>
                            :
                            null
                        }

                    </>
                }
            />

            {/* { nemolists && nemolists.length !== 0 ? 
                <FlatList 
                    data={nemolists}
                    renderItem={renderAlbum}
                    keyExtractor={album => album.album_id}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ref={ref}
                    ListHeaderComponent={
                        <>
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginHorizontal: regWidth * 13,
                                    marginVertical: regHeight * 10,
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Pressable
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                    onPress={onPressSort}
                                >
                                    <Image 
                                        source={iconRepeat}
                                        style={{
                                            width: regWidth * 15,
                                            height: regWidth * 15,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "700",
                                            marginHorizontal: regWidth * 5,
                                        }}
                                    >
                                        Recent
                                    </Text>
                                </Pressable>
                                <Pressable>
                                    <Image 
                                        source={iconGrid}
                                        style={{
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                        }}
                                    />
                                </Pressable>
                            </View>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => navigation.navigate('AlbumProfile', { albumId: item.album_id, })} 
                            >
                                <AlbumList album={item} navigation={navigation} />
                            </TouchableOpacity>
                        </>
                    }
                />
                :
                <View
                    style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: regHeight * 200,
                    }}
                >
                    <Text
                        style={{
                        fontSize: regWidth * 20,
                        fontWeight: "500",
                        color: "grey",
                        }}
                    >
                        앨범을 생성해보세요
                    </Text>
                </View>
            } */}
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
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
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
                                fontWeight: "700", 
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
        </View>
    )
}

const BookScreen = ({navigation}) => {
    const dispatch = useDispatch();
    const [books, setBooks] = useState(null);
    const [newBookNum, setNewBookNum] = useState(null);
    const [loading, setLoading] = useState(false);
    const sortList = [ "recents", "alphabetical", "creator", ];
    const [sort, setSort] = useState(0);
    const { shouldBookRefresh } = useSelector(userSelector);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [isTile, setIsTile] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBook(sort);
    }, []);

    useEffect(() => {
        if (shouldBookRefresh === true) {
            fetchBook(sort);
            dispatch(setShouldBookRefresh(false));
        }
    }, [shouldBookRefresh]);

    const fetchBook = async(sortNum) => {
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "books",
                sort: sortList[sortNum],
                items: 0,
            })
            .then((res) => {
                console.log(res.data);
                setBooks(res.data);
                setNewBookNum(res.data.length);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getBook();
        }
    };

    const getBook = async() => {
        if (books.length >= 16 && newBookNum >= 16) {
            try {
                setScrollLoading(true);
                await Api
                .post("api/v1/user/library/", {
                    ctg: "books",
                    sort: sortList[sort],
                    items: nemolists.length,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setNemolists([...books, ...res.data, ]);
                    setNewNemolistNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
        }
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchBook(sort)
        .then(() => setRefreshing(false));
    }, []);

    const renderBook = ({ item, index }) => (
        <Pressable
            activeOpacity={1}
            onPress={() => navigation.push('BookProfile', {
                bookId: item.book_id, 
            })}
        >
            {isTile ? 
                <BookTile book={item} />
                :
                <BookList book={item} />
            }
            
        </Pressable>
    );

    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchBook(sortNum);
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
    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);

    return (
        <View style={styles.container}>
            <FlatList 
                data={books}
                renderItem={renderBook}
                key={isTile ? '_' : "#"}
                keyExtractor={isTile ? book => "_" + book.book_id : book => "#" + book.book_id}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ref={ref}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={scrollLoading && <ActivityIndicator />}
                numColumns={isTile ? 2 : 1}
                ListHeaderComponent={
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                marginHorizontal: regWidth * 13,
                                marginVertical: regHeight * 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Pressable
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                                onPress={onPressSort}
                            >
                                <Image 
                                    source={iconRepeat}
                                    style={{
                                        width: regWidth * 15,
                                        height: regWidth * 15,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "700",
                                        marginHorizontal: regWidth * 5,
                                    }}
                                >
                                    {sort === 0 ? "Recents" : (sort === 1 ? "Alphabetical" : "Creator")}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setIsTile(!isTile)}
                            >
                                <Image 
                                    source={isTile ? iconList : iconGrid}
                                    style={{
                                        width: regWidth * 20,
                                        height: regWidth * 20,
                                    }}
                                />
                            </Pressable>
                        </View>
                    </>
                }
            />
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
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
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
                                fontWeight: "700", 
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
        </View>
    )
}

function MyTabBar({ state, descriptors, navigation, position }) {
    const viewRef = useRef();
    const [tabBarSize, setTabBarSize] = useState(0);
    const tabRefs = useRef(
        Array.from({ length: state.routes.length }, () => createRef())
    ).current;
    const [measures, setMeasures] = useState(null);

    useEffect(() => {
        if (viewRef.current) {
          const temp = [];

          tabRefs.forEach((ref, _, array) => {
            ref.current.measureLayout(
              viewRef.current,
              (left, top, width, height) => {
                temp.push({ left, top, width, height });
                if (temp.length === array.length) {
                    // console.log(temp);
                    setMeasures(temp);
                }
              },
              () => console.log('fail')
            );
          });
        } else {
            console.log("!!");
        }
      }, [tabRefs, tabBarSize]);

    const handleTabWrapperLayout = (e) => {
        const { width } = e.nativeEvent.layout;
        // console.log(width);
        setTabBarSize(width);
    };

    const standardSize = useMemo(() => {
        if (!tabBarSize) return 0;
        return tabBarSize / state.routes.length;
    }, [tabBarSize]);

    const inputRange = useMemo(() => {
        return state.routes.map((_, i) => i);
    }, [state]);

    const indicatorScale = useMemo(() => {
        if (!measures || !standardSize) return 0;
      
        return position.interpolate({
            inputRange,
            outputRange: measures.map(
                measure => measure.width / standardSize
            ),
        });
    }, [inputRange, measures, standardSize]);

    const translateX = useMemo(() => {
        if (!measures || !standardSize) return 0;
      
        return position.interpolate({
            inputRange,
            outputRange: measures.map(
                measure =>
                measure.left - (standardSize - measure.width) / 2
            ),
        });
    }, [inputRange, measures, standardSize]);

    return (
        <View
            style={{
                borderBottomWidth: 0.3,
                marginBottom: 2,
            }}
            ref={viewRef}
        >
            <View 
                style={{ 
                    flexDirection: 'row', 
                    paddingTop: 18, 
                    paddingBottom: 5,
                    marginHorizontal: regWidth * 37,
                    justifyContent: "space-between",
                }}
                onLayout={handleTabWrapperLayout}
            >
                {state.routes.map((route, index) => {
                    const ref = tabRefs[index];
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;
            
                    const isFocused = state.index === index;
            
                    const onPress = () => {
                        const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        });
            
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };
            
                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };
                    // modify inputRange for custom behavior
                    const inputRange = state.routes.map((_, i) => i);
                    const opacity = position.interpolate({
                        inputRange,
                        outputRange: inputRange.map(i => (i === index ? 1 : 0.6)),
                    });
            
                    return (
                        <Pressable
                            ref={ref}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{ 
                                width: "auto",
                                alignItems: "center",
                            }}
                            key={index}
                        >
                            <Animated.Text 
                                style={{ 
                                    opacity,
                                    fontSize: regWidth * 16,
                                    // fontWeight: "700",
                                    fontFamily: "NotoSansKR-Bold",
                                    // paddingHorizontal: 4,
                                    // backgroundColor: "green",
                                }}
                            >   
                                {label}
                            </Animated.Text>
                        </Pressable>

                    );
                })}
            </View>
            <Animated.View
                style={{
                    width: standardSize,
                    height: 3,
                    backgroundColor: "#7341ffcc",
                    transform: [
                        {
                          translateX,
                        },
                        {
                          scaleX: indicatorScale,
                        },
                    ],
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
      // backgroundColor: "red",
      marginVertical: regHeight * 8,
      marginHorizontal: regWidth * 13,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
    sortBtn: {
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: regHeight * 24, 
        justifyContent: "space-between",
    },
})

export default UserLibrary;