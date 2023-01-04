import { 
    View, 
    SafeAreaView,
    Text, 
    Button, 
    StyleSheet, 
    Image, 
    ScrollView, 
    Dimensions, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl,
    Pressable,
    Animated,
    FlatList,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, createRef, useMemo, forwardRef, } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons';
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SelectDropdown from 'react-native-select-dropdown';
import { Card, BookmarkTile, BookmarkList, AlbumList } from '../components';
import Api from "../lib/Api";
import AsyncStorage from '@react-native-async-storage/async-storage';

import blankBookCover from '../assets/images/blankBookImage.png';
import userImage from '../assets/images/userImage.jpeg';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { 
    resetUserInfo, 
    setRefreshToken, 
    resetRefreshToken, 
    setShouldHomeRefresh, 
    setShouldLibraryRefresh, 
    setShouldUserRefresh, 
    setIsAlarm, 
    resetAvatar, 
    setAvatar, 
    setIsStaff, 
} from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';
import blankAvatar from '../assets/images/peopleicon.png';
import sortCheck from '../assets/images/sortCheck.png';
import iconRepeat from '../assets/icons/iconRepeat.png';
import iconGrid from '../assets/icons/iconGrid.png';
import iconNemolist from '../assets/icons/iconNemolist.png';
import iconBook from '../assets/icons/iconBook.png';
import iconAlarm from '../assets/icons/iconAlarm.png';
import { colors, regHeight, regWidth } from "../config/globalStyles";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
// import BottomSheet from '@gorhom/bottom-sheet';
import { Portal, PortalHost } from '@gorhom/portal';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const TopTab = createMaterialTopTabNavigator();

const UserLibrary = ({navigation, route }) => {
    const dispatch = useDispatch();
    const { isAlarm, avatar, } = useSelector(userSelector);
    const [loading, setLoading] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    // const snapPoints = useMemo(() => ['25%','65%'], []);


    useEffect(() => {
        fetchRefreshToken();
    }, []);

    useEffect(() => {
        if (route.params) {
            console.log(route.params.test);
        }
    }, [route.params])

    const fetchRefreshToken = async() => {
        const refreshToken = await AsyncStorage.getItem('refresh');
        if (refreshToken !== null) {
            try {
            await Api.post("/api/v1/user/reissue/", {
                refresh_token: refreshToken,
            })
            .then(async(res) => {
                try {
                    // console.log("reissue!", res.data.refresh);
                    // console.log(res.data);
                    await AsyncStorage.setItem('refresh', res.data.refresh)
                    .then(async() => await AsyncStorage.setItem('access', res.data.access))
                    .then(() => {
                        fetchAvatar();
                        fetchNewAlarm();
                    })
                    dispatch(setRefreshToken(res.data.refresh));
                    // console.log(res.data.is_staff);
                    dispatch(setIsStaff(res.data.is_staff));
                } catch (err) {
                    console.error(err);
                }
            })
            } catch (err) {
                if (err.response.status === 404) {
                    await AsyncStorage.removeItem('access');
                    await AsyncStorage.removeItem('refresh');
                    dispatch(resetRefreshToken());
                    dispatch(resetAvatar());
                } else {
                    console.error(err);
                }
            }
        }
    }

    const fetchAvatar = async() => {
        // const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .get("/api/v1/user/avatar/")
            .then((res) => {
                // console.log("avatar!", refreshToken);
                // console.log(res.data);
                dispatch(setAvatar(res.data.avatar));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchNewAlarm = async() => {
        // const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .get("/api/v1/user/new_alarm/")
            .then((res) => {
                // console.log("alarm!", refreshToken);
                dispatch(setIsAlarm(res.data.alarm));
            })
        } catch (err) {
            console.error(err);
        }
    }

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
    const plusModalRef = useRef();
    const sortModalRef = useRef();

    const onPressPlus = useCallback(() => {
        plusModalRef.current.present();
    }, [plusModalRef]);


    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable
                        onPress={() => navigation.navigate('UserStorage')}
                    >
                        <Image 
                            source={ avatar !== null ? { uri: avatar } : blankAvatar} 
                            style={{        
                                width: regWidth * 32,
                                height: regWidth * 32,
                                resizeMode: "cover",
                                borderRadius: 50,
                                borderColor: "black",
                            }} 
                        />
                    </Pressable>
                    <Text style={{
                        fontSize: 24,
                        fontWeight: "900",
                        marginHorizontal: regWidth * 10,
                    }}>
                        My Library
                    </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        onPress={onPressPlus}
                    >
                        <Feather name="plus" size={regWidth * 35} color="black" style={{ marginRight: 24, }}/>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('AlarmScreen')}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        // style={{ backgroundColor: "pink"}}
                    >
                        {/* <Feather name="bell" size={28} color="black" /> */}
                        <Image 
                            source={iconAlarm}
                            style={{
                                width: regWidth * 35,
                                height: regWidth * 35,
                                resizeMode: 'contain',
                            }}
                        />
                        {isAlarm ? 
                            <View
                                style={{
                                    position: "absolute",
                                    backgroundColor: "#7341ffcc",
                                    borderRadius: 50,
                                    height: regWidth * 8,
                                    width: regWidth * 8,
                                    right: 0,
                                }}
                            >
                            </View>
                            : 
                            null
                        }
                    </Pressable>
                </View>
            </SafeAreaView>
            
            <TopTab.Navigator
                tabBar={(props) => <MyTabBar {...props} />}
            >
                <TopTab.Screen 
                    name="Nemos" 
                    component={NemoScreen} 
                    // initialParams={{ sortModalRef: sortModalRef, }}
                />
                <TopTab.Screen name="NemoLists" component={NemoListScreen} />
                <TopTab.Screen name="Books" component={BookScreen} />
            </TopTab.Navigator>

            <BottomSheetModal
                index={0}
                ref={plusModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                        Create
                    </Text>
                    <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                        <Image 
                            source={iconNemolist}
                            style={{
                                height: regWidth * 39,
                                width: regWidth * 39,
                                resizeMode: "contain",
                            }}
                        />
                        <View>
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                New Nemolist
                            </Text>
                            <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                Add Nemos to a new Nemolist
                            </Text>
                        </View>
                    </Pressable>
                    <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                        <Image 
                            source={iconBook}
                            style={{
                                height: regWidth * 39,
                                width: regWidth * 39,
                                resizeMode: "contain",
                            }}
                        />
                        <View>
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                New Book
                            </Text>
                            <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                Add new Book to your library
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    )
}

const NemoScreen = ({route, navigation}) => {
    const dispatch = useDispatch();
    // const { sortModalRef, } = route.params;
    const [loading, setLoading] = useState(false);
    const [bookmarks, setBookmarks] = useState(null);
    const { shouldLibraryRefresh } = useSelector(userSelector);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const sortList = [ "recents", "book", ];
    const [sort, setSort] = useState(0)

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchBookmarkList(sort);
    }, []);

    useEffect(() => {
        if (shouldLibraryRefresh === true) {
            fetchBookmarkList();
            dispatch(setShouldLibraryRefresh(false));
        }
    }, [shouldLibraryRefresh]);

    const renderBookmark = ({ item, index }) => (
        <Pressable
            onPress={() => navigation.navigate('BookmarkNewDetail', { bookmarks: bookmarks, subTitle: "My Library", title: "Bookmarks", index: index, })} 
        >
            <BookmarkList bookmark={item} navigation={navigation} />
        </Pressable>
    )

    const fetchBookmarkList = async(sortNum) => {
        console.log(sortList[sortNum])
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemos",
                // sort: "recents",
                sort: sortList[sortNum],
            })
            .then((res) => {
                // console.log(res.data);
                setBookmarks(res.data.reverse());
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
    }, []);


    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchBookmarkList(sortNum)
    }


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
                                            fontSize: 13,
                                            fontWeight: "700",
                                            marginHorizontal: regWidth * 5,
                                        }}
                                    >
                                        Recent
                                    </Text>
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
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
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

