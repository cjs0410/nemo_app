import { View, SafeAreaView, Text, Button, StyleSheet, TouchableOpacity, TextInput, Pressable, Image, Animated, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Api from '../lib/Api';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import NemoLogo from '../assets/images/NemoLogo(small).png';
import Check from '../assets/images/Check.png';
import Arrow from '../assets/icons/LeftArrow.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import { ScrollView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

const Join1 = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [authNumber, setAuthNumber] = useState('');
    const [isAuth, setIsAuth] = useState('');
    const [sendButton, setSendButton] = useState('인증번호 문자로 받기');
    const [phoneNumberWarning, setPhoneNumberWarning] = useState('');
    const [warningColor, setWarningColor] = useState("black");
    const [authWarning, setAuthWarning] = useState('');

    const [min, setMin] = useState(3);
    const [sec, setSec] = useState("00");
    const time = useRef(180);
    const timerId = useRef(null);
    const [isCountDown, setIsCountDown] = useState(false);
    const logoValue = useRef(new Animated.Value(0)).current;

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
    
    const showLogo = () => {
        Animated.timing(logoValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
        }).start();
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

    const onChangePhoneNumber = (payload) => {
        setPhoneNumber(payload);
    }

    const requestPhoneNumber = async() => {
        if (phoneNumber === "") {
            return;
        }
        // countDown();
        try {
            setSendButton('재전송');
            const response = await Api
            .post("/api/v1/user/send_sms/", {
                phone_number: phoneNumber
            })
            .then((res) => {
                setPhoneNumberWarning("인증번호가 전송되었습니다");
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
            .post("/api/v1/user/verify_sms/", {
                phone_number: phoneNumber,
                auth_number: authNumber
            })
            .then((res) => {
                console.log(res.data);
                if (res.data) {
                    navigation.navigate('Join2', { phoneNumber: phoneNumber, });
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
        <View style={{backgroundColor:"white", flex:1}}>
            <SafeAreaView style={ styles.header } >
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth*16, fontWeight: "400" }}>
                        Cancel
                    </Text>
                </Pressable>
            </SafeAreaView>
            <View style={{ alignItems: "center" }}>
          <View style={{ width: regWidth*280, alignItems: "flex-start" }}>
            <Text style={{ marginTop: regHeight*32, fontSize: regWidth*22, fontWeight: "900" }}>
                Create your account
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", width: regWidth*280 }}>
            <TextInput 
                style={{ ...styles.txtInput, marginTop: regHeight*30, paddingHorizontal: regWidth*6 }}
                // onChangeText={onChangeId}
                placeholder="Name"
                placeholderTextColor={"#606060"}
                autoCapitalize="none"
        
            />
            <Image 
                source={Check}
                style={ styles.checkIcon }
                // onLoadEnd={showLogo}
            />
            
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", width: regWidth*280 }}>
            <TextInput 
                style={{ ...styles.txtInput, marginTop: regHeight*30, paddingHorizontal: regWidth*6 }}
                // onChangeText={onChangeId}
                placeholder="Phone number or email address"
                placeholderTextColor={"#7341ffcc"}
                autoCapitalize="none"
        
            />
            <Image 
                source={Check}
                style={ styles.checkIcon }
                // onLoadEnd={showLogo}
            />
            
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", width: regWidth*280 }}>
            <TextInput 
                style={{ ...styles.txtInput, marginTop: regHeight*30, paddingHorizontal: regWidth*6 }}
                // onChangeText={onChangeId}
                placeholder="Date of birth"
                placeholderTextColor={"#606060"}
                autoCapitalize="none"
        
            />
            <Image 
                source={Check}
                style={ styles.checkIcon }
                // onLoadEnd={showLogo}
            />
            
          </View>

          <View style={{ marginTop: regHeight*58, width: regWidth*280, alignItems: "flex-end" }}>
            <Pressable
            //    onPress={onLogin}
               style={{...styles.nextBtn, backgroundColor: "#7341ffcc" }}
             >
               <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Next</Text>
             </Pressable>
          </View>   
          <View style={{ width: regWidth*290, marginTop: regHeight*54 }}>
            <View style={{flexDirection: "row"}}>
                <Text style={{ fontSize: regWidth*12, fontWeight: "400", lineHeight: regHeight*18 }}>
                    By signing up, you agree to our&nbsp;  
                </Text>
                <Pressable
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Text style={{ fontSize: regWidth*12, fontWeight: "500", color: "#7341ffcc", lineHeight: regHeight*18 }}>
                        Terms of Service&nbsp;  
                    </Text>
                </Pressable>
                
                <Text style={{ fontSize: regWidth*12, fontWeight: "400", lineHeight: regHeight*18 }}>
                    and  
                </Text>
            </View> 
            <View style={{flexDirection: "row"}}>
                <Pressable
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Text style={{ fontSize: regWidth*12, fontWeight: "500", color: "#7341ffcc", lineHeight: regHeight*18 }}>
                            Privacy Policy,&nbsp;  
                        </Text>
                </Pressable>
                <Text style={{ fontSize: regWidth*12, fontWeight: "400", lineHeight: regHeight*18 }}>
                    including&nbsp;
                </Text>
                <Pressable
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Text style={{ fontSize: regWidth*12, fontWeight: "500", color: "#7341ffcc", lineHeight: regHeight*18 }}>
                            Cookie Use.&nbsp;
                        </Text>
                </Pressable>
                <Text style={{ fontSize: regWidth*12, fontWeight: "400", lineHeight: regHeight*18 }}>
                    Nemo may use 
                </Text>
            </View>
            <View style={{flexDirection: "row"}}>
                <Text style={{ fontSize: regWidth*12, fontWeight: "400", lineHeight: regHeight*18 }}>
                    your contact information, including your email address and phone number for purposes outlined in our Privacy Policy, 
                    like keeping your account secure and personalizing our services, including ads. Others will be able to find you by email or phone number, 
                    when provided.
                </Text>
            </View>
          </View>
          <View style={{ marginTop: regHeight*16, width: regWidth*280, alignItems: "center" }}>
            <Pressable
               onPress={() => navigation.navigate('Join2')}
               style={ styles.signUpBtn }
             >
               <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Sign up</Text>
             </Pressable>
          </View>         
          
         </View>

        </View>
    );

  }
  
const Join2 = ({ navigation, route }) => {
    return (
        <View style={{backgroundColor:"white", flex:1}} >
            <SafeAreaView style={ styles.header } >
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={Arrow}
                        style={{ width: regWidth*20, height: regHeight*17.5 }}
                        // onLoadEnd={showLogo}
                    />
                </Pressable>
            </SafeAreaView>
            <View style={{ alignItems: "center" }}>
                <View style={{ width: regWidth*280, alignItems: "flex-start" }}>
                    <Text style={{ marginTop: regHeight*32, fontSize: regWidth*22, fontWeight: "900", color: "#202020" }}>
                        We sent you a code
                    </Text>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "500", color: "#606060" }}>
                        Enter it below to verify 010-0000-0000.
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "center", width: regWidth*280, marginTop: regHeight*25 }}>
                        <TextInput 
                            style={{ ...styles.txtInput, width: regWidth*36, marginTop: regHeight*30, paddingHorizontal: regWidth*14, marginHorizontal: regWidth*7.5 }}
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                            placeholder="8"
                        />
                        <TextInput 
                            style={{ ...styles.txtInput, width: regWidth*36, marginTop: regHeight*30, paddingHorizontal: regWidth*14, marginHorizontal: regWidth*7.5 }}
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                            placeholder="2"
                        />
                        <TextInput 
                            style={{ ...styles.txtInput, width: regWidth*36, marginTop: regHeight*30, paddingHorizontal: regWidth*14, marginHorizontal: regWidth*7.5 }}
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                        />
                        <TextInput 
                            style={{ ...styles.txtInput, width: regWidth*36, marginTop: regHeight*30, paddingHorizontal: regWidth*14, marginHorizontal: regWidth*7.5 }}
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                        />
                        <TextInput 
                            style={{ ...styles.txtInput, width: regWidth*36, marginTop: regHeight*30, paddingHorizontal: regWidth*14, marginHorizontal: regWidth*7.5 }}
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                        />
                        <TextInput 
                            style={{ ...styles.txtInput, width: regWidth*36, marginTop: regHeight*30, paddingHorizontal: regWidth*14, marginHorizontal: regWidth*7.5 }}
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                        />
                    </View>
                    <Pressable 
                        onPress={() => navigation.goBack()} 
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    >
                        <Text style={{
                            marginTop: regHeight*76,
                            color: "#7341ffcc"
                        }}>
                            Didn't receive SMS?
                        </Text>
                    </Pressable>
                    <View style={{ marginTop: regHeight*8, width: regWidth*280, alignItems: "center" }}>
                        <Pressable
                            onPress={() => navigation.navigate('Join2')}
                            style={ styles.signUpBtn }
                        >
                        <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Continue</Text>
                        </Pressable>
                    </View>    
                </View>
            </View>
            
            
        </View>
    );
    
    // return (
    //     <View style={styles.container}>
    //         <SafeAreaView style={styles.header} >
    //             <Pressable 
    //                 onPress={() => navigation.goBack()} 
    //                 hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
    //             >
    //                 <Ionicons name="chevron-back" size={28} color="black" />
    //             </Pressable>
    //             <View style={{ flexDirection: "row", alignItems: "center", }}>
    //                 <Animated.Image 
    //                     source={NemoLogo}
    //                     style={{
    //                         ...styles.LogoImage,
    //                         opacity: logoValue,
    //                     }}
    //                     onLoadEnd={showLogo}
    //                 />
    //             </View>
    //             <Pressable 
    //                 hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
    //                 style={{ opacity: 0 }}
    //             >
    //                 <Ionicons name="chevron-back" size={28} color="black" />
    //             </Pressable>
    //         </SafeAreaView>
    //         <ScrollView
    //             scrollEnabled={false}
    //         >
    //             <View style={styles.introduce} >
    //                 <Text style={styles.introduceText}>거의 다 왔습니다.</Text>
    //                 <TextInput 
    //                     style={styles.input}
    //                     placeholder="사용하실 닉네임을 입력해주세요"
    //                     onChangeText={onChangeNickname}
    //                     autoCapitalize="none"
    //                 />
    //                 <Text style={{...styles.warning, color: "#FF4040", }}>
    //                     {""}
    //                 </Text>
    //                 <TextInput 
    //                     style={styles.input}
    //                     placeholder="아이디를 입력해주세요(초기 유저 태그로 사용됩니다)"
    //                     onChangeText={onChangeUsername}
    //                     autoCapitalize="none"
    //                 />
    //                 <Text style={{...styles.warning, color: warningColor, }}>
    //                     {usernameWarning}
    //                 </Text>
    //                 <TextInput 
    //                     style={styles.input}
    //                     placeholder="비밀번호를 입력해주세요"
    //                     onChangeText={onChangePassword}
    //                     secureTextEntry={true}
    //                 />
    //                 <Text style={{...styles.warning, color: "#FF4040", }}>
    //                     {passwordWarning}
    //                 </Text>
    //                 <TextInput 
    //                     style={styles.input}
    //                     placeholder="비밀번호 확인"
    //                     onChangeText={onChangePasswordCheck}
    //                     secureTextEntry={true}
    //                 />
    //                 <Text style={{...styles.warning, color: "#FF4040", }}>
    //                     {passwordCheckWarning}
    //                 </Text>

    //                 <Pressable
    //                     onPress={onJoin}
    //                     style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
    //                     disabled={!buttonActive}
    //                 >
    //                     <Text style={{...styles.btnText, color: "white",}} >가입하기</Text>
    //                 </Pressable>
    //                 <Text style={{...styles.warning, color: "#FF4040", }}>
    //                     {joinWarning}
    //                 </Text>
                    
    //             </View>
    //         </ScrollView>
    //     </View>
    // );
}

function useDebounce(value, delay = 1000) {
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

const Join3 = ({ navigation }) => {
    const goHome = () => {
        navigation.navigate('Home');
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <Text style={{
                    fontSize: 30,
                    fontWeight: "700",
                    letterSpacing: -0.28,
                }}>
                    Roseeta
                </Text>
            </SafeAreaView>
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
    header: {
        marginTop: regHeight * 55,
        marginHorizontal: regWidth * 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    txtInput: {
        height: regHeight * 40,
        width: regWidth*280,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#000000"
    },
    nextBtn: {
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        width: regWidth*80,
        height: regHeight*36,
        flexDirection: "row"
    },
    checkIcon: {
        width: regWidth*25,
        height: regHeight*25,
        marginBottom: regHeight*7,
        marginLeft: -regWidth*24,
        resizeMode: "contain"
    },
    signUpBtn: {
        borderRadius: regWidth*30,
        justifyContent: "center",
        alignItems: "center",
        width: regWidth*280,
        height: regHeight*60,
        flexDirection: "row",
        backgroundColor: "#5c34cc" 
    }
    
  })

export {Join1, Join2, Join3};