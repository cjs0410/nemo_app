import { View, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Touchable } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
    useNavigation,
    useFocusEffect,
} from '@react-navigation/native';
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Api from "../lib/Api";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSelector, useDispatch } from 'react-redux';
import { resetRefreshToken, } from '../modules/user';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Profile = ({navigation}) => {
    const dispatch = useDispatch();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const fetchProfile = async() => {
        try {
            setLoading(true);
            await Api
            // .get("api/v1/user/profile/")
            .get("/api/v1/user/userview/")
            .then((res) => {
                setProfile(res.data);
                // console.log(res.data);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const logout = async() => {
        const refreshToken = await AsyncStorage.getItem('refresh');
        try {
            await Api
            .post("/api/v1/user/logout/", {
                refresh_token: refreshToken,
            })
            .then(async(res) => {
                await AsyncStorage.removeItem('access');
                await AsyncStorage.removeItem('refresh');
                dispatch(resetRefreshToken());
            })
        } catch (err) {
            console.error(err);
        }
    }

    return(
        <View style={styles.container}>
            <View style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>


                <Feather name="settings" size={25} color="black" />
            </View>
            <View style={styles.profileInfo}>
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <>
                        <Image source={{ uri: `http://3.38.228.24${profile.avatar}`}} style={styles.profileImage} />
                        <View style={{ marginHorizontal: 20,}} >
                            <Text style={{
                                fontSize: 11,
                                fontWeight: "500",
                                color: "#008000",
                            }}>{`@${profile.nickname}`}</Text>
                            <Text style={{
                                fontSize: 25,
                                fontWeight: "900",
                            }}>
                                {profile.name}
                            </Text>
                            {/* <View style={{ flexDirection: "row", marginTop: 15,}}>
                                <View>
                                    <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followers} Followers`}</Text>
                                </View>
                                <Entypo name="dot-single" size={15} color="black" />
                                <View>
                                    <Text style={{ fontSize: 15, fontWeight: "500", }} >{`${profile.followings} Following`}</Text>
                                </View>
                            </View> */}
                        </View>
                    </>
                }
            </View>
            <TouchableOpacity 
                style={styles.editBtn}
                activeOpacity={1}
                onPress={() => navigation.navigate('ProfileEdit', { profile: profile, })}
            >
                    <Text style={{ fontSize: 15, fontWeight: "500", }} >프로필 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={{...styles.editBtn, backgroundColor: "#FF4040", }}
                activeOpacity={1}
                onPress={logout}
            >
                    <Text style={{ fontSize: 15, fontWeight: "500", color: "white", }} >로그아웃</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Profile;

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
    profileInfo: {
        // backgroundColor: "pink",
        // marginTop: 60,
        marginHorizontal: 20,
        // paddingBottom: 30,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    profileImage: {
        width: 70,
        height: 70,
        resizeMode: "cover",
        borderRadius: 50,
        // backgroundColor: "red",
        marginTop: 10,
    },
    editBtn: {
        backgroundColor: "#DDDDDD",
        marginTop: 20,
        paddingHorizontal: 38,
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 15,
        justifyContent: "center",
        alignItems: "center",
    }

})