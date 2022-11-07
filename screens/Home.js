import { StyleSheet, View, ScrollView, FlatList, Text, Button, Dimensions, Image, TouchableOpacity, Animated, ActivityIndicator, RefreshControl, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import { BookmarkDetail } from '../components';
import {colors, width, height} from '../config/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import blankAvatar from '../assets/images/peopleicon.png';
import * as Font from "expo-font";

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetUserInfo, setRefreshToken, resetRefreshToken, } from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
  

const Home = ({navigation}) => {
    const dispatch = useDispatch();
    // 카드 뒷면 보기
    const [isReverse, setIsReverse] = useState(false);
    const [current, setCurrent] = useState(0);
    const [bookmarks, setBookmarks] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [loadFont, setLoadFont] = useState(false);
    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBookmarks();
        // fetchProfile();
        fetchFont();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // fetchProfile();
        }, [])
    );

    const fetchBookmarks = async() => {
        try {
            await Api
            .get("/api/v1/user/")
            .then(async(res) => {
                setBookmarks(res.data);
                const accessToken = await AsyncStorage.getItem('access');
                const refreshToken = await AsyncStorage.getItem('refresh');
                console.log(jwt_decode(accessToken));
                console.log(jwt_decode(refreshToken).exp, jwt_decode(accessToken).exp, (Date.now() / 1000));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const renderBookmark = ({ item }) => (
        <BookmarkDetail bookmark={item} navigation={navigation} />
    )


    const onProfile = () => {
        navigation.navigate('OtherProfile');
    }
    

    const onRefresh = useCallback(async() => {
        setRefreshing(true);
        await fetchBookmarks()
        .then(() => setRefreshing(false));
        // wait(2000).then(() => setRefreshing(false));
    }, []);

    // const renderItem = ({ post }) => {
    //     <Post post={post} navigation={navigation} />
    // }


    const fetchProfile = async() => {
        try {
            setLoading(true);
            await Api
            .get("/api/v1/user/userview/")
            .then((res) => {
                setAvatar(res.data.avatar);
                // console.log(res.data);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const fetchFont = async() => {
        await Font.loadAsync({
            "frank": require("../assets/fonts/FrankRuhlLibre-Bold.ttf"),
            "notoSans": require("../assets/fonts/NotoSansKR-Regular.otf"),
        });
        setLoadFont(true)
    }

    if (!loadFont) {
        return (
            <View style={styles.container}>
            </View>
        )
    }


    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Ionicons name="layers-sharp" size={30} color="black" />
                    <Text style={{
                        fontFamily: "frank",
                        fontSize: 30,
                        fontWeight: "900",
                    }}>
                        Nemo
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Feather name="search" size={30} color="black" style={{ marginRight: 24, }}/>
                    <Feather name="bell" size={28} color="black" />
                </View>
                {/* <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => navigation.navigate('Profile')}
                    // onPress={testLogout}
                >
                    <Image source={ avatar !== null ? { uri: `http://3.38.228.24${avatar}`} : blankAvatar} style={styles.profileImage} />
                </TouchableOpacity> */}
            </View>
            {/* <ScrollView 
                showsVerticalScrollIndicator={false}
                ref={ref}
                refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                }
            >
                {posts === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <>
                        {posts.map((post, index) => (
                            <Post post={post} navigation={navigation} key={index} />
                        ))}
                    </>
                }
            </ScrollView> */}

            { bookmarks !== null ? 
                <FlatList 
                    data={bookmarks}
                    renderItem={renderBookmark}
                    keyExtractor={bookmark => bookmark.bookmark_id}
                    showsVerticalScrollIndicator={false}
                    ref={ref}
                    refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                        />
                    }
                />
                :
                null
            }

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "red",
        marginTop: 60,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    post: {
        // backgroundColor: "grey",
        paddingTop: 28,
        paddingBottom: 18,
        borderTopWidth: 0.3,
        borderTopColor: "#808080",
    },

    postWriter: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    postWriterImage: {
        width: 25,
        height: 25,
        resizeMode: "cover",
        borderRadius: 50,
        backgroundColor: "red",
    },
    postWriterText: {
        fontWeight: "700",
        fontSize: 12.5,
        paddingHorizontal: 5,
    },
    postDateText: {
        color: "#808080",
        fontWeight: "500",
        fontSize: 10,
        paddingHorizontal: 5,
    },

    postTitle: {
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    postTitleText: {
        fontWeight: "700",
        fontSize: 20,
    },
    postTitleInfoText: {
        fontWeight: "400",
        fontSize: 13,
        marginTop: 10,
    },


    postLikes: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    postLikesText: {
        fontWeight: "700",
        fontSize: 15,
    },
    profileImage: {
        width: 30,
        height: 30,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
        // marginTop: 10,
    },
})

export default Home;