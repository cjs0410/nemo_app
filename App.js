import { View, Text, Button, Dimensions, Image, StyleSheet, TextInput, Pressable, StatusBar, Platform, Alert, BackHandler, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, } from "react";
import { NavigationContainer, useNavigationContainerRef, getFocusedRouteNameFromRoute, } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack';
import {
  BaseButton,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import jwt_decode from "jwt-decode";
import Api from './lib/Api';
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import store from './modules';
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Join1, Join2, Join3, Join4, Join5, Join6} from "./screens/Join";
import { CreateNemolist1, CreateNemolist2, CreateNemolist3, } from "./screens/CreateNemolist";
import { FindId, FindId2, } from "./screens/FindId";
import { FindPassword, FindPassword2, FindPassword3, } from "./screens/FindPassword";
import { SubmitPost } from "./screens/CreatePost";
import { SubmitEditedPost } from "./screens/EditPost";
import { ChangeUsername, } from "./screens/AccountInfo";
import { ChangeHp1, ChangeHp2, ChangeHp3, } from "./screens/ChangeHp";
import { ChangePsw1, ChangePsw2, } from "./screens/ChangePsw";
import { ChangeEmail1, ChangeEmail2, ChangeEmail3, } from "./screens/ChangeEmail";
import { Deactivate1, Deactivate2, } from "./screens/Deactivate";

import { 
  Welcome, 
  Login, 
  Home, 
  Search, 
  AlarmScreen,
  PostModal, 
  Bookmark, 
  BookmarkNewDetail,
  BookmarkBook,
  BookmarkBookDetail,
  BookmarkUser,
  BookmarkUserDetail,
  UserStorage,
  UserSetting,
  ProfilePosts,
  OtherProfile,
  PostDetail,
  SelectBook,
  CreateBook,
  CreateBookmark,
  EditBookmark,
  CreatePost,
  EditPost,
  BookProfile,
  Profile,
  ProfileEdit,
  CreateAlbumModal,
  AlbumProfile,
  FollowScreen,
  LikeUsers,
  UserLibrary,
  NemoCalender,
  AccountInfo,
  ChangeGender,
  EditAlbum,
  Contact,
  Report,
} from "./screens";

import { Feather, MaterialIcons } from '@expo/vector-icons'; 

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from './modules/hooks';
import { setUserInfo, setAccessToken, setIsAlarm, } from './modules/user';
import {colors, regWidth, regHeight} from './config/globalStyles';

import blankAvatar from './assets/images/peopleicon.png';
import NemoLogo from './assets/NemoLogo.png';
import userLibraryLogo from './assets/icons/userLibraryLogo.png';
import unfocusUserLibrary from './assets/images/unfocusUserLibrary.png';
import focusUserLibrary from './assets/images/focusUserLibrary.png';
import createBookmark from './assets/images/createBookmark.png';
import unfocusExplore from './assets/images/unfocusExplore.png';
import focusExplore from './assets/images/focusExplore.png';

import analytics from '@react-native-firebase/analytics';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { Portal, PortalHost, PortalProvider } from '@gorhom/portal';
import messaging from '@react-native-firebase/messaging';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();
const PostStack = createStackNavigator();
const BookmarkStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const UserLibraryStack = createStackNavigator();

const SIGN_KEY = "@isSignedIn";
const {width:SCREEN_WIDTH} = Dimensions.get('window');

const persistor = persistStore(store);

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

const appRedux = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
            <App />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PersistGate>
  </Provider>
);

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}



