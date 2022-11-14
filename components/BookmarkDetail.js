import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Pressable, Modal, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
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
    const value = useRef(new Animated.Value(0)).current;
    const [isScrap, setIsScrap] = useState(bookmark.is_scrap);
    const [scrapCount, setScrapCount] = useState(bookmark.scraps);
    const [isLike, setIsLike] = useState(bookmark.is_like);
    const [likeCount, setLikeCount] = useState(bookmark.likes);
    const [userTag, setUserTag] = useState(null);
    
    const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const modalValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // console.log(bookmark);
        fetchUserTag();
    }, [])

    const fetchUserTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setUserTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

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

    const showAvatar = () => {
        Animated.timing(value, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    // const showModal = () => {
    //     Animated.timing(value, {
    //         toValue: 1,
    //         duration: 1000,
    //         useNativeDriver: false,
    //     }).start();
    // }

    // const unShowModal = () => {
    //     Animated.timing(value, {
    //         toValue: 0,
    //         duration: 1000,
    //         useNativeDriver: false,
    //     }).start();
    // }

    // const showOrUnshow = () => {
    //     if (bookmarkModalVisible === false) {
    //         showModal();
    //     } else {
    //         unShowModal();
    //     }
    //     setBookmarkModalVisible(!bookmarkModalVisible);
    // }


    const onLike = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/likes/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setIsLike(res.data.is_like);
                setLikeCount(res.data.count);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onScrap = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/scraps/", {
                bookmark_id: bookmark.bookmark_id,
            })
            .then((res) => {
                setIsScrap(res.data.is_scrap);
                setScrapCount(res.data.count);
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <View style={styles.bookmarkContainer}>
                <View style={styles.bookmarkTop}>
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Animated.Image 
                            source={ bookmark.avatar !== null ? { uri: `http://3.38.62.105${bookmark.avatar}`} : blankAvatar} 
                            style={{
                                ...styles.bookmarkWriterImage,
                                opacity: value,
                            }} 
                            // onLoadStart={}
                            onLoadEnd={showAvatar}
                        />
                        <Pressable 
                            activeOpacity={1} 
                            onPress={() => navigation.push('OtherProfile', { userTag: bookmark.user_tag, })} 
                            hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                        >
                            <Text style={styles.bookmakrWriterName}>{bookmark.writer_name}</Text>
                        </Pressable>
                        <Entypo name="dot-single" size={10} color="#808080" />
                        <View>
                            <Text style={styles.bookmarkDateText}>{bookmark.created_date.split('T')[0]}</Text>
                        </View>
                    </View>
                    <Pressable
                        hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                        onPress={() => setBookmarkModalVisible(true)}
                        // onPress={showOrUnshow}
                    >
                        <Entypo name="dots-three-horizontal" size={regWidth * 18} color="black" />
                    </Pressable>
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
                            index={index}
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
                            return <Entypo name="dot-single" size={regWidth * 24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                        }
                        return <Entypo name="dot-single" size={regWidth * 24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                    })}
                </View>

                <View style={styles.bookmarkInfo}>
                    {bookmark.text.length !== 0 ? 
                        <Text style={styles.bookmarkInfoText}>
                            {bookmark.text} 
                        </Text>
                        :
                        null
                    }
                    {bookmark.tags.length !== 0 ? 
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: regHeight * 15, }}>
                            {bookmark.tags.map((tag, index) => (
                                <Text style={styles.bookmarkHashtag} key={index}>
                                    {`#${tag.tag}`}
                                </Text>
                            ))}
                        </View>
                        :
                        null
                    }


                </View>

                <View style={styles.bookmarkLikes}>
                    <Pressable 
                        activeOpacity={1} 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            width: regWidth * 80,
                        }}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        onPress={onLike}
                    >
                        <Entypo 
                            name={isLike ? "heart" : "heart-outlined"} 
                            // name="heart-outlined"
                            size={regWidth * 20} 
                            color="red" 
                        />
                        <Text style={styles.bookmarkLikesText}>{likeCount}</Text>
                    </Pressable>
                    { userTag !== bookmark.user_tag ? 
                        <Pressable 
                            activeOpacity={1} 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                            }}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={onScrap}
                        >
                            <Feather 
                                name="download" 
                                size={regWidth * 20}
                                color={isScrap ? "red" : "black" }
                                // color={scraps.findIndex(scrap => Number(scrap.post_id) === Number(post.post_id)) === -1 ? "black" : "red"} 
                            />
                            <Text style={styles.bookmarkLikesText}>{scrapCount}</Text>
                        </Pressable>
                        :
                        null
                    }

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
            <Modal
                animationType="fade"
                transparent={true}
                visible={bookmarkModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setBookmarkModalVisible(false);
                            setReportVisible(false);
                        }
                    }
                />
                {reportVisible ?
                    <KeyboardAvoidingView
                        style={{
                            ...styles.modal, 
                            height: regHeight * 650, 
                        }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <Entypo name="warning" size={24} color="red" />
                            <TextInput 
                                style={styles.reportInput}
                                placeholder="신고 내용을 적어주세요."
                                // onChangeText={(payload => setReportContents(payload))}
                                multiline={true}
                            />
                        <TouchableOpacity 
                            style={{...styles.menu, justifyContent: "center", backgroundColor: "red"}}
                            activeOpacity={1}
                            // onPress={report}
                        >
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "white", }}>신고하기</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                    :
                    <Animated.View 
                        style={{
                            ...styles.modal,
                            // transform: [
                            //     {
                            //         translateY: modalValue.interpolate({
                            //             inputRange: [0, 1],
                            //             outputRange: [0, 300]
                            //         })
                            //     }
                            // ]
                        }}
                    >
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => setReportVisible(true)}
                        >
                            <Entypo name="warning" size={24} color="red" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
                        </TouchableOpacity>
                        {/* {bookmark.user_tag === userTag ? 
                            <>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setReportVisible(false);
                                        navigation.navigate('EditPost', { 
                                            post: {
                                                ...post, 
                                                bookmarks: arranged,
                                            }, 
                                        });
                                    }}
                                >
                                    <AntDesign name="edit" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        수정하기
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menu}
                                    activeOpacity={1}
                                    onPress={deletePost}
                                >
                                    <Feather name="trash" size={24} color="black" />
                                    <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                        삭제하기
                                    </Text>
                                </TouchableOpacity>
                            </>
                            :
                            null
                        } */}
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                        >
                            {/* <Feather name="trash" size={24} color="black" /> */}
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>
                                앨범에 추가하기
                            </Text>
                        </TouchableOpacity>

                    </Animated.View>
                }

            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    bookmarkContainer: {
        // backgroundColor: "grey",
        flex: 1,
        paddingTop: regHeight * 8,
        paddingBottom: regHeight * 8,
        borderTopWidth: 0.3,
        borderTopColor: "#808080",
    },

    bookmarkTop: {
        flexDirection: "row",
        paddingTop: regHeight * 24,
        paddingHorizontal: regWidth * 13,
        alignItems: "center",
        justifyContent: "space-between",
    },
    bookmarkWriterImage: {
        width: regWidth * 25,
        height: regWidth * 25,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
    },
    bookmakrWriterName: {
        fontWeight: "700",
        fontSize: regWidth * 12.5,
        paddingHorizontal: regWidth * 5,
    },
    bookmarkDateText: {
        color: "#808080",
        fontWeight: "500",
        fontSize: regWidth * 10,
        paddingHorizontal: regWidth * 5,
    },

    bookmarkInfo: {
        marginTop: regHeight * 5,
        paddingHorizontal: regWidth * 13,
    },
    bookmarkInfoText: {
        fontWeight: "400",
        fontSize: regWidth * 14,
        marginTop: regHeight * 10,
    },
    bookmarkHashtag: {
        fontWeight: "400",
        fontSize: regWidth * 14,
        // marginTop: 15,
        marginRight: regWidth * 8,
        color: "#9250FF",
    },


    bookmarkLikes: {
        // backgroundColor: "pink",
        // width: "40%",
        marginTop: regHeight * 10,
        paddingVertical: regHeight * 10,
        paddingHorizontal: regWidth * 13,
        flexDirection: "row",
        alignItems: "center",
        // justifyContent: "space-between",
    },
    bookmarkLikesText: {
        fontWeight: "700",
        fontSize: regWidth * 15,
        marginLeft: regWidth * 5,
    },

    modal: {
        position: "absolute",
        width: "100%",
        height: regHeight * 300,
        bottom: 0, 
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
    },
    menu: {
        backgroundColor: "#DDDDDD",
        width: SCREEN_WIDTH - regWidth * 40,
        height: regHeight * 40,
        borderRadius: 5,
        // paddingVertical: 8,
        paddingHorizontal: regWidth * 13,
        marginTop: regHeight * 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    reportInput: {
        width: SCREEN_WIDTH - regWidth * 40,
        height: regHeight * 170,
        backgroundColor: "#DDDDDD",
        borderWidth: 1,
        borderColor: "#FF4040",
        borderRadius: 10,
        marginTop: regHeight * 20,
        paddingHorizontal: regWidth * 10,
    },
})

export default BookmarkDetail;