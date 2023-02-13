import { View, SafeAreaView, Text, TextInput, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Touchable, Pressable, ImageBackground, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo, } from "react";
import {
    useNavigation,
    useFocusEffect,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import writerImage from '../assets/images/userImage.jpeg';
import blankAvatar from '../assets/images/blankAvatar.png';
import blankBgd from '../assets/images/blankBgd.png';
import { Entypo, Feather, MaterialIcons, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Api from "../lib/Api";
// import * as ImagePicker from 'expo-image-picker';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setRefreshToken, setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, } from '../modules/user';
import { colors, regHeight, regWidth } from "../config/globalStyles";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ImagePicker from 'react-native-image-crop-picker';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import iconImageWhite from '../assets/icons/iconImageWhite.png';

const {width:SCREEN_WIDTH} = Dimensions.get('window');


Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var monthName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|M|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "M": return monthName[d.getMonth()];
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

const ProfileEdit = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { profile, } = route.params;
    const [loading, setLoading] = useState(false);
    // const [image, setImage] = useState(profile.avatar);
    const [image, setImage] = useState(null);
    const [imageSoruce, setImageSource] = useState(
        profile.avatar === null ? blankAvatar : {uri: profile.avatar}
    );
    const [bgdImage, setBgdImage] = useState(null);
    const [bgdImageSrc, setBgdImageSrc] = useState(
        profile.backgroundimg === null ? blankBgd : {uri: profile.backgroundimg}
    )
    // const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
    const [userTag, setUserTag] = useState(profile.user_tag);
    const [name, setName] = useState(profile.name);
    const [bio, setBio] = useState(profile.bio);
    const [birth, setBirth] = useState(profile.birth);
    const [isChange, setIsChange] = useState(false);
    const [isBgdChange, setIsBgdChange] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const [date, setDate] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const snapPoints = useMemo(() => [regHeight * 250], []);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        console.log(profile);
    }, [profile]);
    
    useEffect(() => {
        console.log(isChange);
    }, [isChange]);

    useEffect(() => {
        console.log(profile);
        if (profile && profile.birth) {
            console.log(profile.birth.split("-"));
            const format = profile.birth.split("-");
            const monthName = getMonthName(Number(format[1]));
            console.log(`${monthName} ${format[2]}, ${format[0]}`);
            setDate(`${monthName} ${format[2]}, ${format[0]}`);
        }
    }, [profile]);

    const getMonthName = (month) => {
        var monthWord = month;

        if (monthWord === 1) {
            monthWord = "January"
        } else if (monthWord === 2) {
            monthWord = "Feburary"
        } else if (monthWord === 3) {
            monthWord = "March"
        } else if (monthWord === 4) {
            monthWord = "April"
        } else if (monthWord === 5) {
            monthWord = "May"
        } else if (monthWord === 6) {
            monthWord = "June"
        } else if (monthWord === 7) {
            monthWord = "July"
        } else if (monthWord === 8) {
            monthWord = "August"
        } else if (monthWord === 9) {
            monthWord = "September"
        } else if (monthWord === 10) {
            monthWord = "October"
        } else if (monthWord === 11) {
            monthWord = "November"
        } else if (monthWord === 12) {
            monthWord = "December"
        }

        return monthWord;
    }

    // const pickImage = async () => {
    //     try {
    //       setLoading(true);
    //       if (!status.granted) {
    //         const permission = await requestPermission();
    //         if (!permission.granted) {
    //           return null;
    //         }
    //       }
    
    //       const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         quality: 0.4,
    //       });
      
    //       console.log(result.uri);
      
    //       if (!result.cancelled) {
    //         setImage(result.uri);
    //         setImageSource({uri: result.uri});
    //         setIsChange(true);
    //       }
    //     } catch (error) {
    //       console.error(error);
    //     }
    //     setLoading(false);
    // };

    const changeUserTag = (payload) => {
        if (payload.length === 0) {
            setUserTag(profile.user_tag);
        } else {
            setUserTag(payload);
        }
    };
    const onChangeName = (payload) => {
        if (payload.length === 0) {
            setName(profile.name);
        } else {
            setName(payload);
        }
    };

    const onChangeBio = (payload) => {
        if (payload.length === 0) {
            setBio(profile.bio);
        } else {
            setBio(payload);
        }
    }

    const onEdit = async() => {
        const formData = new FormData();
        setEditLoading(true);

        if (bgdImage !== null) {
            const filename = bgdImage.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('backgroundimg', {
                uri: bgdImage,
                type: type,
                name: filename
            });
        } 

        if (image !== null) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('avatar', {
                uri: image,
                type: type,
                name: filename
            });
        } 
        // else {
        //     formData.append('avatar', blankAvatar)
        // }

        formData.append('name', name);
        formData.append('avatar_change', isChange);
        formData.append('backimg_change', isBgdChange);
        formData.append('bio', bio);
        formData.append('birth', birth);
        console.log(formData);
        try {
            await Api.put('/api/v1/user/myprofile/edit/', formData, 
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
            )
            .then(async(res) => {
                // console.log(res.data);
                // await AsyncStorage.setItem('refresh', res.data.refresh);
                // await AsyncStorage.setItem('access', res.data.access);
                // dispatch(setRefreshToken(res.data.refresh));

                navigation.goBack();
                // dispatch(setShouldHomeRefresh(true));
                // dispatch(setShouldStorageRefresh(true));
                dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
        setEditLoading(false);
    }

    const showDatePicker = (e) => {
        e.preventDefault();
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        console.log(date);
        setBirth(date.format("yyyy-MM-dd"));
        setDate(date.format("M dd, yyyy"));
        hideDatePicker();
    };

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
    const bgdImgModalRef = useRef();
    const avatarModalRef = useRef();

    const onPressBgdImg = useCallback(() => {
        bgdImgModalRef.current.present();
    }, [bgdImgModalRef]);

    const onCloseBgdImg = useCallback(() => {
        // @ts-ignore
        bgdImgModalRef.current.dismiss();
    }, [bgdImgModalRef]);

    const onPressAvatarImg = useCallback(() => {
        avatarModalRef.current.present();
    }, [avatarModalRef]);

    const onCloseAvatarImg = useCallback(() => {
        // @ts-ignore
        avatarModalRef.current.dismiss();
    }, [avatarModalRef]);

    const makeBgd = async() => {
        try {
            ImagePicker.openCamera({
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH * (110 / 375),
                cropping: true,
                cropperCircleOverlay: true,
            }).then(image => {
                console.log(image);
    
                setBgdImage(`file://${image.path}`);
                setBgdImageSrc({uri: `file://${image.path}`});
                setIsBgdChange(true);
                onCloseBgdImg();
            });
      
          } catch (error) {
            console.error(error);
        }
    }

    const pickBgd = async() => {
        try {
            ImagePicker.openPicker({
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH * (110 / 375),
                cropping: true,
            }).then(image => {
                console.log(image);
    
                setBgdImage(`file://${image.path}`);
                setBgdImageSrc({uri: `file://${image.path}`});
                setIsBgdChange(true);
                onCloseBgdImg();
            });
      
          } catch (error) {
            console.error(error);
        }
    }

    const makeAvatar = async () => {
        try {
            ImagePicker.openCamera({
                width: 1000,
                height: 1000,
                cropping: true,
                // freeStyleCropEnabled: true,
                cropperCircleOverlay: true,
            }).then(image => {
                console.log(image);
                // setAvatar(`file://${image.path}`);

                setImage(`file://${image.path}`);
                setImageSource({uri: `file://${image.path}`});
                setIsChange(true);
                onCloseAvatarImg();
            });
    
        } catch (error) {
          console.error(error);
        }
    };

    const pickAvatar = async () => {
        try {
            ImagePicker.openPicker({
                width: 1000,
                height: 1000,
                cropping: true,
                // freeStyleCropEnabled: true,
                cropperCircleOverlay: true,
            }).then(image => {
                console.log(image);
                // setAvatar(`file://${image.path}`);

                setImage(`file://${image.path}`);
                setImageSource({uri: `file://${image.path}`});
                setIsChange(true);
                onCloseAvatarImg();
            });
    
        } catch (error) {
          console.error(error);
        }
    };

    return(
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
                        <Text 
                            style={{ 
                                fontSize: regWidth * 15, 
                                fontFamily: "NotoSansKR-Medium", 
                                color: colors.textDark,
                            }}
                        >
                            Cancel
                        </Text>
                    </Pressable>
                    <Text 
                        style={{ 
                            fontSize: regWidth * 15, 
                            fontFamily: "NotoSansKR-Black",
                            color: colors.textDark,
                        }}
                    >
                        Edit profile
                    </Text>
                    {editLoading ? 
                        <ActivityIndicator 
                            color="#008000"
                        />
                        :
                        <Pressable 
                            onPress={onEdit}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Text 
                                style={{ 
                                    fontSize: regWidth * 15, 
                                    fontFamily: "NotoSansKR-Medium", 
                                    color: colors.textLight,
                                }}
                            >
                                Save
                            </Text>
                        </Pressable>
                    }
            </View>
                {profile === null ? 
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    :
                    <ScrollView>
                        <View style={styles.imageEdit}>
                            <Pressable
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={onPressBgdImg}
                            >
                                <Image 
                                    // source={image === null ? { uri: profile.avatar === null ? blankAvatar : profile.avatar } : { uri: image }} 
                                    // source={image === null ? profile.avatar === null ? blankAvatar : { uri: profile.avatar } : { uri: image }} 
                                    // source={profile.avatar === null ? blankAvatar : (image === null ? { uri: profile.avatar } : { uri: image })} 
                                    source={bgdImageSrc}
                                    style={styles.bgdImage}
                                />
                                <Image 
                                    source={iconImageWhite}
                                    style={{
                                        width: regWidth * 50,
                                        height: regWidth * 50,
                                        position: "absolute",
                                    }}
                                />
                            </Pressable>
                            <Pressable
                                onPress={onPressAvatarImg}
                                style={{
                                    // backgroundColor:"pink",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: regHeight * 10,
                                }}
                            >
                                <Image 
                                    // source={image === null ? { uri: profile.avatar === null ? blankAvatar : profile.avatar } : { uri: image }} 
                                    // source={image === null ? profile.avatar === null ? blankAvatar : { uri: profile.avatar } : { uri: image }} 
                                    // source={profile.avatar === null ? blankAvatar : (image === null ? { uri: profile.avatar } : { uri: image })} 
                                    source={imageSoruce}
                                    style={styles.profileImage}
                                />
                                <Image 
                                    source={iconImageWhite}
                                    style={{
                                        width: regWidth * 40,
                                        height: regWidth * 40,
                                        position: "absolute",
                                    }}
                                />
                            </Pressable>
                        </View>
                            {/* <Pressable
                                style={{ marginTop: 15, }}
                                activeOpacity={1}
                                onPress={pickImage}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", }}>
                                    프로필 사진 바꾸기
                                </Text>
                            </Pressable>
                            <Pressable
                                style={{ marginTop: 22, }}
                                activeOpacity={1}
                                onPress={() => {
                                    if (imageSoruce !== blankAvatar) {
                                        setImageSource(blankAvatar);
                                        setIsChange(true);
                                    }
                                }}
                                hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", }}>
                                    프로필 기본 이미지로 설정
                                </Text>
                            </Pressable> */}
                        {/* <View style={styles.profileEdit}>
                            <Text style={{ fontSize: 15, fontWeight: "500", }}>
                                유저 태그
                            </Text>
                            <TextInput 
                                placeholder={profile.user_tag}
                                style={{ fontSize: 15, fontWeight: "500", }}
                                onChangeText={changeUserTag}
                            />
                        </View>
                        <View style={styles.profileEdit}>
                            <Text style={{ fontSize: 15, fontWeight: "500", }}>
                                이름
                            </Text>
                            <TextInput 
                                placeholder={profile.name}
                                style={{ fontSize: 15, fontWeight: "500", }}
                                onChangeText={onChangeName}
                            />
                        </View> */}
                        <View
                            style={{
                                marginHorizontal: regWidth * 20,
                            }}
                        >
                            <View style={styles.profileEdit}>
                                <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", width: "30%", }}>
                                    Name
                                </Text>
                                <TextInput 
                                    placeholder={profile.name}
                                    style={styles.profileInput}
                                    onChangeText={onChangeName}
                                />
                            </View>
                            <View style={styles.profileEdit}>
                                <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", width: "30%", }}>
                                    Bio
                                </Text>
                                <TextInput 
                                    placeholder={profile.bio}
                                    style={styles.profileInput}
                                    onChangeText={onChangeBio}
                                />
                            </View>
                            <View style={styles.profileEdit}>
                                <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", width: "30%", }}>
                                    Birthday
                                </Text>
                                <Pressable
                                    style={styles.profileInput}
                                    onPress={showDatePicker}
                                >
                                    <TextInput 
                                        placeholder="Birth"
                                        style={{
                                            fontSize: regWidth * 15, 
                                            fontFamily: "NotoSansKR-Medium", 
                                            width: "80%"
                                        }}
                                        onChangeText={onChangeName}
                                        editable={false}
                                        pointerEvents="none"
                                        value={date}
                                    />
                                    <DateTimePickerModal
                                        isVisible={isDatePickerVisible}
                                        mode="date"
                                        onConfirm={handleConfirm}
                                        onCancel={hideDatePicker}
                                    />
                                </Pressable>
                            </View>
                            <Text
                                style={{
                                    fontSize: regWidth * 13,
                                    fontFamily: "NotoSansKR-Medium",
                                    lineHeight: regWidth * 18,
                                    marginTop: regHeight * 37,
                                }}
                            >
                                Personal information. To change your personal
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", }}>
                                <Text
                                    style={{
                                        fontSize: regWidth * 13,
                                        fontFamily: "NotoSansKR-Medium",
                                        lineHeight: regWidth * 18,
                                    }}
                                >
                                    setting, visit
                                </Text>
                                <Pressable
                                    onPress={() => navigation.navigate('UserSetting', { profile: profile, })}
                                >
                                    <Text
                                        style={{
                                            fontSize: regWidth * 13,
                                            fontFamily: "NotoSansKR-Medium",
                                            lineHeight: regWidth * 18,
                                            color: colors.nemoNormal,
                                        }}
                                    >
                                        {" Settings."}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={styles.profileEdit}>
                                <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", width: "30%", }}>
                                    Username
                                </Text>
                                <View 
                                    style={{
                                        ...styles.profileInput,
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: regWidth * 15, 
                                            fontFamily: "NotoSansKR-Medium",
                                            color: colors.nemoNormal,
                                        }}
                                    >
                                        @
                                    </Text>
                                    <TextInput 
                                        placeholder={profile.user_tag}
                                        placeholderTextColor={colors.textDark}
                                        style={{
                                            fontSize: regWidth * 15, 
                                            fontFamily: "NotoSansKR-Medium", 
                                            width: "80%"
                                        }}
                                        onChangeText={onChangeName}
                                        editable={false}
                                    />
                                </View>
 
                            </View>
                            <View style={styles.profileEdit}>
                                <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", width: "30%", }}>
                                    Email
                                </Text>
                                <TextInput 
                                    placeholder={profile.email ? profile.email : "-"}
                                    placeholderTextColor={colors.textDark}
                                    style={styles.profileInput}
                                    onChangeText={onChangeName}
                                    editable={false}
                                />
                            </View>
                            <View style={styles.profileEdit}>
                                <Text style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Medium", width: "30%", }}>
                                    Phone
                                </Text>
                                <TextInput 
                                    placeholder={profile.hp ? `+82 0${String(profile.hp).replace(/(\d{2})(\d{4})(\d)/, "$1-$2-$3")}` : "-"}
                                    placeholderTextColor={colors.textDark}
                                    style={styles.profileInput}
                                    onChangeText={onChangeName}
                                    editable={false}
                                />
                            </View>
                        </View>
                    </ScrollView>
                }
             <BottomSheetModal
                index={0}
                ref={bgdImgModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Pressable
                        onPress={onCloseBgdImg}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => {
                            if (imageSoruce !== blankBgd) {
                                setBgdImageSrc(blankBgd);
                                setIsBgdChange(true);
                            }
                            onCloseBgdImg();
                        }}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                // color: sort === 0 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Remove current picture
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={makeBgd}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                // color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Take photo
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={pickBgd}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                // color: sort === 2 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Choose from library
                        </Text>
                    </Pressable>
                </View>
            </BottomSheetModal>
            <BottomSheetModal
                index={0}
                ref={avatarModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View
                    style={styles.modalContainer}
                >
                    <Pressable
                        onPress={onCloseAvatarImg}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#606060", }}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={() => {
                            if (imageSoruce !== blankAvatar) {
                                setImageSource(blankAvatar);
                                setIsChange(true);
                            }
                            onCloseAvatarImg();
                        }}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                // color: sort === 0 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Remove current picture
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={makeAvatar}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                // color: sort === 1 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Take photo
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={styles.sortBtn}
                        onPress={pickAvatar}
                    >
                        <Text 
                            style={{ 
                                fontSize: regWidth * 14, 
                                fontWeight: "700", 
                                // color: sort === 2 ? colors.nemoDark : colors.textDark, 
                            }}
                        >
                            Choose from library
                        </Text>
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    )
}

export default ProfileEdit;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
    //   backgroundColor: "pink",
      marginVertical: 10,
      marginHorizontal: 20,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    imageEdit: {
        justifyContent: "center",
        alignItems: "center",
        // borderBottomWidth: 0.5,
        // marginTop: regHeight * 10,
        // paddingBottom: 30,
    },
    bgdImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * (110 / 375),
        resizeMode: "cover",
        opacity: 0.5,
    },
    profileImage: {
        width: regWidth * 100,
        height: regWidth * 100,
        resizeMode: "cover",
        borderRadius: 999,
        // backgroundColor: "pink",
        opacity: 0.5,
    },
    profileEdit: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: regHeight * 30,
    },
    profileInput: {
        fontSize: regWidth * 15, 
        fontFamily: "NotoSansKR-Medium", 
        width: "70%",
        borderBottomWidth: 0.5,
        borderBottomColor: colors.bgdDark,
    },
    modalContainer: {
        marginHorizontal: regWidth * 20,
    },
    sortBtn: {
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: regHeight * 24, 
        justifyContent: "space-between",
    },

})