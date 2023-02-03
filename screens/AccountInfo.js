import { View, SafeAreaView, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, RefreshControl, Pressable, Alert, Modal, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, AntDesign, Ionicons, } from '@expo/vector-icons'; 
import { BookmarkList, AlbumList } from '../components';
import Api from "../lib/Api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import vectorLeftImage from '../assets/icons/vector_left.png';
import iconPerson from '../assets/icons/iconPerson.png';
import iconLock from '../assets/icons/iconLock.png';
import iconLoaderOutline from '../assets/icons/iconLoaderOutline.png';
import iconCheckmark from '../assets/icons/iconCheckmark.png';

import { useSelector, useDispatch } from 'react-redux';
import { resetRefreshToken, resetAvatar, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AccountInfo = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { profile, } = route.params;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (profile) {
            console.log(profile);
        }
    }, [profile]);

    const logout = async() => {
        Alert.alert("Dongin Jung", "Are you sure you want to log out of Nemo?", [
            {
                text: "Log out",
                style: 'destructive',
                onPress: async() => {
                    const refreshToken = await AsyncStorage.getItem('refresh');
                    try {
                        await Api
                        .post("/api/v1/user/logout/", {
                            refresh_token: refreshToken,
                        })
                        .then(async(res) => {
                            // navigation.popToTop();
                            await AsyncStorage.removeItem('access');
                            await AsyncStorage.removeItem('refresh');
                            dispatch(resetRefreshToken());
                            dispatch(resetAvatar());
                        })
                    } catch (err) {
                        console.error(err);
                    }
                } 
            },
            {
                text: "Cancel", 
                
            }
        ]);

    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*35, height: regWidth*35 }}
                    />
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                }}>
                    Account information
                </Text>
                <Pressable
                    style={{ opacity: 0, }}
                >
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*35, height: regWidth*35 }}
                    />
                </Pressable>
            </View>
            <View 
                style={{
                    ...styles.infoContainer,
                    marginTop: regHeight * 60,        
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Username
                </Text>
                <Pressable 
                    style={{ flexDirection: "row", alignItems: "center", }}
                    onPress={() => navigation.navigate("ChangeUsername", { userTag: profile.user_tag, })}    
                >
                    <Text style={styles.infoTxt}>
                        {`@${profile.user_tag}`}
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </Pressable>
            </View>
            <View style={styles.infoContainer}>
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Phone
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={styles.infoTxt}>
                        {profile.hp ? `+82 ${profile.hp}` : "-" }
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </View>
            <View style={styles.infoContainer}>
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Email
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={styles.infoTxt}>
                        {profile.email ? profile.email : "-" }
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </View>
            <View style={styles.infoContainer}>
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Gender
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={styles.infoTxt}>
                        Add
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </View>
            <View style={{ alignItems: "center", marginTop: regHeight * 51, }}>
                <Pressable
                    onPress={logout}
                >
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "700", color: colors.redNormal,  }}>
                        Log out
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const ChangeUsername = ({navigation, route}) => {
    const insets = useSafeAreaInsets();
    const { userTag, } = route.params;
    const [newUserTag, setNewUserTag] = useState('');

    const onChangeUsername = async() => {
        try {
            // await Api
            // .post("", {

            // })
            // .then((res) => {

            // })
            Alert.alert("Your username is updated.", "", [
                {
                    text: "OK", 
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", }}>
                        Cancel
                    </Text>
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                }}>
                    Change username
                </Text>
                <Pressable
                    onPress={onChangeUsername}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", }}>
                        Done
                    </Text>
                </Pressable>
            </View>
            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", }}>
                    Current
                </Text>
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", marginTop: regHeight * 20, }}>
                    {`@${userTag}`}
                </Text>
            </View>
            <View 
                style={{
                    marginTop: regHeight * 60,   
                    marginHorizontal: regWidth * 13,     
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", }}>
                    New username
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        marginTop: regHeight * 20,
                    }}
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium",  }}>
                        @
                    </Text>
                    <TextInput 
                        onChangeText={(payload) => setNewUserTag(payload)}
                        style={{
                            fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium",
                            width: "90%",
                        }}
                    />
                </View>
            </View>
        </View>
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        marginVertical: regHeight * 10,
        marginHorizontal: regWidth * 13,
        paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: regWidth * 13,
        marginVertical: regHeight * 12,
        alignItems: "center",
    },
    infoTxt: {
        fontSize: regWidth * 17, 
        fontWeight: "500", 
        color: colors.textLight,
        marginHorizontal: regWidth * 10,
    }
})

export default AccountInfo;
export {ChangeUsername};