import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput, Pressable } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Api from '../lib/Api';
import {colors, regWidth, regHeight} from '../config/globalStyles';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';

const Stack = createNativeStackNavigator();

const Join1 = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [authNumber, setAuthNumber] = useState('');
    const [isAuth, setIsAuth] = useState('');
    const [sendButton, setSendButton] = useState('인증번호 문자로 받기');
    const [phoneNumberWarning, setPhoneNumberWarning] = useState('');
    const [authWarning, setAuthWarning] = useState('');

    const [min, setMin] = useState(3);
    const [sec, setSec] = useState("00");
    const time = useRef(180);
    const timerId = useRef(null);
    const [isCountDown, setIsCountDown] = useState(false);

    // useEffect(() => {
    //     timerId.current = setInterval(() => {
    //         setMin(parseInt(time.current / 60));
    //         setSec(time.current % 60);
    //         time.current -= 1;
    //     }, 1000);

    //     return () => clearInterval(timerId.current);
    // }, []);

    useEffect(() => {
        timeOut();
    }, [sec]);
    

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

    const onChangePhoneNumber = (payload) => {
        setPhoneNumber(payload);
    }

    const requestPhoneNumber = async() => {
        if (phoneNumber === "") {
            return;
        }
        countDown();
        try {
            setSendButton('재전송');
            setPhoneNumberWarning("인증번호가 전송되었습니다.")
            const response = await Api
            .post("/api/v1/user/send_sms/", {
                phone_number: phoneNumber
            })
        } catch (err) {
            console.error(err);
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
            .post("/api/v1/user/verify_sms/", {
                phone_number: phoneNumber,
                auth_number: authNumber
            })
            .then((res) => {
                console.log(res.data);
                if (res.data) {
                    navigation.navigate('Join2');
                } else {
                    setAuthWarning('이미 가입된 계정입니다.');
                }
            })
        } catch (err) {
            // console.error(err);
            setAuthWarning('잘못된 인증번호입니다.');
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Ionicons name="layers-sharp" size={30} color="black" />
                    <Text style={{
                        fontSize: 30,
                        fontWeight: "700",
                        letterSpacing: -0.28,
                    }}>
                        Nemo
                    </Text>
                </View>
                <Pressable 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    style={{ opacity: 0 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </View>
            <View style={styles.introduce} >
                <Text style={styles.introduceText}>전화번호를 입력하세요</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="전화번호"
                    onChangeText={onChangePhoneNumber}
                    value={phoneNumber}
                />
                <Text style={styles.warning}>
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
        </View>
    );
  }
  
const Join2 = ({ navigation }) => {
    const axios = require('axios').default;
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [nickname, setNickname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPsw, setIsPsw] = useState(false);
    const [passwordCheck, setPasswordCheck] = useState('');
    const [isPswCheck, setIsPswCheck] = useState(false);
    const [passwordWarning, setPasswordWarning] = useState('');
    const [passwordCheckWarning, setPasswordCheckWarning] = useState('');
    const [joinWarning, setJoinWarning] = useState('');

    const onChangeNickname = (payload) => setNickname(payload);
    const onChangeUsername = (payload) => setUsername(payload);

    const onChangePassword = (payload) => {
        const pswRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/
        setPassword(payload);

        if (!pswRegex.test(payload) && payload.length > 0) {
            setPasswordWarning('숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요!');
            setIsPsw(false);
        } else {
            setPasswordWarning('');
            setIsPsw(true);
        }

        if (passwordCheck.length === 0 || (payload === passwordCheck)) {
            setPasswordCheckWarning('');
            setIsPswCheck(true);
        } else {
            setPasswordCheckWarning('비밀번호가 일치하지 않습니다.');
            setIsPswCheck(false);
        }
    }

    const onChangePasswordCheck = (payload) => {
        setPasswordCheck(payload);
        if (password === payload || payload.length === 0) {
            setPasswordCheckWarning('');
            setIsPswCheck(true);
        } else {
            setPasswordCheckWarning('비밀번호가 일치하지 않습니다.');
            setIsPswCheck(false);
        }
    };

    const buttonActive = isPsw && isPswCheck === true;

    const onJoin = async() => {
        if (loading) {
        return;
        }

        try {
            setLoading(true);
            await Api
            .post("/api/v1/user/register/", {
                name: nickname,
                username: username,
                password: password,
            })
            .then(async(res) => {
                console.log(res.data);
                try {
                    await AsyncStorage.setItem('refresh', res.data.refresh);
                    await AsyncStorage.setItem('access', res.data.access);
                    dispatch(setRefreshToken(res.data.refresh));
                } catch (err) {
                    console.error(err);
                }
                navigation.navigate('Join3');
            })
        } catch (err) {
            if (err.response.status === 400) {
                setJoinWarning('같은 아이디가 이미 존재합니다');
            }
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Ionicons name="layers-sharp" size={30} color="black" />
                    <Text style={{
                        fontSize: 30,
                        fontWeight: "700",
                        letterSpacing: -0.28,
                    }}>
                        Nemo
                    </Text>
                </View>
                <Pressable 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    style={{ opacity: 0 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </View>
            <View style={styles.introduce} >
                <Text style={styles.introduceText}>거의 다 왔습니다.</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="사용하실 닉네임을 입력해주세요"
                    onChangeText={onChangeNickname}
                />
                <Text style={{...styles.warning, color: "#FF4040", }}>
                    {""}
                </Text>
                <TextInput 
                    style={styles.input}
                    placeholder="아이디를 입력해주세요(유저 태그로 )"
                    onChangeText={onChangeUsername}
                />
                <Text style={{...styles.warning, color: "#FF4040", }}>
                    {""}
                </Text>
                <TextInput 
                    style={styles.input}
                    placeholder="비밀번호를 입력해주세요"
                    onChangeText={onChangePassword}
                    secureTextEntry={true}
                />
                <Text style={{...styles.warning, color: "#FF4040", }}>
                    {passwordWarning}
                </Text>
                <TextInput 
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    onChangeText={onChangePasswordCheck}
                    secureTextEntry={true}
                />
                <Text style={{...styles.warning, color: "#FF4040", }}>
                    {passwordCheckWarning}
                </Text>

                <Pressable
                    onPress={onJoin}
                    style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                    disabled={!buttonActive}
                >
                    <Text style={{...styles.btnText, color: "white",}} >가입하기</Text>
                </Pressable>
                <Text style={{...styles.warning, color: "#FF4040", }}>
                    {joinWarning}
                </Text>
                
            </View>
        </View>
    );
}

const Join3 = ({ navigation }) => {
    const goHome = () => {
        navigation.navigate('Home');
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <Text style={{
                    fontSize: 30,
                    fontWeight: "700",
                    letterSpacing: -0.28,
                }}>
                    Roseeta
                </Text>
            </View>
            <View style={styles.introduce} >
                <Text style={styles.introduceText}>가입이 완료되었습니다!!!</Text>
                <TouchableOpacity
                    onPress={goHome}
                    style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                >
                    <Text style={{...styles.btnText, color: "white",}} >홈으로 바로가기</Text>
                </TouchableOpacity>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    header: {
      marginTop: 65,
      marginHorizontal: 20,
      paddingBottom: 30,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    introduce: {
        marginTop: -18,
        justifyContent: "center",
        marginHorizontal: 38,
    },
    introduceText: {
        fontSize: 24,
        fontWeight: "900",
        marginTop: 35,
        textAlign: "center",
    },
    introduceBtn: {
        height: regHeight * 50,
        backgroundColor: "#EEEEEE",
        // paddingVertical: 10,
        marginVertical: 10,
        alignContent: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    btnText: {
        fontSize: 16,
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

export {Join1, Join2, Join3};