import { View, SafeAreaView, KeyboardAvoidingView, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Pressable, Modal, Alert, ImageBackground, FlatList, } from "react-native";
import React, { useEffect, useState, useRef, createRef, useMemo, useCallback, } from "react";
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Api from "../lib/Api";
import blankAvatar from '../assets/images/blankAvatar.png';
import blankBgd from '../assets/images/blankBgd.png';
import { BookmarkList, BookmarkSimple, AlbumList, BookList, AlbumTile, BookTile, } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import {
    useScrollToTop,
} from '@react-navigation/native';

import vectorLeftImage from '../assets/icons/vector_left.png';
import settings from '../assets/icons/settings.png';
import sortCheck from '../assets/images/sortCheck.png';
import iconRepeat from '../assets/icons/iconRepeat.png';
import iconGrid from '../assets/icons/iconGrid.png';
import iconList from '../assets/icons/iconList.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { 
    setShouldHomeRefresh, 
    setShouldStorageRefresh, 
    setShouldUserRefresh, 
    toggleAlbumTile,
    toggleBookTile,
} from '../modules/user';

import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { he } from "date-fns/locale";
import { Tabs } from 'react-native-collapsible-tab-view';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const TopTab = createMaterialTopTabNavigator();

const Max_Header_Height = 200;
const Min_Header_Height = 70;
const Scroll_Distance = Max_Header_Height - Min_Header_Height;

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

    const scrollOffsetY = useRef(new Animated.Value(0)).current;
    const [ headerHeight, setHeaderHeight ] = useState(0);
    const headerTranslateY = scrollOffsetY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight],
        extrapolate: "clamp"
    });

    const headerOnLayout = useCallback((event)=>{
        const { height } = event.nativeEvent.layout;
        setHeaderHeight(height);
        // console.log(height);
    }, []);


    useEffect(() => {
        fetchProfile();
        // fetchBookmarkList();
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
            console.log(userTag);
            await Api
            .post("api/v1/user/profile/", { user_tag: userTag })
            .then((res) => {
                console.log(res.data);
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
                // console.log(res.data.bookmarks);
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


    // return (
    //     <View 
    //         style={{
    //             flex: 1,
    //             backgroundColor: "white",
    //         }}
    //         stickyHeaderIndices={[0]}
    //     >
    //         <ImageBackground 
    //             source={profile && profile.backgroundimg ? profile.backgroundimg : blankBgd} 
    //             resizeMode= "cover" 
    //             style={{ height: SCREEN_WIDTH * (110 / 375),  width:"100%", zIndex: 0,}}
    //         >
    //             <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: regWidth * 13, marginTop: regHeight * 45, }}>
    //                 <Pressable
    //                     onPress={() => navigation.goBack()}
    //                     hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
    //                 >
    //                     <Image 
    //                         source={vectorLeftImage} 
    //                         style={{ width: regWidth*35, height: regWidth*35 }}
    //                     />
    //                 </Pressable>
    //                 {/* <Pressable
    //                     onPress={() => navigation.navigate('UserSetting')}
    //                     hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
    //                 >
    //                     <Image 
    //                         source={settings} 
    //                         style={{ width: regWidth*35, height: regWidth*35 }}
    //                     />
    //                 </Pressable> */}
    //             </View>
    //         </ImageBackground>
    //         <Tabs.Container
    //             renderTabBar={(props) => <MyTabBar {...props} />}
    //             headerHeight={250}
    //             renderHeader={() => (
    //                 <View 
    //                     style={{ 
    //                         // alignItems: "center", 
    //                         // marginTop: -regHeight*40, 
    //                         // height: "30%", 
    //                         backgroundColor: "white",
    //                         paddingHorizontal: regWidth * 13,
    //                         zIndex: 10,
    //                     }}
    //                     onLayout={headerOnLayout}
    //                 >
    //                     {profile === null ? 
    //                         <ActivityIndicator 
    //                             color="white" 
    //                             style={{ marginTop: 10 }} 
    //                             size="large"
    //                         />
    //                         :
    //                         <>
    //                             <View 
    //                                 style={{ 
    //                                     marginTop: -regHeight * 25, 
    //                                     justifyContent: "space-between",
    //                                     alignItems: "center", 
    //                                     flexDirection: "row",
    //                                 }}
    //                             >
    //                                 <View style={{ flexDirection: "row", alignItems: "flex-end"}}>
    //                                     <Animated.Image 
    //                                         source={ profile.avatar !== null ? { uri: profile.avatar } : blankAvatar} 
    //                                         style={{ ...styles.profileAvatar, opacity: avatarValue }} 
    //                                         onLoadEnd={showAvatarImage}
    //                                     />
    //                                     <View
    //                                         style={{
    //                                             marginTop: 40,
    //                                             marginHorizontal: regWidth * 7,
    //                                         }}
    //                                     >
    //                                         <Text style={{ fontSize: regWidth * 14, fontWeight: "700", color: colors.nemoNormal, includeFontPadding: false,                                             {`@${profile.user_tag}`}
    //                                         </Text>
    //                                         <Text style={{ fontSize: regWidth * 23, fontWeight: "900", color: colors.textDark, includeFontPadding: false,                                             {profile.name}
    //                                         </Text>
    //                                     </View>
    //                                 </View>
    //                                 <Pressable 
    //                                     style={{
    //                                         ...styles.followBtn,
    //                                         backgroundColor: isFollow ? "white" : colors.textNormal,
    //                                     }} 
    //                                     onPress={onFollow}
    //                                 >
    //                                     <Text 
    //                                         style={{ 
    //                                             fontSize: regWidth * 13, 
    //                                             // fontWeight: "500",
    //                                             color: isFollow ? colors.textDark : "white",
    //                                             fontFamily: "NotoSansKR-Bold",
    //                                         }}
    //                                     >
    //                                         {isFollow ? "Following" : "Follow"}
    //                                     </Text>
    //                                 </Pressable>
    //                             </View>
    //                             <View style={{ marginTop: regHeight * 10, }}>
    //                                 <Text
    //                                     style={{ 
    //                                         width: "50%", 
    //                                         includeFontPadding: false,
    //                                         color: "#404040",
    //                                         fontSize: regWidth * 13,
    //                                         fontWeight: "500",
    //                                     }}
    //                                     numberOfLines={3}
    //                                     ellipsizeMode='tail'
    //                                 >
    //                                     {profile.intro}
    //                                 </Text>
    //                             </View>
    //                             <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 13, }}>
    //                                 <Text style={ styles.boldNumberTxt }>
    //                                     {profile.nemos}
    //                                 </Text>
    //                                 <Text style={ styles.followTxt }>
    //                                     Nemos
    //                                 </Text>
    //                                 <Pressable
    //                                     style={{ flexDirection: "row", alignItems: "center", }}
    //                                     onPress={() =>  navigation.navigate("FollowScreen", { title: "팔로워", userTag: profile.user_tag })}
    //                                 >
    //                                     <Text style={styles.boldNumberTxt}>
    //                                         {followers}
    //                                     </Text>
    //                                     <Text style={ styles.followTxt }>
    //                                         Followers
    //                                     </Text>
    //                                 </Pressable>
    //                                 <Pressable
    //                                     style={{ flexDirection: "row", alignItems: "center", }}
    //                                     onPress={() =>  navigation.navigate("FollowScreen", { title: "팔로잉", userTag: profile.user_tag })}
    //                                 >
    //                                     <Text style={styles.boldNumberTxt}>
    //                                         {profile.followings}
    //                                     </Text>
    //                                     <Text style={ styles.followTxt }>
    //                                         Following
    //                                     </Text>
    //                                 </Pressable>
    //                             </View>
    //                             <View style={ styles.followedByContainer}>
    //                                 {profile.know_together.map((user, index) => (
    //                                     <Animated.Image 
    //                                         source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
    //                                         style={{
    //                                             ...styles.smallAvatar, 
    //                                             opacity: avatarValue,
    //                                             marginLeft: index === 0 ? 0 : -regWidth*15
    //                                         }} 
    //                                         onLoadEnd={showAvatarImage}
    //                                         key={index}
    //                                     />
    //                                 ))}
    //                                 <Text style={{ marginLeft: regWidth*11, width: "70%", color: "#606060" }}
    //                                     numberOfLines={2}
    //                                 >
    //                                         {`Followed by ${profile.know_together.map((user, index) => `${index === 0 ? '' : ' '}${user.name}`)} ${profile.know_together_counts - profile.know_together.length === 0 ? "" : `and ${profile.know_together_counts - profile.know_together.length} other`}`}
    //                                 </Text>
    //                             </View>
    //                         </>
    //                     }
    //                 </View>
    //             )}
    //             // headerHeight={HEADER_HEIGHT}
    //         >
    //             <Tabs.Tab name="Nemo">
    //             <Tabs.ScrollView>
    //                 <NemoScreen navigation={navigation} userTag={userTag} />
    //             </Tabs.ScrollView>
    //             </Tabs.Tab>
    //             <Tabs.Tab name="B">
    //             <Tabs.ScrollView>
    //                 <View style={[styles.box, styles.boxA]} />
    //                 <View style={[styles.box, styles.boxB]} />
    //             </Tabs.ScrollView>
    //             </Tabs.Tab>
    //         </Tabs.Container>
    //     </View>
    // )


    return (
        <View 
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
                        {/* <Pressable
                            onPress={() => navigation.navigate('UserSetting')}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Image 
                                source={settings} 
                                style={{ width: regWidth*35, height: regWidth*35 }}
                            />
                        </Pressable> */}
                    </View>
                </ImageBackground>
            {/* </View> */}
            <Animated.View 
                style={{ 
                    // alignItems: "center", 
                    // marginTop: -regHeight*40, 
                    // height: "30%", 
                    backgroundColor: "white",
                    marginHorizontal: regWidth * 13,
                    zIndex: 10,
                }}
                onLayout={headerOnLayout}
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
                                        borderRadius: userTag === "nemo" ? regWidth * 10 : 999,
                                    }} 
                                    onLoadEnd={showAvatarImage}
                                />
                                <View
                                    style={{
                                        marginTop: regHeight * 40,
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
                                style={{
                                    ...styles.followBtn,
                                    backgroundColor: isFollow ? "white" : colors.textNormal,
                                    opacity: myTag === userTag ? 0 : 1,
                                    position: "absolute",
                                    right: 0,
                                }} 
                                disabled={ myTag === userTag ? true : false }
                                onPress={onFollow}
                            >
                                <Text 
                                    style={{ 
                                        fontSize: regWidth * 13, 
                                        // fontWeight: "500",
                                        color: isFollow ? colors.textDark : "white",
                                        fontFamily: "NotoSansKR-Bold",
                                        includeFontPadding: false,
                                        // width: 
                                    }}
                                >
                                    {isFollow ? "Following" : "Follow"}
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
                                    fontWeight: "500",
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
                                    {followers}
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
                        {(userTag === myTag) || (profile.know_together_counts === 0) ? 
                            null
                            : 
                            <Pressable 
                                style={ styles.followedByContainer}
                                onPress={() =>  navigation.push("FollowScreen", { title: "팔로워", userTag: profile.user_tag, name: profile.name, })}
                            >
                                {profile.know_together.map((user, index) => (
                                    <Animated.Image 
                                        source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
                                        style={{
                                            ...styles.smallAvatar, 
                                            opacity: avatarValue,
                                            marginLeft: index === 0 ? 0 : -regWidth*15
                                        }} 
                                        onLoadEnd={showAvatarImage}
                                        key={index}
                                    />
                                ))}
                                <Text 
                                    style={{ 
                                        marginLeft: regWidth*11, 
                                        width: "70%", 
                                        color: "#606060" ,
                                        fontSize: regWidth * 13,
                                        fontFamily: "NotoSansKR-Medium",
                                    }}
                                    numberOfLines={2}
                                >
                                    {`Followed by ${profile.know_together.map((user, index) => `${index === 0 ? '' : ' '}${user.name}`)} ${profile.know_together_counts - profile.know_together.length === 0 ? "" : `and ${profile.know_together_counts - profile.know_together.length} other`}`}
                                </Text>
                            </Pressable>
                        }

                    </>
                }
            </Animated.View>
            {profile ? 
                <TopTab.Navigator
                    tabBar={(props) => <MyTabBar {...props} />}
                >
                    <TopTab.Screen 
                        name="Nemos" 
                        component={NemoScreen} 
                        initialParams={{ userTag: profile.user_tag }}
                    />
                    <TopTab.Screen 
                        name="NemoLists" 
                        component={NemoListScreen} 
                        initialParams={{ userTag: profile.user_tag }}
                    />
                    <TopTab.Screen 
                        name="Books" 
                        component={BookScreen} 
                        initialParams={{ userTag: profile.user_tag }}
                    />
                </TopTab.Navigator>
                :
                null
            }

        </View>
    );
};


const NemoScreen = ({route, navigation,}) => {
    const dispatch = useDispatch();
    const { userTag, } = route.params;
    const sortList = [ "recents", "book", ];
    const [sort, setSort] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const [bookmarks, setBookmarks] = useState(null);
    const [newBookmarkNum, setNewBookmarkNum] = useState(0);
    const [loading, setLoading] = useState(false);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [isList, setIsList] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBookmarkList(sort);
    }, []);

    const fetchBookmarkList = async(sortNum) => {
        try {
            // console.log(sortList[sortNum])
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemos",
                sort: sortList[sortNum],
                items: 0,
                user_tag: userTag,
            })
            .then((res) => {
                // console.log(res.data);
                // console.log("fetch Nemos");
                // setBookmarks(res.data.reverse());
                setBookmarks(res.data);
                setNewBookmarkNum(res.data.length);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchBookmarkList(sort)
        .then(() => setRefreshing(false));
    }, [sort]);


    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchBookmarkList(sortNum)
    }

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getBookmarks();
        }
    };

    const getBookmarks = async() => {
        if (bookmarks.length >= 8 && newBookmarkNum >= 8) {
            // console.log(bookmarks[bookmarks.length - 1].nemo_num);
            try {
                setScrollLoading(true);
                await Api
                .post("api/v1/user/library/", {
                    ctg: "nemos",
                    sort: sortList[sort],
                    items: bookmarks.length,
                    user_tag: userTag,
                    // cursor: bookmarks[bookmarks.length - 1].nemo_num,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setBookmarks([...bookmarks, ...res.data, ]);
                    setNewBookmarkNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
            // setCursor(bookmarks.at(-1).cursor);
        }
    };
    

    const renderBookmark = ({ item, index }) => (
        <Pressable
            onPress={() => navigation.navigate('BookmarkNewDetail', { bookmarks: bookmarks, subTitle: userTag, title: "Nemos", index: index, })} 
        >
            {isList ? 
                <BookmarkList bookmark={item} navigation={navigation} />
                : 
                <BookmarkSimple bookmark={item} navigation={navigation} />
            }
            
        </Pressable>
    );

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                // animatedIndex={{
                //     value: 0,
                // }}
            />
        ),
        []
    );
    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);

    return (
        <View style={styles.container}>
            { bookmarks && bookmarks.length !== 0 ? 
                <>
                    <FlatList 
                        data={bookmarks}
                        renderItem={renderBookmark}
                        keyExtractor={bookmark => bookmark.bookmark_id}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ref={ref}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={scrollLoading && <ActivityIndicator />}
                        ListHeaderComponent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginHorizontal: regWidth * 13,
                                    marginVertical: regHeight * 10,
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Pressable
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                    // onPress={() => navigation.navigate('UserLibrary', { test: "test", })}
                                    onPress={onPressSort}
                                >
                                    <Image 
                                        source={iconRepeat}
                                        style={{
                                            width: regWidth * 15,
                                            height: regWidth * 15,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: regWidth * 13,
                                            fontFamily: "NotoSansKR-Bold",
                                            marginHorizontal: regWidth * 5,
                                            includeFontPadding: false,
                                        }}
                                    >
                                        {sort === 0 ? "Recents" : "Book"}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setIsList(!isList)}
                                >
                                    <Image 
                                        source={isList ? iconList : iconGrid}
                                        style={{
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                        }}
                                    />
                                </Pressable>
                            </View>
                        }
                    />
                </>
                :
                <View
                    style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: regHeight * 200,
                    }}
                >
                    <Text
                        style={{
                        fontSize: regWidth * 20,
                        fontWeight: "500",
                        color: "grey",
                        }}
                    >
                        북마크를 생성해보세요
                    </Text>
                </View>
            }
            <BottomSheetModal
                index={0}
                ref={sortModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 0 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Recents
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 0 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(1)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Book
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 1 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    )
}

const NemoListScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { userTag, } = route.params;
    const [loading, setLoading] = useState(false);
    const [likedNemos, setLikedNemos] = useState(null);
    const [nemolists, setNemolists] = useState(null);
    const [newNemolistNum, setNewNemolistNum] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const sortList = [ "recents", "alphabetical", "creator", ];
    const [sort, setSort] = useState(0);
    const { shouldLibraryRefresh, } = useSelector(userSelector);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [isTile, setIsTile] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchNemoList(sort);
    }, []);


    const renderAlbum = ({ item, index }) => (
        <Pressable
            activeOpacity={1}
            onPress={() => navigation.navigate('AlbumProfile', { albumId: item.nemolist_id, })} 
        >
            {isTile ? 
                <AlbumTile album={item} navigation={navigation} isDefault={false} />
                :
                <AlbumList album={item} navigation={navigation} isDefault={false} />
            }
        </Pressable>
    )

    const fetchNemoList = async(sortNum) => {
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemolists",
                sort: sortList[sortNum],
                items: 0,
                user_tag: userTag,
            })
            .then((res) => {
                // console.log(res.data);
                // console.log("fetch Nemolists");
                setLikedNemos(res.data.Liked_Nemos);
                setNemolists(res.data.Nemolists);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getNemolist();
        }
    };

    const getNemolist = async() => {
        if (nemolists.length >= 16 && newNemolistNum >= 16) {
            try {
                setScrollLoading(true);
                await Api
                .post("api/v1/user/library/", {
                    ctg: "nemolists",
                    sort: sortList[sort],
                    items: nemolists.length,
                    user_tag: userTag,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setNemolists([...nemolists, ...res.data.Nemolists, ]);
                    setNewNemolistNum(res.data.Nemolists.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
        }
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchNemoList(sort)
        .then(() => setRefreshing(false));
    }, [sort]);

    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchNemoList(sortNum);
    }


    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );
    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);

    return (
        <View style={styles.container}>
            <FlatList 
                data={nemolists}
                renderItem={renderAlbum}
                key={isTile ? '_' : "#"}
                keyExtractor={isTile ? nemolist => "_" + nemolist.nemolist_id : nemolist => "#" + nemolist.nemolist_id}
                numColumns={isTile ? 2 : 1}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ref={ref}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={scrollLoading && <ActivityIndicator />}
                ListHeaderComponent={
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                marginHorizontal: regWidth * 13,
                                marginVertical: regHeight * 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Pressable
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                                onPress={onPressSort}
                            >
                                <Image 
                                    source={iconRepeat}
                                    style={{
                                        width: regWidth * 15,
                                        height: regWidth * 15,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: regWidth * 13,
                                        fontFamily: "NotoSansKR-Bold",
                                        marginHorizontal: regWidth * 5,
                                        includeFontPadding: false,
                                    }}
                                >
                                    Recent
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setIsTile(!isTile)}
                            >
                                <Image 
                                    source={isTile ? iconList : iconGrid}
                                    style={{
                                        width: regWidth * 20,
                                        height: regWidth * 20,
                                    }}
                                />
                            </Pressable>
                        </View>
                        {likedNemos ? 
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => navigation.navigate('AlbumProfile', { albumId: likedNemos.nemolist_id, })} 
                            >
                                {isTile ? 
                                    <AlbumTile album={likedNemos} navigation={navigation} isDefault={true} />
                                    :
                                    <AlbumList album={likedNemos} navigation={navigation} isDefault={true} />
                                }
                            </TouchableOpacity>
                            :
                            null
                        }

                    </>
                }
            />
            <BottomSheetModal
                index={0}
                ref={sortModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 0 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Recents
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 0 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(1)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Alphabetical
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 1 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(2)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 2 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Creator
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 2 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    )
}

const BookScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { userTag, } = route.params;
    const [books, setBooks] = useState(null);
    const [newBookNum, setNewBookNum] = useState(null);
    const [loading, setLoading] = useState(false);
    const sortList = [ "recents", "alphabetical", "creator", ];
    const [sort, setSort] = useState(0);
    const { shouldBookRefresh } = useSelector(userSelector);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [isBookTile, setIsBookTile] = useState(false);

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBook(sort);
    }, []);

    const fetchBook = async(sortNum) => {
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "books",
                sort: sortList[sortNum],
                items: 0,
                user_tag: userTag,
            })
            .then((res) => {
                // console.log(res.data);
                setBooks(res.data);
                setNewBookNum(res.data.length);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getBook();
        }
    };

    const getBook = async() => {
        if (books.length >= 16 && newBookNum >= 16) {
            try {
                setScrollLoading(true);
                await Api
                .post("api/v1/user/library/", {
                    ctg: "books",
                    sort: sortList[sort],
                    items: books.length,
                    user_tag: userTag,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setBooks([...books, ...res.data, ]);
                    setNewBookNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
        }
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchBook(sort)
        .then(() => setRefreshing(false));
    }, [sort]);

    const renderBook = ({ item, index }) => (
        <Pressable
            activeOpacity={1}
            onPress={() => navigation.push('BookProfile', {
                bookId: item.book_id, 
            })}
        >
            {isBookTile ? 
                <BookTile book={item} />
                :
                <BookList book={item} />
            }
        </Pressable>
    );

    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchBook(sortNum);
    }


    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );
    const sortModalRef = useRef();

    const onPressSort = useCallback(() => {
        sortModalRef.current.present();
    }, [sortModalRef]);

    const onPressClose = useCallback(() => {
        // @ts-ignore
        sortModalRef.current.dismiss();
    }, [sortModalRef]);

    return (
        <View style={styles.container}>
            <FlatList 
                data={books}
                renderItem={renderBook}
                key={isBookTile ? '_' : "#"}
                keyExtractor={isBookTile ? book => "_" + book.book_id : book => "#" + book.book_id}
                numColumns={isBookTile ? 2 : 1}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ref={ref}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={scrollLoading && <ActivityIndicator />}
                ListHeaderComponent={
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                marginHorizontal: regWidth * 13,
                                marginVertical: regHeight * 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Pressable
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                                onPress={onPressSort}
                            >
                                <Image 
                                    source={iconRepeat}
                                    style={{
                                        width: regWidth * 15,
                                        height: regWidth * 15,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: regWidth * 13,
                                        fontFamily: "NotoSansKR-Bold",
                                        marginHorizontal: regWidth * 5,
                                        includeFontPadding: false,
                                    }}
                                >
                                    {sort === 0 ? "Recents" : (sort === 1 ? "Alphabetical" : "Creator")}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setIsBookTile(!isBookTile)}
                            >
                                <Image 
                                    source={isBookTile ? iconList : iconGrid}
                                    style={{
                                        width: regWidth * 20,
                                        height: regWidth * 20,
                                    }}
                                />
                            </Pressable>
                        </View>
                    </>
                }
            />
            <BottomSheetModal
                index={0}
                ref={sortModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: "#606060", }}>
                        Sort by
                    </Text>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(0)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 0 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Recents
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 0 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(1)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Alphabetical
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 1 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => onSort(2)}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                color: sort === 2 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Creator
                        </Text>
                        <Image 
                            source={sortCheck}
                            style={{
                                width: regWidth * 20,
                                height: regWidth * 20,
                                resizeMode: "contain",
                                opacity: sort === 2 ? 1 : 0,
                            }}
                        />
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    )
}

