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
import iconWarning from '../assets/icons/iconWarning.png';
import Check from '../assets/images/Check.png';
import Eye from '../assets/images/Eye.png';
import Arrow from '../assets/icons/LeftArrow.png';

import { useSelector, useDispatch } from 'react-redux';
import { resetRefreshToken, resetAvatar, setRefreshToken, setShouldUserRefresh, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Report = ({navigation, route}) => {
    const {ctg, id} = route.params;
    const insets = useSafeAreaInsets();
    const [report, setReport] = useState('');

    useEffect(() => {
        console.log(ctg, id);
    }, [])

    const onSubmit = async() => {
        try {
            if (ctg === "nemo") {
                await Api
                .post("/api/v2/bookmark/report/", {
                    report: report,
                    bookmark_id: id,
                })
                .then((res) => {
                    Alert.alert("Your report has been received", "", [
                        {
                            text: "OK", 
                            onPress: () => navigation.goBack()
                        }
                    ]);
                })
            }
            if (ctg === "nemolist") {
                await Api
                .post("/api/v2/bookmark/report/", {
                    report: report,
                    nemolist_id: id,
                })
                .then((res) => {
                    Alert.alert("Your report has been received", "", [
                        {
                            text: "OK", 
                            onPress: () => navigation.goBack()
                        }
                    ]);
                })
            }
            if (ctg === "book") {
                await Api
                .post("/api/v2/bookmark/report/", {
                    report: report,
                    book_id: id,
                })
                .then((res) => {
                    Alert.alert("Your report has been received", "", [
                        {
                            text: "OK", 
                            onPress: () => navigation.goBack()
                        }
                    ]);
                })
            }
            if (ctg === "user") {
                await Api
                .post("/api/v2/bookmark/report/", {
                    report: report,
                    user_tag: id,
                })
                .then((res) => {
                    Alert.alert("Your report has been received", "", [
                        {
                            text: "OK", 
                            onPress: () => navigation.goBack()
                        }
                    ]);
                })
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container} >
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
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontFamily: "NotoSansKR-Bold",
                            color: colors.textLight,
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
                <Text style={{
                    fontSize: regWidth * 18,
                    fontFamily: "NotoSansKR-Bold",
                }}>
                    Report
                </Text>
                <Pressable
                    style={{ opacity: 0, }}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontFamily: "NotoSansKR-Bold",
                            color: colors.textLight,
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </View>
            <View style={{ marginHorizontal: regWidth * 13, marginTop: regHeight * 28, }}>
                <Text
                    style={{
                        fontSize: regWidth * 15,
                        fontFamily: "NotoSansKR-Bold",
                    }}
                >
                    Tell us about our service error, or 
                </Text>
                <Text
                    style={{
                        fontSize: regWidth * 15,
                        fontFamily: "NotoSansKR-Bold",
                    }}
                >
                    complains.
                </Text>
                <TextInput 
                    style={{
                        width: "100%",
                        // backgroundColor:"pink",
                        borderBottomWidth: 1,
                        borderBottomColor: colors.textLight,
                        marginTop: regHeight * 42,
                        fontSize: regWidth * 17,
                        fontFamily: "NotoSansKR-Bold",
                    }}
                    multiline={true}
                    onChangeText={(payload) => setReport(payload)}
                />
                <View
                   style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: regHeight * 80,
                    }}
                >
                    <Pressable 
                        style={styles.btn}
                        onPress={onSubmit}
                    >
                        <Text style={styles.btnTxt}>
                            Submit
                        </Text>
                    </Pressable>
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
    btn: {
        width: regWidth * 300,
        height: regWidth * 60,
        backgroundColor: colors.nemoDark,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: regWidth * 30,
    },
    btnTxt: {
        fontSize: regWidth * 18,
        fontFamily: "NotoSansKR-Black", 
        color: "white",
    },
})

export default Report;