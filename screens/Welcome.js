import { View, Text, Button, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
// import favicon from '../assets/images/favicon.ico';
import { AntDesign } from '@expo/vector-icons';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Welcome = ({ navigation }) => {
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
          <Text style={styles.introduceText}>
            원하는 부분을
          </Text>
          <Text style={styles.introduceText}>
            언제 어디서나
          </Text>
          <Text style={styles.introduceText}>
            북마크에 저장하고,
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
            <AntDesign name="phone" size={18} color="white" />
            <Text style={{...styles.btnText, color: "white", marginLeft: 8,}} >전화번호로 계속하기</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", marginTop: 18, justifyContent: "center", }}>
            <Text style={{ fontSize: 13, fontWeight: "500", textAlign: "center", }}>
              이미 가입하셨나요?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              // style={styles.introduceBtn}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#FF0000", marginLeft: 10, textAlign: "center", }}>로그인</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: "row",
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
  }
})

export default Welcome;