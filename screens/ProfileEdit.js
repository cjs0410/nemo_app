import { View, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Touchable } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
    useNavigation,
    useFocusEffect,
} from '@react-navigation/native';
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Api from "../lib/Api";
import * as ImagePicker from 'expo-image-picker';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setUserInfo, setAccessToken, setRefreshToken, resetRefreshToken, setAvatar, setIsAlarm, } from '../modules/user';

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
            quality: 1,
          });
      
          console.log(result.uri);
      
          if (!result.cancelled) {
            setImage(result.uri);
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
            .then((res) => {
                navigation.goBack();
            })
        } catch (err) {
            console.error(err);
        }
    }


    return(
        <View style={styles.container}>
            <View style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Text style={{ fontSize: 15, fontWeight: "500", }}>
                        취소
                    </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 19, fontWeight: "700", }}>
                    프로필 수정
                </Text>
                <TouchableOpacity onPress={onEdit} >
                    <Text style={{ fontSize: 15, fontWeight: "500", color: "#008000", }}>
                        완료
                    </Text>
                </TouchableOpacity>


                {/* <Feather name="settings" size={25} color="black" /> */}
            </View>
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <>
                        <View style={styles.imageEdit}>
                            <Image 
                                source={image === null ? { uri: `http://3.38.62.105${profile.avatar}`} : { uri: image }} 
                                style={styles.profileImage}
                            />
                            <TouchableOpacity
                                style={{ marginTop: 15, }}
                                activeOpacity={1}
                                onPress={pickImage}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", }}>
                                    프로필 사진 바꾸기
                                </Text>
                            </TouchableOpacity>
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
      marginTop: 60,
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