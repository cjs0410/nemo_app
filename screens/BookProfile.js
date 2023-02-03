import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, ScrollView, Text, Pressable, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Touchable, Platform, ActivityIndicator, Modal, Alert, ImageBackground, } from "react-native";
import React, { useEffect, useState, useCallback, useMemo, useRef, } from "react";
import Svg, {Line, Polygon} from 'react-native-svg';
import { Entypo, Feather, AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import blankBookCover from '../assets/images/blankBookImage.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";
import Api from '../lib/Api';
import { BookmarkList, AlbumList } from '../components';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import vectorLeftImage from '../assets/icons/vector_left.png';
import iconThreeDot from '../assets/icons/iconThreeDot.png';
import iconPlusNemoDark from '../assets/icons/iconPlusNemoDark.png';
import iconHeart from '../assets/icons/iconHeart.png';
import iconHeartOutline from '../assets/icons/iconHeartOutline.png';
import iconHeartOutlineBlack from '../assets/icons/iconHeartOutlineBlack.png';
import bookShelf from '../assets/images/bookShelf.png';
import iconAlert from '../assets/icons/iconAlert.png';

import { useSelector, useDispatch } from 'react-redux';
import { setShouldBookRefresh, } from '../modules/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookProfile = ({route, navigation}) => {
    const dispatch = useDispatch();
    const [isBookmark, setIsBookmark] = useState(true);
    const { bookId, } = route.params;
    const [bookInfo, setBookInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookModalVisible, setBookModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportContents, setReportContents] = useState('');
    const [isLike, setIsLike] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchBook();
    }, [])

    const fetchBook = async() => {
        try {
            setLoading(true);
            await Api.post("/api/v3/book/profile_view/", {
                book_id: bookId,
            })
            .then((res) => {
                // console.log(res.data);
                setBookInfo(res.data);
                setLikeCount(res.data.likes);
                setIsLike(res.data.is_like);
            })
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const selectBookmark = () => {
        setIsBookmark(true);
    }

    const selectPost = () => {
        setIsBookmark(false);
    }


    const onReport = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/report/", {
                book_id: bookId,
                report: reportContents,
            })
            .then((res) => {
                setReportVisible(false);
                Alert.alert("신고 접수", "신고가 접수되었습니다.");
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onLike = async() => {
        try {
            await Api
            .post("api/v3/book/like/", {
                book_id: bookId,
            })
            .then((res) => {
                // console.log(res.data);
                setIsLike(res.data.is_like);
                setLikeCount(res.data.likes);
                if (res.data.is_like) {
                    Alert.alert(bookInfo.book_title, "is added to your library");
                } else {
                    Alert.alert(bookInfo.book_title, "is deleted from your library");
                }
                dispatch(setShouldBookRefresh(true));
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

    const menuModalRef = useRef();
    const snapPoints = useMemo(() => [regHeight * 200], []);
    const onPressMenu = useCallback(() => {
        menuModalRef.current.present();
    }, [menuModalRef]);

    const onPressClose = useCallback(() => {
        menuModalRef.current.dismiss();
    }, [menuModalRef]);

    return (
        <View style={styles.container}>
            {bookInfo !== null ? 
                <>
                    <View 
                        style={{
                            backgroundColor: bookInfo.background ? bookInfo.background : colors.nemoLight,
                            paddingTop: insets.top,
                            paddingBottom: 0,
                            paddingLeft: insets.left,
                            paddingRight: insets.right,
                        }} 
                    >
                        <View style={styles.header}>
                            <Pressable
                                onPress={() => navigation.goBack()}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Image 
                                    source={vectorLeftImage} 
                                    style={{ width: regWidth*35, height: regWidth*35 }}
                                />
                            </Pressable>
                            <View style={{ alignItems: "center", }}>
                                <TouchableOpacity>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                }}>
                                    {bookInfo.book_title}
                                </Text>
                                </TouchableOpacity>
                            </View>
                            <Pressable
                                hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }}
                                onPress={onPressMenu}
                            >
                                <Image 
                                    source={iconThreeDot} 
                                    style={{ width: regWidth*35, height: regWidth*35 }}
                                />
                            </Pressable>
                        </View>

                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <LinearGradient 
                            colors={[
                                bookInfo.background ? bookInfo.background : colors.nemoLight,
                                // 'white',
                                'white'
                            ]} 
                            style={{
                                width: "100%",
                                height: regHeight * 400,
                                // height: "100%",
                                position: "absolute",
                                // backgroundColor: "pink"
                            }}
                        />
                        <View style={{ alignItems: "center",}}>
                            <ImageBackground
                                source={bookShelf}
                                style={{
                                    width: regWidth * 200,
                                    height: regWidth * 203,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: regHeight * 18,
                                }}
                            >
                                <Image 
                                    source={ bookInfo.book_cover !== null ? { uri: bookInfo.book_cover } : blankBookCover} 
                                    style={styles.bookImage}
                                />
                            </ImageBackground>
                            {/* <Text style={{ fontSize: 20, fontWeight: "700", marginVertical: 10,}}>
                                {bookInfo.book_title}
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: "400", marginVertical: 8,}}>
                                {bookInfo.book_author}
                            </Text> */}
                            <Pressable
                                style={{
                                    borderWidth: 2,
                                    borderColor: colors.nemoDark,
                                    borderRadius: regWidth * 30,
                                    paddingHorizontal: regWidth * 14,
                                    paddingVertical: regHeight * 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginTop: regHeight * 31,
                                }}
                                onPress={() => navigation.navigate("CreateBookmark", { selectedBook: bookInfo, })}
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
                                        color: colors.nemoDark,
                                        fontFamily: "NotoSansKR-Black"
                                    }}
                                >
                                    Create Nemo from this book
                                </Text>
                            </Pressable>
                        </View>
                        <View
                            style={{ 
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                marginTop: regHeight * 28,
                                marginHorizontal: regWidth * 13,
                            }}
                        >
                            <View>
                                <Text
                                    style={{
                                        fontSize: regWidth * 14,
                                        fontFamily: "NotoSansKR-Bold",
                                        lineHeight: regWidth * 20,
                                        color: colors.textDark,
                                    }}
                                >
                                    {bookInfo.book_title}
                                </Text>
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 5, }}>
                                    <Text style={styles.bookInfoTxt}>
                                        {likeCount}
                                    </Text>
                                    <Text style={styles.bookInfoTxt}>
                                        {' likes'}
                                    </Text>
                                    <Entypo name="dot-single" size={regWidth * 16} color="#808080" />
                                    <Text style={styles.bookInfoTxt}>
                                        {bookInfo.nemos}
                                    </Text>
                                    <Text style={styles.bookInfoTxt}>
                                        {' Nemos'}
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={onLike}
                            >
                                <Image 
                                    source={isLike ? iconHeart : iconHeartOutline}
                                    style={{
                                        width: regWidth * 35,
                                        height: regWidth * 35,
                                    }}
                                />
                            </Pressable>
                        </View>
                        {loading ? 
                            <ActivityIndicator 
                                color="black" 
                                style={{marginTop: 100}} 
                                size="large"
                            />
                            : 
                            <View style={{ marginTop: regHeight * 25, }}>
                                {bookInfo.bookmarks && bookInfo.bookmarks.map((bookmark, index) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={() => navigation.push('BookmarkNewDetail', {bookmarks: bookInfo.bookmarks, subTitle: bookInfo.book_title, title: "북마크", index: index, })} 
                                        key={index}
                                    >
                                        <BookmarkList bookmark={bookmark} navigation={navigation} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        }
                    </ScrollView>
                </>
                : 
                null
            }
            <BottomSheetModal
                index={0}
                ref={menuModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Pressable
                        onPress={onPressClose}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                        <Image 
                            source={iconHeartOutlineBlack}
                            style={{
                                height: regWidth * 39,
                                width: regWidth * 39,
                                resizeMode: "contain",
                            }}
                        />
                        <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                Like all Nemos
                            </Text>
                        </View>
                    </Pressable>
                    <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                        <Image 
                            source={iconAlert}
                            style={{
                                height: regWidth * 39,
                                width: regWidth * 39,
                                resizeMode: "contain",
                            }}
                        />
                        <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                Report
                            </Text>
                            <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                Report your issue
                            </Text>
                        </View>
                    </Pressable>
                    {/* {albumInfo && albumInfo.user_tag !== userTag ? 
                        <>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}
                                onPress={onFollow}
                            >
                                <Image 
                                    source={iconFollow}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        {isFollow ? `Unfollow @${albumInfo.user_tag}` : `Follow @${albumInfo.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconEyeoff}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        {`Block @${albumInfo.user_tag}`}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Report your issue
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                        :
                        <>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 19, }}>
                                <Image 
                                    source={iconEdit}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Edit
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Edit your Nemolist
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable 
                                style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}
                                onPress={deleteAlbum}
                            >
                                <Image 
                                    source={iconTrash}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Delete
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Delete Nemolist from your library
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 24, }}>
                                <Image 
                                    source={iconAlert}
                                    style={{
                                        height: regWidth * 39,
                                        width: regWidth * 39,
                                        resizeMode: "contain",
                                    }}
                                />
                                <View style={{ justifyContent: "center", marginHorizontal: regWidth * 7, }}>
                                    <Text style={{ fontSize: regWidth * 15, fontWeight: "700", color: "#202020", }}>
                                        Report
                                    </Text>
                                    <Text style={{ fontSize: regWidth * 12, fontWeight: "500", color: "#606060", }}>
                                        Report your issue
                                    </Text>
                                </View>
                            </Pressable>
                        </>
                    } */}

                </View>
            </BottomSheetModal>

            {/* <Modal
                // animationType="fade"
                transparent={true}
                visible={bookModalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setBookModalVisible(false);
                            setReportVisible(false);
                        }
                    }
                />
                    <Animated.View 
                        style={{
                            ...styles.modal,
                        }}
                    >
                        <TouchableOpacity 
                            style={styles.menu}
                            activeOpacity={1}
                            onPress={() => {
                                setBookModalVisible(false);
                                setReportVisible(true);
                            }}
                        >
                            <Entypo name="warning" size={24} color="black" />
                            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>신고</Text>
                        </TouchableOpacity>
                    </Animated.View>
            </Modal>
            <Modal
                // animationType="fade"
                transparent={true}
                visible={reportVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setReportVisible(false);
                        }
                    }
                />
                <KeyboardAvoidingView
                    style={{
                        ...styles.modal, 
                        height: regHeight * 650, 
                    }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <Entypo name="warning" size={24} color="red" />
                        <TextInput 
                            style={styles.reportInput}
                            placeholder="신고 내용을 적어주세요."
                            onChangeText={(payload => setReportContents(payload))}
                            multiline={true}
                        />
                    <TouchableOpacity 
                        style={{...styles.menu, justifyContent: "center", backgroundColor: "red"}}
                        activeOpacity={1}
                        onPress={onReport}
                    >
                        <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, color: "white", }}>신고하기</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal> */}

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
        marginHorizontal: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookImage: {
        width: 200,
        height: 200,
        resizeMode: "contain",

        // ...Platform.select({
        //     ios: {
        //       shadowColor: "black",
        //       shadowOffset: {
        //         width: 5,
        //         // height: 5,
        //       },
        //       shadowOpacity: 0.5,
        //     //   shadowRadius: 10,
        //     },
        //     android: {
        //       elevation: 3,
        //     },
        // }),
    },
    bookmarkOrPost: {
        width: SCREEN_WIDTH * 0.5,
        alignItems: "center",
        borderBottomWidth: 1,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
    },
    modal: {
        position: "absolute",
        width: "100%",
        height: regHeight * 150,
        bottom: 0, 
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 12,
        alignItems: "center",
    },
    menu: {
        backgroundColor: "#DDDDDD",
        width: SCREEN_WIDTH - regWidth * 40,
        height: regHeight * 40,
        borderRadius: 5,
        // paddingVertical: 8,
        paddingHorizontal: regWidth * 13,
        marginTop: regHeight * 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    reportInput: {
        width: SCREEN_WIDTH - regWidth * 40,
        height: regHeight * 170,
        backgroundColor: "#DDDDDD",
        borderWidth: 1,
        borderColor: "#FF4040",
        borderRadius: 10,
        marginTop: regHeight * 20,
        paddingHorizontal: regWidth * 10,
    },
    bookInfoTxt: {
        fontSize: regWidth * 14,
        fontFamily: "NotoSansKR-Bold",
        lineHeight: regWidth * 20,
        color: colors.textLight,
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
})

export default BookProfile;