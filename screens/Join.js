import { View, SafeAreaView, Text, Button, StyleSheet, TouchableOpacity, TextInput, Pressable, Image, Animated, ScrollView, TouchableWithoutFeedback, Keyboard, Alert, } from "react-native";
import React, { useEffect, useState, useRef, createRef, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Api from '../lib/Api';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import NemoLogo from '../assets/images/NemoLogo(small).png';
import Check from '../assets/images/Check.png';
import Eye from '../assets/images/Eye.png';
import ProfileImage from '../assets/images/ProfileImage.png';
import Arrow from '../assets/icons/LeftArrow.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ImagePicker from 'react-native-image-crop-picker';

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

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
    const btnValue = useRef(new Animated.Value(0)).current;

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [name, setName] = useState('');
    const [hpOrEmail, setHpOrEmail] = useState('');
    const [hpOrEmailValue, setHpOrEmailValue] = useState('');
    const [date, setDate] = useState('');
    const [isNameValid, setIsNameValid] = useState(false);
    const [isHpOrEmailValid, setIsHpOrEmailValid] = useState(false);
    const [isDateValid, setIsDateValid] = useState(false);
    const [isNextPressed, setIsNextPressed] = useState(false);
    const [type, setType] = useState("hp");
    const isValid = isNameValid && isHpOrEmailValid && isDateValid;

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

    useEffect(() => {
        if (isValid) {
            showBtn();
        }
    }, [isValid]);
    
    const showLogo = () => {
        Animated.timing(logoValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }

    const showBtn = () => {
        Animated.timing(btnValue, {
            toValue: 1,
            duration: 400,
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

    const onChangeName = (payload) => {
        setName(payload);
        if (payload.length >= 3) {
            setIsNameValid(true);
        } else {
            setIsNameValid(false);
        }
    }

    const onChangeHpOrEmail = (payload) => {
        const onlyNum = payload.replace(/-/g, '');
        setHpOrEmail(payload);
        setHpOrEmailValue(payload);
        const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        const hpRegex = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/
        const hpValueRegex = /^\d{2,3}-\d{3,4}-\d{4}$/

        if (emailRegex.test(payload)) {
            setHpOrEmail(payload);
            setHpOrEmailValue(payload);
            setType("email");
            setIsHpOrEmailValid(true);
        } else {
            if (hpRegex.test(onlyNum) || hpValueRegex.test(payload)) {
                setHpOrEmail(onlyNum);
                setHpOrEmailValue(payload.replace(/(\d{3})(\d{4})(\d)/, "$1-$2-$3"));
                setType("hp");
                setIsHpOrEmailValid(true);
            } else {
                setIsHpOrEmailValid(false);
            }
        }
    }

    const onSignUp = async() => {
        console.log(hpOrEmail, type)
        // navigation.navigate('Join2', {name: name, hpOrEmail: hpOrEmail, date: date,})
        try {
            await Api
            .post("/api/v1/user/verify_account/", {
                hp_or_email: hpOrEmail,
                type: type,
            })
            .then((res) => {
                Alert.alert(`Verify ${type === "hp" ? "phone" : "email" }`, `We'll ${type === "hp" ? "text" : "email" } your verification code to ${hpOrEmail}`, 
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('Join2', {name: name, hpOrEmail: hpOrEmail, date: date, type: type, })
                    },
                ]);
            })
        } catch (err) {
            console.error(err);
        }
    }

    // const requestPhoneNumber = async() => {
    //     if (phoneNumber === "") {
    //         return;
    //     }
    //     // countDown();
    //     try {
    //         setSendButton('재전송');
    //         const response = await Api
    //         .post("/api/v1/user/send_sms/", {
    //             phone_number: phoneNumber
    //         })
    //         .then((res) => {
    //             setPhoneNumberWarning("인증번호가 전송되었습니다");
    //             setWarningColor("black");
    //             countDown();
    //         })
    //     } catch (err) {
    //         // console.error(err);
    //         if (err.response.status === 400) {
    //             setPhoneNumberWarning('해당 전화번호로 가입된 계정이 이미 존재합니다');
    //             setWarningColor("#FF4040");
    //         }
    //     }
    // }

    // const onChangeAuthNumber = (payload) => {
    //     setAuthNumber(payload);
    // }

    // const requestAuthNumber = async() => {
    //     if (authNumber === "") {
    //         return;
    //     }

    //     try {
    //         const response = await Api
    //         .post("/api/v1/user/verify_sms/", {
    //             phone_number: phoneNumber,
    //             auth_number: authNumber
    //         })
    //         .then((res) => {
    //             console.log(res.data);
    //             if (res.data) {
    //                 navigation.navigate('Join2', { phoneNumber: phoneNumber, });
    //             } else {
    //                 setAuthWarning('이미 가입된 계정입니다.');
    //             }
    //         })
    //     } catch (err) {
    //         // console.error(err);
    //         setAuthWarning('잘못된 인증번호입니다.');
    //     }
    // }

    const showDatePicker = (e) => {
        e.preventDefault();
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setDate(date.format("yyyy-MM-dd"));
        setIsDateValid(true);
        hideDatePicker();
    };

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
                <View
                    style={{
                        width: regWidth*280, 
                        marginTop: regHeight * 30,
                    }}
                >
                    <Text 
                        style={{ 
                            fontSize: regWidth * 13, 
                            fontWeight: "400", 
                            marginHorizontal: regWidth * 6, 
                            color: "#606060",
                            opacity: name.length > 0 ? 1 : 0,
                        }}
                    >
                        Name
                    </Text>
                    <View 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "flex-end", 
                        }}
                    >
                        <TextInput 
                            style={{ ...styles.txtInput, paddingHorizontal: regWidth*6 }}
                            onChangeText={onChangeName}
                            placeholder="Name"
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                    
                        />
                        {isNameValid ? 
                            <Image 
                                source={Check}
                                style={ styles.checkIcon }
                                // onLoadEnd={showLogo}
                            />
                            :
                            null
                        }

                        
                    </View>
                </View>
                <View
                    style={{
                        width: regWidth*280, 
                        marginTop: regHeight * 30,
                    }}
                >
                    <Text 
                        style={{ 
                            fontSize: regWidth * 13, 
                            fontWeight: "400", 
                            marginHorizontal: regWidth * 6, 
                            color: "#606060",
                            opacity: hpOrEmail.length > 0 ? 1 : 0,
                        }}
                    >
                        {"ex) XXX-XXXX-XXXX or nemo@namo.com"}
                    </Text>
                    <View 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "flex-end", 
                        }}
                    >
                        <TextInput 
                            style={{ ...styles.txtInput, paddingHorizontal: regWidth*6 }}
                            onChangeText={onChangeHpOrEmail}
                            placeholder="Phone number or email address"
                            placeholderTextColor={"#7341ffcc"}
                            autoCapitalize="none"
                            value={hpOrEmailValue}
                    
                        />
                        {isHpOrEmailValid ? 
                            <Image 
                                source={Check}
                                style={ styles.checkIcon }
                                // onLoadEnd={showLogo}
                            />
                            :
                            null
                        }
                        
                    </View>
                </View>
                <View
                    style={{
                        width: regWidth*280, 
                        marginTop: regHeight * 30,
                    }}
                >
                    <Text 
                        style={{ 
                            fontSize: regWidth * 13, 
                            fontWeight: "400", 
                            marginHorizontal: regWidth * 6, 
                            color: "#606060",
                            opacity: date.length > 0 ? 1 : 0,
                        }}
                    >
                        Date of birth
                    </Text>
                    <Pressable 
                        style={{ 
                            flexDirection: "row", 
                            alignItems: "flex-end", 
                        }}
                        onPress={showDatePicker}
                    >
                        <TextInput 
                            style={{ 
                                ...styles.txtInput, 
                                paddingHorizontal: regWidth*6,
                            }}
                            // onChangeText={onChangeId}
                            placeholder="Date of birth"
                            placeholderTextColor={"#606060"}
                            autoCapitalize="none"
                            // showSoftInputOnFocus={false}
                            editable={false}
                            pointerEvents="none"
                            value={date}
                        />
                        {isDateValid ? 
                            <Image 
                                source={Check}
                                style={ styles.checkIcon }
                                // onLoadEnd={showLogo}
                            />
                            :
                            null
                        }
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </Pressable>
                </View>
                
                {/* <View style={{ marginTop: regHeight*58, width: regWidth*280, alignItems: "flex-end" }}>
                    <Pressable
                        onPress={() => setIsNextPressed(true)}
                        style={{...styles.nextBtn, backgroundColor: "#7341ffcc" }}
                    >
                    <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Next</Text>
                    </Pressable>
                </View>    */}
                {/* {isValid ?
                    <Animated.View
                        style={{
                            opacity: btnValue
                        }}
                    >
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
                                onPress={onSignUp}
                                style={ styles.signUpBtn }
                            >
                            <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Sign up</Text>
                            </Pressable>
                        </View>  
                    </Animated.View>
                    :
                    null
                } */}
                    <Animated.View
                        style={{
                            opacity: btnValue
                        }}
                    >
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
                                onPress={onSignUp}
                                style={ styles.signUpBtn }
                                disabled={isValid ? false : true }
                            >
                            <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Sign up</Text>
                            </Pressable>
                        </View>  
                    </Animated.View>
       
          
            </View>
            
            {/* <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            /> */}
        </View>
    );

  }
  
