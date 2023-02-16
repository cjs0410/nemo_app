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

import { useSelector, useDispatch } from 'react-redux';
import { bookmarkSelector } from '../modules/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkNewDetail = ({route, navigation}) => {
    // const { bookmarks, } = useSelector(bookmarkSelector);
    const { bookmarks, subTitle, title, index } = route.params;
    const [ref, setRef] = useState(null);
    const flatListRef = useRef();
    const [scrollLoading, setScrollLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // useEffect(() => {
    //     console.log(index);
    // }, []);

    // useEffect(() => {
    //     console.log(scrollLoading);
    // }, [scrollLoading]);

    useEffect(() => {
        setScrollLoading(true);
        let scrollTimer = setTimeout(() => {
            
            flatListRef.current.scrollToIndex({ index: index, animated: false });
            setScrollLoading(false);
            // if (index <= 9) {
            //     setScrollLoading(false);
            // }
        }, 200);
        
        return ()=>{ 
            clearTimeout(scrollTimer);
            // console.log("done");
        }
        
    }, [])

    const autoScroll = () => {
        ref.scrollTo({ x: 0, y: SCREEN_WIDTH * index, animated: false });
    }

    const renderBookmark = ({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    )


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
            {scrollLoading ? 
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
                    style={{
                        opacity: scrollLoading ? 0 : 1,
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

export default BookmarkNewDetail;