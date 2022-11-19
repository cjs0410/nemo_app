import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator, Modal, Alert, } from "react-native";
import React, { useEffect, useState } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import { BookmarkList, AlbumList } from '../components';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookProfile = ({route, navigation}) => {
    const [isBookmark, setIsBookmark] = useState(true);
    const { bookId, } = route.params;
    const [bookInfo, setBookInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookModalVisible, setBookModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportContents, setReportContents] = useState('');

    useEffect(() => {
        fetchBook();
    }, [])

    const fetchBook = async() => {
        try {
            setLoading(true)
            await Api.post("/api/v3/book/list/", {
                book_id: bookId,
            })
            .then((res) => {
                setBookInfo(res.data);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const selectBookmark = () => {
        setIsBookmark(true);
    }

    const selectPost = () => {
        setIsBookmark(false);
    }

    const postDetail = async(postId) => {
        try {
            await Api
            .post("/api/v4/post/post_detail/", {
                post_id: postId,
            })
            .then((res) => {
                navigation.push('PostDetail', {post: res.data})
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onReport = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/report/", {
                book_id: bookId,
                report: reportContents,
            })
            .then((res) => {
                setReportVisible(false);
                Alert.alert("신고 접수", "신고가 접수되었습니다.");
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            {bookInfo !== null ? 
                <>
                    <SafeAreaView style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} >
                            <Ionicons name="chevron-back" size={28} color="black" />
                        </TouchableOpacity>
                        <View style={{ alignItems: "center", }}>
                            <TouchableOpacity>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>
                                {bookInfo.book_title}
                            </Text>
                            </TouchableOpacity>
                        </View>
                        <Pressable
                            hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                            onPress={() => setBookModalVisible(true)}
                        >
                            <Entypo name="dots-three-horizontal" size={regWidth * 28} color="black" />
                        </Pressable>
                    </SafeAreaView>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ alignItems: "center", borderBottomWidth: 0.2, }}>
                            <Image 
                                source={ bookInfo.book_cover !== null ? { uri: bookInfo.book_cover } : bookCover} 
                                style={styles.bookImage}
                            />
                            <Text style={{ fontSize: 20, fontWeight: "700", marginVertical: 10,}}>
                                {bookInfo.book_title}
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: "400", marginVertical: 8,}}>
                                {bookInfo.book_author}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "center", }} >
                            <TouchableOpacity activeOpacity={1} onPress={selectBookmark}>
                                <View style={{...styles.bookmarkOrPost, borderBottomColor: isBookmark ? "red" : "#CBCBCB" }}>
                                    <Feather name="bookmark" size={24} color={isBookmark ? "red" : "#CBCBCB"} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        marginHorizontal: 4,
                                        color: isBookmark ? "red" : "#CBCBCB"
                                    }}>
                                        {bookInfo.bookmarks ? bookInfo.bookmarks.length : null}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} onPress={selectPost}>
                                <View style={{...styles.bookmarkOrPost, borderBottomColor: !isBookmark ? "red" : "#CBCBCB" }}>
                                    <Feather name="folder" size={24} color={!isBookmark ? "red" : "#CBCBCB"} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        marginHorizontal: 4,
                                        color: !isBookmark ? "red" : "#CBCBCB"
                                    }}>
                                        {bookInfo.albums ? bookInfo.albums.length : null}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {isBookmark ? 
                            <>
                                {loading ? 
                                    <ActivityIndicator 
                                        color="black" 
                                        style={{marginTop: 100}} 
                                        size="large"
                                    />
                                    : 
                                    <>
                                        <View>
                                        {bookInfo.bookmarks && bookInfo.bookmarks.map((bookmark, index) => (
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={() => navigation.push('BookmarkNewDetail', {bookmarks: bookInfo.bookmarks, index: index, })} 
                                                key={index}
                                            >
                                                <BookmarkList bookmark={bookmark} navigation={navigation} />
                                            </TouchableOpacity>
                                        ))}
                                        </View>
                                    </>
                                }
                            </>
                            :
                            <>
                                {loading ? 
                                    <ActivityIndicator 
                                        color="black" 
                                        style={{marginTop: 100}} 
                                        size="large"
                                    />
                                    : 
                                    <>
                                        <View>
                                        {bookInfo.albums && bookInfo.albums.map((album, index) => (
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={() => navigation.push('AlbumProfile', { albumId: album.album_id, })} 
                                                // onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarked: bookmarked, index: index, })} 
                                                key={index}
                                            >
                                                <AlbumList album={album} navigation={navigation} />
                                            </TouchableOpacity>
                                        ))}
                                        </View>
                                    </>
                                }
                            </>
                        }
                    </ScrollView>
                </>
                : 
                null
            }

            <Modal
                // animationType="fade"
                transparent={true}
                visible={bookModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setBookModalVisible(false);
                            setReportVisible(false);
                        }
                    }
                />
                    <Animated.View 
                        style={{
                            ...styles.modal,
                        }}
                    >
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => {
                                setBookModalVisible(false);
                                setReportVisible(true);
                            }}
                        >
                            <Entypo name="warning" size={24} color="red" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
                        </TouchableOpacity>
                    </Animated.View>
            </Modal>
            <Modal
                // animationType="fade"
                transparent={true}
                visible={reportVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setReportVisible(false);
                        }
                    }
                />
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
                            onChangeText={(payload => setReportContents(payload))}
                            multiline={true}
                        />
                    <TouchableOpacity 
                        style={{...styles.menu, justifyContent: "center", backgroundColor: "red"}}
                        activeOpacity={1}
                        onPress={onReport}
                    >
                        <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "white", }}>신고하기</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

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
    bookImage: {
        width: 320,
        height: 320,
        resizeMode: "contain",

        ...Platform.select({
            ios: {
              shadowColor: "black",
              shadowOffset: {
                width: 5,
                // height: 5,
              },
              shadowOpacity: 0.5,
            //   shadowRadius: 10,
            },
            android: {
              elevation: 3,
            },
        }),
    },
    bookmarkOrPost: {
        width: SCREEN_WIDTH * 0.5,
        alignItems: "center",
        borderBottomWidth: 1,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
    },
    modal: {
        position: "absolute",
        width: "100%",
        height: regHeight * 150,
        bottom: 0, 
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 12,
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

export default BookProfile;