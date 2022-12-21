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

const FindPassword = ({navigation}) => {
    const logoValue = useRef(new Animated.Value(0)).current;
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [targetEmail, setTargetEmail] = useState('');

    const onChangeUsername = (payload) => setUsername(payload);
    const onChangePhoneNumber = (payload) => setPhoneNumber(payload);
    const onChangeEmail = (payload) => setTargetEmail(payload);

    const showLogo = () => {
        Animated.timing(logoValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }

    const findPassword = async() => {
        try {
            console.log(username, phoneNumber, targetEmail);
            await Api
            .post("/api/v1/user/find_password/", {
                username: username,
                phone_number: phoneNumber,
                target_email: targetEmail,
            })
            .then((res) => {
                console.log(res.data);
                navigation.navigate('FindPassword2');
            })
        } catch (err) {
            console.error(err);
        }
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
                <Text style={styles.introduceText}>비밀번호 찾기</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="아이디를 입력해주세요"
                    onChangeText={onChangeUsername}
                    autoCapitalize="none"
                />
                <TextInput 
                    style={styles.input}
                    placeholder="전화번호를 입력해주세요"
                    onChangeText={onChangePhoneNumber}
                    value={phoneNumber}
                    keyboardType="numeric"
                />
                <Text style={styles.introduceText}>임시 비밀번호를 전송할 이메일을 입력하세요</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="이메일을 입력해주세요"
                    onChangeText={onChangeEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Pressable
                    onPress={findPassword}
                    style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
                    // disabled={!buttonActive}
                >
                    <Text style={{...styles.btnText, color: "white",}} >찾기</Text>
                </Pressable>
            </View>
        </View>
    )
}

const FindPassword2 = ({route, navigation}) => {
    const logoValue = useRef(new Animated.Value(0)).current;

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
                <Text style={styles.introduceText}>임시 비밀번호를</Text>
                <Text style={styles.introduceText}>입력하신 이메일로 전송했습니다</Text>

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

export { FindPassword, FindPassword2, };