import { View, SafeAreaView, Text, Button, StyleSheet, Image, ScrollView, FlatList, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useRef, useCallback, } from "react";
import { useFocusEffect } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile, BookmarkDetail } from '../components';
import user from "../modules/user";

import { useSelector, useDispatch } from 'react-redux';
import { bookmarkSelector } from '../modules/hooks';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkNewDetail = ({route, navigation}) => {
    // const { bookmarks, } = useSelector(bookmarkSelector);
    const { bookmarks, subTitle, title, index } = route.params;
    const [ref, setRef] = useState(null);
    const flatListRef = useRef();

    // useEffect(() => {
    //     console.log(bookmarks);
    // }, []);

    const autoScroll = () => {
        ref.scrollTo({ x: 0, y: SCREEN_WIDTH * index, animated: false });
    }

    const renderBookmark = ({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    )


    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <View style={{ alignItems: "center", }}>
                    <Text style={{ fontSize: 10, fontWeight: "500", color: "#808080", }} >
                        {subTitle}
                    </Text>
                    <TouchableOpacity
                        // onPress={autoScroll}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "500",
                        }}>
                            {title}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ opacity: 0, }} >
                    <MaterialCommunityIcons name="square-outline" size={30} color="black" />
                </View>
            </SafeAreaView>
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
            {(bookmarks !== null) && (bookmarks !== undefined) ? 
                <FlatList 
                    data={bookmarks}
                    ref={flatListRef}
                    renderItem={renderBookmark}
                    keyExtractor={bookmark => bookmark.bookmark_id}
                    showsVerticalScrollIndicator={false}
                    initialScrollIndex={index}
                    disableVirtualization={false}
                    // initialNumToRender={bookmarks.length / 5}
                    onScrollToIndexFailed={(error) => {
                        console.log(error);
                        flatListRef.current.scrollToOffset({ offset: error.averageItemLength * error.index, animated: false });
                        setTimeout(() => {
                            if (bookmarks.length !== 0 && flatListRef !== null) {
                                flatListRef.current.scrollToIndex({ index: error.index, animated: false });
                            }
                        }, 200);
                    }}
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