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

import { useSelector, useDispatch } from 'react-redux';
import { resetRefreshToken, resetAvatar, } from '../modules/user';

const UserSetting = ({navigation}) => {
    const dispatch = useDispatch();
    const [withDrawModalVisible, setWithDrawModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [warning, setWarning] = useState('');

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

    const withdraw = async() => {
        try {
            await Api
            .post("/api/v1/user/out/", {
                password: password,
            })
            .then(async(res) => {
                console.log("del");
                setWithDrawModalVisible(false);
                await AsyncStorage.removeItem('access');
                await AsyncStorage.removeItem('refresh');
                dispatch(resetRefreshToken());
                dispatch(resetAvatar());
            })
        } catch (err) {
            if (err.response.status === 404) {
                setWarning('잘못된 비밀번호입니다');
                console.error(err);
            } else {
                console.error(err);
            }
        }
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
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
            </SafeAreaView>
            <Pressable 
                style={styles.menuContainer}
                onPress={logout}
            >
                <Text style={{ fontSize: 16, fontWeight: "500", }}>
                    로그아웃
                </Text>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </Pressable>
            <Pressable 
                style={styles.menuContainer}
                onPress={() => setWithDrawModalVisible(true)}
            >
                <Text style={{ fontSize: 16, fontWeight: "500", }}>
                    탈퇴하기
                </Text>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </Pressable>
            {/* <View style={styles.menuContainer}>
                <Text style={{ fontSize: 16, fontWeight: "500", }}>
                    탈퇴하기
                </Text>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </View> */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={withDrawModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setWithDrawModalVisible(false);
                            setWarning('');
                        }
                    }
                />
                <View style={styles.modal}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={() => {
                                setWithDrawModalVisible(false);
                                setWarning('');
                            }}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: 16, fontWeight: "700", }} >
                            비밀번호를 입력하세요
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={withdraw}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", color: "#FF4040" }}>
                                탈퇴
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <TextInput 
                        placeholder="비밀번호"
                        style={{
                            ...styles.modalInput,
                            height: regHeight * 50,
                        }}
                        secureTextEntry={true}
                        onChangeText={setPassword}
                        // onSubmitEditing={submitTag}
                        // value={tagValue}
                    />
                    <Text style={styles.warning}>
                        {warning}
                    </Text>
                </View>
            </Modal>
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
        marginVertical: 10,
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
    modal: {
        width: '100%', 
        height: regHeight * 220, 
        position: 'absolute', 
        backgroundColor: 'white', 
        borderRadius: 10, 
        paddingTop: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: regHeight * 50,
        marginHorizontal: regWidth * 18, 
    },
    modalInput: {
        backgroundColor: "#EEEEEE",
        marginHorizontal: regWidth * 22,
        marginVertical: regHeight * 22,
        borderRadius: 10,
        height: "25%",
        paddingHorizontal: regWidth * 8,
        fontSize: regWidth * 15,
        fontWeight:"500",
    },
    warning: {
        fontSize: regWidth * 12,
        marginHorizontal: regWidth * 25,
        fontWeight: "500",
        color: "#FF4040",
        marginTop: regHeight * 8,
    },
})

export default UserSetting;