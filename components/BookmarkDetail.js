import { StyleSheet, View, ScrollView, Text, Button, Dimensions, Image, TouchableOpacity, Animated, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import Card from './Card';
import Api from '../lib/Api';
import blankAvatar from '../assets/images/peopleicon.png';

import { useSelector, useDispatch } from 'react-redux';
import { bookmarkSelector, scrapSelector } from '../modules/hooks';
import { addBookmark } from '../modules/bookmarks';
import { addScrap, deleteScrap } from '../modules/scraps';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkDetail = (props) => {
    const bookmark = props.bookmark;
    const navigation = props.navigation;
    const [current, setCurrent] = useState(0);
    const [contentsByNum, setContentsByNum] = useState([]);

    // useEffect(() => {
    //     const cardNum = parseInt(bookmark.contents.length / 200) + 1;
    //     let copy = [];

    //     for ( let i = 0; i < cardNum; i++) {
    //         copy = [...copy, bookmark.contents.substring(i * 200, (i + 1) * 200)]
    //     }
    //     setContentsByNum(copy);
    // }, [])


    const handleCurrentChange = (e) => {
        const nextCurrent = Math.floor(
            e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 26),
        );
        if (nextCurrent < 0) {
            return;
        }
        // console.log(nextCurrent);
        setCurrent(nextCurrent);
    };

    return (
        <View style={styles.bookmarkContainer}>
            <View style={styles.bookmarkTop}>
                <Image 
                    source={ bookmark.avatar !== null ? { uri: `http://3.38.62.105${bookmark.avatar}`} : blankAvatar} 
                    style={styles.bookmarkWriterImage} 
                />
                <Pressable 
                    activeOpacity={1} 
                    onPress={() => navigation.navigate('OtherProfile', { userTag: bookmark.user_tag, })} 
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Text style={styles.bookmakrWriterName}>{bookmark.writer_name}</Text>
                </Pressable>
                <Entypo name="dot-single" size={10} color="#808080" />
                <View>
                    <Text style={styles.bookmarkDateText}>{bookmark.created_date}</Text>
                </View>
            </View>
            <ScrollView
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                horizontal
                // onScrollEndDrag={handleCurrentChange}
                onScroll={handleCurrentChange}
                scrollEventThrottle={16}
            >
                {/* {bookmark.nemos.map((nemo, index) => (
                    <Card 
                        bookmark={bookmark} 
                        nemo={nemo} 
                        navigation={navigation} 
                        key={index} 
                    />
                ))} */}
                {/* {contentsByNum.map((contents, index) => (
                    <Card 
                        bookmark={bookmark} 
                        // nemo={nemo} 
                        contents={contents}
                        navigation={navigation} 
                        key={index} 
                    />
                ))} */}
                {bookmark.contents.map((content, index) => (
                    <Card 
                        bookmark={bookmark} 
                        contents={content}
                        navigation={navigation} 
                        key={index} 
                    />
                ))}
                
            </ScrollView>

            <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: -12, }}>
                {/* {bookmark.nemos.map((nemo, index) => {
                    if ((nemo.numbering - 1) === current) {
                        return <Entypo name="dot-single" size={24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                    }
                    return <Entypo name="dot-single" size={24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                })} */}
                {/* {contentsByNum.map((contents, index) => {
                    if (index === current) {
                        return <Entypo name="dot-single" size={24} color="#FF4040" style={{ marginHorizontal: -4, }} key={index} />
                    }
                    return <Entypo name="dot-single" size={24} color="#808080" style={{ marginHorizontal: -4, }} key={index} />
                })} */}
                {bookmark.contents.map((contents, index) => {
                    if (index === current) {
                        return <Entypo name="dot-single" size={24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                    }
                    return <Entypo name="dot-single" size={24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                })}
            </View>

            <View style={styles.bookmarkInfo}>
                <Text style={styles.bookmarkInfoText}>
                    {bookmark.text} 
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 15, }}>
                    {bookmark.tags.map((tag, index) => (
                        <Text style={styles.bookmarkHashtag} key={index}>
                            {`#${tag.tag}`}
                        </Text>
                    ))}
                </View>

            </View>

            <View style={styles.bookmarkLikes}>
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    // onPress={onLike}
                >
                    <Entypo 
                        // name={isLike ? "heart" : "heart-outlined"} 
                        name="heart-outlined"
                        size={24} 
                        color="red" 
                    />
                    <Text style={styles.bookmarkLikesText}>{bookmark.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={{ 
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginHorizontal: 20,
                    }}
                    // onPress={onScrap}
                >
                    <Feather 
                        name="download" 
                        size={24}
                        color="black" 
                        // color={scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id)) === -1 ? "black" : "red"} 
                    />
                    <Text style={styles.bookmarkLikesText}>{bookmark.scraps}</Text>
                </TouchableOpacity>
                {/* {watermark === post.nickname ?
                    null
                    :
                    <TouchableOpacity 
                        activeOpacity={1} 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                        }}
                        onPress={onScrap}
                    >
                        <Feather 
                            name="download" 
                            size={24} 
                            color={scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id)) === -1 ? "black" : "red"} 
                        />
                        <Text style={styles.bookmarkLikesText}>{scrapNum}</Text>
                    </TouchableOpacity>
                } */}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bookmarkContainer: {
        // backgroundColor: "grey",
        flex: 1,
        paddingTop: 28,
        paddingBottom: 18,
        borderTopWidth: 0.3,
        borderTopColor: "#808080",
    },

    bookmarkTop: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 13,
        alignItems: "center",
    },
    bookmarkWriterImage: {
        width: 25,
        height: 25,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
    },
    bookmakrWriterName: {
        fontWeight: "700",
        fontSize: 12.5,
        paddingHorizontal: 5,
    },
    bookmarkDateText: {
        color: "#808080",
        fontWeight: "500",
        fontSize: 10,
        paddingHorizontal: 5,
    },

    bookmarkInfo: {
        marginTop: 5,
        paddingHorizontal: 13,
    },
    bookmarkInfoText: {
        fontWeight: "400",
        fontSize: 14,
        marginTop: 10,
    },
    bookmarkHashtag: {
        fontWeight: "400",
        fontSize: 14,
        // marginTop: 15,
        marginRight: 8,
        color: "#9250FF",
    },


    bookmarkLikes: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 13,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    bookmarkLikesText: {
        fontWeight: "700",
        fontSize: 15,
        marginLeft: 5,
    },
})

export default BookmarkDetail;