const App = () => {
  const dispatch = useDispatch();
  const { decodedRefresh, avatar, isAlarm, } = useSelector(userSelector);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isSignOut = !((decodedRefresh !== null) && (decodedRefresh.exp > (Date.now() / 1000)));

  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();
  // const [avatar, setAvatar] = useState(null);
  // const [decodedRefresh, setDecodedRefresh] = useState(null);
  const [preparing, setPreparing] = useState(true);
  const [loading, setLoading] = useState(false);


////////////////////////////////////////////////////////////백엔드 연결/////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    requestUserPermission();
    
    // getFcmToken();
  }, [])

  const getFcmToken = useCallback(async () => {
    const fcmToken = await messaging().getToken();
    // Alert.alert(fcmToken);
    // console.log(fcmToken);

    try {
      console.log(fcmToken);
      await Api
      .post("/api/v1/user/test/", {
        token: fcmToken,
      })
      // .then((res) => {
      //   console.log(res.data);
      // })
    } catch (err) {
      console.error(err);
    }
  }, []);

  // const fetchRefreshToken = async() => {
  //   const refreshToken = await AsyncStorage.getItem('refresh');
  //   if (refreshToken !== null) {
  //     try {
  //       await Api.post("/api/v1/user/reissue/", {
  //         refresh_token: refreshToken,
  //       })
  //       .then(async(res) => {
  //         try {
  //           await AsyncStorage.setItem('refresh', res.data.refresh);
  //           await AsyncStorage.setItem('access', res.data.access);
  //           dispatch(setRefreshToken(res.data.refresh));
  //           fetchAvatar();
  //         } catch (err) {
  //           console.error(err);
  //         }
  //       })
  //     } catch (err) {
        
  //       if (err.response.status === 404) {
  //         await AsyncStorage.removeItem('access');
  //         await AsyncStorage.removeItem('refresh');
  //         dispatch(resetRefreshToken());
  //         dispatch(resetAvatar());
  //       } else {
  //         console.error(err);
  //       }
  //     }
  //   }
  //     // await AsyncStorage.removeItem('access');
  //     // await AsyncStorage.removeItem('refresh');
  //     // dispatch(resetRefreshToken());
  // }

  // const fetchAvatar = async() => {
  //   try {
  //     await Api
  //     .get("/api/v1/user/avatar/")
  //     .then((res) => {
  //       // setAvatar(res.data.avatar);
  //       // console.log(res.data);
  //       console.log("avatar!");
  //       dispatch(setAvatar(res.data.avatar));
  //       // dispatch(setIsAlarm(res.data.alarm));
  //     })
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // return(
  //   <NavigationContainer>
  //     <Stack.Navigator>
  //       <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false, }} />
  //       <Stack.Screen name="Join1" component={Join1} options={{ headerShown: false, }} />
  //       <Stack.Screen name="Join2" component={Join2} options={{ headerShown: false, }} />
  //       <Stack.Screen name="Join3" component={Join3} options={{ headerShown: false, }} />
  //       <Stack.Screen name="Login" component={Login} options={{ headerShown: false, }} />
  //     </Stack.Navigator>
  //   </NavigationContainer>
  // )

  // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  //   console.log('Message handled in the background!', remoteMessage);
  //   //  여기에 로직을 작성한다.
  //   //  remoteMessage.data로 메세지에 접근가능
  //   //  remoteMessage.from 으로 topic name 또는 message identifier
  //   //  remoteMessage.messageId 는 메시지 고유값 id
  //   //  remoteMessage.notification 메시지와 함께 보내진 추가 데이터
  //   //  remoteMessage.sentTime 보낸시간
  // });

  // Foreground 상태인 경우
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage);
      if (remoteMessage.notification.title === "Patch") {
        Alert.alert(remoteMessage.notification.body, "", [
          {
              text: "OK", 
              onPress: () => setLoading(true)
          }
        ]);
      } 
      if (remoteMessage.notification.title === "Notice") {
        Alert.alert(remoteMessage.notification.body, "", [
          {
              text: "OK", 
          }
        ]);
      }
      else {
        dispatch(setIsAlarm(true));
      }
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // remoteMessage.notification;
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    firstPrepare();
    // setTimeout(() => {
    //   setPreparing(false);
    // }, 2000)
  }, []);

  useEffect(() => {
    if (!preparing) {
      SplashScreen.hideAsync();
    }
  }, [preparing]);

  const firstPrepare = async() => {
    try {
      await Api
      .get("/api/v1/user/check_announce/")
      .then((res) => {
        console.log(res.data);
        if (res.data.accessible) {
          setPreparing(false);
          if (res.data.message !== "No Announce") {
            Alert.alert(res.data.message, "", [
              {
                  text: "OK", 
              }
            ]);
          }

        } else {
          setPreparing(true);
          Alert.alert(res.data.message, "", [
            {
                text: "OK", 
                // onPress: () => BackHandler.exitApp()
                // onPress: () => {throw {}}
            }
          ]);
        }
      })
    } catch (err) {
      console.error(err);
    }
  }


  if (loading) {
    return (
      <View style={styles.container}>
        <Image 
          source={NemoLogo}
          style={{
            width: regWidth * 256,
            height: regWidth * 256,
          }}
        />
      </View>
    )

  }
  
  return (
    
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          routeNameRef.current = navigationRef.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;
  
          if (previousRouteName !== currentRouteName) {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
          }
          routeNameRef.current = currentRouteName;
        }}
      >
        <StatusBar 
          barStyle={'dark-content'}
        />
        {!((decodedRefresh !== null) && (decodedRefresh.exp > (Date.now() / 1000))) ? 
        (
          <Stack.Navigator>
            <Stack.Screen 
              name="Welcome" 
              component={Welcome} 
              options={{ 
                headerShown: false, 
                animationTypeForReplace: isSignOut ? 'pop' : 'push',
              }} 
            />
            <Stack.Screen name="Join1" component={Join1} options={{ headerShown: false, }} />
            <Stack.Screen name="Join2" component={Join2} options={{ headerShown: false, }} />
            <Stack.Screen name="Join3" component={Join3} options={{ headerShown: false, }} />
            <Stack.Screen name="Join4" component={Join4} options={{ headerShown: false, }} />
            <Stack.Screen name="Join5" component={Join5} options={{ headerShown: false, }} />
            <Stack.Screen name="Join6" component={Join6} options={{ headerShown: false, }} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false, }} />
            <Stack.Screen name="FindId" component={FindId} options={{ headerShown: false, }} />
            <Stack.Screen name="FindId2" component={FindId2} options={{ headerShown: false, }} />
            <Stack.Screen name="FindPassword" component={FindPassword} options={{ headerShown: false, }} />
            <Stack.Screen name="FindPassword2" component={FindPassword2} options={{ headerShown: false, }} />
            <Stack.Screen name="FindPassword3" component={FindPassword3} options={{ headerShown: false, }} />
          </Stack.Navigator>
        ) 
        : 
        (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
      
                if (route.name === 'Home') {
                  return <Image 
                    source={focused ? focusExplore : unfocusExplore}
                    style={{
                      width: size,
                      height: size,
                      resizeMode: "contain",
                    }}
                  />
                } else if (route.name === 'Search') {
                  iconName = 'search';
                } else if (route.name === 'Post') {
                  return <Image 
                    source={createBookmark}
                    style={{        
                      width: size,
                      height: size,
                      resizeMode: "contain",
                    }} 
                  />
                } else if (route.name === 'Bookmark') {
                  iconName = 'download';
                } else if (route.name === 'Profile') {
                  // return <MaterialIcons name="collections-bookmark" size={size} color={color} />
                  return <Image 
                    source={blankAvatar} 
                    style={{        
                      width: size,
                      height: size,
                      resizeMode: "cover",
                      borderRadius: 50,
                    }} 
                  />
                } else if (route.name === 'UserLibrary') {
                  return <Image 
                    source={focused ? focusUserLibrary : unfocusUserLibrary}
                    style={{
                      width: size,
                      height: size,
                      resizeMode: "contain",
                    }}
                  />
                }
      
                // You can return any component that you like here!
                return <Feather name={iconName} size={28} color={color} />;
              },
              tabBarActiveTintColor: 'black',
              tabBarInactiveTintColor: 'gray',
              tabBarShowLabel: false,
            })}
          >

            <Tab.Screen 
              name="UserLibrary"
              component={UserLibraryScreen}
              // options={{ headerShown: false, }} 
              options={({ route }) => ({
                headerShown: false,
                // tabBarIcon: ({ focused }) => {
                //   return (
                //     <Image 
                //       source={focused ? focusUserLibrary : unfocusUserLibrary}
                //       style={{        
                //         width: regWidth * 28,
                //         height: regWidth * 28,
                //         resizeMode: "cover",
                //       }} 
                //     />
                //   )
                // },
                tabBarStyle: ((route) => {
                  const routeName = getFocusedRouteNameFromRoute(route)
                  if ((routeName === 'SelectBook0' || routeName === 'CreateBook0' || routeName === 'CreateBookmark0')) {
                    return { display: "none", }
                  }
                  if (routeName === 'NemoCalender') {
                    return { display: "none", }
                  }
                  if (routeName === 'EditBookmark') {
                    return { display: "none", }
                  }
                  if (routeName === 'CreateBookmark') {
                    return { display: "none", }
                  }
                  return
                })(route),
              })}

            />
            {/* <Tab.Screen 
              name="Search" 
              component={SearchScreen}
              options={{
                headerShown: false,
              }}
            /> */}
            <Tab.Screen 
              name="Post" 
              component={PostScreen}
              options={{
                // tabBarIcon: ({ focused }) => {
                //   return (
                //     <Image 
                //       // source={ avatar !== null ? { uri: avatar } : blankAvatar} 
                //       source={createBookmark}
                //       style={{        
                //         width: regWidth * 35,
                //         height: regWidth * 35,
                //         resizeMode: "cover",
                //       }} 
                //     />
                //   )
                // },
              }}
              listeners={({ navigation }) => ({
                tabPress: (e) => {
                  e.preventDefault();
                  navigation.navigate(`SelectBook${navigation.getState().index}`, { index: navigation.getState().index, isLib: false, });
                }
              })}
            />
            <Tab.Screen 
              name="Home" 
              component={HomeScreen} 
              options={({ route }) => ({
                headerShown: false,
                // tabBarIcon: ({ focused }) => {
                //   return (
                //     <Image 
                //       // source={ avatar !== null ? { uri: avatar } : blankAvatar} 
                //       source={focused ? focusExplore : unfocusExplore}
                //       style={{        
                //         width: regWidth * 35,
                //         height: regWidth * 35,
                //         resizeMode: "cover",
                //       }} 
                //     />
                //   )
                // },
                tabBarStyle: ((route) => {
                  const routeName = getFocusedRouteNameFromRoute(route)
                  if ((routeName === 'SelectBook2' || routeName === 'CreateBook2' || routeName === 'CreateBookmark2')) {
                    return { display: "none", }
                  }
                  if (routeName === 'EditBookmark') {
                    return { display: "none", }
                  }
                  if (routeName === 'CreateBookmark') {
                    return { display: "none", }
                  }
                  return
                })(route),
              })}
            />
            {/* <Tab.Screen name="Bookmark" component={BookmarkScreen} options={{ headerShown: false, }} />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ 
                headerShown: false, 
                tabBarIcon: ({ focused }) => {
                  return (
                    <Image 
                      source={ avatar !== null ? { uri: avatar } : blankAvatar} 
                      style={{        
                        width: 33,
                        height: 33,
                        resizeMode: "cover",
                        borderRadius: 50,
                        borderWidth: focused ? 2 : 0,
                        borderColor: "black",
                      }} 
                    />
                  )
                }
              }} 
            /> */}
          </Tab.Navigator>
        )}
      </NavigationContainer>
      
  );

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////테스트 용/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // return (
  //   <NavigationContainer>
  //     <Tab.Navigator
  //       screenOptions={({ route }) => ({
  //         tabBarIcon: ({ focused, color, size }) => {
  //           let iconName;

  //           if (route.name === 'Home') {
  //             iconName = 'home';
  //           } else if (route.name === 'Search') {
  //             iconName = 'search';
  //           } else if (route.name === 'Post') {
  //             iconName = 'plus';
  //           } else if (route.name === 'Bookmark') {
  //             iconName = 'bookmark';
  //           } else if (route.name === 'Profile') {
  //             iconName = 'user';
  //           }

  //           // You can return any component that you like here!
  //           return <Feather name={iconName} size={size} color={color} />;
  //         },
  //         tabBarActiveTintColor: 'red',
  //         tabBarInactiveTintColor: 'gray',
  //         tabBarShowLabel: false,
  //       })}
  //     >
  //       <Tab.Screen 
  //         name="Home" 
  //         component={HomeScreen} 
  //         options={{ headerShown: false, }} 
  //       />
  //       <Tab.Screen 
  //         name="Search" 
  //         component={SearchScreen}
  //         options={{
  //           headerShown: false,
  //         }}
  //       />
  //       <Tab.Screen 
  //         name="Post" 
  //         component={Post}
  //         listeners={({ navigation }) => ({
  //           tabPress: (e) => {
  //             e.preventDefault();
  //             navigation.navigate(`PostModal${navigation.getState().index}`);
  //           }
  //         })}
  //       />
  //       <Tab.Screen name="Bookmark" component={BookmarkScreen} options={{ headerShown: false, }} />
  //       <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false, }} />
  //     </Tab.Navigator>
  //   </NavigationContainer>
  // )

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

