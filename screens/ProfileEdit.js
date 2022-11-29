import { View, SafeAreaView, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Touchable, Pressable } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
    useNavigation,
    useFocusEffect,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import writerImage from '../assets/images/userImage.jpeg';
import blankAvatar from '../assets/images/peopleicon.png';
import { Entypo, Feather, MaterialIcons, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Api from "../lib/Api";
import * as ImagePicker from 'expo-image-picker';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setRefreshToken, setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, } from '../modules/user';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const ProfileEdit = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { profile, } = route.params;
    const [loading, setLoading] = useState(false);
    // const [image, setImage] = useState(profile.avatar);
    const [image, setImage] = useState(null);
    const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
    const [userTag, setUserTag] = useState(profile.user_tag);
    const [name, setName] = useState(profile.name);
    const [imageSoruce, setImageSource] = useState(
        profile.avatar === null ? blankAvatar : {uri: profile.avatar}
    )

    const pickImage = async () => {
        try {
          setLoading(true);
          if (!status.granted) {
            const permission = await requestPermission();
            if (!permission.granted) {
              return null;
            }
          }
    
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
      
          console.log(result.uri);
      
          if (!result.cancelled) {
            setImage(result.uri);
            setImageSource({uri: result.uri});
          }
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
    };

    const changeUserTag = (payload) => {
        if (payload.length === 0) {
            setUserTag(profile.user_tag);
        } else {
            setUserTag(payload);
        }
    };
    const changeName = (payload) => {
        if (payload.length === 0) {
            setName(profile.name);
        } else {
            setName(payload);
        }
    };

    const onEdit = async() => {
        const formData = new FormData();
        
        if (image !== null) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('avatar', {
                uri: image,
                type: type,
                name: filename
            });
        } 
        // else {
        //     formData.append('avatar', blankAvatar)
        // }

        formData.append('user_tag', userTag);
        formData.append('name', name);
        console.log(formData);
        try {
            await Api.put('/api/v1/user/myprofile/edit/', formData, 
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
            )
            .then(async(res) => {
                // console.log(res.data);
                await AsyncStorage.setItem('refresh', res.data.refresh);
                await AsyncStorage.setItem('access', res.data.access);
                dispatch(setRefreshToken(res.data.refresh));

                navigation.goBack();
                dispatch(setShouldHomeRefresh(true));
                dispatch(setShouldStorageRefresh(true));
                dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }


    return(
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <Pressable 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: 15, fontWeight: "500", }}>
                        취소
                    </Text>
                </Pressable>
                <Text style={{ fontSize: 19, fontWeight: "700", }}>
                    프로필 수정
                </Text>
                <Pressable 
                    onPress={onEdit}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: 15, fontWeight: "500", color: "#008000", }}>
                        완료
                    </Text>
                </Pressable>


                {/* <Feather name="settings" size={25} color="black" /> */}
            </SafeAreaView>
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <>
                        <View style={styles.imageEdit}>
                            <Pressable
                                onPress={pickImage}
                            >
                                <Image 
                                    // source={image === null ? { uri: profile.avatar === null ? blankAvatar : profile.avatar } : { uri: image }} 
                                    // source={image === null ? profile.avatar === null ? blankAvatar : { uri: profile.avatar } : { uri: image }} 
                                    // source={profile.avatar === null ? blankAvatar : (image === null ? { uri: profile.avatar } : { uri: image })} 
                                    source={imageSoruce}
                                    style={styles.profileImage}
                                />
                            </Pressable>
                            <Pressable
                                style={{ marginTop: 15, }}
                                activeOpacity={1}
                                onPress={pickImage}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", }}>
                                    프로필 사진 바꾸기
                                </Text>
                            </Pressable>
                            <Pressable
                                style={{ marginTop: 22, }}
                                activeOpacity={1}
                                onPress={() => setImageSource(blankAvatar)}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", }}>
                                    프로필 기본 이미지로 설정
                                </Text>
                            </Pressable>
                        </View>
                        <View style={styles.profileEdit}>
                            <Text style={{ fontSize: 15, fontWeight: "500", }}>
                                유저 태그
                            </Text>
                            <TextInput 
                                placeholder={profile.user_tag}
                                style={{ fontSize: 15, fontWeight: "500", }}
                                onChangeText={changeUserTag}
                            />
                        </View>
                        <View style={styles.profileEdit}>
                            <Text style={{ fontSize: 15, fontWeight: "500", }}>
                                이름
                            </Text>
                            <TextInput 
                                placeholder={profile.name}
                                style={{ fontSize: 15, fontWeight: "500", }}
                                onChangeText={changeName}
                            />
                        </View>
                    </>
                }
 
        </View>
    )
}

export default ProfileEdit;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
    //   backgroundColor: "pink",
      marginVertical: 10,
      marginHorizontal: 20,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    imageEdit: {
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 0.5,
        marginTop: 10,
        paddingBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        resizeMode: "cover",
        borderRadius: 50,
    },
    profileEdit: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        paddingVertical: 20,
        paddingHorizontal: 20,
        justifyContent: "space-between",
        alignItems: "center",
    }

})