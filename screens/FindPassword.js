import { View, SafeAreaView, ScrollView, Text, Button, StyleSheet, TouchableOpacity, Dimensions, TextInput, Pressable, Image, Animated, Alert, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import vectorLeftImage from '../assets/icons/vector_left.png';
import Arrow from '../assets/icons/LeftArrow.png';
import iconWarning from '../assets/icons/iconWarning.png';
import Eye from '../assets/images/Eye.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import Api from '../lib/Api';
import NemoLogo from '../assets/images/NemoLogo(small).png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FindPassword = ({navigation}) => {
    const insets = useSafeAreaInsets();
    const logoValue = useRef(new Animated.Value(0)).current;
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [targetEmail, setTargetEmail] = useState('');

    const [hpOrEmail, setHpOrEmail] = useState('');
    const [hpOrEmailValue, setHpOrEmailValue] = useState('');
    const [type, setType] = useState("hp");

    const onChangeUsername = (payload) => setUsername(payload);
    const onChangePhoneNumber = (payload) => setPhoneNumber(payload);
    const onChangeEmail = (payload) => setTargetEmail(payload);

    const onChangeHpOrEmail = (payload) => {
        setHpOrEmail(payload);
        setHpOrEmailValue(payload);
        const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        const hpRegex = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/
        const hpValueRegex = /^\d{2,3}-\d{3,4}-\d{4}$/
    
        if (emailRegex.test(payload)) {
            setHpOrEmail(payload);
            setHpOrEmailValue(payload);
            setType("email");
            // setIsHpOrEmailValid(true);
        } else {
            if (hpRegex.test(payload) || hpValueRegex.test(payload)) {
                setHpOrEmail(payload.replace(/-/g, ''));
                setHpOrEmailValue(payload.replace(/(\d{3})(\d{4})(\d)/, "$1-$2-$3"));
                setType("hp");
                // setIsHpOrEmailValid(true);
            } else {
                // setIsHpOrEmailValid(false);
            }
        }
    }

    const verifyUser = async() => {
        try {
            console.log(hpOrEmail, type);
            await Api
            .post("/api/v1/user/forgot_password/", {
                hp_or_email: hpOrEmail,
                type: type,
            })
            .then(async(res) => {
                try {
                    await Api
                    .post("/api/v1/user/send_authcode/", {
                        hp_or_email: hpOrEmail,
                        type: type,
                    })
                    .then((res) => {
                        navigation.navigate('FindPassword2', {hpOrEmail: hpOrEmail});
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
                    <Text
                        style={{
                            fontSize: regWidth * 16,
                            fontFamily: "NotoSansKR-Regular",
                            includeFontPadding: false,
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </View>
            <View style={{ marginHorizontal: regWidth * 24, marginTop: regHeight * 28, }}>
                <Text
                    style={{
                        fontSize: regWidth * 20,
                        fontFamily: "NotoSansKR-Black",
                        includeFontPadding: false,
                    }}
                >
                    Enter phone number or email
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 20,
                        fontFamily: "NotoSansKR-Black",
                        includeFontPadding: false,
                    }}
                >
                    address of your account
                </Text>
                <TextInput 
                    placeholder="Phone number or email address"
                    style={{
                        width: "100%",
                        // backgroundColor:"pink",
                        borderBottomWidth: regWidth * 1,
                        borderBottomColor: colors.textLight,
                        marginTop: regHeight * 42,
                        fontSize: regWidth * 16,
                        fontFamily: "NotoSansKR-Regular",
                        includeFontPadding: false,
                    }}
                    multiline={true}
                    onChangeText={onChangeHpOrEmail}
                    autoCapitalize="none"
                    value={hpOrEmailValue}
                    // onChangeText={(payload) => setFeedback(payload)}
                />
                <View
                   style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: regHeight * 80,
                    }}
                >
                    <Pressable 
                        style={styles.btn}
                        onPress={verifyUser}
                    >
                        <Text style={styles.btnTxt}>
                            Continue
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const FindPassword2 = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { hpOrEmail, } = route.params;
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
        try {
            await Api
            .post("/api/v1/user/verify_sms/", {
                hp_or_email: hpOrEmail,
                auth_number: authNumList.join(''),
            })
            .then((res) => {
                navigation.navigate('FindPassword3', { hpOrEmail: hpOrEmail, });
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
                    {`Enter it below to verify phone number or email.`}
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

const FindPassword3 = ({navigation, route}) => {
    const insets = useSafeAreaInsets();
    const { hpOrEmail, } = route.params;
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
            .post("/api/v1/user/reset_password/", {
                new_password1: psw,
                new_password2: pswCheck,
                hp_or_email: hpOrEmail,
            })
            .then((res) => {
                console.log(res.data);
                Alert.alert("Your password is updated.", "", [
                    {
                        text: "OK", 
                        onPress: () => navigation.navigate("Login")
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
                    // onPress={() => navigation.navigate("UserSetting", {profile: profile})}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    style={{opacity: 0,}}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, }}>
                        Done
                    </Text>
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                    includeFontPadding: false,
                }}>
                    Change password
                </Text>
                <Pressable
                    onPress={changePassword}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    disabled={isValid ? false : true}
                    style={{ opacity: isValid ? 1 : 0 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, }}>
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
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }}>
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
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }}>
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
        marginHorizontal: regWidth * 20,
        paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    input: {
        height: regHeight * 50,
        backgroundColor: "#EEEEEE",
        // paddingVertical: regHeight * 10,
        paddingHorizontal: regWidth * 10,
        borderRadius: 10,
        marginTop: regHeight * 12,
    },
    warning: {
        fontSize: regWidth * 12,
        marginHorizontal: regWidth * 8,
        fontWeight: "500",
        // color: "#FF4040",
        marginTop: regHeight * 8,
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

export { FindPassword, FindPassword2, FindPassword3, };