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
import blankAvatar from '../assets/images/peopleicon.png';
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
                    source={ require('../assets/images/userImage.jpeg') } 
                    resizeMode= "cover" 
                    style={{ height: regHeight * 110, width:"100%", zIndex: 0,}}
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
                            onPress={() => navigation.navigate('UserSetting')}
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
                                    style={{ ...styles.profileAvatar, opacity: avatarValue }} 
                                    onLoadEnd={showAvatarImage}
                                />
                                <View
                                    style={{
                                        marginTop: 40,
                                        marginHorizontal: regWidth * 7,
                                    }}
                                >
                                    <Text style={{ fontSize: regWidth * 14, fontWeight: "700", color: colors.nemoNormal, lineHeight: 20, }}>
                                        {`@${profile.user_tag}`}
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 23, fontWeight: "900", color: colors.textDark, lineHeight: 33, }}>
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
                                        fontWeight: "500",
                                        color: colors.textDark,
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
                                    lineHeight: regHeight*19, 
                                    color: "#404040",
                                    fontSize: regWidth * 13,
                                    fontWeight: "500",
                                }}
                                numberOfLines={3}
                                ellipsizeMode='tail'
                            >
                                I literally have no idea.
                                CEO of the Nemo project.
                                Majoring PHYS at Korea.
                                길어지면 이렇게 됨길어지면길어지면길어지면
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 13, }}>
                            <Text style={ styles.boldNumberTxt }>
                                {profile.nemos}
                            </Text>
                            <Text style={ styles.followTxt }>
                                Nemos
                            </Text>
                            <Text style={styles.boldNumberTxt}>
                                {profile.followers}
                            </Text>
                            <Text style={ styles.followTxt }>
                                Followers
                            </Text>
                            <Text style={styles.boldNumberTxt}>
                                {profile.followings}
                            </Text>
                            <Text style={ styles.followTxt }>
                                Following
                            </Text>
                        </View>

                        <View 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "center",
                                marginTop: regHeight * 60,
                                justifyContent: "space-between" 
                            }}
                        >
                            <Text 
                                style={{ 
                                    color: colors.textDark,
                                    fontWeight: "700", 
                                    fontSize: regWidth*20 
                                }}
                            >
                                Nemo Calender
                            </Text>
                            <TouchableOpacity 
                                style={ styles.streakBtn } 
                            >
                                <Text style={{ fontSize: regWidth * 16, fontWeight: "700", color: "#FFFFFF" }} >
                                    6-day streak!</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: regHeight * 15, }}>
                            <Text
                                style={{ 
                                    lineHeight: regHeight*19, 
                                    color: "#404040",
                                    fontSize: regWidth * 13,
                                    fontWeight: "500",
                                }}
                            >
                                {`You've made ${profile.month_nemos} Nemos this month!`}
                            </Text>
                            <Text
                                style={{ 
                                    lineHeight: regHeight*19, 
                                    color: "#404040",
                                    fontSize: regWidth * 13,
                                    fontWeight: "500",
                                }}
                            >
                                15% more than the previous month. Great move!
                            </Text>
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
                                    fontWeight: "700", 
                                    fontSize: regWidth*16 
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
                                                    fontWeight: "700", 
                                                    lineHeight: regWidth * 16, 
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
                                                        fontWeight: "900",
                                                        color: "#FFFFFF",
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
                                            View all</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        {/* <View 
                            style={{ 
                                width: "100%", 
                                flexDirection: "column", 
                                alignItems: "flex-end", 
                                height: "50%",
                            }}
                        >
                            <View style={{ marginTop: -regHeight * 82, width: "69%", height: "70%", }}>
                                    <View style={ styles.editProfileBtnContainer }>
                                        <Pressable 
                                            style={styles.editProfileBtn} 
                                            onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                                        >
                                            <Text style={{ 
                                                fontSize: regWidth * 13, 
                                                fontWeight: "500",
                                                opacity: 0.8 
                                                }} >Edit profile</Text>
                                        </Pressable>
                                    </View>
                                    <View style={ styles.usertagContainer } >
                                        <Text style={{ fontSize: regWidth * 14, fontWeight: "700", color: "#7341ffcc", width: "50%" }}
                                            numberOfLines={1}
                                            ellipsizeMode='tail'
                                        >
                                            {`@${profile.user_tag}`}</Text>

                                    </View>
                                    <View>
                                        <Text 
                                            style={ styles.usernameContainer }
                                            numberOfLines={1}
                                            ellipsizeMode='tail'
                                        >
                                            {profile.name}
                                        </Text>
                                    </View>
                                    
                                </View>
                        </View>
                        <View style={ styles.introContainer }>
                                <View style={{ height: "40%", width: "100%", flexDirection: "column", alignItems: "flex-start" }}>
                                    <Text
                                        style={{ width: "90%", lineHeight: regHeight*19, color: "#404040", marginHorizontal: regWidth*13 }}
                                        numberOfLines={3}
                                        ellipsizeMode='tail'
                                    >
                                        I literally have no idea.
                                        CEO of the Nemo project.
                                        Majoring PHYS at Korea.
                                        길어지면 이렇게 됨길어지면길어지면길어지면
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", marginLeft: regWidth*13 }}>
                                    <Text style={ styles.boldNumberTxt }>
                                        {profile.nemos}
                                    </Text>
                                    <Text style={ styles.followTxt }>
                                        Nemos
                                    </Text>
                                    <Text style={{ ...styles.boldNumberTxt, marginLeft: regWidth*28 }}>
                                        {profile.followers}
                                    </Text>
                                    <Text style={ styles.followTxt }>
                                        Followers
                                    </Text>
                                    <Text style={{ ...styles.boldNumberTxt, marginLeft: regWidth*28 }}>
                                        {profile.followings}
                                    </Text>
                                    <Text style={{ ...styles.followTxt, marginHorizontal: regWidth*6 }}>
                                        Following
                                    </Text>
                                </View>
                                <View style={ styles.followedByContainer}>
                                    <Animated.Image 
                                        source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                                        style={{ ...styles.smallAvatar, opacity: avatarValue }} 
                                        onLoadEnd={showAvatarImage}
                                    />
                                    <Animated.Image 
                                        source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                                        style={{ ...styles.smallAvatar, opacity: avatarValue, marginLeft: -regWidth*15 }} 
                                        onLoadEnd={showAvatarImage}
                                    />
                                    <Animated.Image 
                                        source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                                        style={{ ...styles.smallAvatar, opacity: avatarValue, marginLeft: -regWidth*15 }} 
                                        onLoadEnd={showAvatarImage}
                                    />

                                    <Text style={{ marginLeft: regWidth*11, width: "70%", color: "#606060" }}
                                        numberOfLines={2}
                                    >
                                            Followed by Elon Musk, Doowoo Kang, and 1 other
                                    </Text>

                                </View>
                        </View>
                        <View 
                            style={{ 
                                flexDirection: "row", 
                                alignItems: "flex-end", 
                                // width: "100%", 
                                height: "25%", 
                                justifyContent: "space-between" 
                            }}
                        >
                            <Text 
                                style={{ 
                                    marginLeft: regWidth*13, 
                                    color: "#000000", 
                                    fontWeight: "700", 
                                    fontSize: regWidth*20 
                                }}
                            >
                                Nemo Calender
                            </Text>
                            <TouchableOpacity 
                                style={ styles.streakBtn } 
                                // onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                            >
                                <Text style={{ fontSize: regWidth * 16, fontWeight: "700", color: "#FFFFFF" }} >
                                    6-day streak!</Text>
                            </TouchableOpacity>
                        </View>
                        <View 
                            style={ styles.boardContainer }
                            onLayout={onLayout}
                        >
                            <View style={{  height: "50%", flexDirection: "column", alignItems: "flex-start" }}>
                                <Text
                                    style={{ marginTop: regHeight*5, marginLeft: regWidth*7, color: "#FFFFFF", fontWeight: "700", fontSize: regWidth*16 }}
                                >
                                    Recent 2 weeks
                                </Text>
                            </View>
                            <View style={ styles.calenderContainer }>
                                {profile && profile.two_weeks.map((day, index) => (
                                    <View 
                                        style ={{ width: dateWidth, height: "40%" }}
                                        key={index}
                                    >
                                        <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                            {day.days}
                                        </Text>
                                        <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                            <View
                                                style={{ backgroundColor: "#D9D9D9", width: "80%", height: "80%" }}
                                            >
                                                <Text>
                                                    nemo
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                <View style = {{ width: "100%", alignItems: "center", height: "40%", marginTop: regHeight*17 }}>
                                    <Pressable 
                                        style={ styles.viewAllBtn } 
                                        // onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                                    >
                                        <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#FFFFFF" }} >
                                            View all</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View> */}
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
        borderRadius: 50,
        borderWidth: 2,
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
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.textDark,
        borderWidth: 0.5, 
        paddingHorizontal: regWidth * 8,
        paddingVertical: regHeight * 5,
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
        fontWeight: "900",
        fontSize: regWidth*16,
        letterSpacing: -regWidth,
        // width: regWidth * 20,
    },
    followTxt: {
        marginLeft: regWidth*8,
        marginRight: regWidth*15,
        fontWeight: "500",
        color: "#404040",
    },
    followedByContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        height: "30%",
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
        borderRadius: 30,
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