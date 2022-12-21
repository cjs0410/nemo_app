import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const AlbumList = (props) => {
    const album = props.album;
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
            <View style={{ flexDirection: "row", alignItems: "center", width: "70%"}}>
                <Animated.Image 
                    source={{ uri: album.album_cover }} 
                    style={{
                        ...styles.AlbumImage,
                        opacity: albumCoverValue
                    }} 
                    onLoadEnd={showAlbumCover}
                />
                <View style={{ backgroundColor: "pink" }}>
                    <Text 
                        style={{ fontSize: regWidth*20, fontWeight: "500", marginHorizontal: 12 }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {album.album_title}
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                        <Text 
                            style={{ fontSize: regWidth*11, fontWeight: "500", marginHorizontal: 12, color: "#606060", }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            유저 태그
                        </Text>
                        <Entypo name="dot-single" size={10} color="#808080" />
                        <Text 
                            style={{ fontSize: regWidth*11, fontWeight: "500", marginHorizontal: 12, color: "#606060" }}
                            // numberOfLines={1}
                            // ellipsizeMode="tail"
                        >
                            {album.bookmark_count} Nemos
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
        borderBottomWidth: 0.5,
        borderBottomColor: "#CBCBCB",
        paddingVertical: 12,
        marginHorizontal: 12,
    },
    AlbumImage: {
        width: 45,
        height: 45,
        resizeMode: "contain",
    },

})

export default AlbumList;