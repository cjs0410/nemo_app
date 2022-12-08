import { StyleSheet, View, SafeAreaView, ScrollView, FlatList, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, ActivityIndicator, RefreshControl, Pressable, Modal, StatusBar, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankBookCover from '../assets/images/blankBookImage.png';
import { BookmarkDetail } from '../components';
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
import { resetUserInfo, setRefreshToken, resetRefreshToken, setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, setIsAlarm, resetAvatar, setAvatar, } from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
  

const Home = ({navigation}) => {
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
    const [searchResultList, setSearchResultList] = useState(null);

    const logoValue = useRef(new Animated.Value(0)).current;

    const [reRender, setReRender] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchRefreshToken();
    }, [])

    useEffect(() => {
        autoSearch();
    }, [debounceVal]);

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
                    await AsyncStorage.setItem('refresh', res.data.refresh)
                    .then(async() => await AsyncStorage.setItem('access', res.data.access))
                    .then(() => {
                        fetchAvatar();
                        fetchBookmarks();
                        fetchNewAlarm();
                    })
                    dispatch(setRefreshToken(res.data.refresh));
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
    // const renderBookmark = useCallback(({ item }) => {
    //     console.log(item);
    //     return(
    //         <BookmarkDetail bookmark={item} navigation={navigation} />
    //     )
    // }, [])

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

    // const onRefresh = async() => {
    //     setRefreshing(true);
    //     setCursor(0);
    //     // setReRender(!reRender);
    //     // setBookmarks([]);
    //     // setNewBookmarkNum(0);
    //     await fetchBookmarks()
    //     .then(async() => await fetchNewAlarm())
    //     // .then(() => setRefreshing(false));
    //     wait(1000).then(() => setRefreshing(false));
    // };


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
                await Api.post("/api/v3/book/select/", {
                    keyword: debounceVal,
                })
                .then((res) => {
                    console.log(res.data);
                    setSearchResultList(res.data);
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
                .post("/api/v3/book/select/", {
                    keyword: debounceVal,
                })
                .then((res) => {
                    console.log(res.data);
                    setSearchResultList(res.data);
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


    if (!loadFont) {
        return (
            <View style={styles.container}>
            </View>
        )
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <Pressable 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    // onPress={() => setReRender(!reRender)}
                >
                    <Animated.Image 
                        source={NemoLogo}
                        style={{
                            ...styles.LogoImage,
                            opacity: logoValue,
                        }}
                        onLoadEnd={showLogo}
                    />
                    {/* <Text style={{
                        fontFamily: "frank",
                        fontSize: regWidth * 30,
                        fontWeight: "900",
                        marginHorizontal: regWidth * 8,
                    }}>
                        Nemo
                    </Text> */}
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable
                        onPress={() => setSearchModalVisible(true)}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    >
                        <Feather name="search" size={30} color="black" style={{ marginRight: 24, }}/>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('AlarmScreen')}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        // style={{ backgroundColor: "pink"}}
                    >
                        <Feather name="bell" size={28} color="black" />
                        {isAlarm ? 
                            <View
                                style={{
                                    position: "absolute",
                                    backgroundColor: "red",
                                    borderRadius: 50,
                                    height: regWidth * 6,
                                    width: regWidth * 6,
                                    right: 0,
                                }}
                            >
                            </View>
                            : 
                            null
                        }

                    </Pressable>
                </View>
                {/* <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => navigation.navigate('Profile')}
                    // onPress={testLogout}
                >
                    <Image source={ avatar !== null ? { uri: `http://3.38.228.24${avatar}`} : blankAvatar} style={styles.profileImage} />
                </TouchableOpacity> */}
            </SafeAreaView>
            {/* <ScrollView 
                showsVerticalScrollIndicator={false}
                ref={ref}
                refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                }
            >
                {posts === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <>
                        {posts.map((post, index) => (
                            <Post post={post} navigation={navigation} key={index} />
                        ))}
                    </>
                }
            </ScrollView> */}

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

            <Modal
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
                            setSearchResultList(null);
                        }
                    }
                />
                <View 
                    style={{
                        ...styles.modal, 
                        height: searchResultList !== null && searchResultList.length > 0 ? regHeight * 500 : regHeight * 180
                    }}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={() => {
                                setSearchModalVisible(false);
                                setSearchInput('');
                                setSearchResultList(null);
                            }}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: regWidth * 16, fontWeight: "700", }} >
                            책 검색
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
                        placeholder="책 제목을 입력하세요"
                        style={styles.modalInput}
                        onChangeText={onChangeSearchInput}
                        // multiline={true}
                        value={searchInput}
                    />
                    {searchResultList !== null && searchResultList.length > 0? 
                        <View style={styles.searchResultContainer}>
                            <Text style={{ fontSize: 20, fontWeight: "500", }}>
                                책
                            </Text>
                            <ScrollView style={styles.searchResult}>
                                {searchResultList.map((searchResult, index) => (
                                    <Pressable 
                                        style={styles.resultList} 
                                        onPress={() => 
                                            {
                                                setSearchModalVisible(false);
                                                setSearchInput('');
                                                setSearchResultList(null);
                                                navigation.navigate('BookProfile', {
                                                    bookId: searchResult.book_id, 
                                                })
                                            }
                                        }
                                        key={index}
                                    >
                                        <Image 
                                            source={searchResult.book_cover !== null ? { uri: searchResult.book_cover } : blankBookCover}
                                            style={styles.bookCoverImage}
                                        />
                                        <View style={{ marginHorizontal: regWidth * 8, }}>
                                            <Text 
                                                style={{ 
                                                    fontSize: regWidth * 18, 
                                                    fontWeight: "700", 
                                                    width: regWidth * 180, 
                                                }}
                                                numberOfLines={2}
                                                ellipsizeMode='tail'
                                            >
                                                {searchResult.book_title}
                                            </Text>
                                            <Text 
                                                style={{ 
                                                    fontSize: regWidth * 15, 
                                                    fontWeight: "400", 
                                                    width: regWidth * 180,
                                                    marginTop: regHeight * 8,
                                                }}
                                                numberOfLines={1}
                                                ellipsizeMode='tail'
                                            >
                                                {searchResult.book_author}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                        :
                        null
                    }
                </View>
            </Modal>
        </View>
    );
};

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
        marginVertical: regHeight * 10,
        marginHorizontal: 20,
        paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
        marginTop: regHeight * 8,
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
})

export default Home;