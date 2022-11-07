import { StyleSheet, View, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Modal, Pressable, Alert, } from "react-native";
import React, { useEffect, useState, useCallback, } from "react";
import { Entypo, Feather, AntDesign, Ionicons } from '@expo/vector-icons'; 
import { Card, Post } from '../components';
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from "../lib/Api";
import {
    useNavigation,
    useFocusEffect,
} from '@react-navigation/native';


const {width:SCREEN_WIDTH} = Dimensions.get('window');

const PostDetail = ({navigation, route}) => {
    const { post } = route.params;
    const bookmarks = post.bookmarks;
    const [arranged, setArranged] = useState([]);

    const bookmarkNumbering = bookmarks.map((bookmark) => (Number(bookmark.bookmark_numbering)));
    bookmarkNumbering.sort((a, b) => a - b);

    const [isLike, setIsLike] = useState(false);
    const [isScrap, setIsScrap] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportContents, setReportContents] = useState('');
    const [watermark, setWatermark] = useState('');

    useEffect(() => {
        fetchWatermark();
        setArranged(bookmarkNumbering.map((number) => (
            bookmarks.find(bookmark => Number(bookmark.bookmark_numbering) === Number(number))
        )))
    }, [])

    const onProfile = () => {
        navigation.navigate('OtherProfile');
    }

    const onLike = () => {
        setIsLike(!isLike);
    }

    const onScrap = () => {
        setIsScrap(!isScrap);
    }

    const report = async() => {
        try {
            await Api.post("/api/v4/post/report/", {
                post_id: post.post_id,
                text: reportContents,
            })
            .then((res) => {
                setModalVisible(false);
                setReportVisible(false);
                Alert.alert("신고 접수", "신고가 접수되었습니다.")
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchWatermark = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setWatermark(jwt_decode(accessToken).watermark);
        } catch (err) {
            console.error(err);
        }
    }

    const deletePost = async() => {
        Alert.alert("게시물을 삭제하시겠습니까?", "확인 버튼을 누르면 삭제됩니다.", [
            {
                text: "취소",
                onPress: () => {
                    setModalVisible(false);
                    setReportVisible(false);
                }
            },
            {
                text: "확인", 
                onPress: async() => {
                    try {
                        console.log(post.post_id);
                        await Api.post("/api/v4/post/delete/", {
                            post_id: post.post_id,
                        })
                        .then((res) => {
                            setModalVisible(false);
                            setReportVisible(false);
                            navigation.popToTop();
                        })
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        ]);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "500",
                    // alignSelf: "center",
                    // marginHorizontal: 18,
                }}>
                    {post.title}
                </Text>
                <Pressable
                    onPress={() => setModalVisible(true)}
                >
                    <Entypo name="dots-three-horizontal" size={27} color="black" />
                </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.post}>
                    <View style={styles.postWriter}>
                        <Image source={writerImage} style={styles.postWriterImage} />
                        <TouchableOpacity activeOpacity={1} onPress={onProfile} >
                            <Text style={styles.postWriterText}>{post.writer_name}</Text>
                        </TouchableOpacity>
                        <Entypo name="dot-single" size={10} color="#808080" />
                        <View>
                            <Text style={styles.postDateText}>{post.modified_date}</Text>
                        </View>
                    </View>
                    <View style={styles.postTitle}>
                        <Text style={styles.postTitleText}>{post.title}</Text>
                        <Text style={styles.postTitleInfoText}>{post.text}</Text>
                    </View>
                    {/* {bookmarkNumbering.map((number, index) => (
                        <Card bookmark={bookmarks.find(bookmark => Number(bookmark.bookmark_numbering) === Number(number))} navigation={navigation} key={index} />
                    ))} */}
                    {arranged.map((bookmark, index) => (
                        <Card bookmark={bookmark} navigation={navigation} key={index} />
                    ))}

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
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{ flexDirection: "row", alignItems: "center", }}
                            onPress={onScrap}
                        >
                            <Feather 
                                name="download" 
                                size={24} 
                                color={isScrap ? "red" : "black"} 
                            />
                            <Text style={styles.postLikesText}>{post.scraps}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {/* {modalVisible ? 
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>setModalVisible(false)}
                />
                :
                null
            } */}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setModalVisible(false);
                            setReportVisible(false);
                        }
                    }
                />
                {reportVisible ? 
                    <View style={{...styles.modal, height: "80%", }}>
                        <Entypo name="warning" size={24} color="red" />
                            <TextInput 
                                style={styles.reportInput}
                                placeholder="신고 내용을 적어주세요."
                                onChangeText={(payload => setReportContents(payload))}
                            />
                        <TouchableOpacity 
                            style={{...styles.menu, justifyContent: "center", backgroundColor: "red"}}
                            activeOpacity={1}
                            onPress={report}
                        >
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "white", }}>신고하기</Text>
                        </TouchableOpacity>
                    </View>
                    : 
                    <View style={styles.modal}>
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => setReportVisible(true)}
                        >
                            <Entypo name="warning" size={24} color="red" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
                        </TouchableOpacity>
                        {post.nickname === watermark ? 
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
                        }

                    </View>
                }

            </Modal>
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
        marginTop: 60,
        marginHorizontal: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

    },
    post: {
        flex: 1,
        paddingTop: 28,
        paddingBottom: 18,
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

    postContentsScrollBox: {
        // flex: 1,
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
    },
    postContentsBox: {
        flex: 1,
        backgroundColor: "#D9D9D9",
        marginVertical: 13,
        marginHorizontal: 13,
        paddingVertical: 5,
        borderRadius: 2,
        paddingHorizontal: 10,
    },
    postContentsBookCover: {
        // flex: 1,
        // backgroundColor: "red",
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
    postContentsBook: {
        flex: 1,
        flexDirection: "row", 
        justifyContent: "space-between"
    },
    postContentsBookTitle: {
        fontWeight: "700",
        fontSize: 15,
    },
    postContentsBookChapter: {
        fontWeight: "400",
        fontSize: 10,

    },
    postContentsTextBox: {
        flex: 5,
        marginTop: 8,
        justifyContent: "center", 
    },
    postContentsText: {
        fontWeight: "500",
        fontSize: 16,
        lineHeight: 28,
    },
    postContentsWatermark: {
        flex: 0.3,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    postLikes: {
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
    modal: {
        position: "absolute",
        width: "100%",
        height: "40%",
        bottom: 0, 
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
    },
    menu: {
        backgroundColor: "#DDDDDD",
        width: SCREEN_WIDTH - 40,
        height: 40,
        borderRadius: 5,
        // paddingVertical: 8,
        paddingHorizontal: 13,
        marginTop: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    reportInput: {
        width: SCREEN_WIDTH - 40,
        height: 170,
        backgroundColor: "#DDDDDD",
        borderWidth: 1,
        borderColor: "#FF4040",
        borderRadius: 10,
        marginTop: 20,
        paddingHorizontal: 10,
    }
})

export default PostDetail;