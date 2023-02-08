import { StyleSheet, View, SafeAreaView, ScrollView, FlatList, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, ActivityIndicator, RefreshControl, Pressable, Modal, StatusBar, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankBookCover from '../assets/images/blankBookImage.png';
import iconTrendingUp from '../assets/icons/iconTrendingUp.png';
import { BookmarkDetail, BookmarkList, AlbumList, } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import blankAvatar from '../assets/images/peopleicon.png';
import * as Font from "expo-font";
import * as Update from "expo-updates";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import NemoLogo from '../assets/images/NemoLogo(small).png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { 
    resetUserInfo, 
    setRefreshToken, 
    resetRefreshToken, 
    setShouldHomeRefresh, 
    setShouldStorageRefresh, 
    setShouldUserRefresh, 
    setIsAlarm, 
    resetAvatar, 
    setAvatar, 
    setIsStaff, 
} from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';

import analytics from '@react-native-firebase/analytics';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width:SCREEN_WIDTH} = Dimensions.get('window');
const TopTab = createMaterialTopTabNavigator();
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
  

const Home = ({route, navigation}) => {
    const dispatch = useDispatch();
    // 카드 뒷면 보기
    const [isReverse, setIsReverse] = useState(false);
    const [current, setCurrent] = useState(0);
    const [bookmarks, setBookmarks] = useState(null);
    const [newBookmarkNum, setNewBookmarkNum] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scrollLoading, setScrollLoading] = useState(false);
    // const [avatar, setAvatar] = useState(null);
    const [loadFont, setLoadFont] = useState(false);
    const { isAlarm, shouldHomeRefresh, } = useSelector(userSelector);
    const [cursor, setCursor] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const debounceVal = useDebounce(searchInput);
    const [bookSearchResultList, setBookSearchResultList] = useState(null);
    const [userSearchResultList, setUserSearchResultList] = useState(null);
    const [albumSearchResultList, setAlbumSearchResultList] = useState(null);
    const isSearchListNonEmpty = 
        (bookSearchResultList !== null && bookSearchResultList.length > 0)
        || (userSearchResultList !== null && userSearchResultList.length > 0)
        || (albumSearchResultList !== null && albumSearchResultList.length > 0);

    const logoValue = useRef(new Animated.Value(0)).current;

    const [reRender, setReRender] = useState(false);

    const [ctg, setCtg] = useState("book");
    const [isInitial, setIsInitial] = useState(true);
    const searchBarValue = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        if (route.params) {
            if (route.params.cancel) {
                Animated.timing(searchBarValue, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false,
                }).start();
                // searchBarValue.setValue(0);
                showSearchBar();
                setIsInitial(false);

            }
        }
    }, [route.params]);

    // useEffect(() => {
    //     console.log(isCancel);
    //     if (isCancel) {
    //         showSearchBar();
    //     }
    // }, [isCancel]);

    useEffect(() => {
        autoSearch();
    }, [debounceVal, ctg]);

    useEffect(() => {
        // fetchBookmarks();
        // fetchNewAlarm();
        fetchFont();
    }, []);

    useEffect(() => {
        if (shouldHomeRefresh === true) {
            fetchBookmarks();
            fetchNewAlarm();
            dispatch(setShouldHomeRefresh(false));
        }
    }, [shouldHomeRefresh]);

    const showSearchBar = () => {
        Animated.timing(searchBarValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
        }).start();
    }

    // useEffect(() => {
    //     console.log(bookmarks);
    // }, [bookmarks]);


    // useFocusEffect(
    //     useCallback(() => {
    //         // fetchProfile();
    //     }, [])
    // );

    const fetchRefreshToken = async() => {
        const refreshToken = await AsyncStorage.getItem('refresh');
        if (refreshToken !== null) {
            try {
            await Api.post("/api/v1/user/reissue/", {
                refresh_token: refreshToken,
            })
            .then(async(res) => {
                try {
                    // console.log("reissue!", res.data.refresh);
                    // console.log(res.data);
                    await AsyncStorage.setItem('refresh', res.data.refresh)
                    .then(async() => await AsyncStorage.setItem('access', res.data.access))
                    .then(() => {
                        fetchAvatar();
                        fetchBookmarks();
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
        }
    }
    
    const fetchAvatar = async() => {
        // const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .get("/api/v1/user/avatar/")
            .then((res) => {
                // console.log("avatar!", refreshToken);
                // console.log(res.data);
                dispatch(setAvatar(res.data.avatar));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchBookmarks = async() => {
        // const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            // setScrollLoading(true);
            setCursor("");
            await Api
            .post("/api/v1/user/", {
                cursor: "",
            })
            .then((res) => {
                // console.log(Object.assign([], res.data));
                setBookmarks(() => [...res.data]);
                setNewBookmarkNum(res.data.length);

            })
        } catch (err) {
            console.error(err);
        }
        // setScrollLoading(false);
    }

    const fetchNewAlarm = async() => {
        // const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .get("/api/v1/user/new_alarm/")
            .then((res) => {
                // console.log("alarm!", refreshToken);
                dispatch(setIsAlarm(res.data.alarm));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const renderBookmark = useCallback(({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    ), [])

    const keyExtractor = (bookmark, index) => bookmark.bookmark_id


    const onProfile = () => {
        navigation.navigate('OtherProfile');
    }
    

    const onRefresh = useCallback(async() => {
        setRefreshing(true);
        setCursor(0);

        await fetchBookmarks()
        .then(async() => await fetchNewAlarm())
        .then(() => setRefreshing(false));
        // wait(1500).then(() => {
        //     setRefreshing(false);
        //     console.log(bookmarks, 2);
        // });
    }, []);


    const fetchProfile = async() => {
        try {
            setLoading(true);
            await Api
            .get("/api/v1/user/userview/")
            .then((res) => {
                setAvatar(res.data.avatar);
                // console.log(res.data);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const fetchFont = async() => {
        await Font.loadAsync({
            "frank": require("../assets/fonts/FrankRuhlLibre-Bold.ttf"),
            "notoSans": require("../assets/fonts/NotoSansKR-Regular.otf"),
        });
        setLoadFont(true)
    }



    const getBookmarks = async() => {
        if (bookmarks.length >= 4 && newBookmarkNum >= 4) {
            try {
                setScrollLoading(true);
                setCursor(bookmarks[bookmarks.length - 1].cursor);
                await Api
                .post("/api/v1/user/", {
                    cursor: bookmarks[bookmarks.length - 1].cursor,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
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


    const onEndReached = () => {
    	if(!scrollLoading) {
        	getBookmarks();
        }
    };

    const onChangeSearchInput = (payload) => {
        setSearchInput(payload);
    };

    const autoSearch = async() => {
        if (debounceVal.length > 0) {
            try {
                await Api.post("/api/v5/search/", {
                    keyword: debounceVal,
                    ctg: ctg,
                })
                .then((res) => {
                    console.log(res.data);
                    if (ctg === "book") {
                        setBookSearchResultList(res.data);
                    }
                    if (ctg === "user") {
                        setUserSearchResultList(res.data);
                    }
                    if (ctg === "album") {
                        setAlbumSearchResultList(res.data);
                    }
                    
                })
            } catch (err) {
                console.error(err);
            }
        }
    };

    const onSearch = async() => {
        if (debounceVal.length > 0) {
            try {
                await Api
                .post("/api/v5/search/", {
                    keyword: debounceVal,
                    ctg: ctg,
                })
                .then((res) => {
                    // console.log(res.data);
                    if (ctg === "book") {
                        setBookSearchResultList(res.data);
                    }
                    if (ctg === "user") {
                        setUserSearchResultList(res.data);
                    }
                    if (ctg === "album") {
                        setAlbumSearchResultList(res.data);
                    }
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    const showLogo = () => {
        Animated.timing(logoValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }

    const exitSearch = () => {
        setSearchModalVisible(false);
        setSearchInput('');
        setBookSearchResultList(null);
        setUserSearchResultList(null);
        setAlbumSearchResultList(null);
    }


    if (!loadFont) {
        return (
            <View style={styles.container}>
            </View>
        )
    };

    return (
        <View style={styles.container}>
            <View
                style={{
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <View style={styles.header}>
                    <AnimatedPressable
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#D9D9D9",
                            width: isInitial ? 
                                "100%" 
                                : 
                                searchBarValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["83%" , "100%"]
                                })
                            ,
                            borderRadius: 10,
                            height: regWidth * 36,
                            paddingHorizontal: regWidth * 8,
                            // marginTop: regHeight * 12,
                        }}
                        onPress={() => navigation.navigate("Search")}
                    >
                        <Feather name="search" size={regWidth * 18} color="#606060" />
                        <TextInput 
                            placeholder="Search Accounts, Books, and Nemolists"
                            placeholderTextColor={"#606060"}
                            style={{
                                height: "100%",
                                width: "90%",
                            }}
                            editable={false}
                            pointerEvents="none"
                        />
                    </AnimatedPressable>
                </View>
            </View>
            <TopTab.Navigator
                screenOptions={{
                    swipeEnabled: false,
                    tabBarLabelStyle: { 
                        fontSize: regWidth * 17, 
                        fontFamily: "NotoSansKR-Black",
                        textTransform: 'none', 
                    },
                    tabBarActiveTintColor: colors.nemoDark,
                    tabBarInactiveTintColor: colors.bgdDark,
                    tabBarItemStyle: { width: regWidth * 120, paddingBottom: 0, },
                    tabBarContentContainerStyle: { 
                        justifyContent: "center", 
                        borderBottomWidth: 0.3, 
                        borderBottomColor: colors.bgdNormal, 
                    },
                    tabBarIndicatorStyle: {opacity: 0},
                    animationEnabled: false,
                }}
            >
                <TopTab.Screen 
                    name="Following" 
                    component={FollowingScreen} 
                    options={{ tabBarLabel: 'Following' }}
                />
                <TopTab.Screen 
                    name="Explore" 
                    component={ExploreScreen} 
                    options={{ tabBarLabel: 'Explore' }}
                />
            </TopTab.Navigator>
            {/* { bookmarks !== null ? 
                <FlatList 
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={scrollLoading && <ActivityIndicator />}
                    data={bookmarks}
                    renderItem={renderBookmark}

                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    ref={ref}
                />
                :
                null
            } */}

            {/* <Modal
                animationType="fade"
                transparent={true}
                visible={searchModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setSearchModalVisible(false);
                            setSearchInput('');
                            setBookSearchResultList(null);
                            setUserSearchResultList(null);
                            setAlbumSearchResultList(null);
                        }
                    }
                />
                <View 
                    style={{
                        ...styles.modal, 
                        // height: bookSearchResultList !== null && bookSearchResultList.length > 0 ? regHeight * 500 : regHeight * 180
                        height: isSearchListNonEmpty ? regHeight * 500 : regHeight * 200
                    }}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={() => {
                                exitSearch();
                            }}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: regWidth * 16, fontWeight: "700", }} >
                            검색
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={onSearch}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", color: "#008000" }}>
                                검색
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <TextInput 
                        placeholder="키워드를 입력하세요"
                        style={styles.modalInput}
                        onChangeText={onChangeSearchInput}
                        // multiline={true}
                        value={searchInput}
                    />
                    <View style={styles.searchResultContainer}>
                        <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <Pressable
                                onPress={() => setCtg("book")}
                                hitSlop={{ bottom: 50, left: 50, right: 50, top: 50 }}
                                style={{
                                    ...styles.ctgContainer,
                                    marginLeft: 0,
                                }}
                            >
                                <Text 
                                    style={{ 
                                        fontSize: 18, 
                                        fontWeight: "500", 
                                        color: ctg === "book" ? "red" : "black",
                                        // marginHorizontal: regWidth * 20,
                                    }}
                                >
                                    책
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setCtg("user")}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                                style={styles.ctgContainer}
                            >
                                <Text 
                                    style={{ 
                                        fontSize: 18, 
                                        fontWeight: "500", 
                                        color: ctg === "user" ? "red" : "black",
                                        // marginHorizontal: regWidth * 40,
                                    }}
                                >
                                    유저
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setCtg("album")}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                                style={styles.ctgContainer}
                            >
                                <Text 
                                    style={{ 
                                        fontSize: 18, 
                                        fontWeight: "500", 
                                        color: ctg === "album" ? "red" : "black",
                                    }}
                                >
                                    앨범
                                </Text>
                            </Pressable>
                        </View>
                        {bookSearchResultList !== null && bookSearchResultList.length > 0 && ctg === "book" ?
                            <ScrollView style={styles.searchResult}>
                                {bookSearchResultList.map((searchResult, index) => (
                                    <BookList book={searchResult} exitSearch={exitSearch} navigation={navigation} key={index} />
                                ))}
                            </ScrollView>
                            :
                            null
                        }
                        {userSearchResultList !== null && userSearchResultList.length > 0 && ctg === "user" ? 
                            <ScrollView style={styles.searchResult}>
                                {userSearchResultList.map((searchResult, index) => (
                                    <UserList user={searchResult} exitSearch={exitSearch} navigation={navigation} key={index} />
                                ))}
                            </ScrollView>
                            :
                            null
                        }
                        {albumSearchResultList !== null && albumSearchResultList.length > 0 && ctg === "album" ?
                            <ScrollView style={styles.searchResult}>
                                {albumSearchResultList.map((searchResult, index) => (
                                    <AlbumList album={searchResult} exitSearch={exitSearch} navigation={navigation} key={index} />
                                ))}
                            </ScrollView>
                            :
                            null
                        }
                    </View>
                </View>
            </Modal> */}
        </View>
    );
};


const FollowingScreen = ({route, navigation}) => {
    const [bookmarks, setBookmarks] = useState(null);
    const [newBookmarkNum, setNewBookmarkNum] = useState(0);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [feed, setFeed] = useState(null);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchFollowing();
    }, []);

    const fetchFollowing = async() => {
        try {
            await Api
            .post('/api/v1/user/', {
                ctg: "following",
                items: 0,
            })
            .then((res) => {
                setBookmarks(res.data.nemos);
                setFeed(res.data.feed);
                setNewBookmarkNum(res.data.nemos.length);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const getBookmarks = async() => {
        if (bookmarks.length >= 5 && newBookmarkNum >= 5) {
            
            try {
                setScrollLoading(true);
                await Api
                .post("/api/v1/user/", {
                    ctg: "following",
                    items: bookmarks.length,
                    list: feed,
                })
                .then((res) => {
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

    const onEndReached = () => {
    	if(!scrollLoading) {
            
        	getBookmarks();
        }
    };

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchFollowing()
        .then(() => setRefreshing(false));
    }, []);

    const renderBookmark = useCallback(({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    ), []);

    const keyExtractor = (bookmark, index) => bookmark.bookmark_id;

    return (
        <View style={styles.container}>
            { bookmarks !== null ? 
                <FlatList 
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={scrollLoading && <ActivityIndicator />}
                    data={bookmarks}
                    renderItem={renderBookmark}

                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    ref={ref}
                />
                :
                null
            }
        </View>
    )
}

const ExploreScreen = ({route, navigation}) => {
    const [trendNemos, setTrendNemos] = useState(null);
    const [trendNemolists, setTrendNemolists] = useState(null);
    const [sort, setSort] = useState(3);
    const [loading, setLoading] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchTrending();
    }, [sort]);

    const fetchTrending = async() => {
        try {
            setLoading(true);
            await Api
            .post('/api/v1/user/', {
                ctg: "explore",
                sort: sort,
            })
            .then((res) => {
                // console.log(res.data);
                setTrendNemos(res.data.nemos);
                setTrendNemolists(res.data.nemolists);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }


    return (
        <View style={styles.container}>
            <ScrollView
                ref={ref}
            >
                <View 
                    style={{ 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        marginHorizontal: regWidth * 13, 
                        marginTop: regHeight * 13, 
                        marginBottom: regHeight * 17, 
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row", 
                            alignItems: "center", 
                        }}    
                    >
                        <Image 
                            source={iconTrendingUp}
                            style={{
                                width: regWidth * 30,
                                height: regWidth * 30,
                                resizeMode: "contain",
                            }}
                        />
                        <Text
                            style={{
                                fontSize: regWidth * 17,
                                fontWeight: "900",
                                marginHorizontal: regWidth * 5,
                            }}
                        >
                            Trending on Nemo
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row", 
                            alignItems: "center", 
                        }}    
                    >
                        <Pressable
                            style={{
                                ...styles.selectContainer,
                                backgroundColor: sort === 3 ? colors.nemoLight : "white",
                            }}
                            onPress={() => setSort(3)}
                        >
                            <Text style={{ fontSize: regWidth * 9, fontWeight: "700", }}>
                                Now
                            </Text>
                        </Pressable>
                        <Pressable
                            style={{
                                ...styles.selectContainer,
                                backgroundColor: sort === 14 ? colors.nemoLight : "white",
                            }}
                            onPress={() => setSort(14)}
                        >
                            <Text style={{ fontSize: regWidth * 9, fontWeight: "700", }}>
                                Weekly
                            </Text>
                        </Pressable>
                        <Pressable
                            style={{
                                ...styles.selectContainer,
                                backgroundColor: sort === 30 ? colors.nemoLight : "white",
                            }}
                            onPress={() => setSort(30)}
                        >
                            <Text style={{ fontSize: regWidth * 9, fontWeight: "700", }}>
                                Monthly
                            </Text>
                        </Pressable>
                    </View>
                </View>
                {loading ? 
                    <ActivityIndicator 
                        color="black" 
                        style={{marginTop: regHeight * 50,}} 
                        size="large"
                    />
                    : 
                    <>
                        {trendNemos && trendNemos.map((nemo, index) => (
                            <View key={index} style={{ marginTop: regHeight * 10, }}>
                                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: regWidth * 18, }}>
                                    <Text 
                                        style={styles.numberTxt}
                                    >
                                        {`0${index + 1}`}
                                    </Text>
                                    <Image 
                                        source={nemo.avatar !== null ? { uri: nemo.avatar } : blankAvatar}
                                        style={{
                                            width: regWidth * 19,
                                            height: regWidth * 19,
                                            borderRadius: 999,
                                            resizeMode: "contain",
                                        }}
                                    />
                                    <Pressable 
                                        onPress={() => navigation.push('OtherProfile', { userTag: nemo.user_tag, })} 
                                        hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: regWidth * 13,
                                                fontWeight: "700",
                                                marginLeft: regWidth * 6,
                                            }}
                                        >
                                            {nemo.writer_name}
                                        </Text>
                                    </Pressable>
                                </View>
                                <Pressable
                                    onPress={() => navigation.navigate('BookmarkNewDetail', { bookmarks: trendNemos, subTitle: "trending", title: "Nemos", index: index, })} 
                                >
                                    <BookmarkList bookmark={nemo} navigation={navigation} />
                                </Pressable>
                            </View>
                        ))}
                    </>
                }

                <View 
                    style={{ 
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginHorizontal: regWidth * 13, 
                        marginTop: regHeight * 45, 
                        marginBottom: regHeight * 17, 
                    }}
                >
                    <Image 
                        source={iconTrendingUp}
                        style={{
                            width: regWidth * 30,
                            height: regWidth * 30,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: regWidth * 17,
                            fontWeight: "900",
                            marginHorizontal: regWidth * 5,
                        }}
                    >
                        Trending Nemolists
                    </Text>
                </View>
                {loading ? 
                    <ActivityIndicator 
                        color="black" 
                        style={{marginTop: regHeight * 50,}} 
                        size="large"
                    />
                    : 
                    <>
                        {trendNemolists && trendNemolists.map((nemolist, index) => (
                            <View key={index} style={{ marginTop: regHeight * 10, }}>
                                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: regWidth * 18, }}>
                                    <Text 
                                        style={styles.numberTxt}
                                    >
                                        {`0${index + 1}`}
                                    </Text>
                                    <Image 
                                        source={nemolist.user_avatar !== null ? { uri: nemolist.user_avatar } : blankAvatar}
                                        style={{
                                            width: regWidth * 19,
                                            height: regWidth * 19,
                                            borderRadius: 999,
                                            resizeMode: "contain",
                                        }}
                                    />
                                    <Pressable 
                                        onPress={() => navigation.push('OtherProfile', { userTag: nemolist.user_tag, })} 
                                        hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: regWidth * 13,
                                                fontWeight: "700",
                                                marginLeft: regWidth * 6,
                                            }}
                                        >
                                            {nemolist.name}
                                        </Text>
                                    </Pressable>
                                </View>
                                <Pressable
                                    activeOpacity={1}
                                    onPress={() => navigation.navigate('AlbumProfile', { albumId: nemolist.nemolist_id, })} 
                                >
                                    <AlbumList album={nemolist} navigation={navigation} isDefault={false} />
                                </Pressable>
                            </View>
                        ))}
                    </>
                }
            </ScrollView>
        </View>
    )
}



// const BookList = ({book, exitSearch, navigation,}) => {
//     return (
//         <Pressable 
//             style={styles.resultList} 
//             onPress={() => 
//                 {
//                     exitSearch();
//                     navigation.navigate('BookProfile', {
//                         bookId: book.book_id, 
//                     })
//                 }
//             }
//         >
//             <Image 
//                 source={book.book_cover !== null ? { uri: book.book_cover } : blankBookCover}
//                 style={styles.bookCoverImage}
//             />
//             <View style={{ marginHorizontal: regWidth * 8, }}>
//                 <Text 
//                     style={{ 
//                         fontSize: regWidth * 18, 
//                         fontWeight: "700", 
//                         width: regWidth * 220, 
//                     }}
//                     numberOfLines={2}
//                     ellipsizeMode='tail'
//                 >
//                     {book.book_title}
//                 </Text>
//                 <Text 
//                     style={{ 
//                         fontSize: regWidth * 15, 
//                         fontWeight: "400", 
//                         width: regWidth * 180,
//                         marginTop: regHeight * 8,
//                     }}
//                     numberOfLines={1}
//                     ellipsizeMode='tail'
//                 >
//                     {book.book_author}
//                 </Text>
//             </View>
//         </Pressable>
//     )
// }

// const UserList = ({user, exitSearch, navigation,}) => {
//     return (
//         <Pressable 
//             style={styles.resultList} 
//             onPress={() => 
//                 {
//                     exitSearch();
//                     navigation.navigate('OtherProfile', {
//                         userTag: user.user_tag, 
//                     })
//                 }
//             }
//         >
//             <Image 
//                 source={user.avatar !== null ? { uri: user.avatar } : blankAvatar}
//                 style={styles.userImage}
//             />
//             <View style={{ marginHorizontal: regWidth * 8, }}>
//                 <Text 
//                     style={{ 
//                         fontSize: regWidth * 18, 
//                         fontWeight: "700", 
//                         width: regWidth * 220, 
//                     }}
//                     numberOfLines={2}
//                     ellipsizeMode='tail'
//                 >
//                     {user.name}
//                 </Text>
//                 <Text 
//                     style={{ 
//                         fontSize: regWidth * 15, 
//                         fontWeight: "400", 
//                         width: regWidth * 180,
//                         marginTop: regHeight * 8,
//                         color: "#008000",
//                     }}
//                     numberOfLines={1}
//                     ellipsizeMode='tail'
//                 >
//                     {`@${user.user_tag}`}
//                 </Text>
//             </View>
//         </Pressable>
//     )
// }

// const AlbumList = ({album, exitSearch, navigation,}) => {
//     return (
//         <Pressable 
//             style={styles.resultList} 
//             onPress={() => 
//                 {
//                     exitSearch();
//                     navigation.navigate('AlbumProfile', {
//                         albumId: album.album_id, 
//                     })
//                 }
//             }
//         >
//             <Image 
//                 source={album.album_cover !== null ? { uri: album.album_cover } : blankBookCover}
//                 style={styles.albumImage}
//             />
//             <View style={{ marginHorizontal: regWidth * 8, }}>
//                 <Text 
//                     style={{ 
//                         fontSize: regWidth * 18, 
//                         fontWeight: "700", 
//                         width: regWidth * 220, 
//                     }}
//                     numberOfLines={2}
//                     ellipsizeMode='tail'
//                 >
//                     {album.album_title}
//                 </Text>
//                 <Text 
//                     style={{ 
//                         fontSize: regWidth * 15, 
//                         fontWeight: "400", 
//                         width: regWidth * 180,
//                         marginTop: regHeight * 8,
//                         color: "#008000",
//                     }}
//                     numberOfLines={1}
//                     ellipsizeMode='tail'
//                 >
//                     {`@${album.user_tag}`}
//                 </Text>
//             </View>
//         </Pressable>
//     )
// }

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
        marginTop: regHeight * 8,
        marginHorizontal: regWidth * 20,
        // paddingBottom: regHeight * 8,
        justifyContent: "center",
        // alignItems: "center",
    },
    LogoImage: {
        width: regWidth * 120,
        height: regWidth * 40,
        resizeMode: "contain",
    },

    modal: {
        width: '100%', 
        // height: '35%',
        height: regHeight * 180, 
        position: 'absolute', 
        // bottom: 0, 
        backgroundColor: 'white', 
        borderRadius: 10, 
        paddingTop: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: regHeight * 10,
        marginHorizontal: regWidth * 18, 
    },
    modalInput: {
        backgroundColor: "#EEEEEE",
        marginHorizontal: regWidth * 22,
        marginTop: regHeight * 22,
        borderRadius: 10,
        height: regHeight * 50,
        paddingHorizontal: regWidth * 8,
        fontSize: regWidth * 15,
        fontWeight:"500",
    },
    searchResultContainer: {
        marginHorizontal: regWidth * 22,
        marginTop: regHeight * 12,
    },
    searchResult: {
        borderRadius: 10,
        backgroundColor: "#EEEEEE",
        height: regHeight * 280,
        marginTop: regHeight * 12,
    },
    ctgContainer: {
        backgroundColor: "#EEEEEE",
        paddingVertical: regHeight * 10,
        paddingHorizontal: regWidth * 18,
        marginHorizontal: regWidth * 8, 
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        
    },
    resultList: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#CBCBCB",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    bookCoverImage: {
        width: regWidth * 92,
        height: regWidth * 92,
        resizeMode: "contain",
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        resizeMode: "cover",
        marginVertical: 5,
        marginHorizontal: 8,
    },
    albumImage: {
        width: regWidth * 70,
        height: regWidth * 70,
        resizeMode: "contain",
        marginVertical: 5,
    },
    numberTxt: {
        fontSize: regWidth * 27, 
        fontWeight: "900", 
        color: colors.bgdNormal, 
        width: regWidth * 45,
    },
    selectContainer: {
        // backgroundColor: colors.nemoLight,
        borderRadius: 12,
        paddingHorizontal: regWidth * 5,
        paddingVertical: regWidth * 2,
        marginHorizontal: regWidth * 8,
    }
})

export default Home;