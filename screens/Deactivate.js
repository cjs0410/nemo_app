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
import { resetRefreshToken, resetAvatar, setRefreshToken, setShouldUserRefresh, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Deactivate1 = ({navigation, route}) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { profile, } = route.params;

    const onDelete = () => {
        Alert.alert( profile.name, "Are you sure you want to delete your account? This is permanent.", [
            {
                text: "Delete", 
                style: 'destructive',
                onPress: () => deleteAccount()
            },
            {
                text: "Cancel", 
            }
        ]);
    }

    const deleteAccount = async() => {
        try {
            await Api
            .get("/api/v1/user/deactivate/")
            .then(async(res) => {
                await AsyncStorage.removeItem('access');
                await AsyncStorage.removeItem('refresh');
                dispatch(resetRefreshToken());
                dispatch(resetAvatar());
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container} >
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
                    Delete your account
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
            <View style={{ marginHorizontal: regWidth * 13, marginTop: regHeight * 28, }}>
                <Text
                    style={{
                        fontSize: regWidth * 16,
                        fontFamily: "NotoSansKR-Bold",
                        color: colors.textDark,
                        includeFontPadding: false,
                    }}
                >
                    This will permanently delete your account
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 12,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.textNormal,
                        marginTop: regHeight * 18,
                        includeFontPadding: false,
                    }}
                >
                    You’re about to start the process of deleting your Nemo account. Your display name, @username, and public profile will no longer be viewable on Nemo for iOS, or Nemo for Android.
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 16,
                        fontFamily: "NotoSansKR-Bold",
                        color: colors.textDark,
                        marginTop: regHeight * 33,
                        includeFontPadding: false,
                    }}
                >
                    What else you should know
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 12,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.redNormal,
                        marginTop: regHeight * 18,
                        includeFontPadding: false,
                    }}
                >
                    This process is irrevocable. You can not restore your Nemo account and Nemo database.                   </Text>
                <Text
                    style={{
                        fontSize: regWidth * 12,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.textNormal,
                        includeFontPadding: false,
                    }}
                >
                    {"\nSome account information may still be available in search engines, such as Google or Naver."}
                </Text>
                <View style={{ alignItems: "center", marginTop: regHeight * 51, }}>
                    <Pressable
                        onPress={() => {
                            if (profile.user_ctg === "APPLE" || profile.user_ctg === "GOOGLE") {
                                onDelete();
                            } else {
                                navigation.navigate("Deactivate2", {profile: profile,});
                            }
                            
                        }}
                    >
                        <Text style={{ fontSize: regWidth * 17, fontWeight: "700", color: colors.redNormal, includeFontPadding: false, }}>
                            Delete
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const Deactivate2 = ({navigation, route}) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const [psw, setPsw] = useState('');
    const { profile, } = route.params;

    const onVerifyPsw = async() => {
        try {
            await Api
            .post("/api/v1/user/verify_password/", {
                password: psw,
            })
            .then((res) => {
                console.log(res.data);
                // navigation.navigate("ChangeEmail2", {profile: profile})
                Alert.alert( profile.name, "Are you sure you want to delete your account? This is permanent.", [
                    {
                        text: "Delete", 
                        style: 'destructive',
                        onPress: () => deleteAccount()
                    },
                    {
                        text: "Cancel", 
                    }
                ]);
                // deleteAccount();
            })
        } catch (err) {
            console.error(err);
        }
    }

    const deleteAccount = async() => {
        try {
            await Api
            .get("/api/v1/user/deactivate/")
            .then(async(res) => {
                await AsyncStorage.removeItem('access');
                await AsyncStorage.removeItem('refresh');
                dispatch(resetRefreshToken());
                dispatch(resetAvatar());
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container} >
            <View
                style={{
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                    marginTop: regHeight * 60,
                    marginHorizontal: regWidth * 30,
                }}
            >
                <Text
                    style={{
                        fontSize: regWidth * 22,
                        fontFamily: "NotoSansKR-Black",
                        lineHeight: regWidth * 44,
                        color: colors.textDark,
                        includeFontPadding: false,
                    }}
                >
                    Verify your password
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 13,
                        fontFamily: "NotoSansKR-Medium",
                        lineHeight: regWidth * 20,
                        color: colors.textLight,
                        includeFontPadding: false,
                    }}
                >
                    re-enter your Nemo password to continue.
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 13,
                        fontFamily: "NotoSansKR-Regular",
                        lineHeight: regWidth * 20,
                        color: colors.textLight,
                        marginTop: regHeight * 50,
                        includeFontPadding: false,
                    }}
                >
                    Password
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        marginTop: regHeight * 20,
                        paddingBottom: regHeight * 4,
                    }}
                >
                    <TextInput 
                        onChangeText={(payload) => setPsw(payload)}
                        style={{
                            fontSize: regWidth * 17, 
                            fontFamily: "NotoSansKR-Medium",
                            width: "90%",
                            includeFontPadding: false,
                        }}
                        secureTextEntry={true}
                    />
                    <Image 
                        source={Eye}
                        style={{
                            width: regWidth * 25,
                            height: regWidth * 25,
                            marginRight: regWidth * 8,

                        }}
                    />
                </View>
                <View
                style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: regHeight * 80,
                    }}
                >
                    <Pressable 
                        style={styles.btn}
                        onPress={onVerifyPsw}
                    >
                        <Text style={styles.btnTxt}>
                            Delete
                        </Text>
                    </Pressable>
                    <Pressable
                        style={{
                            borderBottomWidth: 1,
                            borderColor: colors.textNormal,
                            marginTop: regHeight * 8,
                        }}
                        onPress={() => navigation.navigate("UserSetting", {profile: profile})}
                    >
                        <Text
                            style={{
                                fontSize: regWidth * 18,
                                fontFamily: "NotoSansKR-Bold", 
                                color: colors.textNormal,
                                includeFontPadding: false,
                            }}
                        >
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
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
    btn: {
        width: regWidth * 300,
        height: regWidth * 60,
        backgroundColor: colors.redNormal,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: regWidth * 30,
    },
    btnTxt: {
        fontSize: regWidth * 18,
        fontFamily: "NotoSansKR-Black", 
        color: "white",
    },
})

export {Deactivate1, Deactivate2};