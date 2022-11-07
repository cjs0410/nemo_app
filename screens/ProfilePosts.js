import { StyleSheet, View, ScrollView, Text, Button, Dimensions, Image, TouchableOpacity, Animated } from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo, Ionicons, Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'; 
import writerImage from '../assets/images/userImage.jpeg';
import bookCover from '../assets/images/steve.jpeg';
import Api from '../lib/Api';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetUserInfo } from '../modules/user';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const ProfilePosts = ({route, navigation}) => {
    const dispatch = useDispatch();
    const { accessToken, refreshToken, decodedAccess, decodedRefresh } = useSelector(userSelector);
    // 카드 뒷면 보기
    const [isReverse, setIsReverse] = useState(false);
    const [current, setCurrent] = useState(0);
    const { posts, } = route.params;

    const handleCurrentChange = (e) => {
        const nextCurrent = Math.floor(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
        );
        if (nextCurrent < 0) {
            return;
        }
        console.log(nextCurrent);
        setCurrent(nextCurrent);
    };

    const onProfile = () => {
        navigation.navigate('OtherProfile');
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "500",
                }}>
                    스티브 잡스
                </Text>
                <View style={{ opacity: 0 }}>
                    <MaterialCommunityIcons name="square-outline" size={30} color="black" />
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* {posts.map((post, index) => (
                    <Post post={post} navigation={navigation} key={index} />
                ))} */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "pink",
        marginTop: 60,
        marginHorizontal: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    post: {
        // backgroundColor: "grey",
        paddingTop: 28,
        paddingBottom: 18,
        borderTopWidth: 0.3,
        borderTopColor: "#808080",
    },

    postWriter: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    postWriterImage: {
        width: 25,
        height: 25,
        resizeMode: "cover",
        borderRadius: 50,
        backgroundColor: "red",
    },
    postWriterText: {
        fontWeight: "700",
        fontSize: 12.5,
        paddingHorizontal: 5,
    },
    postDateText: {
        color: "#808080",
        fontWeight: "500",
        fontSize: 10,
        paddingHorizontal: 5,
    },

    postTitle: {
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    postTitleText: {
        fontWeight: "700",
        fontSize: 20,
    },
    postTitleInfoText: {
        fontWeight: "400",
        fontSize: 13,
        marginTop: 10,
    },


    postLikes: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    postLikesText: {
        fontWeight: "700",
        fontSize: 15,
    },
})

export default ProfilePosts;