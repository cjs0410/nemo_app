import { View, SafeAreaView, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, RefreshControl, Pressable, Alert, Modal, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import { BookmarkList, AlbumList } from '../components';
import Api from "../lib/Api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import vectorLeftImage from '../assets/icons/vector_left.png';
import iconPerson from '../assets/icons/iconPerson.png';
import iconLock from '../assets/icons/iconLock.png';
import iconLoaderOutline from '../assets/icons/iconLoaderOutline.png';
import iconCheckmark from '../assets/icons/iconCheckmark.png';
import iconWarning from '../assets/icons/iconWarning.png';
import Check from '../assets/images/Check.png';
import Eye from '../assets/images/Eye.png';
import Arrow from '../assets/icons/LeftArrow.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetRefreshToken, resetAvatar, setRefreshToken, setShouldUserRefresh, resetFcmToken, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AccountInfo = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { profile, } = route.params;
    const insets = useSafeAreaInsets();
    const { fcmToken, } = useSelector(userSelector);

    const logout = async() => {
        Alert.alert(profile.name, "Are you sure you want to log out of Nemo?", [
            {
                text: "Log out",
                style: 'destructive',
                onPress: async() => {
                    const refreshToken = await AsyncStorage.getItem('refresh');
                    try {
                        await Api
                        .post("/api/v1/user/logout/", {
                            refresh_token: refreshToken,
                            fcm_token: fcmToken,
                        })
                        .then(async(res) => {
                            // navigation.popToTop();
                            await AsyncStorage.removeItem('access');
                            await AsyncStorage.removeItem('refresh');
                            dispatch(resetRefreshToken());
                            dispatch(resetAvatar());
                            dispatch(resetFcmToken());
                        })
                    } catch (err) {
                        console.error(err);
                    }
                } 
            },
            {
                text: "Cancel", 
                
            }
        ]);
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
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
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                    includeFontPadding: false,
                }}>
                    Account information
                </Text>
                <Pressable
                    style={{ opacity: 0, }}
                >
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*35, height: regWidth*35 }}
                    />
                </Pressable>
            </View>
            <View 
                style={{
                    ...styles.infoContainer,
                    marginTop: regHeight * 60,        
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }}>
                    Username
                </Text>
                <Pressable 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    onPress={() => navigation.navigate("ChangeUsername", { userTag: profile.user_tag, })}    
                >
                    <Text style={styles.infoTxt}>
                        {`@${profile.user_tag}`}
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </Pressable>
            </View>
            <View style={styles.infoContainer}>
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }}>
                    Phone
                </Text>
                <Pressable 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    onPress={() => navigation.navigate("ChangeHp1", {profile: profile,})}
                    disabled={profile.user_ctg === "APPLE" || profile.user_ctg === "GOOGLE" ? true : false}
                >
                    <Text style={styles.infoTxt}>
                        {profile.hp ? `+82 0${String(profile.hp).replace(/(\d{2})(\d{4})(\d)/, "$1-$2-$3")}` : "-" }
                    </Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={24} 
                        color={colors.textLight} 
                        style={{
                            opacity: profile.user_ctg === "APPLE" || profile.user_ctg === "GOOGLE" ? 0 : 1
                        }}
                    />
                </Pressable>
            </View>
            <View style={styles.infoContainer}>
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }}>
                    Email
                </Text>
                <Pressable 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    onPress={() => navigation.navigate("ChangeEmail1", {profile: profile,})}
                    disabled={profile.user_ctg === "APPLE" || profile.user_ctg === "GOOGLE" ? true : false}
                >
                    <Text style={styles.infoTxt}>
                        {profile.email ? profile.email : "-" }
                    </Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={24} 
                        color={colors.textLight} 
                        style={{
                            opacity: profile.user_ctg === "APPLE" || profile.user_ctg === "GOOGLE" ? 0 : 1
                        }}
                    />
                </Pressable>
            </View>
            <View style={styles.infoContainer}>
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }}>
                    Gender
                </Text>
                <Pressable 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    onPress={() => navigation.navigate("ChangeGender", {gender: profile.gender})}
                >
                    <Text style={styles.infoTxt}>
                        {profile.gender ? profile.gender : "Add"}
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </Pressable>
            </View>
            <View style={{ alignItems: "center", marginTop: regHeight * 51, }}>
                <Pressable
                    onPress={logout}
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, color: colors.redNormal,  }}>
                        Log out
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const ChangeUsername = ({navigation, route}) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { userTag, } = route.params;
    const [newUserTag, setNewUserTag] = useState(userTag);
    const debounceVal = useDebounce(newUserTag);
    const [isUsernameValid, setIsUsernameValid] = useState(false);

    useEffect(() => {
        checkUsername();
    }, [debounceVal]);

    const onChangeUsername = async() => {
        try {
            await Api
            .post("/api/v1/user/change/user_tag/", {
                username: newUserTag,
            })
            .then(async(res) => {
                await AsyncStorage.setItem('refresh', res.data.refresh);
                await AsyncStorage.setItem('access', res.data.access);
                dispatch(setRefreshToken(res.data.refresh));
                dispatch(setShouldUserRefresh(true));
                Alert.alert("Your username is updated.", "", [
                    {
                        text: "OK", 
                        onPress: () => navigation.navigate("UserStorage")
                    }
                ]);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onChangeUserTag = (payload) => {
        if (payload.length === 0) {
            setNewUserTag(userTag);
        } else {
            setNewUserTag(payload);
        }
    }

    const checkUsername = async() => {
        if (debounceVal.length > 0) {
            try {
                await Api.post("/api/v1/user/verify_username/", {
                    username: debounceVal,
                })
                .then((res) => {
                    console.log(res.data);
                    setIsUsernameValid(true);
                    // setUsernameWarning("사용 가능한 아이디입니다");
                    // setWarningColor("#008000");
                })
            } catch (err) {
                // console.error(err);
                if (err.response.status === 400) {
                    setIsUsernameValid(false);
                    // setUsernameWarning("사용할 수 없는 아이디입니다");
                    // setWarningColor("#FF4040");
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Cancel
                    </Text>
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                    includeFontPadding: false,
                }}>
                    Change username
                </Text>
                <Pressable
                    onPress={onChangeUsername}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    disabled={isUsernameValid ? false : true}
                    style={{ opacity: isUsernameValid ? 1 : 0 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Done
                    </Text>
                </Pressable>
            </View>
            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", }}>
                    Current
                </Text>
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", marginTop: regHeight * 20, includeFontPadding: false,}}>
                    {`@${userTag}`}
                </Text>
            </View>
            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                    New username
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        marginTop: regHeight * 20,
                    }}
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, }}>
                        @
                    </Text>
                    <TextInput 
                        onChangeText={onChangeUserTag}
                        style={{
                            fontSize: regWidth * 17, 
                            fontFamily: "NotoSansKR-Medium",
                            includeFontPadding: false,
                            width: "88%",
                        }}
                        autoCapitalize={false}
                    />
                    {isUsernameValid ? 
                        <Image 
                            source={Check}
                            style={{
                                width: regWidth * 25,
                                height: regWidth * 25,

                            }}
                            // onLoadEnd={showLogo}
                        />
                        :
                        null
                    }
                </View>
            </View>
        </View>
    )

}

function useDebounce(value, delay = 500) {
    const [debounceVal, setDebounceVal] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceVal(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debounceVal;
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        marginVertical: regHeight * 10,
        marginHorizontal: regWidth * 13,
        paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: regWidth * 13,
        marginVertical: regHeight * 12,
        alignItems: "center",
    },
    infoTxt: {
        fontSize: regWidth * 17, 
        fontFamily: "NotoSansKR-Medium", 
        color: colors.textLight,
        marginHorizontal: regWidth * 10,
        includeFontPadding: false,
    },
    btn: {
        width: regWidth * 300,
        height: regWidth * 60,
        backgroundColor: colors.nemoDark,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: regWidth * 30,
    },
    btnTxt: {
        fontSize: regWidth * 18,
        fontFamily: "NotoSansKR-Black", 
        color: "white",
    },
    authInput: {
        height: regHeight * 40,
        // backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
        width: regWidth*36, 
        marginTop: regHeight*30, 
        // paddingHorizontal: regWidth*10, 
        marginHorizontal: regWidth*7.5, 
        fontSize: regWidth*30, 
        fontFamily: "NotoSansKR-Black", 
        includeFontPadding: false,
        textAlign: "center"
    },
})

export default AccountInfo;
export { ChangeUsername, };