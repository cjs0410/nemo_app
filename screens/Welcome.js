import { View, SafeAreaView, Text, Button, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Pressable, } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
// import favicon from '../assets/images/favicon.ico';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import * as Font from "expo-font";
import * as Update from "expo-updates";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import Api from '../lib/Api';
import NemoLogo from '../assets/images/NemoLogo(small).png';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Welcome = ({ navigation }) => {
  const logoValue = useRef(new Animated.Value(0)).current;

  const showLogo = () => {
      Animated.timing(logoValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
      }).start();
  }

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.header} >
          <Animated.Image 
            source={NemoLogo}
            style={{
                ...styles.LogoImage,
                opacity: logoValue,
            }}
            onLoadEnd={showLogo}
          />
        </SafeAreaView>
        <View style={styles.introduce} >
          <Text style={styles.introduceText}>
            책 문장을
          </Text>
          <Text style={styles.introduceText}>
            언제 어디서나
          </Text>
          <Text style={styles.introduceText}>
            빠르게 저장하고,
          </Text>
          <Text style={styles.introduceText}>
            마음대로 분류하고,
          </Text>
          <Text style={styles.introduceText}>
            공유까지 간편하게.
          </Text>
          <Text style={{ ...styles.introduceText, fontSize: 20, fontWeight: "700", marginBottom: 20, }} >
            지금 시작하세요.
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
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
            <View style={{ height: 0.5, width: SCREEN_WIDTH * 0.2, backgroundColor: "black"}}></View>
            <Text style={{ marginHorizontal: 10, fontSize: 13, fontWeight: "500", textAlign: "center", }}>또는</Text>
            <View style={{ height: 0.5, width: SCREEN_WIDTH * 0.2, backgroundColor: "black"}}></View>
          </View> */}


          <TouchableOpacity
            onPress={() => navigation.navigate('Join1')}
            style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
          >
            <Text style={{...styles.btnText, color: "white", marginLeft: 8,}} >회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{...styles.introduceBtn, }}
          >
            <Text style={{...styles.btnText, color: "#FF4040", marginLeft: 8,}} >로그인</Text>
          </TouchableOpacity>

          <View 
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: regHeight * 8,
            }}
          >
            <Pressable
              style={{
                marginHorizontal: regWidth * 8,
              }}
              onPress={() => navigation.navigate('FindId')}
            >
              <Text
                style={{
                  fontSize: regWidth * 15,
                  fontWeight: "400",
                  color: "grey",
                }}
              >
                아이디 찾기
              </Text>
            </Pressable>
            {/* <Text
              style={{
                fontSize: regWidth * 15,
                fontWeight: "400",
                color: "grey",
              }}
            >
              |
            </Text>
            <Pressable
              style={{
                marginHorizontal: regWidth * 8,
              }}
              onPress={() => navigation.navigate('FindPassword')}
            >
              <Text
                style={{
                  fontSize: regWidth * 15,
                  fontWeight: "400",
                  color: "grey",
                }}
              >
                비밀번호 찾기
              </Text>
            </Pressable> */}
          </View>
          {/* <View style={{ flexDirection: "row", marginTop: 18, justifyContent: "center", }}>
            <Text style={{ fontSize: 13, fontWeight: "500", textAlign: "center", }}>
              이미 가입하셨나요?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              // style={styles.introduceBtn}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#FF0000", marginLeft: 10, textAlign: "center", }}>로그인</Text>
            </TouchableOpacity>
          </View> */}
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
    marginTop: regHeight * 58,
    marginHorizontal: regWidth * 20,
    paddingBottom: regHeight * 30,
    flexDirection: "row",
    justifyContent: "center"
  },
  LogoImage: {
    width: regWidth * 120,
    height: regWidth * 40,
    resizeMode: "contain",
  },
  introduce: {
    marginTop: -regHeight * 18,
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
    flexDirection: "row",
    paddingVertical: regHeight * 10,
    marginVertical: regHeight * 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF4040",
  },
  btnText: {
    fontSize: regWidth * 16,
    fontWeight: "500",
    textAlign: "center",
  }
})

export default Welcome;