export default appRedux;

const UserLibraryScreen = ({route, navigation}) => {

  return (
    <UserLibraryStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <UserLibraryStack.Screen name="UserLibraryScreen" component={UserLibrary} />
      <UserLibraryStack.Screen 
        name="SelectBook0" 
        component={SelectBook}
        options={{
          // presentation: "modal",
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }}
      />
      <UserLibraryStack.Screen 
        name="CreateBook0" 
        component={CreateBook}
        options={{
          presentation: "fullScreenModal",
          // animation: "fade",
        }}
      />
      <UserLibraryStack.Screen 
        name="CreateBookmark0" 
        component={CreateBookmark}
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: false,
          // animation: "fade",
        }}
      />
      <UserLibraryStack.Screen 
        name="CreateBookmark" 
        component={CreateBookmark}
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: false,
          // animation: "fade",
        }}
      />
      <UserLibraryStack.Screen 
        name="UserStorage" 
        component={UserStorage} 
        options={{
          // presentation: "fullScreenModal",
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="UserSetting" 
        component={UserSetting}
        options={{
          // gestureDirection: "vertical",
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,

        }}
      />
      <UserLibraryStack.Screen name="AlarmScreen" component={AlarmScreen} />
      <UserLibraryStack.Screen name="BookmarkNewDetail" component={BookmarkNewDetail} />
      <UserLibraryStack.Screen name="AlbumProfile" component={AlbumProfile} />
      <UserLibraryStack.Screen name="BookProfile" component={BookProfile} />
      <UserLibraryStack.Screen name="OtherProfile" component={OtherProfile} />
      <UserLibraryStack.Screen 
        name="AccountInfo" 
        component={AccountInfo} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeUsername" 
        component={ChangeUsername} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeHp1" 
        component={ChangeHp1} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeHp2" 
        component={ChangeHp2} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeHp3" 
        component={ChangeHp3} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeEmail1" 
        component={ChangeEmail1} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeEmail2" 
        component={ChangeEmail2} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeEmail3" 
        component={ChangeEmail3} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangePsw1" 
        component={ChangePsw1} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangePsw2" 
        component={ChangePsw2} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="ChangeGender" 
        component={ChangeGender} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="Contact" 
        component={Contact} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="Deactivate1" 
        component={Deactivate1} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="Deactivate2" 
        component={Deactivate2} 
        options={{
          // gestureDirection: "horizontal-inverted",
        }}
      />
      <UserLibraryStack.Screen 
        name="NemoCalender" 
        component={NemoCalender}
        options={{
          // presentation: "transparentModal",
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }} 
      />
      <UserLibraryStack.Screen 
        name="ProfileEdit" 
        component={ProfileEdit}
        options={{
          // presentation: "transparentModal",
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }}
      />
      <UserLibraryStack.Screen 
        name="CreateNemolist1" 
        component={CreateNemolist1}
        options={{
          // presentation: "fullScreenModal",
        }}
      />
      <UserLibraryStack.Screen 
        name="CreateNemolist2" 
        component={CreateNemolist2}
        options={{
          // presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
      <UserLibraryStack.Screen 
        name="CreateNemolist3" 
        component={CreateNemolist3}
        options={{
          // presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
      <UserLibraryStack.Screen 
        name="EditAlbum" 
        component={EditAlbum}
        options={{
          // animation: "fade",
        }}
      />
      <UserLibraryStack.Screen 
        name="Report" 
        component={Report} 
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }}
      />
      <UserLibraryStack.Screen name="FollowScreen" component={FollowScreen} />
      <UserLibraryStack.Screen name="LikeUsers" component={LikeUsers} />
      <UserLibraryStack.Screen 
        name="EditBookmark" 
        component={EditBookmark}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }}
      />
    </UserLibraryStack.Navigator>
  )
}

