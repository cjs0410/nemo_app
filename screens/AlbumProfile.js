import { StyleSheet, View, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import { BookmarkList, } from '../components';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const AlbumProfile = ({route, navigation}) => {
    const { albumId, } = route.params;
    const [loading, setLoading] = useState(false);
    const [albumInfo, setAlbumInfo] = useState(null);
    const albumCoverValue = useRef(new Animated.Value(0)).current;
    const avatarValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchAlbum();
    }, [])

    const fetchAlbum = async() => {
        try {
            setLoading(true)
            await Api.post("/api/v4/album/view/", {
                album_id: albumId,
            })
            .then((res) => {
                console.log(res.data);
                setAlbumInfo(res.data);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const showAlbumCover = () => {
        Animated.timing(albumCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const showAvatar = () => {
        Animated.timing(avatarValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return (
        <View style={styles.container}>
            {albumInfo !== null ? 
                <>
                    <View style={styles.header}>
                        <Pressable 
                            onPress={() => navigation.goBack()}
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                        >
                            <Ionicons name="chevron-back" size={28} color="black" />
                        </Pressable>
                        <View style={{ alignItems: "center", }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>
                                {albumInfo.album_title}
                            </Text>
                        </View>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                        >
                            <Entypo name="dots-three-horizontal" size={24} color="black" />
                        </Pressable>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ alignItems: "center", }}>
                            <Animated.Image 
                                source={ albumInfo.album_cover !== null ? { uri: `http://3.38.62.105${albumInfo.album_cover}`} : bookCover} 
                                style={{
                                    ...styles.AlbumCover,
                                    opacity: albumCoverValue,
                                }}
                                onLoadEnd={showAlbumCover}
                            />
                            <Text style={{ fontSize: 20, fontWeight: "700", marginVertical: 20,}}>
                                {albumInfo.album_title}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 3,}}>
                                <Animated.Image 
                                    source={ albumInfo.user_avatar !== null ? { uri: `http://3.38.62.105${albumInfo.user_avatar}`} : bookCover} 
                                    style={{
                                        ...styles.profileImage,
                                        opacity: avatarValue,
                                    }}
                                    onLoadEnd={showAvatar}
                                />
                                <Pressable
                                    onPress={() => navigation.push('OtherProfile', { userTag: albumInfo.user_tag, })}
                                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: "500", marginHorizontal: 8, }}>
                                        {albumInfo.name}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 15, marginVertical: 12, }} >
                            <View style={{ flexDirection: "row", alignItems: "center", }}>
                                <Feather name="bookmark" size={30} color="#606060" />
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", }}>
                                    {albumInfo.bookmark_count}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: "#606060", }}>
                                    {albumInfo.created_date.split('T')[0]}
                            </Text>
                            {/* <TouchableOpacity activeOpacity={1} onPress={selectBookmark}>
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
                            </TouchableOpacity> */}
                        </View>

                        {/* {loading ? 
                            <ActivityIndicator 
                                color="black" 
                                style={{marginTop: 100}} 
                                size="large"
                            />
                            : 
                            <>
                                <View>
                                {albumInfo.bookmarks !== null && albumInfo.bookmarks.map((bookmark, index) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={() => navigation.push('BookmarkNewDetail', {bookmarks: albumInfo.bookmarks, index: index, })} 
                                        key={index}
                                    >
                                        <BookmarkList bookmark={bookmark} navigation={navigation} />
                                    </TouchableOpacity>
                                ))}
                                </View>
                            </>
                        } */}


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
    AlbumCover: {
        width: 200,
        height: 200,
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
    profileImage: {
        width: regWidth * 25,
        height: regWidth * 25,
        resizeMode: "cover",
        borderRadius: 50,
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

export default AlbumProfile;