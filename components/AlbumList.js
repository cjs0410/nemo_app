import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';

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
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                <Animated.Image 
                    source={{ uri: album.album_cover }} 
                    style={{
                        ...styles.AlbumImage,
                        opacity: albumCoverValue,
                    }} 
                    onLoadEnd={showAlbumCover}
                />
                <Text 
                    style={{ fontSize: 15, fontWeight: "500", marginHorizontal: 12, width: "70%", }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {album.album_title}
                </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                <Feather name="bookmark" size={18} color="#606060" />
                <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", }}>
                    {album.bookmark_count}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    AlbumListContainer: {
        flexDirection: "row",
        alignItems: "center",
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