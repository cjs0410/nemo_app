import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetBookmarks, addBookmark, deleteBookmark } from '../modules/bookmarks';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkTile = (props) => {
    const bookmark = props.bookmark;
    const { bookmarked, } = useSelector(bookmarkSelector);

    return (
        <View style={styles.bookMarkTileBox} >
            <View style={{...styles.bookMarkTile, backgroundColor: bookmark.hex, }} >
                <View style={styles.bookMarkTitle}>
                    <View style={{ width: "90%", }}>
                        <Text 
                            style={{ fontSize: 15, fontWeight: "700", }} 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                        >
                            {bookmark.book_title}
                        </Text>
                    </View>
                    <View style={{ alignItems: "center", }}>
                        <FontAwesome name="bookmark" size={18} color="black" />
                        <Text style={{ fontSize: 7, fontWeight: "700"}}>{bookmark.bookmarking}</Text>
                    </View>
                </View>
                <View style={styles.bookMarkContent}>
                    <Text style={{ fontSize: 13, fontWeight: "400", marginTop: 20, }} >{bookmark.contents}</Text>
                </View>
                <View style={styles.bookMarkWatermark}>
                    <Text style={{ fontSize: 9, fontWeight: "500", }} >{`@${bookmark.watermark}`}</Text>
                </View>
            </View>
        </View>
    );
    // return (
    //     <View style={styles.bookMarkTileBox} >
    //         <View style={{...styles.bookMarkTile, backgroundColor: "pink", }} >
    //             <View style={styles.bookMarkTitle}>
    //                 <Text style={{ fontSize: 15, fontWeight: "700", }} >스티브 잡스의 유산</Text>
    //                 <View style={{ alignItems: "center", }}>
    //                     <Feather name="bookmark" size={18} color="black" />
    //                     <Text style={{ fontSize: 7, fontWeight: "700"}}>128</Text>
    //                 </View>
    //             </View>
    //             <View style={styles.bookMarkContent}>
    //                 <Text style={{ fontSize: 13, fontWeight: "400", marginTop: 20, }} > 스티브 잡스는 미국의 기업인이었으며 애플의 전 CEO이자 공동 창립자이다.</Text>
    //             </View>
    //             <View style={styles.bookMarkWatermark}>
    //                 <Text style={{ fontSize: 9, fontWeight: "500", }} >@leehakjoon</Text>
    //             </View>
    //         </View>
    //     </View>
    // );
}

const styles = StyleSheet.create({
    bookMarkTileBox: {
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_WIDTH * 0.5,
        paddingHorizontal: 3,
        paddingVertical: 3,
    },
    bookMarkTile: {
        flex: 1,
        // borderWidth: 3,
        // borderColor: "white",
        paddingHorizontal: 2,
        borderRadius: 2,
    },
    bookMarkTitle: {
        // backgroundColor: "blue",
        flex: 0.5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookMarkContent: {
        flex: 2,
    },
    bookMarkWatermark: {
        flex: 0.3,
        alignItems: "flex-start",
    },
})

export default BookmarkTile;