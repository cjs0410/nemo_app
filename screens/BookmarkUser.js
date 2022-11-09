import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, } from "react-native";
import React, { useEffect, useState } from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile, BookmarkList, } from '../components';
import userImage from '../assets/images/userImage.jpeg';
import blankAvatar from '../assets/images/peopleicon.png';
import Api from "../lib/Api";

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkUser = ({route, navigation}) => {
    const [isTile, setIsTile] = useState(true);
    const { user, userTag, } = route.params;
    const [bookmarks, setBookmarks] = useState(null);
    

    useEffect(() => {
        fetchUser();
    }, []);

    const onArrange = () => {
        setIsTile(!isTile);
    }

    const fetchUser = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/scrap_list/user/", {
                user_tag: userTag,
            })
            .then((res) => {
                setBookmarks(res.data);
            })
        } catch (err) {
            console.error(err);
        }
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
                    {user.name}
                </Text>
                <Pressable
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Entypo name="dots-three-horizontal" size={24} color="black" />
                </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.list} >
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Image 
                            source={ user.avatar !== null ? { uri: `http://3.38.62.105${user.avatar}`} : blankAvatar} 
                            style={styles.userImage} 
                        />
                        <View>
                            <Text style={{...styles.listTitle, }} >{user.name}</Text>
                            <Text style={{...styles.listAuthor, color: "#008000", }} >{`@${user.user_tag}`}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 4,}}>
                        <Feather name="bookmark" size={18} color="#606060" />
                        <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", marginHorizontal: 4, }}>
                            {user.count}
                        </Text>
                    </View>
                </View>
                {bookmarks && bookmarks.map((bookmark, index) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarks: bookmarks, index: index, })} 
                      key={index}
                    >
                      <BookmarkList bookmark={bookmark} navigation={navigation} />
                    </TouchableOpacity>
                ))}

            </ScrollView>
        </View>
    )
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
    list: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        flexDirection: "row",
        borderBottomWidth: 0.3,
        borderBottomColor: "#808080",
        alignItems: "center",
        justifyContent: "space-between",
      },
    bookImage: {
        width: 92,
        height: 92,
        resizeMode: "contain",
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

export default BookmarkUser