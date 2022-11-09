import { StyleSheet, View, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import { BookmarkList, AlbumList } from '../components';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookProfile = ({route, navigation}) => {
    const [isBookmark, setIsBookmark] = useState(true);
    const { bookId, } = route.params;
    const [bookInfo, setBookInfo] = useState(null);
    const [loading, setLoading] = useState(false);

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

    return (
        <View style={styles.container}>
            {bookInfo !== null ? 
                <>
                    <View style={styles.header}>
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
                        <View style={{ opacity: 0, }} >
                            <MaterialCommunityIcons name="square-outline" size={30} color="black" />
                        </View>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ alignItems: "center", borderBottomWidth: 0.2, }}>
                            <Image 
                                source={ bookInfo.book_cover !== null ? { uri: `http://3.38.62.105${bookInfo.book_cover}`} : bookCover} 
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
                                <View style={{...styles.bookmarkOrPost, borderBottomColor: isBookmark ? "red" : "white" }}>
                                    <Feather name="bookmark" size={24} color={isBookmark ? "red" : "black"} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        marginHorizontal: 4,
                                        color: isBookmark ? "red" : "black"
                                    }}>
                                        {bookInfo.bookmarks ? bookInfo.bookmarks.length : null}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} onPress={selectPost}>
                                <View style={{...styles.bookmarkOrPost, borderBottomColor: !isBookmark ? "red" : "white" }}>
                                    <Feather name="folder" size={24} color={!isBookmark ? "red" : "black"} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        marginHorizontal: 4,
                                        color: !isBookmark ? "red" : "black"
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
        marginTop: 60,
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
})

export default BookProfile;