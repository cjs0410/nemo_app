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
import vectorLeftImage from '../assets/icons/vector_left.png';
import { colors, regHeight, regWidth } from "../config/globalStyles";

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LikeUsers = ({route, navigation}) => {
    // const { bookmarkId, } = route.params;
    const [users, setUsers] = useState(null);
    const insets = useSafeAreaInsets();

    // useEffect(() => {
    //     fetchUsers();
    // }, [])

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
            <View 
                style={{
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }}
            >
                <View style={styles.header} >
                    <Pressable
                        onPress={() => navigation.goBack()}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    >
                        <Image 
                            source={vectorLeftImage} 
                            style={{ width: regWidth*30, height: regWidth*30 }}
                        />
                    </Pressable>
                    <Text style={{
                        fontSize: regWidth * 19,
                        fontFamily: "NotoSansKR-Black",
                    }}>
                        Liked by
                    </Text>
                    <Pressable
                        style={{ opacity: 0, }}
                    >
                        <Image 
                            source={vectorLeftImage} 
                            style={{ width: regWidth*30, height: regWidth*30 }}
                        />
                    </Pressable>
                </View>
            </View>
            { users && users.map((user, index) => (
                <UserList user={user} navigation={navigation} key={index} />
            ))}
        </View>
    )
}

const UserList = ({user, navigation,}) => {
    return (
      <>
        <Pressable activeOpacity={1} onPress={() => navigation.push('OtherProfile', { userTag: user.user_tag, })} >
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
      paddingHorizontal: regWidth * 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: regHeight * 8,
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