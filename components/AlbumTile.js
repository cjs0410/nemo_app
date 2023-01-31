import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import likedNemos from '../assets/images/likedNemos.png';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const AlbumTile = (props) => {
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
    return (
        <View style={styles.AlbumTileContainer}>
            <View style={{ alignItems: "center", }}>
                <Animated.Image 
                    source={ isDefault ? likedNemos : { uri: album.nemolist_cover }} 
                    style={{
                        ...styles.AlbumImage,
                        opacity: albumCoverValue
                    }} 
                    onLoadEnd={showAlbumCover}
                />
                <View 
                    style={{ 
                        width: regWidth * 165, 
                        marginTop: regHeight * 8,
                    }}
                >
                    <Text 
                        style={{ fontSize: regWidth * 15, fontFamily: "NotoSansKR-Bold", }}
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
                            style={{ ...styles.AlbumInfoText, marginLeft: regWidth*3, }}
                            // numberOfLines={1}
                            // ellipsizeMode="tail"
                        >
                            {album.nemos} Nemos
                        </Text>
                    </View>
                </View>
            </View>

        </View>
    )

}

const styles = StyleSheet.create({
    AlbumTileContainer: {
        justifyContent: "space-between",
        // borderBottomWidth: 0.5,
        // borderBottomColor: "#CBCBCB",
        paddingVertical: regHeight * 12,
        // marginHorizontal: regWidth * 12,
        width: SCREEN_WIDTH / 2,
        // backgroundColor:"pink"
    },
    AlbumImage: {
        width: regWidth * 165,
        height: regWidth * 165,
        resizeMode: "contain",
        borderRadius: 5,
    },
    AlbumInfoText: {
        fontSize: regWidth*10, 
        fontFamily: "NotoSansKR-Medium",
        // marginHorizontal: regWidth*12, 
        color: colors.textLight,
    },

})

export default AlbumTile;