const Join2 = ({ navigation, route }) => {
    const { name, hpOrEmail, date, type, } = route.params;
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

    const onContinue = async() => {
        console.log(authNumList.join(''));
        try {
            await Api
            .post("/api/v1/user/verify_sms/", {
                hp_or_email: hpOrEmail,
                auth_number: authNumList.join(''),
            })
            .then((res) => {
                navigation.navigate('Join3', {name: name, hpOrEmail: hpOrEmail, date: date, type: type, });
            })
        } catch (err) {
            console.error(err);
        }
    }

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
                    <Text style={{ fontSize: regWidth*13, fontWeight: "500", color: "#606060", marginTop: regHeight*4 }}>
                        Enter it below to verify 010-0000-0000.
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "center", width: regWidth*280, marginTop: regHeight*25 }}>
                        <TextInput 
                            style={ styles.authInput }
                            placeholderTextColor={"#000000"}
                            keyboardType="numeric"
                            // maxLength={1}
                            // caretHidden="true"
                            ref={el => inputRefs.current[0] = el}
                            onChangeText={(text) => onSetAuthNum(text, 0)}
                            onKeyPress={(e) => onKeyPress(e, 0)}
                            autoFocus="true"
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
                            caretHidden="true"
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
                    <Pressable 
                        onPress={() => navigation.goBack()} 
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        style={{
                            marginTop: regHeight*76,
                        }}
                    >
                        <Text style={{
                            
                            color: "#7341ffcc"
                        }}>
                            Didn't receive SMS?
                        </Text>
                    </Pressable>
                    <View style={{ marginTop: regHeight*8, width: regWidth*280, alignItems: "center" }}>
                        <Pressable
                            onPress={onContinue}
                            style={ styles.signUpBtn }
                        >
                        <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Continue</Text>
                        </Pressable>
                    </View>    
                </View>
            </View>
            
            
        </View>
    );
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

