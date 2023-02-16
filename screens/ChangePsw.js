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

const ChangePsw1 = ({navigation, route}) => {
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
                navigation.navigate("ChangePsw2", {profile: profile})
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
                        includeFontPadding: false,
                        color: colors.textDark,
                    }}
                >
                    Verify your password
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 13,
                        fontFamily: "NotoSansKR-Medium",
                        includeFontPadding: false,
                        color: colors.textLight,
                    }}
                >
                    re-enter your Nemo password to continue.
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 13,
                        fontFamily: "NotoSansKR-Regular",
                        includeFontPadding: false,
                        color: colors.textLight,
                        marginTop: regHeight * 50,
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
                            Next
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
    );
}

const ChangePsw2 = ({navigation, route}) => {
    const { profile, } = route.params;
    const insets = useSafeAreaInsets();
    const [psw, setPsw] = useState('');
    const [pswCheck, setPswCheck] = useState('');
    const [isPswValid, setIsPswValid] = useState(false);
    const [isPswCheckValid, setIsPswCheckValid] = useState(false);
    const isValid = isPswValid && isPswCheckValid;

    const onChangePsw = (payload) => {
        const pswRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/
        setPsw(payload);

        if (pswRegex.test(payload)) {
            setIsPswValid(true);
        } else {
            setIsPswValid(false);
        }

        if ((payload === pswCheck)) {
            setIsPswCheckValid(true);
        } else {
            setIsPswCheckValid(false);
        }
    }

    const onChangePswCheck = (payload) => {
        setPswCheck(payload);
        if (psw === payload) {
            setIsPswCheckValid(true);
        } else {
            setIsPswCheckValid(false);
        }
    }

    const changePassword = async() => {
        try {
            await Api
            .post("/api/v1/user/change/password/", {
                new_password1: psw,
                new_password2: pswCheck,
            })
            .then((res) => {
                console.log(res.data);
                Alert.alert("Your password is updated.", "", [
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
                    onPress={() => navigation.navigate("UserSetting", {profile: profile})}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Cancel
                    </Text>
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                }}>
                    Change password
                </Text>
                <Pressable
                    onPress={changePassword}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    disabled={isValid ? false : true}
                    style={{ opacity: isValid ? 1 : 0 }}
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
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                    New password
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
                        onChangeText={onChangePsw}
                        placeholder="At least 8 characters"
                        style={{
                            fontSize: regWidth * 17, 
                            fontFamily: "NotoSansKR-Medium",
                            width: "90%",
                            includeFontPadding: false,
                        }}
                        autoCapitalize={false}
                        secureTextEntry={true}
                    />
                    <Image 
                        source={iconWarning}
                        style={{
                            width: regWidth * 30,
                            height: regWidth * 30,
                            opacity: psw.length > 0 && !isPswValid ? 1 : 0,
                        }}
                    />
                </View>
                <Text
                    style={{
                        fontSize: regWidth * 12,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.redNormal,
                        opacity: psw.length > 0 && !isPswValid ? 1 : 0,
                        includeFontPadding: false,
                    }}
                >
                    {"Make sure to use letters, numbers, and specials(!@#$%^*+-)"}
                </Text>
            </View>

            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", }}>
                    Confirm password
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
                        onChangeText={onChangePswCheck}
                        placeholder="At least 8 characters"
                        style={{
                            fontSize: regWidth * 17, 
                            fontFamily: "NotoSansKR-Medium",
                            width: "90%",
                            includeFontPadding: false,
                        }}
                        autoCapitalize={false}
                        secureTextEntry={true}
                    />
                    <Image 
                        source={iconWarning}
                        style={{
                            width: regWidth * 30,
                            height: regWidth * 30,
                            opacity: pswCheck.length > 0 && !isPswCheckValid ? 1 : 0,
                        }}
                    />
                </View>
                <Text
                    style={{
                        fontSize: regWidth * 12,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.redNormal,
                        opacity: pswCheck.length > 0 && !isPswCheckValid ? 1 : 0,
                        includeFontPadding: false,
                    }}
                >
                    Confirm password is differ from your new password.
                </Text>
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
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: regWidth * 13,
        marginVertical: regHeight * 12,
        alignItems: "center",
    },
    infoTxt: {
        fontSize: regWidth * 17, 
        fontWeight: "500", 
        color: colors.textLight,
        marginHorizontal: regWidth * 10,
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
        includeFontPadding: false,
    },
})

export {ChangePsw1, ChangePsw2, };