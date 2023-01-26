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

const AccountInfo = ({navigation}) => {
    const dispatch = useDispatch();

    const logout = async() => {
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

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
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
                    fontWeight: "700",
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
            </SafeAreaView>
            <View 
                style={{
                    ...styles.infoContainter,
                    marginTop: regHeight * 60,        
                }}
            >
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Username
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={styles.infoTxt}>
                        @jungdonginn
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </View>
            <View style={styles.infoContainter}>
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Phone
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={styles.infoTxt}>
                        +82 10-0000-0000
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </View>
            <View style={styles.infoContainter}>
                <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                    Email
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={styles.infoTxt}>
                        Add
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </View>
            <View style={styles.infoContainter}>
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        marginVertical: 10,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoContainter: {
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