const HomeScreen = ({route, navigation}) => {

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={Home} />
      <HomeStack.Screen 
        name="PostModal2" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <HomeStack.Screen 
        name="SelectBook2" 
        component={SelectBook}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }}
      />
      <HomeStack.Screen 
        name="CreateBook2" 
        component={CreateBook}
        options={{
          presentation: "fullScreenModal",
          // animation: "fade",
        }}
      />
      <HomeStack.Screen 
        name="CreateBookmark2" 
        component={CreateBookmark}
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: false,
        }}
      />
      <HomeStack.Screen 
        name="CreateBookmark" 
        component={CreateBookmark}
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: false,
        }}
      />
      <HomeStack.Screen 
        name="EditBookmark" 
        component={EditBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <HomeStack.Screen name="OtherProfile" component={OtherProfile} />
      <HomeStack.Screen name="PostDetail" component={PostDetail} />
      <HomeStack.Screen 
        name="EditPost" 
        component={EditPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <HomeStack.Screen 
        name="SubmitEditedPost" 
        component={SubmitEditedPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <HomeStack.Screen name="BookProfile" component={BookProfile} />
      <HomeStack.Screen name="BookmarkNewDetail" component={BookmarkNewDetail} />
      <HomeStack.Screen name="Profile" component={Profile} />
      <HomeStack.Screen name="AlarmScreen" component={AlarmScreen} />
      <HomeStack.Screen name="FollowScreen" component={FollowScreen} />
      <HomeStack.Screen name="AlbumProfile" component={AlbumProfile} />
      <HomeStack.Screen name="LikeUsers" component={LikeUsers} />
      <HomeStack.Screen 
        name="Search" 
        component={Search} 
        options={{
          animationEnabled: false,
          gestureEnabled: false,
        }}
      />
      <HomeStack.Screen 
        name="Report" 
        component={Report} 
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        }}
      />
    </HomeStack.Navigator>
  )
}

