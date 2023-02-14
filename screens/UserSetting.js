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

const UserSetting = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { profile, } = route.params;
    const [withDrawModalVisible, setWithDrawModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [newPwdModalVisible, setNewPwdModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [warning, setWarning] = useState('');
    const insets = useSafeAreaInsets();

    const onChangeNewPassword1 = (payload) => setNewPassword1(payload);
    const onChangeNewPassword2 = (payload) => setNewPassword2(payload);

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

    const verifyPassword = async() => {
        try {
            await Api
            .post("/api/v1/user/verify_password/", {
                current_password: password,
            })
            .then((res) => {
                console.log(res.data);
                setPasswordModalVisible(false);
                setNewPwdModalVisible(true);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const changePassword = async() => {
        try {
            await Api
            .post("/api/v1/user/change_password/", {
                new_password1: newPassword1,
                new_password2: newPassword2,
            })
            .then((res) => {
                console.log(res.data);
                setNewPwdModalVisible(false);
            })
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
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*35, height: regWidth*35 }}
                    />
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontWeight: "700",
                }}>
                    Settings
                </Text>
                <Pressable
                    style={{ opacity: 0, }}
                >
                    <Image 
                        source={vectorLeftImage} 
                        style={{ width: regWidth*30, height: regWidth*30 }}
                    />
                </Pressable>
            </View>
            <Pressable 
                style={styles.menuContainer}
                onPress={() => navigation.navigate('AccountInfo', { profile: profile, })}
            >
                <Image 
                    source={iconPerson}
                    style={styles.icon}
                />
                <View style={{ justifyContent: "center", width: "75%", }}>
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                        Account information
                    </Text>
                    <Text style={{ fontSize: regWidth * 10, fontWeight: "400", marginTop: regHeight * 5, }}>
                        See your account information such as your phone
                    </Text>
                    <Text style={{ fontSize: regWidth * 10, fontWeight: "400", marginTop: regHeight * 2, }}>
                        number and email address.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </Pressable>
            {profile.user_ctg === "APPLE" || profile.user_ctg === "GOOGLE" ? 
                null
                : 
                <Pressable 
                    style={styles.menuContainer}
                    onPress={() => navigation.navigate('ChangePsw1', { profile: profile, })}
                >
                    <Image 
                        source={iconLock}
                        style={styles.icon}
                    />
                    <View style={{ justifyContent: "center", width: "75%", }}>
                        <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                            Change your password
                        </Text>
                        <Text style={{ fontSize: regWidth * 10, fontWeight: "400", marginTop: regHeight * 5, }}>
                            Whenever change it.
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="black" />
                </Pressable>
            }

            <Pressable 
                style={styles.menuContainer}
                onPress={() => navigation.navigate('Deactivate1', { profile: profile, })}
            >
                <Image 
                    source={iconLoaderOutline}
                    style={styles.icon}
                />
                <View style={{ justifyContent: "center", width: "75%", }}>
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                        Deactivate your account
                    </Text>
                    <Text style={{ fontSize: regWidth * 10, fontWeight: "400", marginTop: regHeight * 5, }}>
                        You can recover your account within 30 days.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </Pressable>
            <Pressable 
                style={styles.menuContainer}
                onPress={() => navigation.navigate('Contact', { profile: profile, })}
            >
                <Image 
                    source={iconLock}
                    style={styles.icon}
                />
                <View style={{ justifyContent: "center", width: "75%", }}>
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "700", }}>
                        Contact us
                    </Text>
                    <Text style={{ fontSize: regWidth * 10, fontWeight: "400", marginTop: regHeight * 5, }}>
                        Contact us anytime.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
            </Pressable>
            {/* <Pressable 
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
            </Pressable> */}

            <Modal
                animationType="fade"
                transparent={true}
                visible={passwordModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setPasswordModalVisible(false);
                            setWarning('');
                        }
                    }
                />
                <View 
                    style={{
                        ...styles.modal, 
                        // height: regHeight * 380, 
                    }}
                >
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={() => {
                                setPasswordModalVisible(false);
                                setWarning('');
                            }}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: 16, fontWeight: "700", }} >
                            비밀번호 변경
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={verifyPassword}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", color: "#008000", }}>
                                다음
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <TextInput 
                        placeholder="기존 비밀번호"
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
            <Modal
                animationType="fade"
                transparent={true}
                visible={newPwdModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setNewPwdModalVisible(false);
                            setWarning('');
                        }
                    }
                />
                <View 
                    style={{
                        ...styles.modal, 
                        height: regHeight * 300, 
                    }}
                >
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={() => {
                                setNewPwdModalVisible(false);
                                setWarning('');
                            }}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: 16, fontWeight: "700", }} >
                            비밀번호 변경
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={changePassword}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", color: "#008000", }}>
                                다음
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <TextInput 
                        placeholder="새 비밀번호"
                        style={{
                            ...styles.modalInput,
                            height: regHeight * 50,
                        }}
                        secureTextEntry={true}
                        onChangeText={onChangeNewPassword1}
                        // onSubmitEditing={submitTag}
                        // value={tagValue}
                    />
                    <TextInput 
                        placeholder="새 비밀번호 확인"
                        style={{
                            ...styles.modalInput,
                            height: regHeight * 50,
                        }}
                        secureTextEntry={true}
                        onChangeText={onChangeNewPassword2}
                        // onSubmitEditing={submitTag}
                        // value={tagValue}
                    />
                    <Text style={styles.warning}>
                        {warning}
                    </Text>
                </View>
            </Modal>

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
        marginVertical: regHeight * 10,
        marginHorizontal: regWidth * 13,
        paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuContainer: {
        flexDirection: "row",
        // borderBottomWidth: 0.5,
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
    icon: {
        width: regWidth * 40,
        height: regWidth * 40,
    }
})

export default UserSetting;