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

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState(null);
    const [loading, setLoading] = useState(false);
    
    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
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
                                // onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarked: bookmarked, index: index, })} 
                                key={index}
                            >
                                <BookmarkList bookmark={bookmark} navigation={navigation} />
                            </TouchableOpacity>
                        ))}
                        </View>
                    </>
                }
            </ScrollView>
        </View>
    )

};
  
const Albums = () => {
    const [albums, setAlbums] = useState([1, 2, 3]);
    const [loading, setLoading] = useState(false);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
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
                                <AlbumList album={album} />
                            </TouchableOpacity>
                        ))}
                        </View>
                    </>
                }
            </ScrollView>
        </View>
    )

};

const renderScene = SceneMap({
    bookmarks: Bookmarks,
    albums: Albums,
});

const getTabBarIcon = (props) => {
    const {route, focused, } = props

    if (route.key === 'bookmarks') {
        return <Feather name='bookmark' size={24} color={focused ? 'red' : 'grey'}/>
    } else {
        return <Feather name='folder' size={24} color={focused ? 'red' : 'grey'}/>
    }
}

const renderTabBar = (props) => (
    <TabBar
        {...props}
        indicatorStyle={{backgroundColor: 'red'}}
        renderIcon={
            props => getTabBarIcon(props)
        }
        renderLabel={({ route, focused, color }) => (
            <></>
        )}
        style={{ backgroundColor: 'white' }}
    />
);


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
                <ImageBackground source={ require('../assets/images/userImage.jpeg') } resizeMode= "cover" 
                                    style={{
                                        height: 110, 
                                        width:"100%"
                                        }}>
                    <View style={{ 
                        flexDirection: "row", 
                        justifyContent: "space-between"
                         }}>
                        <Pressable
                            onPress={() => navigation.navigate('UserSetting')}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            style={{ 
                                marginLeft: regWidth*13, 
                                marginTop: regWidth*45 
                            }}
                            >
                            <Image source={vectorLeftImage} 
                            style={{ 
                                width: regWidth*30, 
                                height: regWidth*30 
                                }}/>
                            {/* <FontAwesome name="arrow-circle-left" size={30} color="black" /> */}
                        </Pressable>
                        <Pressable
                            onPress={() => navigation.navigate('UserSetting')}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            style={{ 
                                marginRight: regWidth*13, 
                                marginTop: regWidth*45 
                            }}
                        >
                            <Image source={settings} style={{ width: regWidth*30, height: regWidth*30 }}/>
                            {/* <Feather name="settings" size={30} color="black" /> */}
                        </Pressable>
                    </View>
                </ImageBackground>
            </SafeAreaView>
            <View style={{
                // backgroundColor: "pink",
                // marginHorizontal: regWidth * 20,
                //paddingBottom: 30,
                // paddingBottom: regHeight * 18,
                // flexDirection: "row",
                // justifyContent: "space-between",
                alignItems: "center",
                marginTop: -regHeight*40,
                height: "30%",

            }} >
                    
                    {profile === null ? 
                        <ActivityIndicator 
                            color="white" 
                            style={{
                                marginTop: 10
                            }} 
                            size="large"
                        />
                        :
                        <>
                        <View style={{ 
                            flexDirection: "column", 
                            alignItems: "flex-start",
                            width: "100%",
                            marginTop: 12,
                            }}>

                            <Animated.Image 
                                source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                                style={{
                                    width: regWidth * 100,
                                    height: regWidth * 100,
                                    resizeMode: "cover",
                                    borderRadius: 50,
                                    borderWidth: 2,
                                    borderColor: "#7341ffcc",
                                    opacity: avatarValue,
                                    // marginBottom: 10,
                                    marginLeft: regWidth*13,
                                    // marginTop: -regHeight*50,

                                }} 
                                onLoadEnd={showAvatarImage}
                            />
            </View>
            <View style={{
                // backgroundColor: "blue",
                width: "100%",
                flexDirection: "column",
                alignItems: "flex-end",
                height: "50%",
            }}>
                <View style={{ 
                        // marginHorizontal: 8, 
                        // backgroundColor: "pink",
                        marginTop: -regHeight*82,
                        // opacity: 0.5,
                        width: "69%",
                        height: "70%"
                        
                    }}>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "flex-end", 
                            alignItems: "center",
                            // backgroundColor: "skyblue",
                            width: "100%",
                            height: "30%",
                            marginTop: regWidth*13
                        }}>
                            <TouchableOpacity 
                                style={{
                                    // paddingHorizontal: regWidth * 5,
                                    // paddingVertical: regHeight * 5,
                                    borderRadius: 20,
                                    // marginBottom: regHeight * 2,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "33%",
                                    height: "100%",
                                    borderColor: "#202020", 
                                    borderWidth: 0.5, 
                                    // marginTop: 10, 
                                    marginRight: regWidth*13
                                }} 
                                onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                            >
                                <Text style={{ 
                                    fontSize: regWidth * 15, 
                                    fontWeight: "500",
                                    opacity: 0.8 
                                    }} >Edit profile</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ 
                            flexDirection: "row", 
                            width: "100%", 
                            alignItems: "flex-start", 
                            height: "25%",
                            marginTop: -regHeight*15

                        }} >
                            <Text style={{
                                fontSize: regWidth * 14,
                                fontWeight: "700",
                                color: "#7341ffcc",
                                width: "28%",
                                // opacity: 0.8
                                
                            }}
                                numberOfLines={1}
                                ellipsizeMode='tail'
                            >
                                {`@${profile.user_tag}`}</Text>

                        </View>
                        <View>
                            <Text 
                                style={{
                                    fontSize: regWidth * 23,
                                    fontWeight: "900",
                                    width: "70%",
                                    height: regHeight*70,
                                    color: "#202020",
                                }}
                                numberOfLines={1}
                                ellipsizeMode='tail'
                            >
                                {profile.name}아ㅣㄴ망;ㅣㄴ망ㅇㄴㅁ;ㅣㅏㅣㅇㄴㅁ;ㅣ롤
                            </Text>
                        </View>
                        
                    </View>
            </View>
            <View style={{
                // backgroundColor:"pink",
                // opacity: 0.5,
                height: "73%",
                width: "100%",
                marginTop: -regHeight*100,
                flexDirection: "column",
                alignItems: "flex-start",
            }}>
                    <View style={{
                            // backgroundColor: "pink",
                            height: "40%",
                            width: "100%",
                            flexDirection: "column",
                            alignItems: "flex-start"
                        }}>
                        <Text
                            style={{
                                width: "90%",
                                lineHeight: regHeight*19,
                                color: "#404040",
                                marginHorizontal: regWidth*13
                            }}
                            numberOfLines={3}
                            ellipsizeMode='tail'
                        >
                            I literally have no idea.
                            CEO of the Nemo project.
                            Majoring PHYS at Korea.
                            길어지면 이렇게 됨ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
                        </Text>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: regWidth*13,
                        
                    }}>
                        <Text style={{
                            color: "#202020",
                            fontWeight: "900",
                            fontSize: regWidth*16,
                            letterSpacing: -regWidth
                        }}>
                            111  
                        </Text>
                        <Text style={{
                            marginHorizontal: regWidth*8,
                            fontWeight: "500",
                            color: "#404040"
                        }}>
                            Nemos
                        </Text>
                        <Text style={{
                            color: "#202020",
                            fontWeight: "900",
                            fontSize: regWidth*16,
                            marginLeft: regWidth*28,
                            letterSpacing: -regWidth
                        }}>
                            20  
                        </Text>
                        <Text style={{
                            marginHorizontal: regWidth*8,
                            fontWeight: "500",
                            color: "#404040"
                        }}>
                            Followers
                        </Text>
                        <Text style={{
                            color: "#202020",
                            fontWeight: "900",
                            fontSize: regWidth*16,
                            marginLeft: regWidth*28,
                            letterSpacing: -regWidth
                        }}>
                            27 
                        </Text>
                        <Text style={{
                            marginHorizontal: regWidth*6,
                            fontWeight: "500",
                            color: "#404040"
                        }}>
                            Following
                        </Text>
                    </View>
                    <View style={{
                        // backgroundColor: "skyblue",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        width: "100%",
                        height: "30%",
                        marginTop: regHeight*12
                    }}>
                        <Animated.Image 
                            source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                            style={{
                                width: regWidth*30, 
                                height: regWidth*30,
                                resizeMode: "cover",
                                borderRadius: regWidth*15,
                                borderWidth: regWidth*1,
                                borderColor: "#D9D9D9",
                                opacity: avatarValue,
                                marginLeft: regWidth*13,

                            }} 
                            onLoadEnd={showAvatarImage}
                        />
                        <Animated.Image 
                            source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                            style={{
                                width: regWidth*30, 
                                height: regWidth*30,
                                resizeMode: "cover",
                                borderRadius: regWidth*15,
                                borderWidth: regWidth*1,
                                borderColor: "#D9D9D9",
                                opacity: avatarValue,
                                marginLeft: -regWidth*15 ,

                            }} 
                            onLoadEnd={showAvatarImage}
                        />
                        <Animated.Image 
                            source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
                            style={{
                                width: regWidth*30, 
                                height: regWidth*30,
                                resizeMode: "cover",
                                borderRadius: regWidth*15,
                                borderWidth: regWidth*1,
                                borderColor: "#D9D9D9",
                                opacity: avatarValue,
                                marginLeft: -regWidth*15 ,

                            }} 
                            onLoadEnd={showAvatarImage}
                        />

                        <Text style={{
                            marginLeft: regWidth*11,
                            width: "70%",
                            color: "#606060"
                        }}
                            numberOfLines={2}
                        >
                                Followed by Elon Musk, Doowoo Kang, and 1 other
                        </Text>

                    </View>
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: "flex-end",
                // backgroundColor: "pink",
                width: "100%",
                height: "25%"
            }}>
                <Text style={{
                    marginLeft: regWidth*13,
                    color: "#000000",
                    fontWeight: "700",
                    fontSize: regWidth*20,
                }}>
                    Your Move
                </Text>
                <TouchableOpacity 
                    style={{
                        borderRadius: 30,
                        // marginBottom: regHeight * 2,
                        justifyContent: "center",
                        alignItems: "center",
                        width: "32%",
                        height: "55%",
                        backgroundColor: "#5c34cc",
                        borderWidth: 1, 
                        // marginTop: 10, 
                        marginLeft: regWidth*140
                    }} 
                    onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                >
                    <Text style={{ 
                        fontSize: regWidth * 16, 
                        fontWeight: "700",
                        color: "#FFFFFF" 
                        }} >6-day streak!</Text>
                </TouchableOpacity>


            </View>
            <View 
                style={{
                    borderRadius: 10,
                    backgroundColor: "#404040",
                    // opacity: 0.5,
                    height: "115%",
                    width: "94%",
                    marginTop: regHeight*15,
                    flexDirection: "column",
                    alignItems: "flex-start"
                }}
                onLayout={onLayout}
            >
                <View style={{
                        height: "50%",
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}>
                    <Text
                        style={{
                            marginTop: regHeight*4, 
                            marginLeft: regWidth*7,
                            color: "#FFFFFF",
                            fontWeight: "700",
                            fontSize: regWidth*16
                        }}
                    >
                        Recent 2 weeks
                    </Text>
                </View>
                <View style={{
                    flexDirection: 'row', 
                    flexWrap: 'wrap',
                    width: "100%",
                    marginTop: -regHeight*90,
                    height: "70%",
                    // opacity: 0.5
                    }}>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style ={{ 
                        // backgroundColor: 'green',
                        width: dateWidth,
                        height: "40%",
                    }}>
                        <Text style={{
                            color: "#FFFFFF",
                            marginLeft: regWidth*5
                        }}>
                            10
                        </Text>
                        <View style={{
                            // backgroundColor: 'green',
                            marginLeft: regWidth*2,
                            marginTop: -regHeight*4,
                            width: dateWidth,
                            height: dateWidth,
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: 'green',
                            // width: dateWidth,
                            // height: dateWidth,
                            // marginBottom: regHeight*35
                        }}>
                            <View
                                style={{
                                    backgroundColor: "yellow",
                                    
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Text>
                                    asdf
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style = {{
                        width: "100%",
                        alignItems: "center",
                        height: "40%",
                        marginTop: regHeight*15
                    }}>
                        <TouchableOpacity 
                            style={{
                                borderRadius: 30,
                                justifyContent: "center",
                                alignItems: "center",
                                width: "25%",
                                height: "45%",
                                // backgroundColor: "#5c34cc",
                                borderWidth: 1, 
                                borderColor: "#FFFFFF"
                                // marginTop: 10, 
                            }} 
                            onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                        >
                            <Text style={{ 
                                fontSize: regWidth * 15, 
                                fontWeight: "700",
                                color: "#FFFFFF" 
                                }} >View all</Text>
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
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        //   backgroundColor: "pink",
        marginVertical: 10,
        marginHorizontal: 20,
        //   paddingBottom: 30,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backgrounimage: {
        width: regWidth * 375,
        height: regWidth * 110,
        resizeMode: "cover",
        // marginLeft: -13,
        // marginTop: -127
    },
    profileContainer: {
        backgroundColor: "pink",
        // marginHorizontal: regWidth * 20,
        //paddingBottom: 30,
        // paddingBottom: regHeight * 18,
        // flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
        marginTop: -37.5
    },
    profileImage: {
        width: regWidth * 100,
        height: regWidth * 100,
        resizeMode: "cover",
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#7341FF",
        // backgroundColor: "red",
    },
    editOrPost: {
        paddingHorizontal: regWidth * 5,
        paddingVertical: regHeight * 5,
        borderRadius: 20,
        marginHorizontal: regWidth * 8,
        // marginBottom: regHeight * 2,
        justifyContent: "center",
        alignItems: "center",
        width: "24.5%",
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
    style: {
        height: regWidth*41,
        width: regWidth*41,
        backgroundColor: 'pink',
        marginHorizontal: regWidth*4
    }
})

export default UserStorage;