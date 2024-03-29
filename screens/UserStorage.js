import { View, SafeAreaView, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, RefreshControl, Pressable, ImageBackground } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, AntDesign } from '@expo/vector-icons'; 
import { BookmarkList, AlbumList } from '../components';
import Api from "../lib/Api";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import blankAvatar from '../assets/images/blankAvatar.png';
import blankBgd from '../assets/images/blankBgd.png';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import cal1P from '../assets/images/cal1P.png';
import cal2P from '../assets/images/cal2P.png';
import cal3P from '../assets/images/cal3P.png';

import vectorLeftImage from '../assets/icons/vector_left.png';
import settings from '../assets/icons/settings.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, scrapSelector } from '../modules/hooks';
import user, { resetUserInfo, setAvatar, setShouldUserRefresh, } from '../modules/user';
import { loadScraps } from "../modules/scraps";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import { FontAwesome } from '@expo/vector-icons';

import { getDate, } from 'date-fns';

const {width:SCREEN_WIDTH} = Dimensions.get('window');


const UserStorage = ({route, navigation}) => {
    const dispatch = useDispatch();
    const [isMine, setIsMine] = useState(true);
    const [profile, setProfile] = useState(null);
    const [postTiles, setPostTiles] = useState(null);
    const [scrapTiles, setScrapTiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const { accessToken, shouldUserRefresh, } = useSelector(userSelector);
    const [bookmarks, setBookmarks] = useState(null);
    const [albums, setAlbums] = useState(null);
    const avatarValue = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = useState(false);
    const [dateWidth, setDateWidth] = useState(0);
    // const [shouldRefresh, setShouldRefresh] = useState(false);
    // const { refresh, } = route.params;


    const [ headerHeight, setHeaderHeight ] = useState(0);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        // fetchBookmarkList();
        fetchProfile();
    }, []);

    useEffect(() => {
        if (shouldUserRefresh === true) {
            // fetchBookmarkList();
            fetchProfile();
            dispatch(setShouldUserRefresh(false));
        }
    }, [shouldUserRefresh]);

    // useEffect(() => {
    //     if (shouldRefresh === true) {
    //         setShouldRefresh(false);
    //         fetchBookmarkList();
    //         fetchProfile();
    //     }
    // }, [shouldRefresh]);

    // useFocusEffect(
    //     useCallback(() => {
    //         console.log(route.params);
    //         if (route.params !== undefined) {
    //             console.log(route.params);
    //             setShouldRefresh(route.params.refresh);
    //         }
    //     }, [])
    // );

    // const onRefresh = useCallback(async() => {
    //     setRefreshing(true);
    //     await fetchProfile()
    //     .then(() => fetchBookmarkList())
    //     .then(() => setRefreshing(false));
    // }, []);

    const fetchProfile = async() => {
        try {
            await Api
            .get("api/v1/user/myprofile/")
            .then((res) => {
                console.log(res.data);
                setProfile(res.data);
                dispatch(setAvatar(res.data.avatar));
            })
        } catch (err) {
            console.error(err);
        }
    }

    // const fetchBookmarkList = async() => {
    //     try {
    //         setLoading(true);
    //         await Api
    //         .get("api/v1/user/mylist/")
    //         .then((res) => {
    //             setBookmarks(res.data.bookmarks.reverse());
    //             setAlbums(res.data.albums);
    //         })
    //     } catch (err) {
    //         console.error(err);
    //     }
    //     setLoading(false);
    // }

    const mine = () => {
        setIsMine(true);
    }

    const others = () => {
        setIsMine(false);
    }

    const postDetail = async(postId) => {
        try {
            await Api
            .post("/api/v4/post/post_detail/", {
                post_id: postId,
            })
            .then((res) => {
                navigation.navigate('PostDetail', {post: res.data})
            })
        } catch (err) {
            console.error(err);
        }
    }

    const scrollY = useRef(new Animated.Value(0)).current;
    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight],
        extrapolate: "clamp"
    })

    const headerOnLayout = useCallback((event)=>{
        const { height } = event.nativeEvent.layout;
        setHeaderHeight(height);
    }, []);

    const showAvatarImage = () => {
        Animated.timing(avatarValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const onLayout = (e) => {
        const layout = e.nativeEvent.layout;
        setDateWidth(parseInt((layout.width - regWidth * 20) / 7));
    }


    return (
        <ScrollView 
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
            stickyHeaderIndices={[0]}
        >
            {/* <View 
                style={{ 
                    justifyContent: "flex-end"
                }}
            > */}
                <ImageBackground 
                    source={profile && profile.backgroundimg ? {uri: profile.backgroundimg} : blankBgd} 
                    resizeMode= "cover" 
                    style={{ height: SCREEN_WIDTH * (110 / 375),  width:"100%", zIndex: 0, }}
                    imageStyle= {{ opacity: 0.7, }}
                >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: regWidth * 13, marginTop: regHeight * 45, }}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Image 
                                source={vectorLeftImage} 
                                style={{ width: regWidth*35, height: regWidth*35 }}
                            />
                        </Pressable>
                        <Pressable
                            onPress={() => navigation.navigate('UserSetting', { profile: profile, })}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Image 
                                source={settings} 
                                style={{ width: regWidth*35, height: regWidth*35 }}
                            />
                        </Pressable>
                    </View>
                </ImageBackground>
            {/* </View> */}
            <View 
                style={{ 
                    // alignItems: "center", 
                    // marginTop: -regHeight*40, 
                    // height: "30%", 
                    backgroundColor: "white",
                    paddingHorizontal: regWidth * 13,
                    zIndex: 10,
                }}
            >
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{ marginTop: 10 }} 
                        size="large"
                    />
                    :
                    <>
                        <View 
                            style={{ 
                                marginTop: -regHeight * 25, 
                                justifyContent: "space-between",
                                alignItems: "center", 
                                flexDirection: "row",
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "flex-end"}}>
                                <Animated.Image 
                                    source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                                    style={{ 
                                        ...styles.profileAvatar, 
                                        opacity: avatarValue,
                                        borderRadius: profile.user_tag === "nemo" ? regWidth * 10 : 999,
                                    }} 
                                    onLoadEnd={showAvatarImage}
                                />
                                <View
                                    style={{
                                        marginTop: regHeight* 40,
                                        marginHorizontal: regWidth * 7,
                                    }}
                                >
                                    <Text style={{ fontSize: regWidth * 14, fontFamily: "NotoSansKR-Bold", color: colors.nemoNormal, includeFontPadding: false, }}>
                                        {`@${profile.user_tag}`}
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 23, fontFamily: "NotoSansKR-Black", color: colors.textDark, includeFontPadding: false, }}>
                                        {profile.name}
                                    </Text>
                                </View>
                            </View>
                            <Pressable 
                                style={styles.editProfileBtn} 
                                onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                            >
                                <Text 
                                    style={{ 
                                        fontSize: regWidth * 13, 
                                        fontFamily: "NotoSansKR-Medium",
                                        color: colors.textDark,
                                        includeFontPadding: false,
                                    }}
                                >
                                    Edit profile
                                </Text>
                            </Pressable>
                        </View>
                        <View style={{ marginTop: regHeight * 10, }}>
                            <Text
                                style={{ 
                                    width: "50%", 
                                    includeFontPadding: false,
                                    color: "#404040",
                                    fontSize: regWidth * 13,
                                    fontFamily: "NotoSansKR-Medium",
                                }}
                                numberOfLines={3}
                                ellipsizeMode='tail'
                            >
                                {profile.bio}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 13, }}>
                            <Text style={ styles.boldNumberTxt }>
                                {profile.nemos}
                            </Text>
                            <Text style={ styles.followTxt }>
                                Nemos
                            </Text>
                            <Pressable
                                style={{ flexDirection: "row", alignItems: "center", }}
                                onPress={() =>  navigation.push("FollowScreen", { title: "팔로워", userTag: profile.user_tag, name: profile.name, })}
                            >
                                <Text style={styles.boldNumberTxt}>
                                    {profile.followers}
                                </Text>
                                <Text style={ styles.followTxt }>
                                    Followers
                                </Text>
                            </Pressable>
                            <Pressable
                                style={{ flexDirection: "row", alignItems: "center", }}
                                onPress={() =>  navigation.push("FollowScreen", { title: "팔로잉", userTag: profile.user_tag, name: profile.name, })}
                            >
                                <Text style={styles.boldNumberTxt}>
                                    {profile.followings}
                                </Text>
                                <Text style={ styles.followTxt }>
                                    Following
                                </Text>
                            </Pressable>
                        </View>
                        <View 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "center",
                                marginTop: regHeight * 70,
                                justifyContent: "space-between" 
                            }}
                        >
                            <Text 
                                style={{ 
                                    color: colors.textDark,
                                    fontFamily: "NotoSansKR-Black", 
                                    fontSize: regWidth*20,
                                    includeFontPadding: false,
                                }}
                            >
                                Nemo Calendar
                            </Text>
                            <Pressable 
                                style={{
                                    ...styles.streakBtn,
                                    opacity: profile.streak === 0 ? 0 : 1,
                                }} 
                            >
                                <Text style={{ fontSize: regWidth * 16, fontFamily: "NotoSansKR-Black", color: "#FFFFFF", includeFontPadding: false, }} >
                                    {`${profile.streak}-day streak!`}
                                </Text>
                            </Pressable>
                        </View>
                        <View style={{ marginTop: regHeight * 15, }}>
                            <Text
                                style={{ 
                                    includeFontPadding: false,
                                    color: "#404040",
                                    fontSize: regWidth * 13,
                                    fontFamily: "NotoSansKR-Medium",
                                }}
                            >
                                {`You've made ${profile.month_nemos} Nemos this month!`}
                            </Text>
                            {/* <Text
                                style={{ 
                                    lineHeight: regHeight*19, 
                                    color: "#404040",
                                    fontSize: regWidth * 13,
                                    fontWeight: "500",
                                }}
                            >
                                15% more than the previous month. Great move!
                            </Text> */}
                        </View>
                        <View 
                            style={ styles.boardContainer }
                            onLayout={onLayout}
                        >
                            <Text
                                style={{ 
                                    marginTop: regHeight*5, 
                                    marginHorizontal: regWidth*7, 
                                    color: "#FFFFFF", 
                                    fontFamily: "NotoSansKR-Bold",
                                    fontSize: regWidth*16,
                                    includeFontPadding: false,
                                }}
                            >
                                Recent 2 weeks
                            </Text>
                            <View style={ styles.calenderContainer }>
                                {profile && profile.two_weeks.map((day, index) => {
                                    const calWidth = day.count === 1 ? 30 : (day.count === 2 ? 36.75 : 42.45);
                                    const calHeight = day.count === 1 ? 30 : (day.count === 2 ? 35 : 39);

                                    return (
                                        <View 
                                            style ={{ 
                                                width: dateWidth, 
                                                // height: "40%"
                                                marginBottom: regHeight * 16,
                                            }}
                                            key={index}
                                        >
                                            <Text 
                                                style={{ 
                                                    color: colors.bgdLight, 
                                                    fontSize: regWidth * 11, 
                                                    fontFamily: "NotoSansKR-Bold", 
                                                    includeFontPadding: false,
                                                    marginBottom: regHeight * 4,
                                                }}
                                            >
                                                {day.days}
                                            </Text>
                                            <ImageBackground 
                                                source={day.count === 1 ? cal1P : (day.count === 2 ? cal2P : cal3P)}
                                                style={{
                                                    width: regWidth * calWidth,
                                                    height: regWidth * calHeight,
                                                    marginTop: regWidth * (39 - calHeight),
                                                    marginRight: regWidth * (42.45 - calWidth),
                                                    resizeMode: "contain",
                                                    opacity: day.count === 0 ? 0 : 1,
                                                    justifyContent: "flex-end"
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        bottom: 5,
                                                        left: 10,
                                                        fontSize: regWidth * 14,
                                                        fontFamily: "NotoSansKR-Black",
                                                        color: "#FFFFFF",
                                                        includeFontPadding: false,
                                                    }}
                                                >
                                                    {day.count}
                                                </Text>
                                            </ImageBackground>
                                        </View>
                                    )

                                })}
                                <View style = {{ width: "100%", alignItems: "center", marginTop: regHeight*9 }}>
                                    <Pressable 
                                        style={ styles.viewAllBtn } 
                                        onPress={() => navigation.navigate('NemoCalender')}
                                    >
                                        <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#FFFFFF" }} >
                                            View all
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </>
                }
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: "white",
    // },
    // header: {
    //     //   backgroundColor: "pink",
    //     marginVertical: 10,
    //     marginHorizontal: 20,
    //     //   paddingBottom: 30,
    //     paddingBottom: 8,
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    //     alignItems: "center",
    // },
    profileAvatar: {
        width: regWidth * 100,
        height: regWidth * 100,
        resizeMode: "cover",
        borderRadius: 999,
        borderWidth: regWidth * 2,
        borderColor: "#7341ffcc",
        // marginLeft: regWidth*13,
    },
    editProfileBtnContainer: {
        flexDirection: "row",
        justifyContent: "flex-end", 
        alignItems: "center",
        width: "100%",
        height: "30%",
        marginTop: regWidth*13,
    },
    editProfileBtn: {
        borderRadius: regWidth * 20,
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.textDark,
        borderWidth: regWidth * 0.5, 
        paddingHorizontal: regWidth * 8,
        paddingVertical: regWidth * 5,
        position: "absolute",
        right: 0,
    },
    usertagContainer: {
        flexDirection: "row", 
        width: "60%", 
        alignItems: "flex-start", 
        height: "25%",
        marginTop: -regHeight*15,
    },
    usernameContainer: {
        fontSize: regWidth * 23,
        fontWeight: "900",
        width: "70%",
        height: regHeight*70,
        color: "#202020",
    },
    introContainer: {
        height: "73%",
        width: "100%",
        marginTop: -regHeight*100,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    boldNumberTxt: {
        color: "#202020",
        fontFamily: "NotoSansKR-Black",
        fontSize: regWidth*16,
        letterSpacing: -regWidth,
        includeFontPadding: false,
        // width: regWidth * 20,
    },
    followTxt: {
        marginLeft: regWidth*8,
        marginRight: regWidth*15,
        fontFamily: "NotoSansKR-Medium",
        color: "#404040",
        fontSize: regWidth*16,
        includeFontPadding: false,
    },
    followedByContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        // width: "100%",
        // height: "30%",
        marginTop: regHeight*12
    },
    smallAvatar: {
        width: regWidth*30, 
        height: regWidth*30,
        resizeMode: "cover",
        borderRadius: regWidth*15,
        borderWidth: regWidth*1,
        borderColor: "#D9D9D9",
        marginLeft: regWidth*13,
    },
    streakBtn: {
        borderRadius: regWidth * 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.nemoDark,
        borderWidth: 1, 
        paddingHorizontal: regWidth * 13,
        paddingVertical: regHeight * 4,
    },
    boardContainer: {
        borderRadius: 10,
        backgroundColor: colors.textNormal,
        marginTop: regHeight * 7,
        // height: "115%",
        // marginTop: regHeight*15,
        // flexDirection: "column",
        // alignItems: "flex-start"
    },
    calenderContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap',
        // width: "100%",
        marginTop: regHeight*7,
        marginHorizontal: regWidth * 10,
        justifyContent: "center",
        // height: "70%",
    },
    nemoContatiner: {

        marginTop: -regHeight*4,
        alignItems: "center",
        justifyContent: "center",
    },
    viewAllBtn: {
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1, 
        borderColor: "#FFFFFF",
        paddingVertical: regHeight * 3,
        paddingHorizontal: regWidth * 13,
        marginBottom: regHeight * 20,
    }

})

export default UserStorage;