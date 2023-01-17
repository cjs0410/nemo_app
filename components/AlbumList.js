import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import likedNemos from '../assets/images/likedNemos.png';

const AlbumList = (props) => {
    const album = props.album;
    const isDefault = props.isDefault;
    const albumCoverValue = useRef(new Animated.Value(0)).current;

    const showAlbumCover = () => {
        Animated.timing(albumCoverValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return(
        <View style={styles.AlbumListContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Animated.Image 
                    source={ isDefault ? likedNemos : { uri: album.nemolist_cover }} 
                    style={{
                        ...styles.AlbumImage,
                        opacity: albumCoverValue
                    }} 
                    onLoadEnd={showAlbumCover}
                />
                <View style={{ width: "80%" }}>
                    <Text 
                        style={{ fontSize: regWidth*20, fontWeight: "500", marginHorizontal: 12 }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {album.nemolist_title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", width: "70%", }}>
                        <Text 
                            style={{ ...styles.AlbumInfoText, marginRight: regWidth*3 }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {`@${album.user_tag}`}
                        </Text>
                        <Entypo name="dot-single" size={16} color="#808080" />
                        <Text 
                            style={{ ...styles.AlbumInfoText, width: "40%", marginHorizontal: regWidth*3, }}
                            // numberOfLines={1}
                            // ellipsizeMode="tail"
                        >
                            {album.nemos} Nemos
                        </Text>
                    </View>
                </View>
            </View>
            {/* <View style={{ flexDirection: "row", alignItems: "center", }}>
                <Feather name="bookmark" size={18} color="#606060" />
                <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", }}>
                    {album.bookmark_count}
                </Text>
            </View> */}
        </View>
    )
}

const styles = StyleSheet.create({
    AlbumListContainer: {
        flexDirection: "row",
        // alignItems: "center",
        justifyContent: "space-between",
        // borderBottomWidth: 0.5,
        // borderBottomColor: "#CBCBCB",
        paddingVertical: 12,
        marginHorizontal: 12,
    },
    AlbumImage: {
        width: regWidth * 50,
        height: regWidth * 50,
        resizeMode: "contain",
    },
    AlbumInfoText: {
        fontSize: regWidth*11, 
        fontWeight: "500", 
        marginHorizontal: regWidth*12, 
        color: "#606060"
    },

})

export default AlbumList;