const Join3 = ({ navigation, route }) => {
    const { name, hpOrEmail, date, type, } = route.params;
    const [psw, setPsw] = useState('');
    const [pswCheck, setPswCheck] = useState('');
    const [isPswValid, setIsPswValid] = useState(false);
    const [isPswCheckValid, setIsPswCheckValid] = useState(false);
    const isValid = isPswValid && isPswCheckValid;

    const onChangePsw = (payload) => {
        const pswRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/
        setPsw(payload);

        if (!pswRegex.test(payload)) {
            setIsPswValid(false);
        } else {
            setIsPswValid(true);
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

    return (
        <View style={{backgroundColor:"white", flex:1}} >
            <SafeAreaView style={ styles.header } >
                <Image 
                    source={Arrow}
                    style={{ width: regWidth*20, height: regHeight*17.5, opacity: 0 }}
                />
                {/* <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={Arrow}
                        style={{ width: regWidth*20, height: regHeight*17.5 }}
                        // onLoadEnd={showLogo}
                    />
                </Pressable> */}
            </SafeAreaView>
            <View style={{ alignItems: "center" }}>
                <View style={{ width: regWidth*280, alignItems: "flex-start" }}>
                    <Text style={{ marginTop: regHeight*32, fontSize: regWidth*22, fontWeight: "900", color: "#202020" }}>
                        You'll need a password
                    </Text>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "500", color: "#606060", marginTop: regHeight*4 }}>
                        Make sure it's 8 characters or more.
                    </Text>
                    {/* <Text style={{ fontSize: regWidth*13, fontWeight: "400", color: "#606060", marginTop: regHeight*51 }}>
                        Password
                    </Text> */}
                </View>
                
                <View>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "400", color: "#606060", marginTop: regHeight*51 }}>
                            Password
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", width: regWidth*280 }}>
                        <TextInput 
                            style={{ ...styles.txtInput, paddingLeft: regWidth*4, paddingRight: regWidth*70 }}
                            onChangeText={onChangePsw}
                            // placeholder="Password"
                            // placeholderTextColor={"#606060"}
                            secureTextEntry={true}
                        />
                        <Pressable
                            // onPress={() => navigation.goBack()} 
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Image 
                                source={Eye}
                                style={ styles.eyeIcon }
                                // onLoadEnd={showLogo}
                            />
                        </Pressable>

                        {isPswValid ? 
                                <Image 
                                    source={Check}
                                    style={ styles.checkIcon }
                                    // onLoadEnd={showLogo}
                                />
                                :
                                null
                        }
                    </View>
                </View>
                <View>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "400", color: "#606060", marginTop: regHeight*51 }}>
                            Password Check
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", width: regWidth*280 }}>
                        <TextInput 
                            style={{ ...styles.txtInput, paddingLeft: regWidth*4, paddingRight: regWidth*70 }}
                            onChangeText={onChangePswCheck}
                            // placeholder="Password"
                            // placeholderTextColor={"#606060"}
                            secureTextEntry={true}
                        />
                        <Pressable
                            // onPress={() => navigation.goBack()} 
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Image 
                                source={Eye}
                                style={ styles.eyeIcon }
                                // onLoadEnd={showLogo}
                            />
                        </Pressable>

                        {isPswCheckValid ? 
                                <Image 
                                    source={Check}
                                    style={ styles.checkIcon }
                                    // onLoadEnd={showLogo}
                                />
                                :
                                null
                        }
                    </View>
                </View>
                <Text style={{
                    marginTop: regHeight*60,
                    color: "white"
                }}>
                    blank
                </Text>
                <View style={{ marginTop: regHeight*8, width: regWidth*280, alignItems: "center" }}>
                    <Pressable
                        onPress={() => navigation.navigate('Join4', {name: name, hpOrEmail: hpOrEmail, date: date, type: type, psw: psw, })}
                        style={ styles.signUpBtn }
                        disabled={isValid ? false : true}
                    >
                    <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Next</Text>
                    </Pressable>
                </View>    
            </View>
        </View>
    );
}


