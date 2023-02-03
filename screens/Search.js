import { View, SafeAreaView, Text, Button, StyleSheet, TextInput, ScrollView, Pressable, Image, Animated, } from "react-native";
import React, { useEffect, useState, useRef, createRef, useMemo, } from "react";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import { Entypo, Feather, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import blankBookCover from '../assets/images/blankBookImage.png';
import blankAvatar from '../assets/images/peopleicon.png';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import Api from '../lib/Api';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { AlbumList, BookList, UserList, } from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import analytics from '@react-native-firebase/analytics';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { 
    setSearchKeyword,
    addRecentSearch,
    deleteRecentSearch,
} from '../modules/user';

const TopTab = createMaterialTopTabNavigator();

const Search = ({navigation}) => {
    const dispatch = useDispatch();
    const [searchInput, setSearchInput] = useState('');
    const { recentSearch, } = useSelector(userSelector);
    const [searchRecord, setSearchRecord] = useState([]);
    // [...recentSearch].reverse();
    const debounceVal = useDebounce(searchInput);
    const [bookSearchResultList, setBookSearchResultList] = useState(null);
    const [userSearchResultList, setUserSearchResultList] = useState(null);
    const [albumSearchResultList, setAlbumSearchResultList] = useState(null);
    const isSearchListNonEmpty = 
        (bookSearchResultList !== null && bookSearchResultList.length > 0)
        || (userSearchResultList !== null && userSearchResultList.length > 0)
        || (albumSearchResultList !== null && albumSearchResultList.length > 0);

    const [ctg, setCtg] = useState("book");
    const searchBarValue = useRef(new Animated.Value(0)).current;
    const [headerHeight, setHeaderHeight] = useState(regWidth * 99);
    const insets = useSafeAreaInsets();

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        showSearchBar();
    }, [])

    useEffect(() => {
        autoSearch();
        dispatch(setSearchKeyword(debounceVal))
    }, [debounceVal, ctg]);


    useEffect(() => {
        if (recentSearch) {
            setSearchRecord([...recentSearch].reverse());
        }
        
    }, [recentSearch]);

    const showSearchBar = () => {
        Animated.timing(searchBarValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const onChangeSearchInput = (payload) => setSearchInput(payload);

    const autoSearch = async() => {
        // if (debounceVal.length > 0) {
        //     try {
        //         await Api
        //         .post("/api/v5/search/", {
        //             keyword: searchInput,
        //             ctg: "book",
        //         })
        //         .then((res) => {
        //             console.log(res.data);
        //             setBookSearchResultList(res.data);
        //         })
        //     } catch (err) {
        //         console.error(err);
        //     }
        //     try {
        //         await Api
        //         .post("/api/v5/search/", {
        //             keyword: searchInput,
        //             ctg: "nemolist",
        //         })
        //         .then((res) => {
        //             // console.log(res.data);
        //             setAlbumSearchResultList(res.data);
        //         })
        //     } catch (err) {
        //         console.error(err);
        //     }
        //     try {
        //         await Api
        //         .post("/api/v5/search/", {
        //             keyword: searchInput,
        //             ctg: "user",
        //         })
        //         .then((res) => {
        //             // console.log(res.data);
        //             setUserSearchResultList(res.data);
        //         })
        //     } catch (err) {
        //         console.error(err);
        //     }
        // }
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

    const onLayout = (e) => {
        console.log(e.nativeEvent);
        setHeaderHeight(e.nativeEvent.layout.height);
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }}
                onLayout={onLayout}
            >
                <View style={styles.header} >
                    <Animated.View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#D9D9D9",
                            // width: `${searchBarValue}%`,
                            width: searchBarValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["100%" , "83%"]
                            }),
                            // transform: [{
                            //     width: searchBarValue.interpolate({
                            //         inputRange: [0, 1],
                            //         outputRange: ["0%" , "100%"]
                            //     })
                            // }],
                            borderRadius: 10,
                            height: regWidth * 36,
                            paddingHorizontal: regWidth * 8,
                            // marginTop: regHeight * 12,
                            justifyContent: "space-between",
                            zIndex: 10,
                        }}
                    >
                        <Feather name="search" size={regWidth * 18} color="#606060" />
                        <TextInput 
                            placeholder="Search Accounts, Books, and Nemolists"
                            placeholderTextColor={"#606060"}
                            style={{
                                height: "100%",
                                width: "85%",
                            }}
                            onChangeText={onChangeSearchInput}
                            onSubmitEditing={autoSearch}
                            autoFocus={true}
                            value={searchInput}
                        />
                        <Pressable
                            onPress={() => setSearchInput('')}
                        >
                            <Feather name="x" size={regWidth * 18} color="#606060" />
                        </Pressable>
                    </Animated.View>
                    <Pressable
                        onPress={() => navigation.navigate('HomeScreen', { cancel: true, })}
                        style={{
                            position: "absolute",
                            right: 0,
                            zIndex: 0,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: regWidth * 15,
                                fontFamily: "NotoSansKR-Medium",
                            }}
                        >
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </View>
                <TopTab.Navigator
                    tabBar={(props) => <MyTabBar {...props} />}
                    style={{
                        // position: "absolute",
                        opacity: debounceVal.length > 0 ? 1 : 0,
                        zIndex: debounceVal.length > 0 ? 10 : 0,
                    }}
                >
                    <TopTab.Screen 
                        name="Book" 
                        component={BookResultScreen} 
                        initialParams={{ searchInput: debounceVal, bookSearchResultList: bookSearchResultList, }}
                    />
                    <TopTab.Screen 
                        name="NemoList" 
                        component={NemolistResultScreen} 
                        initialParams={{ searchInput: debounceVal, albumSearchResultList: albumSearchResultList, }}
                    />
                    <TopTab.Screen 
                        name="User" 
                        component={UserResultScreen} 
                        initialParams={{ searchInput: debounceVal, userSearchResultList: userSearchResultList, }}
                    />
                </TopTab.Navigator>
            <View
                style={{
                    position: "absolute",
                    opacity: debounceVal.length > 0 ? 0 : 1,
                    zIndex: debounceVal.length > 0 ? 0 : 10,
                    marginTop: headerHeight,
                }}
            >
                <Text 
                    style={{ 
                        fontSize: regWidth * 17, 
                        fontFamily: "NotoSansKR-Black", 
                        marginHorizontal: regWidth * 12, 
                        marginTop: regHeight * 12, 
                    }}
                >
                    Recent searches
                </Text>
                <ScrollView>
                    {searchRecord && searchRecord.map((item, index) => {
                        if (item.ctg === "book") {
                            return (
                                <Pressable 
                                    onPress={async() => 
                                        {
                                            navigation.navigate('BookProfile', {
                                                bookId: item.book_id, 
                                            })
                                            await analytics().logEvent('searchBook', {
                                                search_book_title: item.book_title,
                                            })
                                            dispatch(addRecentSearch({...item, "ctg": "book"}));
                                        }
                                    }
                                    style={{ justifyContent: "center", }}
                                    key={index}
                                >
                                    <BookList book={item} navigation={navigation}  />
                                    <Pressable
                                        onPress={() => dispatch(deleteRecentSearch(searchRecord.length - index - 1))}
                                        style={{
                                            position: "absolute",
                                            right: regWidth * 18,
                                        }}
                                    >
                                        <Feather name="x" size={regWidth * 24} color={colors.bgdDark} />
                                    </Pressable>
                                </Pressable>
                            )
                        }
                        if (item.ctg === "album") {
                            return (
                                <Pressable 
                                    onPress={async() => 
                                        {
                                            navigation.navigate('AlbumProfile', {
                                                albumId: item.nemolist_id,
                                            })
                                            await analytics().logEvent('searchAlbum', {
                                                search_album_title: item.nemolist_title,
                                            })
                                            dispatch(addRecentSearch({...item, "ctg": "album"}));
                                        }
                                    }
                                    style={{ justifyContent: "center", }}
                                    key={index}
                                >
                                    <AlbumList album={item} navigation={navigation} isDefault={false} />
                                    <Pressable
                                        onPress={() => dispatch(deleteRecentSearch(searchRecord.length - index - 1))}
                                        style={{
                                            position: "absolute",
                                            right: regWidth * 18,
                                        }}
                                    >
                                        <Feather name="x" size={regWidth * 24} color={colors.bgdDark} />
                                    </Pressable>
                                </Pressable>
                            )
                        }
                        if (item.ctg === "user") {
                            return (
                                <Pressable
                                    onPress={async() => 
                                        {
                                            navigation.navigate('OtherProfile', {
                                                userTag: item.user_tag, 
                                            })
                                            await analytics().logEvent('searchUser', {
                                                search_user_tag: item.user_tag,
                                            })
                                            dispatch(addRecentSearch({...item, "ctg": "user"}));
                                        }
                                    }
                                    style={{ justifyContent: "center", }}
                                    key={index}
                                >
                                    <UserList user={item} navigation={navigation} />
                                    <Pressable
                                        onPress={() => dispatch(deleteRecentSearch(searchRecord.length - index - 1))}
                                        style={{
                                            position: "absolute",
                                            right: regWidth * 18,
                                        }}
                                    >
                                        <Feather name="x" size={regWidth * 24} color={colors.bgdDark} />
                                    </Pressable>
                                </Pressable>
                            )

                        }
                    })}
                </ScrollView>
            </View>


            {/* {debounceVal.length > 0 ? 
                <TopTab.Navigator
                    tabBar={(props) => <MyTabBar {...props} />}
                >
                    <TopTab.Screen 
                        name="Book" 
                        component={BookResultScreen} 
                        initialParams={{ searchInput: debounceVal, bookSearchResultList: bookSearchResultList, }}
                    />
                    <TopTab.Screen 
                        name="NemoList" 
                        component={NemolistResultScreen} 
                        initialParams={{ searchInput: debounceVal, albumSearchResultList: albumSearchResultList, }}
                    />
                    <TopTab.Screen 
                        name="User" 
                        component={UserResultScreen} 
                        initialParams={{ searchInput: debounceVal, userSearchResultList: userSearchResultList, }}
                    />
                </TopTab.Navigator>
                :
                <View>
                    <Text 
                        style={{ 
                            fontSize: regWidth * 17, 
                            fontFamily: "NotoSansKR-Black", 
                            marginHorizontal: regWidth * 12, 
                            marginTop: regHeight * 12, 
                        }}
                    >
                        Recent searches
                    </Text>
                    <ScrollView>
                        {searchRecord && searchRecord.map((item, index) => {
                            if (item.ctg === "book") {
                                return (
                                    <Pressable 
                                        onPress={async() => 
                                            {
                                                navigation.navigate('BookProfile', {
                                                    bookId: item.book_id, 
                                                })
                                                await analytics().logEvent('searchBook', {
                                                    search_book_title: item.book_title,
                                                })
                                                dispatch(addRecentSearch({...item, "ctg": "book"}));
                                            }
                                        }
                                        style={{ justifyContent: "center", }}
                                        key={index}
                                    >
                                        <BookList book={item} navigation={navigation}  />
                                        <Pressable
                                            onPress={() => dispatch(deleteRecentSearch(searchRecord.length - index - 1))}
                                            style={{
                                                position: "absolute",
                                                right: regWidth * 18,
                                            }}
                                        >
                                            <Feather name="x" size={regWidth * 24} color={colors.bgdDark} />
                                        </Pressable>
                                    </Pressable>
                                )
                            }
                            if (item.ctg === "album") {
                                return (
                                    <Pressable 
                                        onPress={async() => 
                                            {
                                                navigation.navigate('AlbumProfile', {
                                                    albumId: item.nemolist_id,
                                                })
                                                await analytics().logEvent('searchAlbum', {
                                                    search_album_title: item.nemolist_title,
                                                })
                                                dispatch(addRecentSearch({...item, "ctg": "album"}));
                                            }
                                        }
                                        style={{ justifyContent: "center", }}
                                        key={index}
                                    >
                                        <AlbumList album={item} navigation={navigation} isDefault={false} />
                                        <Pressable
                                            onPress={() => dispatch(deleteRecentSearch(searchRecord.length - index - 1))}
                                            style={{
                                                position: "absolute",
                                                right: regWidth * 18,
                                            }}
                                        >
                                            <Feather name="x" size={regWidth * 24} color={colors.bgdDark} />
                                        </Pressable>
                                    </Pressable>
                                )
                            }
                            if (item.ctg === "user") {
                                return (
                                    <Pressable
                                        onPress={async() => 
                                            {
                                                navigation.navigate('OtherProfile', {
                                                    userTag: item.user_tag, 
                                                })
                                                await analytics().logEvent('searchUser', {
                                                    search_user_tag: item.user_tag,
                                                })
                                                dispatch(addRecentSearch({...item, "ctg": "user"}));
                                            }
                                        }
                                        style={{ justifyContent: "center", }}
                                        key={index}
                                    >
                                        <UserList user={item} navigation={navigation} />
                                        <Pressable
                                            onPress={() => dispatch(deleteRecentSearch(searchRecord.length - index - 1))}
                                            style={{
                                                position: "absolute",
                                                right: regWidth * 18,
                                            }}
                                        >
                                            <Feather name="x" size={regWidth * 24} color={colors.bgdDark} />
                                        </Pressable>
                                    </Pressable>
                                )

                            }
                        })}
                    </ScrollView>
                </View>
            } */}
            {/* <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 20, marginTop: 8, }}>
                <Pressable
                    onPress={() => setCtg("book")}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
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
            </View> */}
            {/* <View
                style={{ backgroundColor: "#DDDDDD", paddingVertical:0.3, marginTop: 8, }}
            >
            </View> */}

            {/* <ScrollView

                ref={ref}
            >
                {bookSearchResultList !== null && bookSearchResultList.length > 0 && ctg === "book" ?
                    <>
                        {bookSearchResultList.map((searchResult, index) => (
                            <BookList book={searchResult} navigation={navigation} key={index} />
                        ))}
                    </>
                    :
                    null
                }
                {userSearchResultList !== null && userSearchResultList.length > 0 && ctg === "user" ? 
                    <>
                        {userSearchResultList.map((searchResult, index) => (
                            <UserList user={searchResult} navigation={navigation} key={index} />
                        ))}
                    </>
                    :
                    null
                }
                {albumSearchResultList !== null && albumSearchResultList.length > 0 && ctg === "album" ?
                    <>
                        {albumSearchResultList.map((searchResult, index) => (
                            <AlbumList album={searchResult} navigation={navigation} key={index} />
                        ))}
                    </>
                    :
                    null
                }
            
            </ScrollView> */}
        </View>
    );
};

const BookResultScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { searchKeyword, } = useSelector(userSelector);
    const [bookSearchResultList, setBookSearchResultList] = useState(null);

    useEffect(() => {
        onSearch();
        console.log(searchKeyword);
    }, [searchKeyword])

    const onSearch = async() => {
        if (searchKeyword.length > 0) {
            try {
                await Api
                .post("/api/v5/search/", {
                    keyword: searchKeyword,
                    ctg: "book",
                })
                .then((res) => {
                    // console.log(res.data);
                    setBookSearchResultList(res.data);
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                {bookSearchResultList && bookSearchResultList.map((searchResult, index) => (
                    <Pressable 
                        onPress={async() => 
                            {
                                navigation.navigate('BookProfile', {
                                    bookId: searchResult.book_id, 
                                })
                                await analytics().logEvent('searchBook', {
                                    search_book_title: searchResult.book_title,
                                })
                                dispatch(addRecentSearch({...searchResult, "ctg": "book"}));
                            }
                        }
                        key={index}
                    >
                        <BookList book={searchResult} navigation={navigation}  />
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

const NemolistResultScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { searchKeyword, } = useSelector(userSelector);
    const [albumSearchResultList, setAlbumSearchResultList] = useState(null);

    useEffect(() => {
        onSearch();
    }, [searchKeyword])

    const onSearch = async() => {
        if (searchKeyword.length > 0) {
            try {
                await Api
                .post("/api/v5/search/", {
                    keyword: searchKeyword,
                    ctg: "nemolist",
                })
                .then((res) => {
                    // console.log(res.data);
                    setAlbumSearchResultList(res.data);
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                {albumSearchResultList && albumSearchResultList.map((searchResult, index) => (
                    <Pressable 
                        onPress={async() => 
                            {
                                navigation.navigate('AlbumProfile', {
                                    albumId: searchResult.nemolist_id,
                                })
                                await analytics().logEvent('searchAlbum', {
                                    search_album_title: searchResult.nemolist_title,
                                })
                                dispatch(addRecentSearch({...searchResult, "ctg": "album"}));
                            }
                        }
                        key={index}
                    >
                        <AlbumList album={searchResult} navigation={navigation} isDefault={false} />
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

const UserResultScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { searchKeyword, } = useSelector(userSelector);
    const [userSearchResultList, setUserSearchResultList] = useState(null);

    useEffect(() => {
        onSearch();
    }, [searchKeyword])

    const onSearch = async() => {
        if (searchKeyword.length > 0) {
            try {
                await Api
                .post("/api/v5/search/", {
                    keyword: searchKeyword,
                    ctg: "user",
                })
                .then((res) => {
                    // console.log(res.data);
                    setUserSearchResultList(res.data);
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                {userSearchResultList && userSearchResultList.map((searchResult, index) => (
                    <Pressable
                        onPress={async() => 
                            {
                                navigation.navigate('OtherProfile', {
                                    userTag: searchResult.user_tag, 
                                })
                                await analytics().logEvent('searchUser', {
                                    search_user_tag: searchResult.user_tag,
                                })
                                dispatch(addRecentSearch({...searchResult, "ctg": "user"}));
                            }
                        }
                        key={index}
                    >
                        <UserList user={searchResult} navigation={navigation}  />
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

// const BookList = ({book, navigation,}) => {
//     return (
//         <Pressable 
//             style={styles.resultList} 
//             onPress={async() => 
//                 {
//                     navigation.navigate('BookProfile', {
//                         bookId: book.book_id, 
//                     })
//                     await analytics().logEvent('searchBook', {
//                         search_book_title: book.book_title,
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

// const UserList = ({user, navigation,}) => {
//     return (
//         <Pressable 
//             style={styles.resultList} 
//             onPress={async() => 
//                 {
//                     navigation.navigate('OtherProfile', {
//                         userTag: user.user_tag, 
//                     })
//                     await analytics().logEvent('searchUser', {
//                         search_user_tag: user.user_tag,
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

// const AlbumList = ({album, navigation,}) => {
//     return (
//         <Pressable 
//             style={styles.resultList} 
//             onPress={async() => 
//                 {
//                     navigation.navigate('AlbumProfile', {
//                         albumId: album.album_id, 
//                     })
//                     await analytics().logEvent('searchAlbum', {
//                         search_album_title: album.album_title,
//                     })
//                 }
//             }
//         >
//             <Image 
//                 source={album.album_cover !== null ? { uri: album.album_cover } : emptyAlbumImage}
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
                    paddingTop: regHeight * 12, 
                    paddingBottom: regHeight * 5,
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
                                    fontWeight: "700",
                                    fontFamily: "NotoSansKR-Regular",
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
        // backgroundColor: "pink",
        marginTop: regHeight * 8,
        marginHorizontal: regWidth * 20,
        // paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    searchInput: {
        backgroundColor: "#EEEEEE",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginVertical: 5,
        marginHorizontal: 20,
        fontSize: 18,
    },
    category: {
        backgroundColor: "#EEEEEE",
        paddingHorizontal: 13,
        paddingVertical: 10,
        marginHorizontal: 6,
        marginTop: 15,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"

    },
    categoryText: {
        fontSize: 15,
        fontWeight: "400",
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
})

export default Search;