import { View, SafeAreaView, Text, Button, StyleSheet, Image, ScrollView, FlatList, Dimensions, TouchableOpacity, ActivityIndicator, Pressable, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, } from "react";
import { useFocusEffect } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import vectorLeftImage from '../assets/icons/vector_left.png';
import { Card, BookmarkTile, BookmarkDetail } from '../components';
import user from "../modules/user";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import Api from "../lib/Api";

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
    setShouldNemoRefresh,
} from '../modules/user';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const SpreadInNemos = ({route, navigation}) => {
    // const { bookmarks, } = useSelector(bookmarkSelector);
    const dispatch = useDispatch();
    const { subTitle, title, index, sort, userTag, } = route.params;
    const [ref, setRef] = useState(null);
    const flatListRef = useRef();
    const [pullLoading, setPullLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const [bookmarks, setBookmarks] = useState(route.params.bookmarks);
    const [newBookmarkNum, setNewBookmarkNum] = useState(route.params.newBookmarkNum);
    const { shouldNemoRefresh, isBookmarkList, } = useSelector(userSelector);
    const [refreshing, setRefreshing] = useState(false);
    const sortList = [ "recents", "book", ];
    const [scrollLoading, setScrollLoading] = useState(false);

    // useEffect(() => {
    //     console.log(index);
    // }, []);

    // useEffect(() => {
    //     console.log(scrollLoading);
    // }, [scrollLoading]);

    useEffect(() => {
        setPullLoading(true);
        let scrollTimer = setTimeout(() => {
            
            flatListRef.current.scrollToIndex({ index: index, animated: false });
            setPullLoading(false);
            // if (index <= 9) {
            //     setScrollLoading(false);
            // }
        }, 200);
        
        return ()=>{ 
            clearTimeout(scrollTimer);
            // console.log("done");
        }
        
    }, []);

    useEffect(() => {
        if (shouldNemoRefresh === true) {
            // console.log("auto");
            fetchBookmarkList(sort);
            dispatch(setShouldNemoRefresh(false));
        }
    }, [shouldNemoRefresh]);

    const autoScroll = () => {
        ref.scrollTo({ x: 0, y: SCREEN_WIDTH * index, animated: false });
    }

    const renderBookmark = ({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    )

    const fetchBookmarkList = async(sortNum) => {
        try {
            // console.log(sortList[sortNum])
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemos",
                sort: sortList[sortNum],
                items: 0,
                user_tag: userTag,
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
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);
        console.log(sort)
        await fetchBookmarkList(sort)
        .then(() => setRefreshing(false));
    }, [sort]);

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getBookmarks();
        }
    };

    const getBookmarks = async() => {
        if (bookmarks.length >= 8 && newBookmarkNum >= 8) {
            // console.log(bookmarks[bookmarks.length - 1].nemo_num);
            try {
                setScrollLoading(true);
                await Api
                .post("api/v1/user/library/", {
                    ctg: "nemos",
                    sort: sortList[sort],
                    items: bookmarks.length,
                    user_tag: userTag,
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
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*35, height: regWidth*35 }}
                    />
                </Pressable>
                <View style={{ alignItems: "center", }}>
                    <Text style={{ fontSize: regWidth * 10, fontFamily: "NotoSansKR-Medium", color: "#808080", includeFontPadding: false, }} >
                        {subTitle}
                    </Text>
                    <TouchableOpacity
                        // onPress={autoScroll}
                    >
                        <Text style={{
                            fontSize: regWidth * 16,
                            fontFamily: "NotoSansKR-Medium",
                            includeFontPadding: false,
                        }}>
                            {title}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ opacity: 0, }} >
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*30, height: regWidth*30 }}
                    />
                </View>
            </View>
            {/* <ScrollView 
                showsVerticalScrollIndicator={false}
                ref={(ref) => {
                    setRef(ref);
                }}
                onContentSizeChange={() => {
                    autoScroll();
                }}
            >
                {bookmarks.map((bookmark, index) => (
                    <Card bookmark={bookmark} key={index} navigation={navigation} />
                ))}
            </ScrollView> */}
            {/* <ScrollView 
                showsVerticalScrollIndicator={false}
                ref={(ref) => {
                    setRef(ref);
                }}
            >
                {bookmarks.map((bookmark, index) => (
                    <BookmarkDetail bookmark={bookmark} key={index} navigation={navigation} />
                ))}
            </ScrollView> */}
            {pullLoading ? 
                <ActivityIndicator 
                    color="black" 
                    style={{marginTop: 50}} 
                    size="large"
                />
                :
                null
            }
            {(bookmarks !== null) && (bookmarks !== undefined) ? 
                <FlatList 
                    data={bookmarks}
                    ref={flatListRef}
                    renderItem={renderBookmark}
                    keyExtractor={bookmark => bookmark.bookmark_id}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={scrollLoading && <ActivityIndicator />}
                    style={{
                        opacity: pullLoading ? 0 : 1,
                    }}
                    // initialScrollIndex={index}
                    // disableVirtualization={false}
                    // initialNumToRender={30}
                    initialNumToRender={bookmarks.length}
                    onScrollToIndexFailed={(error) => {
                        console.log(error);
                        // setScrollLoading(true);
                        flatListRef.current.scrollToOffset({ offset: error.averageItemLength * error.index, animated: false });
                        let scrollTimer = setTimeout(() => {
                            // setScrollLoading(false);
                            if (bookmarks.length !== 0 && flatListRef !== null) {
                                flatListRef.current.scrollToIndex({ index: error.index, animated: false });
                            }
                        }, 200);

                        return ()=>{ 
                            clearTimeout(scrollTimer);
                            console.log("done");
                        }
                        
                    }}
                    // onScrollToIndexFailed={info => {
                    //     const wait = new Promise(resolve => setTimeout(resolve, 500));
                    //     wait.then(() => {
                    //         flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    //     });
                    // }}
                />
                :
                null
            }

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
        marginVertical: 10,
        marginHorizontal: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    book: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        flexDirection: "row",
        borderBottomWidth: 0.3,
        borderBottomColor: "#808080",
      },
    bookImage: {
        width: 92,
        height: 92,
        resizeMode: "contain",
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: "700",
        paddingVertical: 18,
        paddingHorizontal: 8,
    },
    bookAuthor: {
        fontSize: 15,
        fontWeight: "400",
        // paddingVertical: ,
        paddingHorizontal: 8,
    },
})

export default SpreadInNemos;