import { View, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo, Feather, MaterialIcons } from '@expo/vector-icons'; 

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const PostTile = (props) => {
    const post = props.post;

    // useEffect(() => {
    //     console.log(post);
    // })

    return (
            <View style={styles.postTileBox} >
                <View style={{...styles.postTile, backgroundColor: "pink", }} >
                    <View style={styles.postIcon}>
                        <MaterialIcons name="collections-bookmark" size={18} color="black" />
                    </View>
                    <View style={styles.postTitle}>
                        <Text 
                            style={{ fontSize: 15, fontWeight: "700", }}
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                        >
                            {post.title}
                        </Text>
                        
                    </View>
                    <View style={styles.postContent}>
                        <Text style={{ fontSize: 13, fontWeight: "400", marginTop: 20, }} >{post.text}</Text>
                    </View>
                    <View style={styles.postWriter}>
                        <Text style={{ fontSize: 9, fontWeight: "500", }} >{`@${post.writer_nickname}`}</Text>
                    </View>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
    postTileBox: {
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_WIDTH * 0.5,
    },
    postTile: {
        flex: 1,
        // marginVertical: 1,
        // marginHorizontal: 1,
        borderWidth: 1,
        borderColor: "white",
        paddingHorizontal: 2,
    },
    postTitle: {
        flex: 0.6,
        width: "80%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    postContent: {
        flex: 2,
    },
    postIcon: {
        flex: 0.3,
        alignItems: "flex-end",
    },
    postWriter: {
        flex: 0.3,
        alignItems: "flex-start",
    },
})

export default PostTile;