import { View, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, } from "react-native";
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

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, scrapSelector } from '../modules/hooks';
import { resetUserInfo } from '../modules/user';
import { loadScraps } from "../modules/scraps";

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


const UserStorage = ({navigation}) => {
    const dispatch = useDispatch();
    const [isMine, setIsMine] = useState(true);
    const [profile, setProfile] = useState(null);
    const [postTiles, setPostTiles] = useState(null);
    const [scrapTiles, setScrapTiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const { accessToken, } = useSelector(userSelector);
    const [bookmarks, setBookmarks] = useState(null);
    const [albums, setAlbums] = useState([1, 2, 3]);

    const [ headerHeight, setHeaderHeight ] = useState(0);

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'bookmarks', title: 'bookmarks' },
        { key: 'albums', title: 'albums' },
    ]);

    const ref = useRef();
    useScrollToTop(ref);

    useFocusEffect(
        useCallback(() => {
            fetchBookmarkList();
            fetchProfile();
        }, [])
    );

    const fetchProfile = async() => {
        try {
            await Api
            .get("api/v1/user/myprofile/")
            .then((res) => {
                setProfile(res.data);
                console.log(res.data);
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




    return (
        <View style={styles.container}>
            <View style={{...styles.header, justifyContent: "flex-end", }} >
                <Feather name="settings" size={30} color="black" />
            </View>


            <ScrollView
                // showsVerticalScrollIndicator={false}
                ref={ref}
            >

            {/* <Animated.View
                style={{
                    transform: [{
                        translateY: headerTranslateY
                    }]
                }}
                onLayout={headerOnLayout}
            > */}
                <View style={styles.profileContainter} >
                    {profile === null ? 
                        <ActivityIndicator 
                            color="white" 
                            style={{marginTop: 10}} 
                            size="large"
                        />
                        :
                        <>
                            <Image 
                                source={ profile.avatar !== null ? { uri: `http://3.38.62.105${profile.avatar}`} : blankAvatar} 
                                style={styles.profileImage} 
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
                                <View style={{ flexDirection: "row", marginTop: 8,}}>
                                    <View>
                                        <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followers} Followers`}</Text>
                                    </View>
                                    <Entypo name="dot-single" size={15} color="black" style={{ marginHorizontal: 8, }} />
                                    <View>
                                        <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followings} Following`}</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    }
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center" }} >
                    <TouchableOpacity 
                        style={{...styles.editOrPost, backgroundColor: "#DDDDDD"}} 
                        activeOpacity={1}
                        onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
                    >
                        <Text style={{ fontSize: 15, fontWeight: "600", }} >프로필 수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{...styles.editOrPost, backgroundColor: "#FF4040"}}
                        activeOpacity={1} 
                        onPress={() => navigation.navigate('CreateAlbumModal')} 
                    >
                        <Text style={{ fontSize: 15, fontWeight: "600", color: "white", }} >새 앨범 생성하기</Text>
                    </TouchableOpacity>
                </View>
            {/* </Animated.View> */}
                {/* <TabView 
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    renderTabBar={renderTabBar}
                /> */}



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
    //   backgroundColor: "pink",
      marginTop: 60,
      marginHorizontal: 20,
    //   paddingBottom: 30,
        paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    profileContainter: {
        //backgroundColor: "pink",
        marginHorizontal: 20,
        //paddingBottom: 30,
        paddingBottom: 18,
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
    editOrPost: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
        width: "40%",
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
})

export default UserStorage;