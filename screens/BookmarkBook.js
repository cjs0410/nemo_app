import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, } from "react-native";
import React, { useEffect, useState } from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile, BookmarkList, } from '../components';
import Api from "../lib/Api";

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkBook = ({route, navigation}) => {
    const [isTile, setIsTile] = useState(true);
    const { book, bookId, } = route.params;
    const [bookmarks, setBookmarks] = useState(null);

    useEffect(() => {
        fetchBook();
    }, []);

    const onArrange = () => {
        setIsTile(!isTile);
    }
    
    const fetchBook = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/scrap_list/book/", {
                book_id: bookId,
            })
            .then((res) => {
                // console.log(res.data);
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
                    {book.book_title}
                </Text>
                <Pressable
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                >
                    <Entypo name="dots-three-horizontal" size={24} color="black" />
                </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.book} >
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Image 
                            source={ book.book_cover !== null ? { uri: book.book_cover } : bookCover} 
                            style={styles.bookImage} 
                        />
                        <View style={{ marginHorizontal: 8, }}>
                            <Text style={styles.bookTitle} >{book.book_title}</Text>
                            <Text style={styles.bookAuthor}>{book.book_author}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 4,}}>
                        <Feather name="bookmark" size={18} color="#606060" />
                        <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", marginHorizontal: 4, }}>
                            {book.count}
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
    book: {
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
    bookTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    bookAuthor: {
        fontSize: 15,
        fontWeight: "400",
        marginTop: 5,
    },
})

export default BookmarkBook