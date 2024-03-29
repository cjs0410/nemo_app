import { View, SafeAreaView, Text, Button, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Pressable, Platform, Linking, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, } from "react";
// import favicon from '../assets/images/favicon.ico';
import { AntDesign, Ionicons, } from '@expo/vector-icons';
import * as Font from "expo-font";
import * as Update from "expo-updates";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import Api from '../lib/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NemoLogo from '../assets/images/NemoLogo(small).png';
import GoogleLogo from '../assets/images/GoogleLogo.png';
import AppleLogo from '../assets/images/AppleLogo.png';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import jwtDecode from "jwt-decode";

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setRefreshToken, setFcmToken, } from '../modules/user';
import messaging from '@react-native-firebase/messaging';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const termsURL = "https://nemomemo.notion.site/Terms-of-Use-cfaefb66ef8d472da963a82e496908dc";
const privacyURL = "https://nemomemo.notion.site/Privacy-Policy-4c19c386e67240e593b38a10769e0938";
const cookieURL = "https://nemomemo.notion.site/Cookie-Policy-f56d8881fc5241cdb75fbdbcbd35ce89";

const Welcome = ({ navigation }) => {
  const dispatch = useDispatch();
  const logoValue = useRef(new Animated.Value(0)).current;
  const googleSigninConfigure = () => { 
    GoogleSignin.configure({ 
      webClientId: '594229461555-l001ir3b47pdahbqbioo23og1fjuus7i.apps.googleusercontent.com',
      // webClientId: '594229461555-jj0lrqph4o81vq8fdkgesskvu0pdh0js.apps.googleusercontent.com',
      // webClientId: '594229461555-6mhekt9rlok1vn3veetjst8ivbvs29k9.apps.googleusercontent.com',
      offlineAccess: true,
    }) 
  }

  const [credentialStateForUser, updateCredentialStateForUser] = useState(-1);

  useEffect(() => {
    if (!appleAuth.isSupported) return;

    fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
      updateCredentialStateForUser(`Error: ${error.code}`),
    );
  }, []);

  useEffect(() => {
    if (!appleAuth.isSupported) return;

    return appleAuth.onCredentialRevoked(async () => {
      console.warn('Credential Revoked');
      fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
        updateCredentialStateForUser(`Error: ${error.code}`),
      );
    });
  }, []);

  useEffect(() => {
    googleSigninConfigure();
  },[]);

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
      .then((res) => {
        dispatch(setFcmToken(fcmToken));
      })
      // .then((res) => {
      //   console.log(res.data);
      // })
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onGoogleButtonPress = async () => { 
    // const { idToken } = await GoogleSignin.signIn(); 
    // const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // console.log(googleCredential); 
    // return auth().signInWithCredential(googleCredential); 
    try {
      await GoogleSignin.hasPlayServices()
      // const userInfo = await GoogleSignin.signIn()
      await GoogleSignin.signIn()
      .then(async(userInfo) => {
        // console.log(userInfo);
        // console.log(jwtDecode(userInfo.idToken));
        // console.log(userInfo.idToken);
        try {
          console.log(userInfo.idToken);
          await Api
          .post("/api/v1/user/social_login/", {
            ctg: "google",
            id_token: userInfo.idToken,
          })
          .then(async(res) => {
            try {
              await AsyncStorage.setItem('refresh', res.data.refresh);
              await AsyncStorage.setItem('access', res.data.access);
              dispatch(setRefreshToken(res.data.refresh));
              getFcmToken();
            } catch (err) {
              console.error(err);
            }
          })
        } catch (err) {
          console.error(err);
        }
      })


    } catch (err) {
      console.log(err.message);
    }

  }

  /**
   * Fetches the credential state for the current user, if any, and updates state on completion.
   */
  async function fetchAndUpdateCredentialState(updateCredentialStateForUser) {
    if (user === null) {
      updateCredentialStateForUser('N/A');
    } else {
      const credentialState = await appleAuth.getCredentialStateForUser(user);
      if (credentialState === appleAuth.State.AUTHORIZED) {
        updateCredentialStateForUser('AUTHORIZED');
      } else {
        updateCredentialStateForUser(credentialState);
      }
    }
  }

  async function onAppleButtonPress(updateCredentialStateForUser) {
    console.log('Beginning Apple Authentication');
  
    // start a login request
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
  
      console.log('appleAuthRequestResponse', appleAuthRequestResponse);
  
      const {
        user: newUser,
        email,
        nonce,
        identityToken,
        realUserStatus /* etc */,
      } = appleAuthRequestResponse;
  
      user = newUser;
  
      fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
        updateCredentialStateForUser(`Error: ${error.code}`),
      );
  
      if (identityToken) {
        console.log(nonce, jwtDecode(identityToken, {header: true}));
        try {
          await Api
          .post('/api/v1/user/social_login/', {
              ctg: "apple",
              id_token: identityToken,
          })
          .then(async(res) => {
            console.log(res.data)
            try {
              await AsyncStorage.setItem('refresh', res.data.refresh);
              await AsyncStorage.setItem('access', res.data.access);
              dispatch(setRefreshToken(res.data.refresh));
              getFcmToken();
            } catch (err) {
              console.error(err);
            }
          })
        } catch (err) {
          console.error(err)
        }

      } else {
        // no token - failed sign-in?
      }
  
      if (realUserStatus === appleAuth.UserStatus.LIKELY_REAL) {
        console.log("I'm a real person!");
      }
  
      console.log(`Apple Authentication Completed, ${user}, ${email}`);
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        console.error(error);
      }
    }
  }

  const showLogo = () => {
      Animated.timing(logoValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
      }).start();
  }

  const openURL = async(url) => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

    // return (
    //   <View style={styles.container}>
    //     <SafeAreaView style={styles.header} >
    //       <Animated.Image 
    //         source={NemoLogo}
    //         style={{
    //             ...styles.LogoImage,
    //             opacity: logoValue,
    //         }}
    //         onLoadEnd={showLogo}
    //       />
    //     </SafeAreaView>
    //     <View style={styles.introduce} >
    //       <Text style={styles.introduceText}>
    //         책 문장을
    //       </Text>
    //       <Text style={styles.introduceText}>
    //         언제 어디서나
    //       </Text>
    //       <Text style={styles.introduceText}>
    //         빠르게 저장하고,
    //       </Text>
    //       <Text style={styles.introduceText}>
    //         마음대로 분류하고,
    //       </Text>
    //       <Text style={styles.introduceText}>
    //         공유까지 간편하게.
    //       </Text>
    //       <Text style={{ ...styles.introduceText, fontSize: 20, fontWeight: "700", marginBottom: 20, }} >
    //         지금 시작하세요.
    //       </Text>


    //       <TouchableOpacity
    //         onPress={() => navigation.navigate('Join1')}
    //         style={{...styles.introduceBtn, backgroundColor: "#FF4040", }}
    //       >
    //         <Text style={{...styles.btnText, color: "white", marginLeft: 8,}} >회원가입</Text>
    //       </TouchableOpacity>
    //       <TouchableOpacity
    //         onPress={() => navigation.navigate('Login')}
    //         style={{...styles.introduceBtn, }}
    //       >
    //         <Text style={{...styles.btnText, color: "#FF4040", marginLeft: 8,}} >로그인</Text>
    //       </TouchableOpacity>

    //       <View 
    //         style={{
    //           flexDirection: "row",
    //           alignItems: "center",
    //           justifyContent: "center",
    //           marginTop: regHeight * 8,
    //         }}
    //       >
    //         <Pressable
    //           style={{
    //             marginHorizontal: regWidth * 8,
    //           }}
    //           onPress={() => navigation.navigate('FindId')}
    //         >
    //           <Text
    //             style={{
    //               fontSize: regWidth * 15,
    //               fontWeight: "400",
    //               color: "grey",
    //             }}
    //           >
    //             아이디 찾기
    //           </Text>
    //         </Pressable>
    //         <Text
    //           style={{
    //             fontSize: regWidth * 15,
    //             fontWeight: "400",
    //             color: "grey",
    //           }}
    //         >
    //           |
    //         </Text>
    //         <Pressable
    //           style={{
    //             marginHorizontal: regWidth * 8,
    //           }}
    //           onPress={() => navigation.navigate('FindPassword')}
    //         >
    //           <Text
    //             style={{
    //               fontSize: regWidth * 15,
    //               fontWeight: "400",
    //               color: "grey",
    //             }}
    //           >
    //             비밀번호 찾기
    //           </Text>
    //         </Pressable>
    //       </View>
    //     </View>
    //   </View>
    // );
    return (
      <View style={{ flex:1, }}>
        <View style={{
          // flexDirection: "row",
          alignItems: "center",
          marginTop: regHeight*77,
          height: "30%",

        }}>
          <Animated.Image 
            source={NemoLogo}
            style={{
            width: regWidth*150,
            height: regHeight*42.44
            }}
            onLoadEnd={showLogo}
          />
          <View style={{
            alignItems: "center",
            marginTop: regHeight*50.5,        
          }}>
            <Text style={{
              fontSize: regWidth*25,
              fontFamily: "NotoSansKR-Black",
              lineHeight: regWidth*50,
              color: "#202020",
              includeFontPadding: false,
            }}>
              Where memo from books
            </Text>
            <Text style={{
              fontSize: regWidth*25,
              fontFamily: "NotoSansKR-Black",
              includeFontPadding: false,
              lineHeight: regWidth*50,
              color: "#202020"
            }}>
              meet social search.
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <Pressable 
              // hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
              style={{ ...styles.Btn, marginTop: regHeight*65, borderColor: "#202020" }} 
              onPress={() => onGoogleButtonPress()}
          >
              <Image 
                source={GoogleLogo}
                style={{
                  width: regWidth*25,
                  height: regHeight*25,
                  marginRight: regWidth*13,
                  resizeMode: "contain"
                }}
                onLoadEnd={showLogo}
              />
              <Text style={{ fontSize: regWidth * 18, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, color: "#202020" }} >
                  Continue with Google</Text>
          </Pressable>
          {Platform.OS === "ios" ?
            <Pressable 
              style={{ ...styles.Btn, marginTop: regHeight*14, borderColor: "#202020" }} 
              onPress={() => onAppleButtonPress(updateCredentialStateForUser)}
            >
                <Image 
                  source={AppleLogo}
                  style={{
                    width: regWidth*25,
                    height: regHeight*27,
                    marginRight: regWidth*13,
                    resizeMode: "contain"
                  }}
                  onLoadEnd={showLogo}
                />
                <Text style={{ fontSize: regWidth * 18, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, color: "#202020" }} >
                  Continue with Apple
                </Text>
            </Pressable>
            :
            null
          }

          {/* <AppleButton
            buttonStyle={AppleButton.Style.WHITE}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{ ...styles.Btn, marginTop: regHeight*14, borderColor: "#202020" }} 
            onPress={() => onAppleButtonPress()}
          /> */}
        </View>
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: regHeight*25}}>
          <View style={{ backgroundColor: "#606060", height: regHeight*1, width: regWidth*130 }}>
          </View>
          <Text style={{ marginHorizontal: regWidth*6, fontSize: regWidth*10, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color: "#606060"}}>
            or
          </Text>
          <View style={{ backgroundColor: "#606060", height: regHeight*1, width: regWidth*130 }}>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <Pressable 
              style={{ ...styles.Btn, borderColor: "#5c34cc" }} 
              onPress={() => navigation.navigate('Join1')}
          >
              <Text style={{ fontSize: regWidth * 18, fontFamily: "NotoSansKR-Black", includeFontPadding: false, color: "#5c34cc" }} >
                Create account
              </Text>
          </Pressable>
        </View>
        <View style={{ alignItems: "center", marginTop: regHeight*9 }}>
          <View style = { styles.introTxt }>
            <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color:"#606060"}}>
              By signing up, you agree to our&nbsp;
            </Text>
            <Pressable
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
              onPress={() => openURL(termsURL)}
            >
              <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color:"#7341ff"}}>
                {"Terms, "}
              </Text>
            </Pressable>
            <Pressable
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
              onPress={() => openURL(privacyURL)}
            >
              <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color:"#7341ff"}}>
                Privacy Policy,
              </Text>
            </Pressable>
          </View>
          <View style = { styles.introTxt }>
            <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color:"#606060"}}>
              and&nbsp;
            </Text>
            <Pressable
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
              onPress={() => openURL(cookieURL)}
            >
              <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color:"#7341ff"}}>
                Cookie Use.
              </Text>
            </Pressable>
          </View>
          <View style = {{ ...styles.introTxt, marginTop:regHeight*36 }}>
            <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Medium", includeFontPadding: false, color:"#606060"}}>
              Have an account already?&nbsp;
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
            >
              <Text style={{fontSize:regWidth*12, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, color:"#5c34cc" }}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
        
    );
}

const styles = StyleSheet.create({
  Btn: {
    borderRadius: regWidth * 40,
    justifyContent: "center",
    alignItems: "center",
    width: regWidth*280,
    height: regHeight*60,
    borderWidth: 2, 
    flexDirection: "row"
  },
  introTxt: {
    flexDirection:"row", 
    alignItems: "flex-start", 
    justifyContent: "flex-start", 
    width: regWidth*280, 
    // height: regHeight*36
  }
})

export default Welcome;