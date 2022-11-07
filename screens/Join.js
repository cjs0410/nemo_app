import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Api from '../lib/Api';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';

const Stack = createNativeStackNavigator();

const Join1 = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [authNumber, setAuthNumber] = useState('');
    const [isAuth, setIsAuth] = useState('');

    const onChangePhoneNumber = (payload) => {
        setPhoneNumber(payload);
    }

    const requestPhoneNumber = async() => {
        if (phoneNumber === "") {
            return;
        }

        try {
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
                    navigation.navigate('Join2')
                } else {
                    alert('tlqkf!!!')
                }
            })
        } catch (err) {
            console.error(err);
            alert('땡!!!')
        }
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
                <Text style={styles.introduceText}>전화번호 입력해라</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="전화번호"
                    onChangeText={onChangePhoneNumber}
                />
                <TouchableOpacity
                    onPress={requestPhoneNumber}
                    style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                >
                    <Text style={{...styles.btnText, color: "white",}} >인증번호 문자로 받기</Text>
                </TouchableOpacity>

                <TextInput 
                    style={styles.input}
                    placeholder="문자 인증번호"
                    onChangeText={onChangeAuthNumber}
                />
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
    const [passwordCheck, setPasswordCheck] = useState('');

    const onChangeNickname = (payload) => setNickname(payload);
    const onChangeUsername = (payload) => setUsername(payload);
    const onChangePassword = (payload) => setPassword(payload);
    const onChangePasswordCheck = (payload) => setPasswordCheck(payload);

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
        console.error(err);
        }
        setLoading(false);
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
                <Text style={styles.introduceText}>거의 다 왔습니다.</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="사용하실 닉네임을 입력해주세요"
                    onChangeText={onChangeNickname}
                />
                <TextInput 
                    style={styles.input}
                    placeholder="아이디를 입력해주세요"
                    onChangeText={onChangeUsername}
                />
                <TextInput 
                    style={styles.input}
                    placeholder="비밀번호를 입력해주세요"
                    onChangeText={onChangePassword}
                    secureTextEntry={true}
                />
                <TextInput 
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    onChangeText={onChangePasswordCheck}
                    secureTextEntry={true}
                />
                <TouchableOpacity
                    onPress={onJoin}
                    style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                >
                    <Text style={{...styles.btnText, color: "white",}} >가입하기</Text>
                </TouchableOpacity>
                
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
      justifyContent: "center"
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
        backgroundColor: "#EEEEEE",
        paddingVertical: 10,
        marginVertical: 7,
        alignContent: "center",
        justifyContent: "center",
        borderRadius: 5,
    },
    btnText: {
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    input: {
        backgroundColor: "#EEEEEE",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 24,
    },
  })

export {Join1, Join2, Join3};