const SearchScreen = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <SearchStack.Screen name="SearchScreen" component={Search} />
      <SearchStack.Screen 
        name="PostModal1" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <SearchStack.Screen 
        name="CreateBookmark1" 
        component={CreateBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <SearchStack.Screen 
        name="EditBookmark" 
        component={EditBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <SearchStack.Screen name="OtherProfile" component={OtherProfile} />
      <SearchStack.Screen name="PostDetail" component={PostDetail} />
      <SearchStack.Screen 
        name="EditPost" 
        component={EditPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <SearchStack.Screen 
        name="SubmitEditedPost" 
        component={SubmitEditedPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <SearchStack.Screen name="BookProfile" component={BookProfile} />
      <SearchStack.Screen name="BookmarkNewDetail" component={BookmarkNewDetail} />
      <SearchStack.Screen name="Profile" component={Profile} />
      <SearchStack.Screen name="AlarmScreen" component={AlarmScreen} />
      <SearchStack.Screen name="FollowScreen" component={FollowScreen} />
      <SearchStack.Screen name="AlbumProfile" component={AlbumProfile} />
      <SearchStack.Screen name="LikeUsers" component={LikeUsers} />
    </SearchStack.Navigator>
  )
}

const BookmarkScreen = () => {
  return (
    <BookmarkStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <BookmarkStack.Screen name="BookmarkScreen" component={Bookmark} />
      <BookmarkStack.Screen 
        name="PostModal3" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <BookmarkStack.Screen 
        name="CreateBookmark3" 
        component={CreateBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <BookmarkStack.Screen 
        name="EditBookmark" 
        component={EditBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <BookmarkStack.Screen name="BookmarkNewDetail" component={BookmarkNewDetail} />
      <BookmarkStack.Screen name="BookmarkBook" component={BookmarkBook} />
      <BookmarkStack.Screen name="BookmarkBookDetail" component={BookmarkBookDetail} />
      <BookmarkStack.Screen name="BookmarkUser" component={BookmarkUser} />
      <BookmarkStack.Screen name="BookmarkUserDetail" component={BookmarkUserDetail} />
      <BookmarkStack.Screen name="BookProfile" component={BookProfile} />
      <BookmarkStack.Screen name="PostDetail" component={PostDetail} />
      <BookmarkStack.Screen 
        name="EditPost" 
        component={EditPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <BookmarkStack.Screen 
        name="SubmitEditedPost" 
        component={SubmitEditedPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <BookmarkStack.Screen name="OtherProfile" component={OtherProfile} />
      <BookmarkStack.Screen name="FollowScreen" component={FollowScreen} />
      <BookmarkStack.Screen name="AlbumProfile" component={AlbumProfile} />
      <BookmarkStack.Screen name="LikeUsers" component={LikeUsers} />
    </BookmarkStack.Navigator>
  )
}

const ProfileScreen = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={UserStorage} />
      <ProfileStack.Screen 
        name="PostModal4" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <ProfileStack.Screen 
        name="CreateBookmark4" 
        component={CreateBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <ProfileStack.Screen 
        name="EditBookmark" 
        component={EditBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
        }}
      />
      <ProfileStack.Screen 
        name="CreatePost" 
        component={CreatePost}
        options={{
          presentation: "transparentModal",
          // animation: "horizontal",
        }}
      />
      <ProfileStack.Screen 
        name="SubmitPost" 
        component={SubmitPost}
        options={{
          presentation: "transparentModal",
          // animation: "horizontal",
        }}
      />
      <ProfileStack.Screen name="ProfilePosts" component={ProfilePosts} />
      <ProfileStack.Screen name="PostDetail" component={PostDetail} />
      <ProfileStack.Screen 
        name="EditPost" 
        component={EditPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <ProfileStack.Screen 
        name="SubmitEditedPost" 
        component={SubmitEditedPost}
        options={{
          presentation: "transparentModal",
        }}
      />
      <ProfileStack.Screen 
        name="ProfileEdit" 
        component={ProfileEdit}
        options={{
          presentation: "transparentModal",
          // animation: "horizontal",
        }}
      />
      <ProfileStack.Screen 
        name="CreateAlbumModal" 
        component={CreateAlbumModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <ProfileStack.Screen name="BookProfile" component={BookProfile} />
      <ProfileStack.Screen name="BookmarkNewDetail" component={BookmarkNewDetail} />
      <ProfileStack.Screen name="AlbumProfile" component={AlbumProfile} />
      <ProfileStack.Screen name="OtherProfile" component={OtherProfile} />
      <ProfileStack.Screen 
        name="UserSetting" 
        component={UserSetting}
        // options={{
        //   presentation: "modal",
        //   // animation: "fade",
        // }} 
      />
      <ProfileStack.Screen name="FollowScreen" component={FollowScreen} />
      <ProfileStack.Screen name="LikeUsers" component={LikeUsers} />
    </ProfileStack.Navigator>
  )
}

const PostScreen = () => {
  return (
    <PostStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <PostStack.Screen 
        name="PostModal3" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <PostStack.Screen name="Profile" component={Profile} />
      <PostStack.Screen name="CreateBookmark" component={CreateBookmark} />
    </PostStack.Navigator>
  )
}




const Auth = async() => {
  const dispatch = useDispatch();
  const { refreshToken, decodedAccess, } = useSelector(userSelector);

  const requestRefreshToken = async() => {
    try {
      const response = await Api
      .post("", {
        refresh: refreshToken,
      })
      .then((res) => {
        dispatch(setAccessToken(res.data.access));
      })
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if ((decodedAccess !== null) && !(decodedAccess.exp > (Date.now() / 1000))) {
      requestRefreshToken();
    }
  }, []);
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center",
  },
})