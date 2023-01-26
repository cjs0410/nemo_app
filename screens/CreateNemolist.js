import { 
    StyleSheet, 
    View, 
    SafeAreaView, 
    ScrollView, 
    Text, TextInput, 
    Image, 
    Animated, 
    Pressable, 
    useWindowDimensions, 
    ActivityIndicator, 
    Alert, 
    ImageBackground, 
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo, } from "react";
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
import iconPlusNemoNormal from '../assets/icons/iconPlusNemoNormal.png';
import iconPlusNemoDark from '../assets/icons/iconPlusNemoDark.png';
import addBookCover from '../assets/images/addBookCover.png';
import iconBook from '../assets/icons/iconBook.png';
import addAlbumCover from '../assets/images/addAlbumCover.png';
import shadow from '../assets/images/shadow.png';

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

const CreateNemolist1 = ({navigation}) => {
    const [albumTitle, setAlbumTitle] = useState('');

    const onExit = () => {
        Alert.alert("Discard changes?", "If you go back now, you’ll lose your changes.", [
            {
                text: "Discard",
                onPress: () => navigation.goBack()
            },
            {
                text: "Keep editing", 
            }
        ]);
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable
                    onPress={onExit}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontWeight: "700",
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </SafeAreaView>
            <View 
                style={{ 
                    alignItems: "center", 
                    marginTop: regHeight * 28, 
                    marginHorizontal: regWidth * 12, 
                }}
            >
                <Text
                    style={{
                        fontSize: regWidth * 17,
                        fontWeight: "700",
                    }}
                >
                    Give your Nemolist a name
                </Text>
                <TextInput 
                    style={styles.nameIpt}
                    onChangeText={(payload) => setAlbumTitle(payload)}
                />
                <Pressable
                    style={{
                        marginTop: regHeight * 102,
                        backgroundColor: colors.nemoDark,
                        width: "80%",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: regWidth * 12,
                        borderRadius: 30,
                    }}
                    onPress={() => navigation.navigate('CreateNemolist2', { albumTitle: albumTitle, })}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 18,
                            fontWeight: "900",
                            color: "white",
                        }}
                    >
                        Next
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const CreateNemolist2 = ({navigation, route}) => {
    const [albumCover, setAlbumCover] = useState(null);
    const { albumTitle, } = route.params;

    const onExit = () => {
        Alert.alert("Discard changes?", "If you go back now, you’ll lose your changes.", [
            {
                text: "Discard",
                onPress: () => navigation.goBack()
            },
            {
                text: "Keep editing", 
            }
        ]);
    }

    const pickAlbumCover = async () => {
        try {
          ImagePicker.openPicker({
            width: 1300,
            height: 1300,
            cropping: true,
          }).then(image => {
            console.log(image);
            setAlbumCover(`file://${image.path}`);
          });
    
        } catch (error) {
          console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable
                    onPress={onExit}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 13,
                            fontWeight: "700",
                        }}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </SafeAreaView>
            <View 
                style={{ 
                    alignItems: "center", 
                    marginTop: regHeight * 28, 
                    marginHorizontal: regWidth * 12, 
                }}
            >
                <Text
                    style={{
                        fontSize: regWidth * 17,
                        fontWeight: "700",
                    }}
                >
                    Select your cover
                </Text>
                <Pressable
                    onPress={pickAlbumCover}
                    style={{
                        marginTop: regHeight * 22,
                    }}
                >
                    <Image 
                        source={albumCover ? {uri: albumCover} : addAlbumCover}
                        style={{
                            width: regWidth * 180,
                            height: regWidth * 180,
                            resizeMode: "contain",
                            borderRadius: 5,
                        }}
                    />
                </Pressable>
                <Pressable
                    style={{
                        marginTop: regHeight * 23,
                        backgroundColor: colors.nemoDark,
                        width: "80%",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: regWidth * 12,
                        borderRadius: 30,
                    }}
                    onPress={() => navigation.navigate('CreateNemolist3', { albumTitle: albumTitle, albumCover: albumCover, })}
                >
                    <Text
                        style={{
                            fontSize: regWidth * 18,
                            fontWeight: "900",
                            color: "white",
                        }}
                    >
                        Create
                    </Text>
                </Pressable>
                <Pressable
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.textNormal,
                        marginTop: regHeight * 7,
                    }}
                >
                    <Text style={{ fontSize: regWidth * 18, fontWeight: "700", color: colors.textNormal, }}>
                        Skip for now
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const CreateNemolist3 = ({navigation, route}) => {
    const { albumTitle, albumCover, } = route.params;
    const albumCoverValue = useRef(new Animated.Value(0)).current;
    const [userTag, setUserTag] = useState(null);
    const [addTextMode, setAddTextMode] = useState(false);
    const [text, setText] = useState(null);
    const [bookmarks, setBookmarks] = useState(null);

    useEffect(() => {
        fetchUserTag();
    }, [])

    const showAlbumCover = () => {
        Animated.timing(albumCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const fetchUserTag = async() => {
        try {
            const accessToken = await AsyncStorage.getItem('access');
            setUserTag(jwt_decode(accessToken).user_tag);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchBookmarks = async() => {
        try {
            await Api
            .post("/api/v4/album/bookmarklist/", {
                nemolist_id: albumId,
            })
            .then((res) => {
                console.log(res.data);
                setBookmarks(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                // animatedIndex={{
                //     value: 0,
                // }}
            />
        ),
        []
    );

    const addModalRef = useRef();
    const addSnapPoints = useMemo(() => [regHeight * 780], []);
    const onPressAddNemos = useCallback(() => {
        addModalRef.current.present();
    }, [addModalRef]);
    const onCloseAddNemos = useCallback(() => {
        addModalRef.current.dismiss();
    }, [addModalRef]);

    return (
        <View style={styles.container}>
            <SafeAreaView 
                style={{
                    // backgroundColor: albumInfo.background ? albumInfo.background : colors.nemoLight,
                }}
            >
                <View style={styles.albumHeader}>
                    <Pressable
                        style={{ opacity: addTextMode ? 1 : 0, }}
                        disabled={addTextMode ? false : true}
                        onPress={() => {
                            setAddTextMode(false);
                            setText(null);
                        }}
                    >
                        <Text
                            style={{
                                fontSize: regWidth* 13,
                                fontWeight: "700",
                                color: colors.textLight,
                            }}
                        >
                            Cancel
                        </Text>
                    </Pressable>
                    <Text
                        style={{
                            fontSize: regWidth * 17,
                            fontWeight: "700",
                        }}
                    >
                        {albumTitle}
                    </Text>
                    <Pressable
                        onPress={addTextMode ? () => setAddTextMode(false) : () => navigation.popToTop()}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    >
                        <Text
                            style={{
                                fontSize: regWidth* 13,
                                fontWeight: "700",
                                color: colors.textLight,
                            }}
                        >
                            Done
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
            <ScrollView
                style={{
                    // marginTop: -headerHeight,
                    zIndex: 0,
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ alignItems: "center", }}>
                    <ImageBackground
                        source={shadow}
                        style={{
                            width: regWidth * 220,
                            height: regWidth * 220,
                            alignItems: "center",
                            justifyContent: "center",
                            // marginTop: headerHeight + regHeight * 40,
                            marginTop: regHeight * 40,
                        }}
                    >
                        <Animated.Image 
                            source={{uri: albumCover}} 
                            style={{
                                ...styles.albumCover,
                                opacity: albumCoverValue,
                                marginTop: -regWidth * 10,
                            }}
                            onLoadEnd={showAlbumCover}
                        />
                    </ImageBackground>
                </View>
                <View
                    style={{
                        marginTop: regHeight * 8,
                        marginHorizontal: regWidth * 18,
                    }}
                >
                    {addTextMode ? 
                        <View>
                            <Text style={{ fontSize: regWidth * 13, fontWeight: "500", color: colors.nemoDark, }}>
                                Description
                            </Text>
                            <TextInput 
                                style={{
                                    borderBottomWidth: 1,
                                    fontSize: regWidth * 14,
                                    fontWeight: "500",
                                    marginTop: regHeight * 8,
                                }}
                                onChangeText={(payload) => setText(payload)}
                                multiline={true}
                            />
                        </View>
                        :
                        <>
                            {text ? 
                                <Text
                                    style={{
                                        fontSize: regWidth * 14,
                                        fontWeight: "500",
                                        lineHeight: regWidth * 21,
                                    }}
                                >
                                    {text}
                                </Text>
                                : 
                                <View style={{ alignItems: "center", }}>
                                    <Pressable
                                        style={{
                                            marginVertical: regHeight * 8,
                                            borderWidth: 1,
                                            borderColor: colors.nemoNormal,
                                            borderRadius: 20,
                                            paddingHorizontal: regWidth * 14,
                                            paddingVertical: regWidth * 6,
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                        onPress={() => setAddTextMode(true)}
                                    >
                                        <Image 
                                            source={iconPlusNemoNormal}
                                            style={{
                                                width: regWidth * 25,
                                                height: regWidth * 25,
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: regWidth * 17,
                                                fontWeight: "700",
                                                color: colors.nemoNormal,
                                            }}
                                        >
                                            Add Description
                                        </Text>
                                    </Pressable>
                                </View>
                            }
                        </>

                    }

                    <View
                        style={{ 
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: regHeight * 9,
                        }}
                    >
                        <View>
                            <Text
                                style={{
                                    fontSize: regWidth * 14,
                                    fontWeight: "700",
                                    color: colors.nemoDark,
                                }}
                            >
                                {`@${userTag}`}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 5, }}>
                                <Text style={styles.albumInfoTxt}>
                                    0
                                </Text>
                                <Text style={styles.albumInfoTxt}>
                                    {' likes'}
                                </Text>
                                <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
                                <Text style={styles.albumInfoTxt}>
                                    0
                                </Text>
                                <Text style={styles.albumInfoTxt}>
                                    {' Nemos'}
                                </Text>
                            </View>

                        </View>
                    </View>
                    <View style={{ alignItems: "center", marginTop: regHeight * 80, }}>
                        <Pressable
                            style={{
                                marginVertical: regHeight * 8,
                                borderWidth: 2,
                                borderColor: colors.nemoDark,
                                borderRadius: 20,
                                paddingHorizontal: regWidth * 14,
                                paddingVertical: regWidth * 4,
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                            onPress={() => {
                                onPressAddNemos();
                                fetchBookmarks();
                            }}
                        >
                            <Image 
                                source={iconPlusNemoDark}
                                style={{
                                    width: regWidth * 28,
                                    height: regWidth * 28,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: regWidth * 19,
                                    fontWeight: "900",
                                    color: colors.nemoDark,
                                }}
                            >
                                Add Nemos
                            </Text>
                        </Pressable>
                        <Text
                            style={{
                                fontSize: regWidth * 17,
                                fontWeight: "700",
                                color: colors.nemoDark,
                            }}
                        >
                            Add Nemos to your Nemolist
                        </Text>
                    </View>
                </View>
            </ScrollView>
            <BottomSheetModal
                index={0}
                ref={addModalRef}
                snapPoints={addSnapPoints}
                backdropComponent={renderBackdrop}
                // backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                {/* <View 
                    // style={{ 
                    //     paddingBottom: 45, 
                    // }}
                > */}
                    <View style={styles.modalHeader}>
                        <Pressable
                            onPress={onCloseAddNemos}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: colors.textLight, }}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Text style={{ fontSize: regWidth * 19, fontWeight: "900", }}>
                            Add Nemos
                        </Text>
                        <Pressable
                            onPress={onCloseAddNemos}
                        >
                            <Text style={{ fontSize: regWidth * 13, fontWeight: "700", color: colors.textLight, }}>
                                Done
                            </Text>
                        </Pressable>
                    </View>
                    <BottomSheetScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        {bookmarks !== null && bookmarks.map((bookmark, index) => (
                            <Pressable
                                key={index}
                                onPress={() => selectBookmark(bookmark)}
                                style={{ 
                                    opacity: selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ? 1 : 0.5,
                                    justifyContent: "center",
                                }}
                            >
                                <UnTouchableBookmarkList bookmark={bookmark} navigation={navigation} />
                                {selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id) === -1 ?
                                    <Image 
                                        source={iconPlusCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 50,
                                            height: regWidth * 50,
                                            right: 0,
                                            marginRight: 22,
                                        }}
                                    />
                                    :
                                    <View style={styles.numbering}>
                                        <Text style={{ fontSize: 16, fontWeight: "500", color: "white", }}>
                                            {Number(selectedBookmarks.findIndex(selectedBookmark => selectedBookmark.bookmark_id === bookmark.bookmark_id)) + 1}
                                        </Text>
                                    </View>
                                }
                            </Pressable>
                        ))}
                    </BottomSheetScrollView>
                {/* </View> */}
            </BottomSheetModal>
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
    albumHeader: {
        paddingHorizontal: regWidth * 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: regHeight * 8,
    },
    nameIpt: {
        fontSize: regWidth * 17,
        fontWeight: "500",
        borderBottomWidth: 1,
        borderBottomColor: colors.nemoDark,
        width: "100%",
        marginTop: regHeight * 68,
        // lineHeight: regWidth * 28,
        paddingHorizontal: regWidth * 4,
    },
    albumCover: {
        width: regWidth * 200,
        height: regWidth * 200,
        resizeMode: "contain",
        borderRadius: 5,
    },
    albumInfoTxt: {
        fontSize: regWidth * 14,
        fontWeight: "700",
        lineHeight: regWidth * 20,
        color: colors.textLight,
    },
})

export {CreateNemolist1, CreateNemolist2, CreateNemolist3};