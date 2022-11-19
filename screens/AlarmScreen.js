import { StyleSheet, View, SafeAreaView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankAvatar from '../assets/images/peopleicon.png';
import Api from '../lib/Api';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setAccessToken, setRefreshToken, resetRefreshToken, setAvatar, setIsAlarm, } from '../modules/user';

const AlarmScreen = ({navigation}) => {
    const dispatch = useDispatch();
    const [alarms, setAlarms] = useState(null);
    const ctg = ["BS", "FS", "BL", ];
    const answer = ["의 북마크를 저장했습", "을 팔로우하기 시작했습", "의 북마크를 좋아합", ];
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
                setAlarms(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "500",
                }}>
                    알림
                </Text>
                <Pressable 
                    style={{ opacity: 0, }}
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </SafeAreaView>
            <ScrollView>
                {alarms !== null && alarms.map((alarm, index) => (
                    <View style={styles.alarmList} key={index} >
                        <Image 
                            source={ alarm.avatar !== null ? { uri: alarm.avatar } : blankAvatar} 
                            style={styles.alarmImage}
                        />
                        <Text 
                            style={{ fontSize: 14, fontWeight: "500", marginHorizontal: 14, width: "85%", }}
                            numberOfLines={2}
                            ellipsizeMode='tail'
                        >
                            {`${alarm.from}님이 회원님${answer[ctg.indexOf(alarm.alarm)]}니다.`}
                        </Text>
                    </View>
                ))}

            </ScrollView>
        </View>
    )
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
    alarmList: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#CBCBCB",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    alarmImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    }
})

export default AlarmScreen;