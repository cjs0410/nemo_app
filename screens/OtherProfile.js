import { View, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Api from "../lib/Api";
import blankAvatar from '../assets/images/peopleicon.png';
import { BookmarkList, AlbumList } from '../components';

const {width:SCREEN_WIDTH} = Dimensions.get('window');


const OtherProfile = ({navigation, route}) => {
    const [isMine, setIsMine] = useState(true);
    const [isFollow, setIsFollow] = useState(false);
    const { userTag, } = route.params;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookmarks, setBookmarks] = useState(null);
    const [albums, setAlbums] = useState([1, 2, 3]);
    const avatarValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchProfile();
        fetchBookmarkList();
    }, []);

    const follow = () => {
        setIsFollow(!isFollow);
    }

    const mine = () => {
        setIsMine(true);
    }

    const others = () => {
        setIsMine(false);
    }

    const fetchProfile = async() => {
        try {
            await Api
            .post("api/v1/user/profile/", { user_tag: userTag })
            .then((res) => {
                setProfile(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchBookmarkList = async() => {
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/otherlist/", { user_tag: userTag })
            .then((res) => {
                setBookmarks(res.data.bookmarks.reverse());
                setAlbums(res.data.albums);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const showAvatarImage = () => {
        Animated.timing(avatarValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={styles.container}>
            {profile === null ? 
                <ActivityIndicator 
                    color="white" 
                    style={{marginTop: 10}} 
                    size="large"
                />
                :
                <View style={styles.header} >
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <Ionicons name="chevron-back" size={28} color="black" />
                    </TouchableOpacity>
                    <View style={{ alignItems: "center", }}>
                        <Text style={{ fontSize: 16, fontWeight: "500", color: "black", }} >
                            {profile.name}
                        </Text>
                    </View>
                    <View style={{ opacity: 0, }} >
                        <MaterialCommunityIcons name="square-outline" size={30} color="black" />
                    </View>
                </View>
            }


            <ScrollView>
                <View style={styles.profileInfo} >
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <>
                    <Animated.Image 
                        source={ profile.avatar !== null ? { uri: `http://3.38.62.105${profile.avatar}`} : blankAvatar} 
                        style={{
                            ...styles.profileImage,
                            opacity: avatarValue,
                        }} 
                        onLoadEnd={showAvatarImage} 
                    />
                    <View style={{ marginHorizontal: 18, }}>
                        <Text style={{
                            fontSize: 11,
                            fontWeight: "500",
                            color: "#008000",
                        }}>{`@${profile.user_tag}`}</Text>
                        <Text style={{
                            fontSize: 25,
                            fontWeight: "900",
                        }}>
                            {profile.name}
                        </Text>
                        <View style={{ flexDirection: "row", marginTop: 15,}}>
                            <View>
                                <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followers} Followers`}</Text>
                            </View>
                            <Entypo name="dot-single" size={15} color="black" />
                            <View>
                                <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followings} Following`}</Text>
                            </View>
                        </View>
                    </View>
                    </>
                }
                </View>
                {/* <View style={styles.introduce} >
                    <Text style={{fontSize: 15, fontWeight: "350", }} >자기소개를 열심히 적어봅시다. 여기 자기소개에는 최대 두줄까지 적을 수가 있습니다. 잘 만들어서 써보세요.</Text>
                </View> */}
                <TouchableOpacity 
                    activeOpacity={1}
                    style={{...styles.followBtn, backgroundColor: isFollow ? "#DDDDDD" : "#FF4040"}}
                    onPress={follow}
                >
                    <Text style={{ fontSize: 15, fontWeight: "500", color: isFollow ? "#808080" : "white", }}>
                        { isFollow ? "팔로우 중" : "팔로우" }
                    </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", justifyContent: "center", }} >
                    <TouchableOpacity activeOpacity={1} onPress={mine}>
                        <View style={{...styles.postByWho, borderBottomColor: isMine ? "red" : "white" }}>
                            <Feather name="bookmark" size={24} color={isMine ? "red" : "black"} />
                            <Text style={{
                                fontSize: 13,
                                fontWeight: "500",
                                marginHorizontal: 4,
                                color: isMine ? "red" : "black"
                            }}>
                                {bookmarks ? bookmarks.length : null}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={others}>
                        <View style={{...styles.postByWho, borderBottomColor: !isMine ? "red" : "white" }}>
                            <Feather name="folder" size={24} color={!isMine ? "red" : "black"} />
                            <Text style={{
                                fontSize: 13,
                                fontWeight: "500",
                                marginHorizontal: 4,
                                color: !isMine ? "red" : "black"
                            }}>
                                {albums ? albums.length : null}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {isMine ? 
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
                                {bookmarks && bookmarks.map((bookmark, index) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarks: bookmarks, index: index, })} 
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
                                {albums && albums.map((album, index) => (
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
        </View>
    );
};

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
    profileInfo: {
        marginHorizontal: 20,
        paddingBottom: 30,
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
    },
    profileImage: {
        width: 70,
        height: 70,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
        marginTop: 10,
    },
    followBtn: {
        paddingHorizontal: 38,
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    introduce: {
        marginTop: -10,
        marginHorizontal: 24,
    },
    postByWho: {
        width: SCREEN_WIDTH * 0.5,
        alignItems: "center",
        borderBottomWidth: 1,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
    },
    postTileBox: {
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_WIDTH * 0.5,
    },
    postTile: {
        flex: 1,
        // marginVertical: 1,
        // marginHorizontal: 1,
        borderWidth: 1,
        borderColor: "white",
        paddingHorizontal: 2,
    },
    postTitle: {
        flex: 0.6,
        width: "80%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    postContent: {
        flex: 2,
    },
    postIconAndWriter: {
        flex: 0.3,
        alignItems: "flex-end",
    }
})

export default OtherProfile;