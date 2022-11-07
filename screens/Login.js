import { View, Text, Button, StyleSheet, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, } from '../modules/user';
import Api from '../lib/Api';


const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

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
          <Text style={styles.introduceText}>
            로그인
          </Text>

          <TouchableOpacity
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
          </View>

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
          <TouchableOpacity
            onPress={onLogin}
            style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
          >
            <Text style={{...styles.btnText, color: "white",}} >로그인하기</Text>
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
  },
  input: {
    backgroundColor: "#EEEEEE",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 24,
  },
})

export default Login;