import { View, SafeAreaView, Text, Button, StyleSheet, Image, ScrollView, FlatList, Dimensions, TouchableOpacity, Pressable, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, } from "react";
import { useFocusEffect } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile, BookmarkDetail } from '../components';
import user from "../modules/user";
import Api from '../lib/Api';
import blankAvatar from '../assets/images/peopleicon.png';

const LikeUsers = ({route, navigation}) => {
    const { bookmarkId, } = route.params;
    const [users, setUsers] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [])

    const fetchUsers = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/likes_user/", {
                bookmark_id: bookmarkId,
            })
            .then((res) => {
                // console.log(res.data);
                setUsers(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <View style={{ alignItems: "center", }}>
                    <TouchableOpacity
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "500",
                        }}>
                            좋아요한 유저
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ opacity: 0, }} >
                    <MaterialCommunityIcons name="square-outline" size={30} color="black" />
                </View>
            </SafeAreaView>
            { users && users.map((user, index) => (
                <UserList user={user} navigation={navigation} key={index} />
            ))}
        </View>
    )
}

const UserList = ({user, navigation,}) => {
    return (
      <>
        <Pressable activeOpacity={1} onPress={() => navigation.navigate('OtherProfile', { userTag: user.user_tag, })} >
          <View style={styles.List} >
            <View style={{ flexDirection: "row", alignItems: "center", }}>
              <Image 
                source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
                style={styles.userImage} 
              />
              <View style={{ marginHorizontal: 8, }}>
                <Text style={styles.listTitle} >{user.name}</Text>
                <Text style={{...styles.listAuthor, color: "#008000", }} >{`@${user.user_tag}`}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </>
    )
  }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "pink",
        marginVertical: 10,
        marginHorizontal: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    List: {
        // backgroundColor: "blue",
        paddingVertical: 4,
        paddingHorizontal: 4,
        flexDirection: "row",
        borderBottomWidth: 0.3,
        borderBottomColor: "#808080",
        alignItems: "center",
        justifyContent: "space-between",
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        resizeMode: "cover",
        marginVertical: 5,
        marginHorizontal: 8,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    listAuthor: {
        fontSize: 15,
        fontWeight: "400",
        marginTop: 5,
    },
})

export default LikeUsers;