const Join4 = ({ navigation, route }) => {
    const { name, hpOrEmail, date, type, psw, } = route.params;
    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const debounceVal = useDebounce(username);

    useEffect(() => {
        checkUsername();
    }, [debounceVal]);

    const onChangeUsername = (payload) => {
        setUsername(payload);
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

    const onJoin = async() => {
        // if (loading) {
        // return;
        // }
        console.log(name, hpOrEmail, type, psw, username, date,)
        try {
            await Api
            .post("/api/v1/user/register/", {
                name: name,
                hp_or_email: hpOrEmail,
                type: type,
                password: psw,
                user_tag: username,
                date: date,
            })
            .then(async(res) => {
                // console.log(res.data);
                // try {
                //     await AsyncStorage.setItem('refresh', res.data.refresh);
                //     await AsyncStorage.setItem('access', res.data.access);
                //     dispatch(setRefreshToken(res.data.refresh));
                // } catch (err) {
                //     console.error(err);
                // }
                navigation.navigate('Join5', { hpOrEmail: hpOrEmail, type: type, psw: psw, });
            })
        } catch (err) {
            // if (err.response.status === 400) {
            //     setJoinWarning('같은 아이디가 이미 존재합니다');
            // }
            console.error(err);
        }
    }

    return (
        <View style={{backgroundColor:"white", flex:1}} >
            <SafeAreaView style={ styles.header } >
                <Image 
                    source={Arrow}
                    style={{ width: regWidth*20, height: regHeight*17.5, opacity: 0 }}
                />
                {/* <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={Arrow}
                        style={{ width: regWidth*20, height: regHeight*17.5 }}
                        // onLoadEnd={showLogo}
                    />
                </Pressable> */}
            </SafeAreaView>
            <View style={{ alignItems: "center" }}>
                <View style={{ width: regWidth*280, alignItems: "flex-start" }}>
                    <Text style={{ marginTop: regHeight*32, fontSize: regWidth*22, fontWeight: "900", color: "#202020" }}>
                        What should we call you?
                    </Text>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "500", color: "#606060", marginTop: regHeight*4 }}>
                        Your @username is unique. You can always change it later.
                    </Text>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "400", color: "#606060", marginTop: regHeight*36 }}>
                        Username
                    </Text>
                </View>
                
                
                <View 
                    style={{ ...styles.txtInput, flexDirection: "row", alignItems: "center" }}
                >
                    <Text style={{ fontSize: regWidth*17, fontWeight: "700", color: "#5c34cc" }}>
                        @
                    </Text>
                    <TextInput 
                        style={ styles.usernameInput }
                        onChangeText={onChangeUsername}
                        placeholder="username"
                        placeholderTextColor={"#606060"}
                        autoCapitalize="none"
                    />

                    {isUsernameValid ? 
                        <Image 
                            source={Check}
                            style={ styles.checkIcon }
                            // onLoadEnd={showLogo}
                        />
                        :
                        null
                    }
                </View>
                <Text style={{
                    marginTop: regHeight*76,
                    color: "white"
                }}>
                    blank
                </Text>
                <View style={{ marginTop: -regHeight*7, width: regWidth*280, alignItems: "center" }}>
                    <Pressable
                        onPress={onJoin}
                        style={ styles.signUpBtn }
                    >
                    <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Next</Text>
                    </Pressable>
                </View>    
            </View>
        </View>
    );
}


