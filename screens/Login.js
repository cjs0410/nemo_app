import { View, SafeAreaView, ScrollView, Text, Button, StyleSheet, TouchableOpacity, Dimensions, TextInput, Pressable, Image, Animated, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import {colors, regWidth, regHeight} from '../config/globalStyles';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import Api from '../lib/Api';
import NemoLogo from '../assets/images/NemoTrans.png';


const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState('');
  const logoValue = useRef(new Animated.Value(0)).current;

  const showLogo = () => {
      Animated.timing(logoValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
      }).start();
  }

  const onChangeId = (payload) => {
    setId(payload);
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
      const response = await Api
      .post("/api/v1/user/login/", {
        username: id,
        password: password,
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
    setLoading(false);
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
            <Text style={{
              fontSize: 30,
              fontWeight: "700",
              letterSpacing: -0.28,
              marginHorizontal: 8,
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
        </SafeAreaView>
        <ScrollView
          scrollEnabled={false}
        >
          <View style={styles.introduce} >
            <Text style={styles.introduceText}>
              로그인
            </Text>

            {/* <TouchableOpacity
              onPress={() => navigation.navigate('Join1')}
              style={styles.introduceBtn}
            >
              <AntDesign name="google" size={18} color="black" />
              <Text style={{...styles.btnText, marginLeft: 8,}} >Google로 계속하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Join1')}
              style={styles.introduceBtn}
            >
              <AntDesign name="apple1" size={18} color="black" />
              <Text style={{...styles.btnText, marginLeft: 8,}} >Apple로 계속하기</Text>
            </TouchableOpacity> */}

            {/* <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
              <View style={{ height: 0.5, width: SCREEN_WIDTH * 0.2, backgroundColor: "black"}}></View>
              <Text style={{ marginHorizontal: 10, fontSize: 13, fontWeight: "500", textAlign: "center", }}>또는</Text>
              <View style={{ height: 0.5, width: SCREEN_WIDTH * 0.2, backgroundColor: "black"}}></View>
            </View> */}
            <TextInput 
              style={styles.input}
              onChangeText={onChangeId}
              placeholder="아이디를 입력해주세요"
            />
            <TextInput 
              style={styles.input}
              onChangeText={onChangePassword}
              placeholder="비밀번호를 입력해주세요"
              secureTextEntry={true}
            />
            <Text style={{...styles.warning, color: "#FF4040", }}>
              {warning}
            </Text>
            <TouchableOpacity
              onPress={onLogin}
              style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
            >
              <Text style={{...styles.btnText, color: "white",}} >로그인하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
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
    width: regWidth * 30,
    height: regWidth * 30,
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
    marginTop: regHeight * 150,
    textAlign: "center",
  },
  introduceBtn: {
    height: regHeight * 50,
    backgroundColor: "#EEEEEE",
    paddingVertical: regHeight * 10,
    marginVertical: regHeight * 80,
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
    paddingVertical: regHeight * 10,
    paddingHorizontal: regWidth * 10,
    borderRadius: 10,
    marginTop: regHeight * 24,
  },
  warning: {
    fontSize: regWidth * 12,
    marginHorizontal: regWidth * 8,
    fontWeight: "500",
    // color: "#FF4040",
    marginTop: regHeight * 12,
  },
})

export default Login;