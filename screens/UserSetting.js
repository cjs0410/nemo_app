import { View, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, RefreshControl, Pressable, } from "react-native";
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

const UserSetting = ({navigation}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <Pressable 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "500",
                }}>
                    설정
                </Text>
                <Pressable
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    style={{ opacity: 0, }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </View>
            <View style={styles.menuContainer}>
                <Text style={{ fontSize: 16, fontWeight: "500", }}>
                    로그아웃
                </Text>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </View>
            <View style={styles.menuContainer}>
                <Text style={{ fontSize: 16, fontWeight: "500", }}>
                    탈퇴하기
                </Text>
                <Ionicons name="chevron-forward" size={24} color="black" />
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
        // backgroundColor: "pink",
        marginTop: 60,
        marginHorizontal: 20,
        // paddingBottom: 30,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuContainer: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
    },
})

export default UserSetting;