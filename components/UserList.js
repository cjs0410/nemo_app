import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import likedNemos from '../assets/images/likedNemos.png';
import { Use } from "react-native-svg";
import blankAvatar from '../assets/images/blankAvatar.png';

const UserList = (props) => {
    const user = props.user;

    return (
        <View 
            style={styles.userListContainer} 
        >
            <Image 
                source={user.avatar !== null ? { uri: user.avatar } : blankAvatar}
                style={styles.userImage}
            />
            <View style={{ marginHorizontal: regWidth * 10, }}>
                <Text 
                    style={{ 
                        fontSize: regWidth * 20, 
                        fontFamily: "NotoSansKR-Bold",
                        width: regWidth * 220, 
                        lineHeight: regWidth * 23,
                    }}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {user.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: regHeight * 2, }}>
                    <Text 
                        style={{ 
                            fontSize: regWidth * 11, 
                            fontFamily: "NotoSansKR-Medium",
                            maxWidth: "50%",
                            
                            color: colors.nemoNormal,
                            lineHeight: regWidth * 15,
                            marginRight: regWidth*3,
                        }}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                    >
                        {`@${user.user_tag}`}
                    </Text>
                    {user.nemos ? 
                        <>
                            <Entypo name="dot-single" size={16} color="#808080" />
                            <Text 
                                style={{ ...styles.userInfoText, marginHorizontal: regWidth*3, }}
                            >
                                {user.nemos} Nemos
                            </Text>
                        </>
                        : 
                        null
                    }
                    
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    userListContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: regWidth * 12,
        paddingVertical: regHeight * 12,
    },
    userImage: {
        width: regWidth * 50,
        height: regWidth * 50,
        borderRadius: 999,
        resizeMode: "cover",
    },
    userInfoText: {
        fontSize: regWidth*11, 
        fontFamily: "NotoSansKR-Medium",
        marginHorizontal: regWidth*12, 
        color: "#606060"
    },
})

export default UserList;