const Join5 = ({ navigation, route }) => {
    const { hpOrEmail, type, psw, } = route.params;
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        console.log(avatar);
    }, [avatar])

    const pickAvatar = async () => {
        try {
          ImagePicker.openPicker({
            width: 1000,
            height: 1000,
            cropping: true,
            // freeStyleCropEnabled: true,
            cropperCircleOverlay: true,
          }).then(image => {
            console.log(image);
            setAvatar(`file://${image.path}`);
          });
    
        } catch (error) {
          console.error(error);
        }
    };

    const onSetAvatar = async() => {
        const formData = new FormData();
        const filename = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const avatarType = match ? `image/${match[1]}` : `image`;
        formData.append('avatar', {
            uri: avatar,
            type: avatarType,
            name: filename
        });
        formData.append('hp_or_email', hpOrEmail);
        formData.append('type', type);
        console.log(avatar);
        console.log(formData);

        try {
            await Api
            .put('/api/v1/user/avatar_Add/', formData, 
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
            )
            .then((res) => {
                navigation.navigate('Join6', { hpOrEmail: hpOrEmail, type: type, psw: psw, });
            })
        } catch (err) {
            console.error(err);
        }

    }

    return (
        <View style={{backgroundColor:"white", flex:1}} >
            <SafeAreaView style={ styles.header } >

                <Image 
                    source={Arrow}
                    style={{ width: regWidth*20, height: regHeight*17.5, opacity: 0 }}
                />
                {/* <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={Arrow}
                        style={{ width: regWidth*20, height: regHeight*17.5 }}
                        // onLoadEnd={showLogo}
                    />
                </Pressable> */}
            </SafeAreaView>
            <View style={{ alignItems: "center" }}>
                <View style={{ width: regWidth*280, alignItems: "flex-start" }}>
                    <Text style={{ marginTop: regHeight*32, fontSize: regWidth*22, fontWeight: "900", color: "#202020" }}>
                        Pick a profile picture
                    </Text>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "500", color: "#606060", marginTop: regHeight*4 }}>
                        Choose your favorite picture
                    </Text>
                </View>
                
                <Pressable 
                    style={{ marginTop: regHeight*51, }}
                    onPress={pickAvatar}
                >
                    <Image 
                        source={avatar === null ? ProfileImage : {uri: avatar}}
                        // source={avatar}
                        style={{ width: regWidth*140, height: regHeight*140, resizeMode: "contain", borderRadius: avatar === null ? 0 : 999, }}
                    />
                </Pressable>
                <View style={{ marginTop: regHeight*109, width: regWidth*280, alignItems: "center" }}>
                    <Pressable
                        onPress={onSetAvatar}
                        style={ styles.signUpBtn }
                        disabled={avatar === null ? true : false}
                    >
                        <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Next</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('Join6', { hpOrEmail: hpOrEmail, type: type, psw: psw, })}
                        style={{marginTop: regHeight*13}}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Text style={{ color: "#404040", fontSize:regWidth*18, fontWeight: "900", borderBottomWidth:regHeight*1 }} >Skip for now</Text>
                    </Pressable>
                </View>    
            </View>
        </View>
    );
}




