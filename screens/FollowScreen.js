import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, Animated, } from "react-native";
import React, { useEffect, useState, useRef, useMemo, useCallback, createRef, } from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Api from "../lib/Api";
import blankAvatar from '../assets/images/blankAvatar.png';
import vectorLeftImage from '../assets/icons/vector_left.png';
import { AlbumList, BookList, UserList, } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors, regHeight, regWidth } from "../config/globalStyles";

import { 
    setShouldUserRefresh,
    setShouldFollowingRefresh, 
} from '../modules/user';
import { useSelector, useDispatch } from "react-redux";
import { userSelector } from "../modules/hooks";

const TopTab = createMaterialTopTabNavigator();

const FollowScreen = ({navigation, route}) => {
    const { title, userTag, name } = route.params;
    const [users, setUsers] = useState(null);
    const insets = useSafeAreaInsets();

    // useEffect(() => {
    //     fetchUser();
    //     console.log(userTag);
    // }, [])

    // const fetchUser = async() => {
    //     try {
    //         if (title === "팔로잉") {
    //             await Api
    //             .post("/api/v1/user/follow_list/", {
    //                 user_tag: userTag,
    //                 ctg: "followings"
    //             })
    //             .then((res) => {
    //                 console.log(res.data);
    //                 // setUsers(res.data);
    //             })
    //         }
    //         if (title === "팔로워") {
    //             await Api
    //             .post("/api/v1/user/follow_list/", {
    //                 user_tag: userTag,
    //                 ctg: "followers"
    //             })
    //             .then((res) => {
    //                 console.log(res.data);
    //                 // setUsers(res.data);
    //             })
    //         }

    //     } catch (err) {
    //         console.error(err);
    //     }
    // }
    
    return (
        <View style={styles.container}>
            <View 
                style={{
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }}
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    >
                        <Image 
                            source={vectorLeftImage} 
                            style={{ width: regWidth*35, height: regWidth*35 }}
                        />
                    </Pressable>
                    <Text style={{
                        fontSize: regWidth * 16,
                        fontFamily: "NotoSansKR-Bold",
                    }}>
                        {name}
                    </Text>
                    <Pressable
                        style={{ opacity: 0, }}
                    >
                        <Image 
                            source={vectorLeftImage} 
                            style={{ width: regWidth*30, height: regWidth*30 }}
                        />
                    </Pressable>
                </View>
            </View>
            <TopTab.Navigator
                tabBar={(props) => <MyTabBar {...props} />}
                initialRouteName={title === "팔로워" ? "Followers" : "Following"}
            >
                <TopTab.Screen 
                    name="Followers" 
                    component={FollowerScreen} 
                    initialParams={{ ctg: title, userTag: userTag, }}
                />
                <TopTab.Screen 
                    name="Following" 
                    component={FollowingScreen} 
                    initialParams={{ ctg: title, userTag: userTag, }}
                />
            </TopTab.Navigator>
            {/* <ScrollView>
                {users !== null && users.map((user, index) => (
                    <Pressable 
                        style={styles.userList} 
                        key={index}
                        onPress={() => navigation.push('OtherProfile', { userTag: user.user_tag, })}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <Image 
                                source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
                                style={styles.userImage}
                            />
                            <View style={{ marginHorizontal: 8, }}>
                                <Text style={{ fontSize: 18, fontWeight: "600", }} >{user.name}</Text>
                                <Text style={{ fontSize: 13, fontWeight: "400", color: "#008000", }} >{`@${user.user_tag}`}</Text>
                            </View>
                        </View>
                    </Pressable>
                ))}

            </ScrollView> */}
        </View>
    );
}