function MyTabBar({ state, descriptors, navigation, position }) {
    const viewRef = useRef();
    const [tabBarSize, setTabBarSize] = useState(0);
    const tabRefs = useRef(
        Array.from({ length: state.routes.length }, () => createRef())
    ).current;
    const [measures, setMeasures] = useState(null);

    useEffect(() => {
        if (viewRef.current) {
          const temp = [];

          tabRefs.forEach((ref, _, array) => {
            ref.current.measureLayout(
              viewRef.current,
              (left, top, width, height) => {
                temp.push({ left, top, width, height });
                if (temp.length === array.length) {
                    // console.log(temp);
                    setMeasures(temp);
                }
              },
              () => console.log('fail')
            );
          });
        } else {
            console.log("!!");
        }
      }, [tabRefs, tabBarSize]);

    const handleTabWrapperLayout = (e) => {
        const { width } = e.nativeEvent.layout;
        // console.log(width);
        setTabBarSize(width);
    };

    const standardSize = useMemo(() => {
        if (!tabBarSize) return 0;
        return tabBarSize / state.routes.length;
    }, [tabBarSize]);

    const inputRange = useMemo(() => {
        return state.routes.map((_, i) => i);
    }, [state]);

    const indicatorScale = useMemo(() => {
        if (!measures || !standardSize) return 0;
      
        return position.interpolate({
            inputRange,
            outputRange: measures.map(
                measure => measure.width / standardSize
            ),
        });
    }, [inputRange, measures, standardSize]);

    const translateX = useMemo(() => {
        if (!measures || !standardSize) return 0;
      
        return position.interpolate({
            inputRange,
            outputRange: measures.map(
                measure =>
                measure.left - (standardSize - measure.width) / 2
            ),
        });
    }, [inputRange, measures, standardSize]);

    return (
        <View
            style={{
                borderBottomWidth: 0.3,
                marginBottom: 2,
                // backgroundColor:"green"
            }}
            ref={viewRef}
        >
            <View 
                style={{ 
                    flexDirection: 'row', 
                    paddingTop: 18, 
                    paddingBottom: 5,
                    marginHorizontal: regWidth * 37,
                    justifyContent: "space-between",
                }}
                onLayout={handleTabWrapperLayout}
            >
                {state.routes.map((route, index) => {
                    const ref = tabRefs[index];
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;
            
                    const isFocused = state.index === index;
            
                    const onPress = () => {
                        const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        });
            
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };
            
                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };
                    // modify inputRange for custom behavior
                    const inputRange = state.routes.map((_, i) => i);
                    const opacity = position.interpolate({
                        inputRange,
                        outputRange: inputRange.map(i => (i === index ? 1 : 0.6)),
                    });
            
                    return (
                        <Pressable
                            ref={ref}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{ 
                                width: "auto",
                                alignItems: "center",
                            }}
                            key={index}
                        >
                            <Animated.Text 
                                style={{ 
                                    opacity,
                                    fontSize: regWidth * 16,
                                    fontFamily: "NotoSansKR-Bold",
                                    includeFontPadding: false,
                                    // paddingHorizontal: 4,
                                    // backgroundColor: "green",
                                }}
                            >   
                                {label}
                            </Animated.Text>
                        </Pressable>

                    );
                })}
            </View>
            <Animated.View
                style={{
                    width: standardSize,
                    height: 3,
                    backgroundColor: "#7341ffcc",
                    transform: [
                        {
                          translateX,
                        },
                        {
                          scaleX: indicatorScale,
                        },
                    ],
                }}
            />
        </View>
    );
}

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
    profileAvatar: {
        width: regWidth * 100,
        height: regWidth * 100,
        resizeMode: "cover",
        borderRadius: 999,
        borderWidth: regWidth * 2,
        borderColor: "#7341ffcc",
        // marginLeft: regWidth*13,
    },
    followBtnContainer: {
        flexDirection: "row",
        justifyContent: "flex-end", 
        alignItems: "center",
        width: "100%",
        height: "30%",
        marginTop: regWidth*13,
    },
    followBtn: {
        borderRadius: regWidth * 20,
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.textDark,
        borderWidth: regWidth * 0.5, 
        paddingHorizontal: regWidth * 18,
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
        alignItems: "center",
        // height: "30%",
        marginTop: regHeight * 12,
    },
    smallAvatar: {
        width: regWidth*30, 
        height: regWidth*30,
        resizeMode: "cover",
        borderRadius: 999,
        borderWidth: regWidth * 1,
        borderColor: "#D9D9D9",
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
    sortBtn: {
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: regHeight * 24, 
        justifyContent: "space-between",
    },

    box: {
        height: 250,
        width: '100%',
    },
    boxA: {
        backgroundColor: 'white',
    },
    boxB: {
        backgroundColor: '#D8D8D8',
    },
})

export default OtherProfile;