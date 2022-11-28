import { View, SafeAreaView, KeyboardAvoidingView, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Pressable, Modal, Alert, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Api from "../lib/Api";
import blankAvatar from '../assets/images/peopleicon.png';
import { BookmarkList, AlbumList } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import {colors, regWidth, regHeight} from '../config/globalStyles';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, } from '../modules/user';

const {width:SCREEN_WIDTH} = Dimensions.get('window');


const OtherProfile = ({navigation, route}) => {
    const dispatch = useDispatch();
    const [isMine, setIsMine] = useState(true);
    const [isFollow, setIsFollow] = useState(false);
    const [followers, setFollowers] = useState(0);
    const { userTag, } = route.params;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookmarks, setBookmarks] = useState(null);
    const [albums, setAlbums] = useState([1, 2, 3]);
    const avatarValue = useRef(new Animated.Value(0)).current;
    const [myTag, setMyTag] = useState(null);

    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportContents, setReportContents] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchBookmarkList();
        fetchMyTag();
    }, []);

    const onFollow = async() => {
        // setIsFollow(!isFollow);
        try {
            await Api
            .post("api/v1/user/follow/", {
                user_tag: userTag,
            })
            .then((res) => {
                // console.log(res.data);
                setIsFollow(res.data.is_follow);
                setFollowers(res.data.count);
                dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
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
                // console.log(res.data);
                setProfile(res.data);
                setIsFollow(res.data.is_follow);
                setFollowers(res.data.followers);
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

    const fetchMyTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setMyTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

    const onReport = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/report/", {
                user_tag: userTag,
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
            {profile === null ? 
                <ActivityIndicator 
                    color="white" 
                    style={{marginTop: 10}} 
                    size="large"
                />
                :
                <SafeAreaView style={styles.header} >
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <Ionicons name="chevron-back" size={28} color="black" />
                    </TouchableOpacity>
                    <View style={{ alignItems: "center", }}>
                        <Text style={{ fontSize: 16, fontWeight: "500", color: "black", }} >
                            {profile.name}
                        </Text>
                    </View>
                    <Pressable
                        hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                        style={{
                            opacity: myTag !== userTag ? 1 : 0,
                        }}
                        disabled={myTag !== userTag ? false : true}
                        onPress={() => setProfileModalVisible(true)}
                    >
                        <Entypo name="dots-three-horizontal" size={regWidth * 28} color="black" />
                    </Pressable>
                </SafeAreaView>
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
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Animated.Image 
                            source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
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
                            <Text 
                                style={{
                                    fontSize: regWidth * 25,
                                    fontWeight: "900",
                                    width: regWidth * 245,
                                }}
                                numberOfLines={2}
                                ellipsizeMode='tail'
                            >
                                {profile.name}
                            </Text>
                            <View style={{ flexDirection: "row", marginTop: 8,}}>
                                <Pressable
                                    onPress={() => navigation.push('FollowScreen', { title: "팔로워", userTag: profile.user_tag, })}
                                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                >
                                    <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${followers} Followers`}</Text>
                                </Pressable>
                                <Entypo name="dot-single" size={15} color="black" />
                                <Pressable
                                    onPress={() => navigation.push('FollowScreen', { title: "팔로잉", userTag: profile.user_tag, })}
                                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                >
                                    <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followings} Following`}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                }
                </View>
                {/* <View style={styles.introduce} >
                    <Text style={{fontSize: 15, fontWeight: "350", }} >자기소개를 열심히 적어봅시다. 여기 자기소개에는 최대 두줄까지 적을 수가 있습니다. 잘 만들어서 써보세요.</Text>
                </View> */}
                {myTag !== userTag && profile !== null ? 
                    <TouchableOpacity 
                        activeOpacity={1}
                        style={{...styles.followBtn, backgroundColor: isFollow ? "#DDDDDD" : "#FF4040"}}
                        onPress={onFollow}
                    >
                        <Text style={{ fontSize: 15, fontWeight: "500", color: isFollow ? "#808080" : "white", }}>
                            { isFollow ? "팔로우 중" : "팔로우" }
                        </Text>
                    </TouchableOpacity>
                    :
                    null
                }


                <View style={{ flexDirection: "row", justifyContent: "center", }} >
                    <TouchableOpacity activeOpacity={1} onPress={mine}>
                        <View style={{...styles.postByWho, borderBottomColor: isMine ? "red" : "#CBCBCB" }}>
                            <Feather name="bookmark" size={24} color={isMine ? "red" : "#CBCBCB"} />
                            <Text style={{
                                fontSize: 13,
                                fontWeight: "500",
                                marginHorizontal: 4,
                                color: isMine ? "red" : "#CBCBCB"
                            }}>
                                {bookmarks ? bookmarks.length : null}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={others}>
                        <View style={{...styles.postByWho, borderBottomColor: !isMine ? "red" : "#CBCBCB" }}>
                            <Feather name="folder" size={24} color={!isMine ? "red" : "#CBCBCB"} />
                            <Text style={{
                                fontSize: 13,
                                fontWeight: "500",
                                marginHorizontal: 4,
                                color: !isMine ? "red" : "#CBCBCB"
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
                                        onPress={() => navigation.push('BookmarkNewDetail', {bookmarks: bookmarks, subTitle: profile.name, title: "북마크", index: index, })} 
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
            <Modal
                // animationType="fade"
                transparent={true}
                visible={profileModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setProfileModalVisible(false);
                            setReportVisible(false);
                        }
                    }
                />
                    <Animated.View 
                        style={{
                            ...styles.modal,
                        }}
                    >
                        {myTag !== userTag ? 
                            <TouchableOpacity 
                                style={styles.menu}
                                activeOpacity={1}
                                onPress={() => {
                                    setProfileModalVisible(false);
                                    setReportVisible(true);
                                }}
                            >
                                <Entypo name="warning" size={24} color="red" />
                                <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "red", }}>신고</Text>
                            </TouchableOpacity>
                            :
                            null
                        }

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
    );
};

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
    profileInfo: {
        marginHorizontal: regWidth * 20,
        paddingBottom: regHeight * 18,
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
        height: regWidth * 40,
        paddingHorizontal: 38,
        // paddingVertical: 10,
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

export default OtherProfile;