const Join6 = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { hpOrEmail, type, psw, } = route.params;

    const onLogin = async() => {
        try {
          await Api
          .post("/api/v1/user/login/", {
            hp_or_email: hpOrEmail,
            type: type,
            password: psw,
          })
          .then(async(res) => {
            // console.log(res.data);
            try {
              await AsyncStorage.setItem('refresh', res.data.refresh);
              await AsyncStorage.setItem('access', res.data.access);
              dispatch(setRefreshToken(res.data.refresh));
            } catch (err) {
              console.error(err);
            }
    
          })
        } catch (err) {
          // console.error(err);
          if (err.response.status === 401) {
            setWarning('잘못된 비밀번호입니다');
          }
          if (err.response.status === 404) {
            setWarning('존재하지 않는 계정입니다');
          }
        }
      }

    return (
        <View style={{backgroundColor:"white", flex:1}} >
            <SafeAreaView style={ styles.header } >
                <Image 
                    source={Arrow}
                    style={{ width: regWidth*20, height: regHeight*17.5, opacity: 0 }}
                />
                {/* <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={Arrow}
                        style={{ width: regWidth*20, height: regHeight*17.5 }}
                        // onLoadEnd={showLogo}
                    />
                </Pressable> */}
            </SafeAreaView>
            <View style={{ alignItems: "center" }}>
                <View style={{ width: regWidth*280, alignItems: "flex-start" }}>
                    <Text style={{ marginTop: regHeight*32, fontSize: regWidth*22, fontWeight: "900", color: "#202020" }}>
                        Welcome!
                    </Text>
                    <Text style={{ fontSize: regWidth*13, fontWeight: "500", color: "#606060", marginTop: regHeight*4 }}>
                        Let's dive into the knowledge from books
                    </Text>
                </View>
                
                <View 
                    style={{ marginTop: regHeight*90 }}
                >
                    <Image 
                        source={NemoLogo}
                        style={{ width: regWidth*220, height: regHeight*62.5, resizeMode: "contain" }}
                    />
                </View>
                <View style={{ marginTop: regHeight*146.5, width: regWidth*280, alignItems: "center" }}>
                    <Pressable
                        onPress={onLogin}
                        style={ styles.signUpBtn }
                    >
                        <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Start</Text>
                    </Pressable>
                </View>    
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
        // backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
        fontSize: 16,
        fontWeight: "500",
        color: "#5c34cc",
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
        resizeMode: "contain",
    },
    eyeIcon: {
        width: regWidth*30,
        height: regHeight*30,
        marginBottom: regHeight*5,
        marginLeft: -regWidth*60,
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
        fontWeight: "900",
        textAlign: "center"
    },
    usernameInput: {
        height: "100%", 
        width: "90%", 
        fontSize: regWidth*17, 
        color: "#5c34cc",
        // lineHeight: regHeight*25.5
    }
    
  })

export {Join1, Join2, Join3, Join4, Join5, Join6};