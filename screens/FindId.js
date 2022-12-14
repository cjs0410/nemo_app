import { View, SafeAreaView, ScrollView, Text, Button, StyleSheet, TouchableOpacity, Dimensions, TextInput, Pressable, Image, Animated, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import {colors, regWidth, regHeight} from '../config/globalStyles';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import Api from '../lib/Api';
import NemoLogo from '../assets/images/NemoLogo(small).png';
import { Join1 } from "./Join";

const FindId = ({navigation}) => {
    const logoValue = useRef(new Animated.Value(0)).current;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [authNumber, setAuthNumber] = useState('');
    const [sendButton, setSendButton] = useState('인증번호 문자로 받기');
    const [phoneNumberWarning, setPhoneNumberWarning] = useState('');
    const [warningColor, setWarningColor] = useState("black");
    const [authWarning, setAuthWarning] = useState('');

    const [min, setMin] = useState(3);
    const [sec, setSec] = useState("00");
    const time = useRef(180);
    const timerId = useRef(null);
    const [isCountDown, setIsCountDown] = useState(false);

    useEffect(() => {
        timeOut();
    }, [sec]);

    const onChangePhoneNumber = (payload) => {
        setPhoneNumber(payload);
    }

    const requestPhoneNumber = async() => {
        if (phoneNumber === "") {
            return;
        }
        // countDown();
        try {
            
            console.log(phoneNumber);
            const response = await Api
            .post("/api/v1/user/find_id/", {
                phone_number: phoneNumber
            })
            .then((res) => {
                setPhoneNumberWarning("인증번호가 전송되었습니다");
                setSendButton('재전송');
                setWarningColor("black");
                countDown();
            })
        } catch (err) {
            // console.error(err);
            if (err.response.status === 400) {
                setPhoneNumberWarning('해당 전화번호로 가입된 계정이 이미 존재합니다');
                setWarningColor("#FF4040");
            }
        }
    }

    const onChangeAuthNumber = (payload) => {
        setAuthNumber(payload);
    }

    const requestAuthNumber = async() => {
        if (authNumber === "") {
            return;
        }

        try {
            const response = await Api
            .post("/api/v1/user/return_id/", {
                phone_number: phoneNumber,
                auth_number: authNumber
            })
            .then((res) => {
                console.log(res.data);
                if (res.data) {
                    navigation.navigate('FindId2', { username: res.data.username, });
                }
            })
        } catch (err) {
            // console.error(err);
            setAuthWarning('잘못된 인증번호입니다.');
        }
    }

    const countDown = () => {
        setIsCountDown(true);
        timerId.current = setInterval(() => {
            setMin(parseInt(time.current / 60));
            if (time.current % 60 < 10) {
                setSec(`0${time.current % 60}`);
            } else {
                setSec(time.current % 60);
            }
            
            time.current -= 1;
        }, 1000);

        return () => {
            clearInterval(timerId.current);
            setIsCountDown(false);
        };
    }

    const timeOut = async() => {
        if (time.current <= 0) {
            setIsCountDown(false);
            setAuthWarning("인증 시간이 만료되었습니다.")
            clearInterval(timerId.current);
            setPhoneNumberWarning('');
            try {
                await Api
                .post("/api/v1/user/timeout/", {
                    phone_number: phoneNumber,
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    const showLogo = () => {
        Animated.timing(logoValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Animated.Image 
                    source={NemoLogo}
                    style={{
                        ...styles.LogoImage,
                        opacity: logoValue,
                    }}
                    onLoadEnd={showLogo}
                    />
                </View>
                <Pressable 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    style={{ opacity: 0 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </SafeAreaView>
            {/* <ScrollView
                scrollEnabled={false}
            > */}
                <View style={styles.introduce} >
                    <Text style={styles.introduceText}>아이디 찾기</Text>
                    <Text style={styles.introduceText}>전화번호를 입력하세요</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="전화번호"
                        onChangeText={onChangePhoneNumber}
                        value={phoneNumber}
                        keyboardType="numeric"
                    />
                    <Text style={{ ...styles.warning, color: warningColor, }}>
                        {phoneNumberWarning}
                    </Text>
                    <TouchableOpacity
                        onPress={requestPhoneNumber}
                        style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                    >
                        <Text style={{...styles.btnText, color: "white",}} >{sendButton}</Text>
                    </TouchableOpacity>

                    {/* <Text style={styles.introduceText}>인증번호를 입력하세요</Text> */}


                    <View
                        style={{
                            ...styles.introduceBtn, 
                            backgroundColor: "#EEEEEE", 
                            paddingHorizontal: regWidth * 10, 
                            flexDirection: "row", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginTop: 18,
                            marginBottom: 0,
                        }}
                    >
                        <TextInput 
                            placeholder="문자 인증번호 5자리를 입력해주세요"
                            onChangeText={onChangeAuthNumber}
                            keyboardType="numeric"
                        />
                        {isCountDown ? 
                            <Text style={{ fontSize: 12, fontWeight: "500", }}>
                                {`${min}:${sec}`}
                            </Text>
                            :
                            null
                        }

                    </View>
                    {/* <TextInput 
                        style={styles.input}
                        placeholder="문자 인증번호 5자리를 입력해주세요"
                        onChangeText={onChangeAuthNumber}
                    /> */}
                    <Text style={{...styles.warning, color: "#FF4040", }}>
                        {authWarning}
                    </Text>

                    <TouchableOpacity
                        onPress={requestAuthNumber}
                        style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                    >
                        <Text style={{...styles.btnText, color: "white",}} >다음</Text>
                    </TouchableOpacity>
                    
                </View>
            {/* </ScrollView> */}
        </View>
    )
}

const FindId2 = ({route, navigation}) => {
    const { username, } = route.params;
    const [foundId, setFoundId] = useState(username);
    const logoValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let copy = username.substring(0, parseInt(username.length / 2));
        // console.log(copy);
        setFoundId(
            copy + "*".repeat(username.length - parseInt(username.length / 2))
        );
    }, [])

    const showLogo = () => {
        Animated.timing(logoValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Animated.Image 
                    source={NemoLogo}
                    style={{
                        ...styles.LogoImage,
                        opacity: logoValue,
                    }}
                    onLoadEnd={showLogo}
                    />
                </View>
                <Pressable 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    style={{ opacity: 0 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </SafeAreaView>
            <View style={styles.introduce} >
                <Text style={styles.introduceText}>해당 전화번호로 가입된 아이디는</Text>
                <Text style={styles.introduceText}>{foundId}</Text>
                <Text style={styles.introduceText}>입니다.</Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                >
                    <Text style={{...styles.btnText, color: "white",}}>로그인하러 가기</Text>
                </TouchableOpacity>
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
      marginTop: regHeight * 58,
      marginHorizontal: regWidth * 20,
      paddingBottom: regHeight * 30,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    LogoImage: {
      width: regWidth * 120,
      height: regWidth * 40,
      resizeMode: "contain",
    },
    introduce: {
        // marginTop: -regHeight * 18,
        justifyContent: "center",
        marginHorizontal: regWidth * 38,
    },
    introduceText: {
        fontSize: regWidth * 24,
        fontWeight: "900",
        marginTop: regHeight * 35,
        textAlign: "center",
    },
    introduceBtn: {
        height: regHeight * 50,
        backgroundColor: "#EEEEEE",
        // paddingVertical: 10,
        marginVertical: regHeight * 10,
        alignContent: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    btnText: {
        fontSize: regWidth * 16,
        fontWeight: "500",
        textAlign: "center",
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
})

export { FindId, FindId2, };