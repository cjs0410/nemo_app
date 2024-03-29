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
import EyeOpen from '../assets/images/EyeOpen.png';
import Arrow from '../assets/icons/LeftArrow.png';

import { useSelector, useDispatch } from 'react-redux';
import { resetRefreshToken, resetAvatar, setRefreshToken, setShouldUserRefresh, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChangeEmail1 = ({navigation, route}) => {
    const insets = useSafeAreaInsets();
    const [psw, setPsw] = useState('');
    const { profile, } = route.params;
    const [visible, setVisible] = useState(false);

    const onVerifyPsw = async() => {
        try {
            await Api
            .post("/api/v1/user/verify_password/", {
                password: psw,
            })
            .then((res) => {
                console.log(res.data);
                navigation.navigate("ChangeEmail2", {profile: profile})
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
                        secureTextEntry={visible ? false : true}
                    />
                    <Pressable
                        onPress={() => setVisible(!visible)}
                    >
                        <Image 
                            source={visible ? EyeOpen : Eye}
                            style={{
                                width: regWidth * 30,
                                height: regWidth * 30,
                                marginRight: regWidth * 8,
                            }}
                        />
                    </Pressable>
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
                        onPress={() => navigation.navigate("AccountInfo", {profile: profile})}
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

const ChangeEmail2 = ({navigation, route}) => {
    const insets = useSafeAreaInsets();
    const { profile, } = route.params;
    const [newEmail, setNewEmail] = useState('');
    const [newHpValue, setNewHpValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isDup, setIsDup] = useState(false);
    const debounceVal = useDebounce(newEmail);

    useEffect(() => {
        checkEmail();
    }, [debounceVal]);

    const checkEmail = async() => {
        if (debounceVal.length > 0) {
            console.log(debounceVal);
            try {
                await Api.post("/api/v1/user/verify_email/", {
                    email: debounceVal,
                })
                .then((res) => {
                    console.log(res.data);
                    setIsDup(false);
                })
            } catch (err) {
                if (err.response.status === 400) {
                    setIsDup(true);
                }
            }
        }
    };

    const onChangeEmail = (payload) => {
        setNewEmail(payload);
        const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/

        if (emailRegex.test(payload)) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }

    const onInputEmail = async() => {
        console.log(newEmail);
        try {
            await Api
            .post("/api/v1/user/send_authcode/", {
                hp_or_email: newEmail,
                type: "email",
            })
            .then((res) => {
                navigation.navigate("ChangeEmail3", {email: newEmail, profile: profile, })
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
                    paddingRight: insets.right,
                    justifyContent: "center",
                }}
            >
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                    includeFontPadding: false,
                }}>
                    Change email
                </Text>
            </View>
            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                    Current
                </Text>
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", marginTop: regHeight * 20, includeFontPadding: false,}}>
                    {profile.email ? profile.email : "-"}
                </Text>
            </View>
            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                    New email address
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
                        onChangeText={onChangeEmail}
                        placeholder="Email Address"
                        style={{
                            fontSize: regWidth * 17, 
                            fontFamily: "NotoSansKR-Medium",
                            width: "90%",
                            includeFontPadding: false,
                        }}
                        autoCapitalize={false}
                        keyboardType={"email-address"}
                    />
                    <Image 
                        source={iconWarning}
                        style={{
                            width: regWidth * 30,
                            height: regWidth * 30,
                            opacity: isDup ? 1 : 0,
                        }}
                    />
                </View>
                <Text
                    style={{
                        fontSize: regWidth * 12,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.redNormal,
                        opacity: isDup ? 1 : 0,
                        includeFontPadding: false,
                    }}
                >
                    That email address has been taken. Please choose another.
                </Text>
            </View>

            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: regHeight * 26,
                }}
            >
                <Pressable 
                    style={styles.btn}
                    onPress={onInputEmail}
                    disabled={isDup === false && isValid === true ? false : true}
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
                    onPress={() => navigation.navigate("AccountInfo", {profile: profile})}
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
    )
}

const ChangeEmail3 = ({navigation, route}) => {
    const dispatch = useDispatch();
    const { email, profile, } = route.params;
    const insets = useSafeAreaInsets();
    const inputRefs = useRef([]);
    const [authNumList, setAuthNumList] = useState(['', '', '', '', '', '',]);

    const onSetAuthNum = (payload, index) => {
        console.log(payload);
        if (payload.length === 6) {
            let copy = [...authNumList];
            for (i = 0; i < 6; i++) {
                copy[i] = payload[i];
                setAuthNumList(copy);
            }

            const next = inputRefs.current[5];
            next.focus();
        }
        // let copy = [...authNumList];
        // copy[index] = payload;
        // setAuthNumList(copy);

        // const next = inputRefs.current[index + 1];
        // if (next && (payload.length === 1)) {
        //     next.focus();
        // }
    }

    const onKeyPress = (e, index) => {
        const key = e.nativeEvent.key;
        console.log(key);
        if (key === "Backspace") {
            let copy = [...authNumList];
            copy[index] = '';
            setAuthNumList(copy);

            if (index !== 0) {
                const prev = inputRefs.current[index - 1];
                if (prev) {
                    prev.focus();
                }
            }
        } 
        else {
            let copy = [...authNumList];
            if (copy[index].length === 0) {
                copy[index] = key;
            } else {
                if (index < 5) {
                    copy[index + 1] = key;
                }
            }
            setAuthNumList(copy);
    
            const next = inputRefs.current[index + 1];
            if (next && (key.length === 1)) {
                next.focus();
            }
        }
    }

    const onInputAuth = async() => {
        console.log(email);
        try {
            await Api
            .post("/api/v1/user/verify_sms/", {
                hp_or_email: email,
                auth_number: authNumList.join(''),
            })
            .then(async() => {
                try {
                    await Api
                    .post("/api/v1/user/change/email/", {
                        email: email,
                    })
                    .then((res) => {
                        dispatch(setShouldUserRefresh(true));
                        Alert.alert("Your email is updated.", "", [
                            {
                                text: "OK", 
                                onPress: () => navigation.navigate("UserStorage")
                            }
                        ]);
                    })
                } catch (err) {
                    console.error(err);
                }
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
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={Arrow}
                        style={{ width: regWidth*30, height: regHeight*30 }}
                        // onLoadEnd={showLogo}
                    />
                </Pressable>
            </View>
            <View style={{ marginHorizontal: regWidth * 30, }}>
                <Text
                    style={{
                        fontSize: regWidth * 22,
                        fontFamily: "NotoSansKR-Black",
                        lineHeight: regWidth * 44,
                        color: colors.textDark,
                        includeFontPadding: false,
                    }}
                >
                    We sent you a code
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
                    {`Enter it below to verify ${email}`}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: regHeight*25, }}>
                    <TextInput 
                        style={ styles.authInput }
                        placeholderTextColor={"#000000"}
                        keyboardType="numeric"
                        // maxLength={1}
                        // caretHidden="true"
                        ref={el => inputRefs.current[0] = el}
                        onChangeText={(text) => onSetAuthNum(text, 0)}
                        onKeyPress={(e) => onKeyPress(e, 0)}
                        autoFocus={true}
                        value={authNumList[0]}
                    />
                    <TextInput 
                        style={ styles.authInput }
                        placeholderTextColor={"#000000"}
                        keyboardType="numeric"
                        maxLength={1}
                        // caretHidden="true"
                        ref={el => inputRefs.current[1] = el}
                        // onChangeText={(text) => onSetAuthNum(text, 1)}
                        onKeyPress={(e) => onKeyPress(e, 1)}
                        value={authNumList[1]}
                    />
                    <TextInput 
                        style={ styles.authInput }
                        placeholderTextColor={"#606060"}
                        keyboardType="numeric"
                        maxLength={1}
                        // caretHidden="true"
                        ref={el => inputRefs.current[2] = el}
                        // onChangeText={(text) => onSetAuthNum(text, 2)}
                        onKeyPress={(e) => onKeyPress(e, 2)}
                        value={authNumList[2]}
                    />
                    <TextInput 
                        style={ styles.authInput }
                        placeholderTextColor={"#606060"}
                        keyboardType="numeric"
                        maxLength={1}
                        // caretHidden="true"
                        ref={el => inputRefs.current[3] = el}
                        // onChangeText={(text) => onSetAuthNum(text, 3)}
                        onKeyPress={(e) => onKeyPress(e, 3)}
                        value={authNumList[3]}
                    />
                    <TextInput 
                        style={ styles.authInput }
                        placeholderTextColor={"#606060"}
                        keyboardType="numeric"
                        maxLength={1}
                        // caretHidden="true"
                        ref={el => inputRefs.current[4] = el}
                        // onChangeText={(text) => onSetAuthNum(text, 4)}
                        onKeyPress={(e) => onKeyPress(e, 4)}
                        value={authNumList[4]}
                    />
                    <TextInput 
                        style={ styles.authInput }
                        placeholderTextColor={"#606060"}
                        keyboardType="numeric"
                        maxLength={1}
                        // caretHidden="true"
                        ref={el => inputRefs.current[5] = el}
                        // onChangeText={(text) => onSetAuthNum(text, 5)}
                        onKeyPress={(e) => onKeyPress(e, 5)}
                        value={authNumList[5]}
                    />
                </View>

                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: regHeight * 26,
                    }}
                >
                    <Pressable 
                        style={styles.btn}
                        onPress={onInputAuth}
                        // disabled={isDup === false && isValid === true ? false : true}
                    >
                        <Text style={styles.btnTxt}>
                            Next
                        </Text>
                    </Pressable>
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
        textAlign: "center",
        includeFontPadding: false,
    },
})

export { ChangeEmail1, ChangeEmail2, ChangeEmail3, };