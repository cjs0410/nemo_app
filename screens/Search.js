import { View, SafeAreaView, Text, Button, StyleSheet, TextInput, ScrollView, Pressable, Image, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import blankBookCover from '../assets/images/blankBookImage.png';
import blankAvatar from '../assets/images/peopleicon.png';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import Api from '../lib/Api';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';

import analytics from '@react-native-firebase/analytics';

const Search = ({navigation}) => {
    const [searchInput, setSearchInput] = useState('');
    const debounceVal = useDebounce(searchInput);
    const [bookSearchResultList, setBookSearchResultList] = useState(null);
    const [userSearchResultList, setUserSearchResultList] = useState(null);
    const [albumSearchResultList, setAlbumSearchResultList] = useState(null);
    const isSearchListNonEmpty = 
        (bookSearchResultList !== null && bookSearchResultList.length > 0)
        || (userSearchResultList !== null && userSearchResultList.length > 0)
        || (albumSearchResultList !== null && albumSearchResultList.length > 0);

    const [ctg, setCtg] = useState("book");

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        autoSearch();
    }, [debounceVal, ctg]);


    const onChangeSearchInput = (payload) => setSearchInput(payload);

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

    return (
        <View style={styles.container}>
            <View>
            <SafeAreaView style={styles.header} >
                <Text style={{
                    fontSize: 25,
                    fontWeight: "900",
                }} >
                    Search
                </Text>
            </SafeAreaView>
            <ScrollView
                scrollEnabled={false}
            >
                <TextInput 
                    style={styles.searchInput}
                    placeholder="키워드를 입력하세요"
                    onChangeText={onChangeSearchInput}
                    value={searchInput}
                />
            </ScrollView>
            {/* <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal
            >
                <View style={styles.category}>
                    <Text style={styles.categoryText}>부동산</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>메타버스</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>아이폰</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>상당히</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>빡세네</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>리액트</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>네이티브</Text>
                </View>
                <View style={styles.category}>
                    <Text style={styles.categoryText}>홀리쉣</Text>
                </View>
            </ScrollView> */}

            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 20, marginTop: 8, }}>
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
            </View>
            </View>
            <View
                style={{ backgroundColor: "#DDDDDD", paddingVertical:0.3, marginTop: 8, }}
            >
            </View>

            <ScrollView

                ref={ref}
            >
                {/* <Text style={{marginHorizontal: 20, marginTop: 20, fontSize: 20, fontWeight: "700", }} >최근 검색어</Text>
                <Text style={{marginHorizontal: 20, marginTop: 20, fontSize: 17, fontWeight: "500", }} >검색 내용이 없습니다.</Text> */}
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
            
            </ScrollView>
        </View>
    );
};

const BookList = ({book, navigation,}) => {
    return (
        <Pressable 
            style={styles.resultList} 
            onPress={async() => 
                {
                    navigation.navigate('BookProfile', {
                        bookId: book.book_id, 
                    })
                    await analytics().logEvent('searchBook', {
                        search_book_title: book.book_title,
                    })
                }
            }
        >
            <Image 
                source={book.book_cover !== null ? { uri: book.book_cover } : blankBookCover}
                style={styles.bookCoverImage}
            />
            <View style={{ marginHorizontal: regWidth * 8, }}>
                <Text 
                    style={{ 
                        fontSize: regWidth * 18, 
                        fontWeight: "700", 
                        width: regWidth * 220, 
                    }}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {book.book_title}
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
                    {book.book_author}
                </Text>
            </View>
        </Pressable>
    )
}

const UserList = ({user, navigation,}) => {
    return (
        <Pressable 
            style={styles.resultList} 
            onPress={async() => 
                {
                    navigation.navigate('OtherProfile', {
                        userTag: user.user_tag, 
                    })
                    await analytics().logEvent('searchUser', {
                        search_user_tag: user.user_tag,
                    })
                }
            }
        >
            <Image 
                source={user.avatar !== null ? { uri: user.avatar } : blankAvatar}
                style={styles.userImage}
            />
            <View style={{ marginHorizontal: regWidth * 8, }}>
                <Text 
                    style={{ 
                        fontSize: regWidth * 18, 
                        fontWeight: "700", 
                        width: regWidth * 220, 
                    }}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {user.name}
                </Text>
                <Text 
                    style={{ 
                        fontSize: regWidth * 15, 
                        fontWeight: "400", 
                        width: regWidth * 180,
                        marginTop: regHeight * 8,
                        color: "#008000",
                    }}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {`@${user.user_tag}`}
                </Text>
            </View>
        </Pressable>
    )
}

const AlbumList = ({album, navigation,}) => {
    return (
        <Pressable 
            style={styles.resultList} 
            onPress={async() => 
                {
                    navigation.navigate('AlbumProfile', {
                        albumId: album.album_id, 
                    })
                    await analytics().logEvent('searchAlbum', {
                        search_album_title: album.album_title,
                    })
                }
            }
        >
            <Image 
                source={album.album_cover !== null ? { uri: album.album_cover } : emptyAlbumImage}
                style={styles.albumImage}
            />
            <View style={{ marginHorizontal: regWidth * 8, }}>
                <Text 
                    style={{ 
                        fontSize: regWidth * 18, 
                        fontWeight: "700", 
                        width: regWidth * 220, 
                    }}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {album.album_title}
                </Text>
                <Text 
                    style={{ 
                        fontSize: regWidth * 15, 
                        fontWeight: "400", 
                        width: regWidth * 180,
                        marginTop: regHeight * 8,
                        color: "#008000",
                    }}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {`@${album.user_tag}`}
                </Text>
            </View>
        </Pressable>
    )
}


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