const NemoListScreen = ({navigation}) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [likedNemos, setLikedNemos] = useState(null);
    const [nemolists, setNemolists] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const sortList = [ "recents", "alphabetical", "creator", ];
    const [sort, setSort] = useState(0)

    const ref = useRef();
    useScrollToTop(ref);

    useEffect(() => {
        fetchAlbum(sort);
    }, []);

    const renderAlbum = ({ item, index }) => (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => navigation.navigate('AlbumProfile', { albumId: item.album_id, })} 
        >
            <AlbumList album={item} navigation={navigation} isDefault={false} />
        </TouchableOpacity>
    )

    const fetchAlbum = async(sortNum) => {
        console.log(sortList[sortNum])
        try {
            setLoading(true);
            await Api
            .post("api/v1/user/library/", {
                ctg: "nemolists",
                sort: sortList[sortNum],
                cursor: "",
            })
            .then((res) => {
                console.log(res.data);
                setLikedNemos(res.data.Liked_Nemos);
                setNemolists(res.data.Nemolists);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        await fetchAlbum(sort)
        .then(() => setRefreshing(false));
    }, []);

    const onSort = (sortNum) => {
        setSort(sortNum);
        onPressClose();
        fetchAlbum(sortNum);
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
                keyExtractor={album => album.album_id}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ref={ref}
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
                                        fontSize: 13,
                                        fontWeight: "700",
                                        marginHorizontal: regWidth * 5,
                                    }}
                                >
                                    Recent
                                </Text>
                            </Pressable>
                            <Pressable>
                                <Image 
                                    source={iconGrid}
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
                                <AlbumList album={likedNemos} navigation={navigation} isDefault={true} />
                            </TouchableOpacity>
                            :
                            null
                        }

                    </>
                }
            />

            {/* { nemolists && nemolists.length !== 0 ? 
                <FlatList 
                    data={nemolists}
                    renderItem={renderAlbum}
                    keyExtractor={album => album.album_id}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ref={ref}
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
                                            fontSize: 13,
                                            fontWeight: "700",
                                            marginHorizontal: regWidth * 5,
                                        }}
                                    >
                                        Recent
                                    </Text>
                                </Pressable>
                                <Pressable>
                                    <Image 
                                        source={iconGrid}
                                        style={{
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                        }}
                                    />
                                </Pressable>
                            </View>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => navigation.navigate('AlbumProfile', { albumId: item.album_id, })} 
                            >
                                <AlbumList album={item} navigation={navigation} />
                            </TouchableOpacity>
                        </>
                    }
                />
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
                        앨범을 생성해보세요
                    </Text>
                </View>
            } */}
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
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
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

const BookScreen = () => {
    return (
        <View style={styles.container}>
            <Text>
                books
            </Text>
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
                                    fontWeight: "700",
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
      // backgroundColor: "red",
      marginVertical: 10,
      marginHorizontal: 20,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
    sortBtn: {
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: regHeight * 24, 
        justifyContent: "space-between",
    }
})

export default UserLibrary;