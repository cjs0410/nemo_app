import { StyleSheet, View, SafeAreaView, ScrollView, FlatList, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, ActivityIndicator, RefreshControl, Pressable, Modal, StatusBar, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
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
import NemoLogo from '../assets/images/NemoTrans.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetUserInfo, setRefreshToken, resetRefreshToken, setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, setIsAlarm, } from '../modules/user';
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
    const [avatar, setAvatar] = useState(null);
    const [loadFont, setLoadFont] = useState(false);
    const { isAlarm, shouldHomeRefresh, } = useSelector(userSelector);
    const [cursor, setCursor] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const debounceVal = useDebounce(searchInput);
    const [searchResultList, setSearchResultList] = useState(null);

    const logoValue = useRef(new Animated.Value(0)).current;

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        autoSearch();
    }, [debounceVal]);

    useEffect(() => {
        fetchBookmarks();
        fetchNewAlarm();
        // fetchProfile();
        fetchFont();
    }, []);

    useEffect(() => {
        if (shouldHomeRefresh === true) {
            fetchBookmarks();
            fetchNewAlarm();
            dispatch(setShouldHomeRefresh(false));
        }
    }, [shouldHomeRefresh]);



    // useFocusEffect(
    //     useCallback(() => {
    //         // fetchProfile();
    //     }, [])
    // );

    const fetchBookmarks = async() => {
        try {
            setScrollLoading(true);
            await Api
            .post("/api/v1/user/", {
                cursor: "",
            })
            .then(async(res) => {
                // console.log(res.data);
                setBookmarks(res.data);
                setNewBookmarkNum(res.data.length);
                const accessToken = await AsyncStorage.getItem('access');
                const refreshToken = await AsyncStorage.getItem('refresh');
                console.log(jwt_decode(accessToken));
                console.log(jwt_decode(refreshToken).exp, jwt_decode(accessToken).exp, (Date.now() / 1000));
            })
        } catch (err) {
            console.error(err);
        }
        setScrollLoading(false);
    }

    const fetchNewAlarm = async() => {
        try {
            await Api
            .get("/api/v1/user/new_alarm/")
            .then((res) => {
                console.log(res.data);
                dispatch(setIsAlarm(res.data.alarm));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const renderBookmark = ({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    )


    const onProfile = () => {
        navigation.navigate('OtherProfile');
    }
    

    const onRefresh = useCallback(async() => {
        setRefreshing(true);
        setCursor(0);
        await fetchBookmarks()
        .then(async() => fetchNewAlarm())
        .then(() => setRefreshing(false));
        // wait(2000).then(() => setRefreshing(false));
    }, []);

    // const renderItem = ({ post }) => {
    //     <Post post={post} navigation={navigation} />
    // }


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
                console.log(bookmarks[bookmarks.length - 1].cursor);
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
                    // onPress={() => Update.reloadAsync()}
                >
                    <Animated.Image 
                        source={NemoLogo}
                        style={{
                            ...styles.LogoImage,
                            opacity: logoValue,
                        }}
                        onLoadEnd={showLogo}
                    />
                    <Text style={{
                        fontFamily: "frank",
                        fontSize: 30,
                        fontWeight: "900",
                        marginHorizontal: regWidth * 8,
                    }}>
                        Nemo
                    </Text>
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable
                        onPress={() => setSearchModalVisible(true)}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Feather name="search" size={30} color="black" style={{ marginRight: 24, }}/>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('AlarmScreen')}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                        // style={{ backgroundColor: "pink"}}
                    >
                        <Feather name="bell" size={28} color="black" />
                        {isAlarm ? 
                            <View
                                style={{
                                    position: "absolute",
                                    backgroundColor: "red",
                                    borderRadius: 50,
                                    height: 6,
                                    width: 6,
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
                    
                    keyExtractor={bookmark => bookmark.bookmark_id}
                    showsVerticalScrollIndicator={false}
                    ref={ref}
                    refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                        />
                    }

                    renderItem={renderBookmark}
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
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
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
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
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
                                            source={searchResult.book_cover !== null ? { uri: searchResult.book_cover } : bookCover}
                                            style={styles.bookCoverImage}
                                        />
                                        <View style={{ marginHorizontal: 8, }}>
                                            <Text style={{ fontSize: 18, fontWeight: "700", }}>
                                                {searchResult.book_title}
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: "400", }}>
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
        marginVertical: 10,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    LogoImage: {
        width: regWidth * 30,
        height: regWidth * 30,
        resizeMode: "contain",
    },
    post: {
        // backgroundColor: "grey",
        paddingTop: 28,
        paddingBottom: 18,
        borderTopWidth: 0.3,
        borderTopColor: "#808080",
    },

    postWriter: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    postWriterImage: {
        width: 25,
        height: 25,
        resizeMode: "cover",
        borderRadius: 50,
        backgroundColor: "red",
    },
    postWriterText: {
        fontWeight: "700",
        fontSize: 12.5,
        paddingHorizontal: 5,
    },
    postDateText: {
        color: "#808080",
        fontWeight: "500",
        fontSize: 10,
        paddingHorizontal: 5,
    },

    postTitle: {
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    postTitleText: {
        fontWeight: "700",
        fontSize: 20,
    },
    postTitleInfoText: {
        fontWeight: "400",
        fontSize: 13,
        marginTop: 10,
    },


    postLikes: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    postLikesText: {
        fontWeight: "700",
        fontSize: 15,
    },
    profileImage: {
        width: 30,
        height: 30,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
        // marginTop: 10,
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