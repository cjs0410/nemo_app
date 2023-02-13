import { View, SafeAreaView, Text, Button, StyleSheet, Image, ScrollView, FlatList, Dimensions, TouchableOpacity, Pressable, } from "react-native";
import React, { useEffect, useState, useRef, useCallback, } from "react";
import { useFocusEffect } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile, BookmarkDetail, UserList, } from '../components';
import user from "../modules/user";
import Api from '../lib/Api';
import blankAvatar from '../assets/images/peopleicon.png';
import vectorLeftImage from '../assets/icons/vector_left.png';
import { colors, regHeight, regWidth } from "../config/globalStyles";

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from "react-redux";
import { 
    setShouldUserRefresh, 
} from '../modules/user';

const LikeUsers = ({route, navigation}) => {
    const { ctg, id, } = route.params;
    const [users, setUsers] = useState(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchUsers();
    }, [])

    const fetchUsers = async() => {
        try {
            console.log(id);
            await Api
            .post("/api/v1/user/like_list/", {
                ctg: ctg,
                id: id,
            })
            .then((res) => {
                console.log(res.data);
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
            {users && users.length !== 0 ? 
                <ScrollView>
                    { users && users.map((user, index) => (
                        <View style={{ justifyContent: "center" }} key={index}>
                            <Pressable
                                onPress={() => navigation.navigate("OtherProfile", { userTag: user.user_tag,  })}
                            >
                                <UserList user={user} navigation={navigation} key={index} />
                            </Pressable>
                            <FollowBtn isFollow={user.is_follow} userTag={user.user_tag} />
                        </View>
                    ))}
                </ScrollView>
                : 
                <View
                    style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: regHeight * 200,
                    }}
                >
                    <Text
                        style={{
                        fontSize: regWidth * 17,
                        fontFamily: "NotoSansKR-Medium",
                        color: colors.textDark,
                        }}
                    >
                        No one liked it yet.
                    </Text>
                </View>
            }

        </View>
    )
}

const FollowBtn = (props) => {
    const dispatch = useDispatch();
    const [isFollow, setIsFollow] = useState(props.isFollow);
    const userTag = props.userTag;

    const onFollow = async() => {
        // setIsFollow(!isFollow);
        try {
            await Api
            .post("api/v1/user/follow/", {
                user_tag: userTag,
            })
            .then((res) => {
                // console.log(res.data);
                setIsFollow(res.data.is_follow);
                dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Pressable 
            style={{
                ...styles.followBtn,
                backgroundColor: isFollow ? "white" : colors.textNormal,
                position: "absolute",
                right: 0,
                marginHorizontal: regWidth * 8,
            }} 
            onPress={onFollow}
        >
            <Text 
                style={{ 
                    fontSize: regWidth * 13, 
                    color: isFollow ? colors.textDark : "white",
                    fontFamily: "NotoSansKR-Bold",
                }}
            >
                {isFollow ? "Following" : "Follow"}
            </Text>
        </Pressable>
    )
}

// const UserList = ({user, navigation,}) => {
//     return (
//       <>
//         <Pressable activeOpacity={1} onPress={() => navigation.push('OtherProfile', { userTag: user.user_tag, })} >
//           <View style={styles.List} >
//             <View style={{ flexDirection: "row", alignItems: "center", }}>
//               <Image 
//                 source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
//                 style={styles.userImage} 
//               />
//               <View style={{ marginHorizontal: 8, }}>
//                 <Text style={styles.listTitle} >{user.name}</Text>
//                 <Text style={{...styles.listAuthor, color: "#008000", }} >{`@${user.user_tag}`}</Text>
//               </View>
//             </View>
//           </View>
//         </Pressable>
//       </>
//     )
//   }

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
    followBtn: {
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderColor: colors.textDark,
        borderWidth: 0.5, 
        paddingHorizontal: regWidth * 18,
        paddingVertical: regHeight * 5,
    },
})

export default LikeUsers;