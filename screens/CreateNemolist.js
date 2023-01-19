import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Modal, Pressable, useWindowDimensions, ActivityIndicator, Alert, ImageBackground, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialIcons, FontAwesome, } from '@expo/vector-icons'; 
import { CardPreview, BlankCardFront, BlankCardChangable, AddBlankCardBack, BlankCardBack } from "../components/Card";
import { InputCard, InvisibleCard, DotInputCard, } from '../components';
import Api from "../lib/Api";
// import * as ImagePicker from 'expo-image-picker';
import bookCover from '../assets/images/steve.jpeg';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import iconCamera from '../assets/images/iconCamera.png';
import iconImage from '../assets/images/iconImage.png';
import iconPlus from '../assets/images/iconPlus.png';
import addBookCover from '../assets/images/addBookCover.png';
import iconBook from '../assets/icons/iconBook.png';
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
// import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import HTML from 'react-native-render-html';
import { UnTouchableBookmarkList, } from "../components/BookmarkList";
import { BookList, } from '../components';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetUserInfo, setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import ImagePicker from 'react-native-image-crop-picker';
import { color } from "react-native-reanimated";

const CreateNemolist = ({navigation}) => {
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontWeight: "700",
                        }}
                    >
                        Cencel
                    </Text>
                </Pressable>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "red",
        marginVertical: 10,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
})

export default CreateNemolist;