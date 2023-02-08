import { View, SafeAreaView, ScrollView, Text, Button, StyleSheet, TouchableOpacity, Dimensions, TextInput, Pressable, Image, Animated, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import {colors, regWidth, regHeight} from '../config/globalStyles';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import Api from '../lib/Api';
import NemoLogo from '../assets/images/NemoLogo(small).png';
import messaging from '@react-native-firebase/messaging';


const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [hpOrEmail, setHpOrEmail] = useState('');
  const [hpOrEmailValue, setHpOrEmailValue] = useState('');
  const [type, setType] = useState("hp");
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState('');
  const logoValue = useRef(new Animated.Value(0)).current;

  const showLogo = () => {
      Animated.timing(logoValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
      }).start();
  }

  // const onChangeHpOrEmail = (payload) => {
  //   setHpOrEmail(payload);
  // }
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

  const onChangePassword = (payload) => {
    setPassword(payload);
  }

  const onLogin = async() => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      await Api
      .post("/api/v1/user/login/", {
        hp_or_email: hpOrEmail,
        // username: hpOrEmail,
        password: password,
        type: type,
      })
      .then(async(res) => {
        // console.log(res.data);
        try {
          await AsyncStorage.setItem('refresh', res.data.refresh);
          await AsyncStorage.setItem('access', res.data.access);
          getFcmToken();
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
    setLoading(false);
  }

  const getFcmToken = useCallback(async () => {
    const fcmToken = await messaging().getToken();
    // Alert.alert(fcmToken);
    // console.log(fcmToken);

    try {
      console.log(fcmToken);
      await Api
      .post("/api/v1/user/fcm_token/", {
        token: fcmToken,
      })
      // .then((res) => {
      //   console.log(res.data);
      // })
    } catch (err) {
      console.error(err);
    }
  }, []);

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
                Welcome back!
            </Text>
          </View>
          <TextInput 
            style={{ ...styles.txtInput, marginTop: regHeight*30, paddingHorizontal: regWidth*6 }}
            onChangeText={onChangeHpOrEmail}
            placeholder="Phone number or email address"
            placeholderTextColor={"#606060"}
            autoCapitalize="none"
            value={hpOrEmailValue}
      
          />
          <TextInput 
            style={{ ...styles.txtInput, marginTop: regHeight*48, paddingHorizontal: regWidth*6 }}
            onChangeText={onChangePassword}
            placeholder="Password"
            placeholderTextColor={"#606060"}
            secureTextEntry={true}
          />
          <View style={{ alignItems: "flex-end",  marginTop: regHeight*6, width: regWidth*280 }}>
            <Pressable
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
              onPress={() => navigation.navigate('FindPassword')}
            >
              <Text style={{fontSize:regWidth*12, fontWeight: "400", color:"#7341ffcc"}}>
                Forgot password?
              </Text>
            </Pressable>
          </View>
          <View style={{ marginTop: regHeight*40 }}>
            <TouchableOpacity
               onPress={onLogin}
               style={{...styles.Btn, backgroundColor: "#5c34cc" }}
             >
               <Text style={{ color: "white", fontSize:regWidth*18, fontWeight: "900" }} >Sign in</Text>
             </TouchableOpacity>
          </View>            
         </View>
      </View>
      
    );

    // return (
    //   <View style={styles.container}>
    //     <SafeAreaView style={styles.header} >
    //       <Pressable 
    //         onPress={() => navigation.goBack()} 
    //         hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
    //       >
    //         <Ionicons name="chevron-back" size={28} color="black" />
    //       </Pressable>
    //       <View style={{ flexDirection: "row", alignItems: "center", }}>
    //         <Animated.Image 
    //           source={NemoLogo}
    //           style={{
    //               ...styles.LogoImage,
    //               opacity: logoValue,
    //           }}
    //           onLoadEnd={showLogo}
    //         />
    //       </View>
    //       <Pressable 
    //           hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
    //           style={{ opacity: 0 }}
    //       >
    //           <Ionicons name="chevron-back" size={28} color="black" />
    //       </Pressable>
    //     </SafeAreaView>
    //     <ScrollView
    //       scrollEnabled={false}
    //     >
    //       <View style={styles.introduce} >
    //         <Text style={styles.introduceText}>
    //           로그인
    //         </Text>

    //         <TextInput 
    //           style={styles.input}
    //           onChangeText={onChangeId}
    //           placeholder="아이디를 입력해주세요"
    //           autoCapitalize="none"
    //         />
    //         <TextInput 
    //           style={styles.input}
    //           onChangeText={onChangePassword}
    //           placeholder="비밀번호를 입력해주세요"
    //           secureTextEntry={true}
    //         />
    //         <Text style={{...styles.warning, color: "#FF4040", }}>
    //           {warning}
    //         </Text>
    //         <TouchableOpacity
    //           onPress={onLogin}
    //           style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
    //         >
    //           <Text style={{...styles.btnText, color: "white",}} >로그인하기</Text>
    //         </TouchableOpacity>
    //       </View>
    //     </ScrollView>
    //   </View>
    // );
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
  Btn: {
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    width: regWidth*280,
    height: regHeight*60,
    flexDirection: "row"
  },
})

export default Login;