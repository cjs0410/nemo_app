import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, } from "react-native";
import React, { useEffect, useState } from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Api from "../lib/Api";
import blankAvatar from '../assets/images/peopleicon.png';

const FollowScreen = ({navigation, route}) => {
    const { title, userTag } = route.params;
    const [users, setUsers] = useState(null);

    useEffect(() => {
        fetchUser();
        console.log(userTag);
    }, [])

    const fetchUser = async() => {
        try {
            if (title === "팔로잉") {
                await Api
                .post("/api/v1/user/following_list/", {
                    user_tag: userTag,
                })
                .then((res) => {
                    console.log(res.data);
                    setUsers(res.data);
                })
            }
            if (title === "팔로워") {
                await Api
                .post("/api/v1/user/follower_list/", {
                    user_tag: userTag,
                })
                .then((res) => {
                    console.log(res.data);
                    setUsers(res.data);
                })
            }

        } catch (err) {
            console.error(err);
        }
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable 
                    onPress={() => navigation.goBack()} 
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "500",
                }}>
                    {title}
                </Text>
                <Pressable 
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    style={{ opacity: 0, }}
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </Pressable>
            </View>
            <ScrollView>
                {users !== null && users.map((user, index) => (
                    <Pressable 
                        style={styles.userList} 
                        key={index}
                        onPress={() => navigation.push('OtherProfile', { userTag: user.user_tag, })}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", }}>
                            <Image 
                                source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
                                style={styles.userImage}
                            />
                            <View style={{ marginHorizontal: 8, }}>
                                <Text style={{ fontSize: 18, fontWeight: "600", }} >{user.name}</Text>
                                <Text style={{ fontSize: 13, fontWeight: "400", color: "#008000", }} >{`@${user.user_tag}`}</Text>
                            </View>
                        </View>
                    </Pressable>
                ))}

            </ScrollView>
        </View>
    );
}

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
    userList: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#CBCBCB",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    }
})

export default FollowScreen;