import { StyleSheet, View, SafeAreaView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankAvatar from '../assets/images/peopleicon.png';
import vectorLeftImage from '../assets/icons/vector_left.png';
import dailyRecord from '../assets/images/dailyRecord.png';
import Api from '../lib/Api';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setAccessToken, setRefreshToken, resetRefreshToken, setAvatar, setIsAlarm, } from '../modules/user';
import { colors, regHeight, regWidth } from "../config/globalStyles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
    setShouldUserRefresh, 
} from '../modules/user';

const AlarmScreen = ({navigation}) => {
    const dispatch = useDispatch();
    const [alarms, setAlarms] = useState(null);
    const ctg = ["NS", "FS", "NL", "NLL", "TR", "ST", ];
    const answer = ["saved your Nemo.", "started following you.", "liked your Nemo.", "liked your Nemolist." ];
    const insets = useSafeAreaInsets();
    // const [whichCtg, setWhichCtg] = useState()

    useEffect(() => {
        fetchAlarm();
        dispatch(setIsAlarm(false));
    }, []);
    
    const fetchAlarm = async() => {
        try {
            await Api
            .get("/api/v1/user/alarm/")
            .then((res) => {
                console.log(res.data);
                setAlarms(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const fetchNemo = async(id) => {
        console.log(id);
        try {
            await Api
            .post("/api/v2/bookmark/read/", {
                bookmark_id: id
            })
            .then((res) => {
                console.log(res.data);
                let singleList = [];
                singleList.push(res.data);
                navigation.navigate('BookmarkNewDetail', { bookmarks: singleList, subTitle: "Notifications", title: "Nemo", index: 0, })
            })
        } catch (err) {
            console.error(err);
        }
    }

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
                        Notifications
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
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {alarms && alarms.length === 0 ? 
                    <View
                        style={{alignItems: "center", marginTop: regHeight * 28,}}
                    >
                        <Text
                            style={{
                                fontSize: regWidth * 17,
                                fontFamily: "NotoSansKR-Medium",
                                color: colors.textLight,
                            }}
                        >
                            There are no notifications for you at the moment.
                        </Text>
                    </View>
                : 
                    null
                }
                {alarms !== null && alarms.map((alarm, index) => 
                    {
                        if (alarm.alarm === "TR") {
                            return (
                                <View style={styles.alarmList} key={index} >
                                    <Image 
                                        source={dailyRecord} 
                                        style={{...styles.alarmImage, borderRadius: 0, }}
                                    />
                                    <View style={{ justifyContent: "center", width: "95%" }}>
                                        <Text 
                                            style={{ 
                                                fontSize: regWidth * 16, 
                                                fontFamily: "NotoSansKR-Bold",
                                                marginHorizontal: regWidth * 12, 
                                                color: colors.redDark,
                                                includeFontPadding: false,
                                            }}
                                        >
                                            Time to read!
                                        </Text>
                                        <Text 
                                            style={{ 
                                                fontSize: regWidth * 13, 
                                                fontFamily: "NotoSansKR-Bold",
                                                marginHorizontal: regWidth * 12, 
                                                color: colors.textDark,
                                                includeFontPadding: false,
                                            }}
                                        >
                                            Let's read what you want and create Nemo!
                                        </Text>
                                    </View>

                                </View>
                            )
                        }

                        if (alarm.alarm === "ST") {
                            return (
                                <View style={styles.alarmList} key={index} >
                                    <View  
                                        style={{        
                                            width: regWidth * 50,
                                            height: regWidth * 50, 
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: regWidth * 50,
                                                fontFamily: "NotoSansKR-Black",
                                                color: colors.nemoDark,
                                                includeFontPadding: false,
                                            }}
                                        >
                                            {alarm.detail}
                                        </Text>
                                    </View>
                                    <View style={{ justifyContent: "center", width: "95%" }}>
                                        <Text 
                                            style={{ 
                                                fontSize: regWidth * 16, 
                                                fontFamily: "NotoSansKR-Bold",
                                                marginHorizontal: regWidth * 12, 
                                                color: colors.nemoDark,
                                                includeFontPadding: false,
                                            }}
                                        >
                                            {`${alarm.detail} days streak!`}
                                        </Text>
                                        <Text 
                                            style={{ 
                                                fontSize: regWidth * 13, 
                                                fontFamily: "NotoSansKR-Bold",
                                                marginHorizontal: regWidth * 12, 
                                                color: colors.textDark,
                                                includeFontPadding: false,
                                            }}
                                        >
                                            Doing really great!
                                        </Text>
                                    </View>

                                </View>
                            )
                        }

                        if (alarm.alarm === "FS") {
                            return (
                                <View 
                                    style={styles.alarmList} 
                                    key={index}
                                >
                                    <Image 
                                        source={ alarm.avatar !== null ? { uri: alarm.avatar } : blankAvatar} 
                                        style={styles.alarmImage}
                                    />
                                    <View style={{marginLeft: regWidth * 12, width: "80%"}}>
                                        <View style={{ flexDirection: "row", }}>
                                            <Pressable
                                                style={{
                                                    maxWidth: "40%"
                                                }}
                                                onPress={() => navigation.navigate('OtherProfile', {userTag: alarm.from_usertag})}
                                            >
                                                <Text 
                                                    style={{ 
                                                        fontSize: regWidth * 16, 
                                                        fontFamily: "NotoSansKR-Bold",
                                                        color: colors.nemoDark,
                                                        includeFontPadding: false,
                                                    }}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {`@${alarm.from_usertag} `}
                                                    {/* @ㅁㄴㅇㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴㅇㄹ */}
                                                </Text>
                                            </Pressable>
                                            <Text 
                                                style={{ 
                                                    fontSize: regWidth * 16, 
                                                    fontFamily: "NotoSansKR-Medium",
                                                    includeFontPadding: false,
                                                    // width: "85%", 
                                                    // backgroundColor:"pink"
                                                }}
                                                numberOfLines={2}
                                            >
                                                started
                                            </Text>
                                        </View>
                                        <Text 
                                            style={{ 
                                                fontSize: regWidth * 16, 
                                                fontFamily: "NotoSansKR-Medium",
                                                includeFontPadding: false,
                                                // width: "85%", 
                                                // backgroundColor:"pink"
                                            }}
                                            numberOfLines={2}
                                        >
                                            following you.
                                        </Text>
                                    </View>


                                    <FollowBtn isFollow={alarm.is_follow} userTag={alarm.from_usertag} />
                                </View>
                            )
                        
                        }

                        else {
                            return (
                                <Pressable 
                                    style={styles.alarmList} 
                                    key={index}
                                    onPress={alarm.alarm === "NLL" ? 
                                        () => navigation.navigate('AlbumProfile', { albumId: alarm.detail, })
                                        : 
                                        () => fetchNemo(alarm.detail)
                                    }
                                >
                                    <Image 
                                        source={ alarm.avatar !== null ? { uri: alarm.avatar } : blankAvatar} 
                                        style={styles.alarmImage}
                                    />
                                        <Pressable
                                            style={{
                                                maxWidth: "40%"
                                            }}
                                            onPress={() => navigation.navigate('OtherProfile', {userTag: alarm.from_usertag})}
                                        >
                                            <Text 
                                                style={{ 
                                                    fontSize: regWidth * 16, 
                                                    fontFamily: "NotoSansKR-Bold",
                                                    marginLeft: regWidth * 12, 
                                                    color: colors.nemoDark,
                                                    includeFontPadding: false,
                                                    
                                                }}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {`@${alarm.from_usertag}`}
                                                {/* @ㅁㄴㅇㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴㅇㄹ */}
                                            </Text>
                                        </Pressable>
                                        <Text 
                                            style={{ 
                                                fontSize: regWidth * 16, 
                                                fontFamily: "NotoSansKR-Medium",
                                                includeFontPadding: false,
                                                // width: "85%", 
                                                // backgroundColor:"pink"
                                            }}
                                            numberOfLines={2}
                                        >
                                            {` ${answer[ctg.indexOf(alarm.alarm)]}`}
                                            {/* asdfasdfasdfasdfasdfasdfasdfaasdfasfdfsd */}
                                        </Text>
                                </Pressable>
                            )
                        }

                    }

                )}

            </ScrollView>
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
                    includeFontPadding: false,
                }}
            >
                {isFollow ? "Following" : "Follow"}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        paddingHorizontal: regWidth * 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: regHeight * 8,
      },
    alarmList: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    alarmImage: {
        width: regWidth * 50,
        height: regWidth * 50,
        borderRadius: 999,
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

export default AlarmScreen;