const FollowerScreen = ({navigation, route}) => {
    const { userTag, } = route.params;
    const [users, setUsers] = useState(null);
    const [myTag, setMyTag] = useState(null);

    useEffect(() => {
        fetchUser();
        fetchMyTag();
    }, [])

    const fetchUser = async() => {
        try {
            await Api
            .post("/api/v1/user/follow_list/", {
                user_tag: userTag,
                ctg: "followers"
            })
            .then((res) => {
                console.log(res.data);
                setUsers(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchMyTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setMyTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            {users && users.length !== 0 ? 
                <ScrollView>
                    {users && users.map((user, index) => (
                        <View style={{ justifyContent: "center" }} key={index}>
                            <Pressable
                                onPress={() => navigation.push("OtherProfile", { userTag: user.user_tag,  })}
                            >
                                <UserList user={user} navigation={navigation} key={index} />
                            </Pressable>
                            {user.user_tag === myTag ? 
                                null
                                : 
                                <FollowBtn isFollow={user.is_follow} userTag={user.user_tag} />
                            }
                            
                        </View>
                    ))}
                </ScrollView>
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
                        fontSize: regWidth * 17,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.textDark,
                        }}
                    >
                        No one followed you yet...
                    </Text>
                </View>
            }

        </View>
    )
}

const FollowBtn = (props) => {
    const dispatch = useDispatch();
    const [isFollow, setIsFollow] = useState(props.isFollow);
    const userTag = props.userTag;

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
                dispatch(setShouldUserRefresh(true));
                dispatch(setShouldFollowingRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Pressable 
            style={{
                ...styles.followBtn,
                backgroundColor: isFollow ? "white" : colors.textNormal,
                position: "absolute",
                right: 0,
                marginHorizontal: regWidth * 8,
            }} 
            onPress={onFollow}
        >
            <Text 
                style={{ 
                    fontSize: regWidth * 13, 
                    color: isFollow ? colors.textDark : "white",
                    fontFamily: "NotoSansKR-Bold",
                }}
            >
                {isFollow ? "Following" : "Follow"}
            </Text>
        </Pressable>
    )
}

const FollowingScreen = ({navigation, route}) => {
    const dispatch = useDispatch();
    const { userTag, } = route.params;
    const [users, setUsers] = useState(null);
    const { shouldFollowingRefresh, } = useSelector(userSelector);

    useEffect(() => {
        if (shouldFollowingRefresh === true) {
            fetchUser();
            dispatch(setShouldFollowingRefresh(false));
        }
    }, [shouldFollowingRefresh]);

    useEffect(() => {
        fetchUser();
    }, [])

    const fetchUser = async() => {
        try {
            await Api
            .post("/api/v1/user/follow_list/", {
                user_tag: userTag,
                ctg: "following"
            })
            .then((res) => {
                console.log(res.data);
                setUsers(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            {users && users.length !== 0 ? 
                <ScrollView>
                    {users && users.map((user, index) => (
                        <Pressable
                            onPress={() => navigation.push("OtherProfile", { userTag: user.user_tag,  })}
                            key={index}
                        >
                            <UserList user={user} navigation={navigation} />
                        </Pressable>
                    ))}
                </ScrollView>
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
                        fontSize: regWidth * 17,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.textDark,
                        }}
                    >
                        Ooops..! You're not following anyone.
                    </Text>
                </View>
            }

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
                borderColor: colors.bgdLight,
            }}
            ref={viewRef}
        >
            <View 
                style={{ 
                    flexDirection: 'row', 
                    paddingTop: 18, 
                    paddingBottom: 5,
                    marginHorizontal: regWidth * 37,
                    justifyContent: "space-around"
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
                                    // fontWeight: "700",
                                    fontFamily: "NotoSansKR-Bold",
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
        // backgroundColor: '(0, 0, 0, 0.5)',
    },
    header: {
      paddingHorizontal: regWidth * 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: regHeight * 8,
    },
    userList: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#CBCBCB",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    },
    followBtn: {
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.textDark,
        borderWidth: 0.5, 
        paddingHorizontal: regWidth * 18,
        paddingVertical: regHeight * 5,
    },
})

export default FollowScreen;