import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile } from '../components';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkBookDetail = ({route, navigation}) => {
    const { book, index } = route.params;
    const bookmarks = book.bookmarks;

    const [ref, setRef] = useState(null);
    const autoScroll = () => {
        ref.scrollTo({ x: 0, y: SCREEN_WIDTH * index + 100.3, animated: false });
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <View style={{ alignItems: "center", }}>
                    <Text style={{ fontSize: 10, fontWeight: "500", color: "#808080", }} >
                        {book.book_title}
                    </Text>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "500",
                    }}>
                        북마크
                    </Text>
                </View>
                <View style={{ opacity: 0, }} >
                    <MaterialCommunityIcons name="square-outline" size={30} color="black" />
                </View>
            </View>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                ref={(ref) => {
                    setRef(ref);
                }}
                onContentSizeChange={() => {
                    autoScroll();
                }}
            >
                <View style={styles.List} >
                    <Image 
                        source={ book.book_cover !== null ? { uri: `http://3.38.228.24${book.book_cover}`} : bookCover} 
                        style={styles.bookImage}
                    />
                    <View>
                        <Text style={styles.listTitle} >{book.book_title}</Text>
                        <Text style={styles.listAuthor}>{book.author}</Text>
                    </View>
                </View>
                {bookmarks.map((bookmark, index) => (
                    <Card bookmark={bookmark} navigation={navigation} key={index} />
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
    List: {
        // backgroundColor: "blue",
        paddingVertical: 4,
        paddingHorizontal: 4,
        flexDirection: "row",
        borderBottomWidth: 0.3,
        borderBottomColor: "#808080",
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    listAuthor: {
        fontSize: 15,
        fontWeight: "400",
        marginTop: -5,
        paddingHorizontal: 8,
    },
    book: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        flexDirection: "row",
        borderBottomWidth: 0.3,
        borderBottomColor: "#808080",
      },
    bookImage: {
        width: 92,
        height: 92,
        resizeMode: "contain",
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: "700",
        paddingVertical: 18,
        paddingHorizontal: 8,
    },
    bookAuthor: {
        fontSize: 15,
        fontWeight: "400",
        // paddingVertical: ,
        paddingHorizontal: 8,
    },
})

export default BookmarkBookDetail;