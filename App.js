import { View, Text, Button, Dimensions, Image, StyleSheet, TextInput, Pressable, StatusBar, } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import {Join1, Join2, Join3} from "./screens/Join";
import { SubmitPost } from "./screens/CreatePost";
import { SubmitEditedPost } from "./screens/EditPost";
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
} from "./screens";

import { Feather, MaterialIcons } from '@expo/vector-icons'; 

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from './modules/hooks';
import { setUserInfo, setAccessToken, setRefreshToken, resetRefreshToken, setAvatar, resetAvatar, setIsAlarm, } from './modules/user';
import blankAvatar from './assets/images/peopleicon.png';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const PostStack = createNativeStackNavigator();
const BookmarkStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

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
        <App />
      </GestureHandlerRootView>
    </PersistGate>
  </Provider>
);

const App = () => {
  const dispatch = useDispatch();
  const { decodedRefresh, avatar, isAlarm, } = useSelector(userSelector);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isSignOut = !((decodedRefresh !== null) && (decodedRefresh.exp > (Date.now() / 1000)));
  // const [avatar, setAvatar] = useState(null);
  // const [decodedRefresh, setDecodedRefresh] = useState(null);


////////////////////////////////////////////////////////////백엔드 연결/////////////////////////////////////////////////////////////////////////////////////////////////


  useEffect(() => {
    // fetchRefreshToken();
    // fetchAvatar();
  }, [])

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

  return (
      <NavigationContainer>
        <StatusBar />
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
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false, }} />
          </Stack.Navigator>
        ) 
        : 
        (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
      
                if (route.name === 'Home') {
                  iconName = 'compass';
                } else if (route.name === 'Search') {
                  iconName = 'search';
                } else if (route.name === 'Post') {
                  iconName = 'plus-square';
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
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false, }} 
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
              listeners={({ navigation }) => ({
                tabPress: (e) => {
                  e.preventDefault();
                  navigation.navigate(`PostModal${navigation.getState().index}`, { index: navigation.getState().index, });
                }
              })}
            />
            <Tab.Screen name="Bookmark" component={BookmarkScreen} options={{ headerShown: false, }} />
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
            />
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

const HomeScreen = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={Home} />
      <HomeStack.Screen 
        name="PostModal0" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <HomeStack.Screen 
        name="CreateBookmark0" 
        component={CreateBookmark}
        options={{
          presentation: "transparentModal",
          // animation: "fade",
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
        name="PostModal2" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <BookmarkStack.Screen 
        name="CreateBookmark2" 
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
        name="PostModal3" 
        component={PostModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <ProfileStack.Screen 
        name="CreateBookmark3" 
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