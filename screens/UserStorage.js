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

import vectorLeftImage from '../assets/icons/vector_left.png';
import settings from '../assets/icons/settings.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, scrapSelector } from '../modules/hooks';
import user, { resetUserInfo, setAvatar, setShouldUserRefresh, } from '../modules/user';
import { loadScraps } from "../modules/scraps";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import { FontAwesome } from '@expo/vector-icons';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

// const Bookmarks = () => {
//     const [bookmarks, setBookmarks] = useState(null);
//     const [loading, setLoading] = useState(false);
    
//     return (
//         <View style={styles.container}>
//             <ScrollView
//                 showsVerticalScrollIndicator={false}
//             >
//                 {loading ? 
//                     <ActivityIndicator 
//                         color="black" 
//                         style={{marginTop: 100}} 
//                         size="large"
//                     />
//                     : 
//                     <>
//                         <View>
//                         {bookmarks && bookmarks.map((bookmark, index) => (
//                             <TouchableOpacity
//                                 activeOpacity={1}
//                                 // onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarked: bookmarked, index: index, })} 
//                                 key={index}
//                             >
//                                 <BookmarkList bookmark={bookmark} navigation={navigation} />
//                             </TouchableOpacity>
//                         ))}
//                         </View>
//                     </>
//                 }
//             </ScrollView>
//         </View>
//     )

// };
  
// const Albums = () => {
//     const [albums, setAlbums] = useState([1, 2, 3]);
//     const [loading, setLoading] = useState(false);

//     return (
//         <View style={styles.container}>
//             <ScrollView
//                 showsVerticalScrollIndicator={false}
//             >
//                 {loading ? 
//                     <ActivityIndicator 
//                         color="black" 
//                         style={{marginTop: 100}} 
//                         size="large"
//                     />
//                     : 
//                     <>
//                         <View>
//                         {albums && albums.map((album, index) => (
//                             <TouchableOpacity
//                                 activeOpacity={1}
//                                 // onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarked: bookmarked, index: index, })} 
//                                 key={index}
//                             >
//                                 <AlbumList album={album} />
//                             </TouchableOpacity>
//                         ))}
//                         </View>
//                     </>
//                 }
//             </ScrollView>
//         </View>
//     )

// };

// const renderScene = SceneMap({
//     bookmarks: Bookmarks,
//     albums: Albums,
// });

// const getTabBarIcon = (props) => {
//     const {route, focused, } = props

//     if (route.key === 'bookmarks') {
//         return <Feather name='bookmark' size={24} color={focused ? 'red' : 'grey'}/>
//     } else {
//         return <Feather name='folder' size={24} color={focused ? 'red' : 'grey'}/>
//     }
// }

