import { StyleSheet, View, ScrollView, Text, Button, Dimensions, Image, TouchableOpacity, Animated } from "react-native";
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

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Post = (props) => {
    const dispatch = useDispatch();
    const { scraps, } = useSelector(scrapSelector);
    const [current, setCurrent] = useState(0);
    const [isLike, setIsLike] = useState(false);
    const [isScrap, setIsScrap] = useState(false);
    const post = props.post;
    const [scrapNum, setScrapNum] = useState(post.scraps);
    const bookmarks = props.post.bookmarks;
    const bookmarkNumbering = bookmarks.map((bookmark) => (Number(bookmark.bookmark_numbering)));
    bookmarkNumbering.sort((a, b) => a - b);
    const navigation = props.navigation;
    const [watermark, setWatermark] = useState('');

    useEffect(() => {
        fetchWatermark();
    }, [])

    const onProfile = () => {
        navigation.navigate('OtherProfile');
    }

    const handleCurrentChange = (e) => {
        const nextCurrent = Math.floor(
            e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 26),
        );
        if (nextCurrent < 0) {
            return;
        }
        // console.log(e.nativeEvent.contentOffset.x);
        // console.log(SCREEN_WIDTH);
        console.log(nextCurrent);
        setCurrent(nextCurrent);
    };

    const onLike = () => {
        setIsLike(!isLike);
    }

    const onScrap = async() => {
        try {
            await Api.post("/api/v4/post/scrap/", {
                post_id: post.post_id,
            })
            .then((res) => {
                const findScrap = scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id))
                if (findScrap === -1) {
                    dispatch(addScrap(post));
                } else {
                    dispatch(deleteScrap(post));
                }
                setScrapNum(res.data.scraps);
            })
        } catch (err) {
            console.error(err);
        }

        // setIsScrap(!isScrap);
    }

    const fetchWatermark = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setWatermark(jwt_decode(accessToken).watermark);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.post}>
            <View style={styles.postWriter}>
                <Image 
                    source={ post.avatar !== null ? { uri: `http://3.38.228.24${post.avatar}`} : blankAvatar} 
                    style={styles.postWriterImage} 
                />
                {/* <TouchableOpacity activeOpacity={1} onPress={onProfile} > */}
                    <Text style={styles.postWriterText}>{post.writer_name}</Text>
                {/* </TouchableOpacity> */}
                <Entypo name="dot-single" size={10} color="#808080" />
                <View>
                    <Text style={styles.postDateText}>{post.modified_date.split("T")[0]}</Text>
                </View>
            </View>
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={() => {
                    navigation.navigate('PostDetail', { 
                        post: post 
                    })
                }}
            >
                <View style={styles.postTitle}>
                    <Text style={styles.postTitleText}>{post.title}</Text>
                    <Text style={styles.postTitleInfoText}>{post.text}</Text>
                </View>
            </TouchableOpacity>
            <ScrollView
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                horizontal
                // onScrollEndDrag={handleCurrentChange}
                onScroll={handleCurrentChange}
                scrollEventThrottle={16}
                // onMomentumScrollEnd={(event) => console.log(event.nativeEvent.contentOffset.x)}
            >
                {/* {post.cards.map((card, index) => (
                    <Card card={card} key={index} />
                ))} */}
                {/* 
                {post.cards.map((card, index) => (
                    <Card 
                        bookTitle={card.bookTitle}
                        bookChapter={card.bookChapter}
                        bookMark={card.bookMark}
                        bookContents={card.bookContents}
                        reverseContents={card.reverseContents}
                        watermark={card.watermark}
                        cardColor={card.cardColor}
                        key={index} 
                    />
                ))} */}
                {bookmarkNumbering.map((number, index) => (
                    <Card bookmark={bookmarks.find(bookmark => Number(bookmark.bookmark_numbering) === Number(number))} navigation={navigation} key={index} />
                ))}
                
            </ScrollView>
            <View style={{flexDirection: "row", }}>
            {bookmarkNumbering.map((number, index) => {
                if ((number - 1) === current) {
                    return <Entypo name="dot-single" size={24} color="red" key={index} />
                }
                return <Entypo name="dot-single" size={24} color="grey" key={index} />
            })}
            </View>
            <View style={styles.postLikes}>
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    onPress={onLike}
                >
                    <Entypo 
                        name={isLike ? "heart" : "heart-outlined"} 
                        size={24} 
                        color="red" 
                    />
                    <Text style={styles.postLikesText}>{post.likes}</Text>
                </TouchableOpacity>
                {watermark === post.nickname ?
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
                        <Text style={styles.postLikesText}>{scrapNum}</Text>
                    </TouchableOpacity>
                }

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    post: {
        // backgroundColor: "grey",
        flex: 1,
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
        // backgroundColor: "red",
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
        marginLeft: 5,
    },
})

export default Post;