import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo, Feather, AntDesign, Ionicons, FontAwesome, } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import blankAlbumImg from '../assets/images/blankAlbumImage.png';

const AlbumList = (props) => {
    return(
        <View style={styles.AlbumListContainer}>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                <Image source={blankAlbumImg} style={styles.AlbumImage} />
                <Text style={{ fontSize: 15, fontWeight: "500", marginHorizontal: 12, }}>
                    트럼프가 부자가 된 방법
                </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                <Feather name="bookmark" size={18} color="#606060" />
                <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", }}>
                    16
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