// const renderTabBar = (props) => (
//     <TabBar
//         {...props}
//         indicatorStyle={{backgroundColor: 'red'}}
//         renderIcon={
//             props => getTabBarIcon(props)
//         }
//         renderLabel={({ route, focused, color }) => (
//             <></>
//         )}
//         style={{ backgroundColor: 'white' }}
//     />
// );


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

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'bookmarks', title: 'bookmarks' },
        { key: 'albums', title: 'albums' },
    ]);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBookmarkList();
        fetchProfile();
    }, []);

    useEffect(() => {
        if (shouldUserRefresh === true) {
            fetchBookmarkList();
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

    const onRefresh = useCallback(async() => {
        setRefreshing(true);
        await fetchProfile()
        .then(() => fetchBookmarkList())
        .then(() => setRefreshing(false));
    }, []);

    const fetchProfile = async() => {
        try {
            await Api
            .get("api/v1/user/myprofile/")
            .then((res) => {
                setProfile(res.data);
                dispatch(setAvatar(res.data.avatar));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchBookmarkList = async() => {
        try {
            setLoading(true);
            await Api
            .get("api/v1/user/mylist/")
            .then((res) => {
                // console.log(res.data);
                setBookmarks(res.data.bookmarks.reverse());
                setAlbums(res.data.albums);
                // setProfile(res.data);
                // setPostTiles(res.data.posts);
                // setScrapTiles(res.data.scrap_posts);
                // dispatch(loadScraps(res.data.scrap_posts));
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

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
        setDateWidth(parseInt(layout.width / 7));
    }


    return (
        <View style={{
            flex: 1,
            backgroundColor: "white",
        }}>
            <SafeAreaView style={{ 
                justifyContent: "flex-end"
             }} >
                <ImageBackground 
                    source={ require('../assets/images/userImage.jpeg') } 
                    resizeMode= "cover" 
                    style={{ height: 110, width:"100%" }}
                >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            style={{ marginLeft: regWidth*13, marginTop: regWidth*45 }}
                            >
                            <Image source={vectorLeftImage} 
                            style={{ width: regWidth*30, height: regWidth*30 }}/>
                            {/* <FontAwesome name="arrow-circle-left" size={30} color="black" /> */}
                        </Pressable>
                        <Pressable
                            onPress={() => navigation.navigate('UserSetting')}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            style={{ marginRight: regWidth*13, marginTop: regWidth*45 }}
                        >
                            <Image source={settings} style={{ width: regWidth*30, height: regWidth*30 }}/>
                            {/* <Feather name="settings" size={30} color="black" /> */}
                        </Pressable>
                    </View>
                </ImageBackground>
            </SafeAreaView>
            <View style={{ alignItems: "center", marginTop: -regHeight*40, height: "30%"  }} >
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{ marginTop: 10 }} 
                        size="large"
                    />
                    :
                    <>
                        <View style={{ flexDirection: "column", alignItems: "flex-start", width: "100%", marginTop: 12 }}>
                            <Animated.Image 
                                source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                                style={{ ...styles.profileAvatar, opacity: avatarValue }} 
                                onLoadEnd={showAvatarImage}
                            />
                        </View>
                        <View 
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
                                        {bookmarks ? bookmarks.length : 0}
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
                        <View style={{ flexDirection: "row", alignItems: "flex-end", width: "100%", height: "25%" }}>
                            <Text style={{ marginLeft: regWidth*13, color: "#000000", fontWeight: "700", fontSize: regWidth*20 }}>
                                Your Move
                            </Text>
                            <TouchableOpacity 
                                style={ styles.streakBtn } 
                                onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
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
                                    style={{ marginTop: regHeight*4, marginLeft: regWidth*7, color: "#FFFFFF", fontWeight: "700", fontSize: regWidth*16 }}
                                >
                                    Recent 2 weeks
                                </Text>
                            </View>
                            <View style={ styles.calenderContainer }>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        10
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
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        11
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        12
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        13
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#8BB7EA", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        14
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFCECE", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        15
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFCECE", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        16
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        17
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        18
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        19
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        20
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        21
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        22
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style ={{ width: dateWidth, height: "40%" }}>
                                    <Text style={{ color: "#FFFFFF", marginLeft: regWidth*5 }}>
                                        23
                                    </Text>
                                    <View style={{ ...styles.nemoContatiner, width: dateWidth, height: dateWidth }}>
                                        <View
                                            style={{ backgroundColor: "#FFF0BC", width: "80%", height: "80%" }}
                                        >
                                            <Text>
                                                nemo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style = {{ width: "100%", alignItems: "center", height: "40%", marginTop: regHeight*17 }}>
                                    <TouchableOpacity 
                                        style={ styles.viewAllBtn } 
                                        onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                                    >
                                        <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#FFFFFF" }} >
                                            View all</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                }
            </View>
        </View>
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
        marginLeft: regWidth*13,
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
        width: "30%",
        height: "110%",
        borderColor: "#202020", 
        borderWidth: 0.5, 
        marginRight: regWidth*13,
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
        letterSpacing: -regWidth
    },
    followTxt: {
        marginHorizontal: regWidth*8,
        fontWeight: "500",
        color: "#404040"
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
        width: "32%",
        height: "55%",
        backgroundColor: "#5c34cc",
        borderWidth: 1, 
        marginLeft: regWidth*140
    },
    boardContainer: {
        borderRadius: 10,
        backgroundColor: "#404040",
        height: "115%",
        width: "94%",
        marginTop: regHeight*15,
        flexDirection: "column",
        alignItems: "flex-start"
    },
    calenderContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap',
        width: "100%",
        marginTop: -regHeight*90,
        height: "70%",
    },
    nemoContatiner: {
        marginLeft: regWidth*2,
        marginTop: -regHeight*4,
        alignItems: "center",
        justifyContent: "center",
    },
    viewAllBtn: {
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        width: "25%",
        height: "45%",
        borderWidth: 1, 
        borderColor: "#FFFFFF"
    }

})

export default UserStorage;