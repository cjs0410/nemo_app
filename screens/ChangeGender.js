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
import sortCheck from '../assets/images/sortCheck.png';

import { useSelector, useDispatch } from 'react-redux';
import { resetRefreshToken, resetAvatar, setRefreshToken, setShouldUserRefresh, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChangeGender = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { gender, } = route.params;
    const insets = useSafeAreaInsets();
    const [newGender, setNewGender] = useState(gender);

    const onChangeGender = async() => {
        try {
            await Api
            .post("/api/v1/user/change/gender/", {
                gender: newGender,
            })
            .then((res) => {
                dispatch(setShouldUserRefresh(true));
                Alert.alert("Your gender is added", "", [
                    {
                        text: "OK", 
                        onPress: () => navigation.navigate("UserStorage")
                    }
                ]);
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
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Cancel
                    </Text>
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                    includeFontPadding: false,
                }}>
                    Change Gender
                </Text>
                <Pressable
                    onPress={onChangeGender}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    // disabled={isUsernameValid ? false : true}
                    // style={{ opacity: isUsernameValid ? 1 : 0 }}
                >
                    <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
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
                <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Bold", includeFontPadding: false,}}>
                    Gender
                </Text>
                <Pressable 
                    style={styles.genderBtn}
                    onPress={() => setNewGender("Male")}    
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Male
                    </Text>
                    <Image 
                        source={sortCheck}
                        style={{
                            width: regWidth * 25,
                            height: regWidth * 25,
                            opacity: newGender === "Male" ? 1 : 0,
                        }}
                    />
                </Pressable>
                <Pressable 
                    style={styles.genderBtn}
                    onPress={() => setNewGender("Female")}    
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Female
                    </Text>
                    <Image 
                        source={sortCheck}
                        style={{
                            width: regWidth * 25,
                            height: regWidth * 25,
                            opacity: newGender === "Female" ? 1 : 0,
                        }}
                    />
                </Pressable>
                <Pressable 
                    style={styles.genderBtn}
                    onPress={() => setNewGender("Another")}    
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", includeFontPadding: false,}}>
                        Another gender identity
                    </Text>
                    <Image
                        source={sortCheck}
                        style={{
                            width: regWidth * 25,
                            height: regWidth * 25,
                            opacity: newGender === "Another" ? 1 : 0,
                        }}
                    />
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
        marginVertical: regHeight * 10,
        marginHorizontal: regWidth * 13,
        paddingBottom: regHeight * 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    genderBtn: {
        marginTop: regHeight * 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    }
})

export default ChangeGender;