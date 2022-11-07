import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { Entypo, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import bookCover from '../assets/images/steve.jpeg';
import { Card, BookmarkTile } from '../components';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const BookmarkBook = ({navigation}) => {
    const [isTile, setIsTile] = useState(true);

    const onArrange = () => {
        setIsTile(!isTile);
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
                <TouchableOpacity activeOpacity={1} onPress={onArrange}>
                    <MaterialCommunityIcons name={ isTile ? "square-outline" : "view-grid-outline" } size={30} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.book} >
                    <Image source={bookCover} style={styles.bookImage} />
                    <View>
                    <Text style={styles.bookTitle} >스티브 잡스</Text>
                    <Text style={styles.bookAuthor}>월터 아이작슨</Text>
                    </View>
                </View>
                {isTile ? 
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        <TouchableOpacity onPress={() => navigation.navigate('BookmarkBookDetail')} >
                            <BookmarkTile />
                        </TouchableOpacity>
                        <BookmarkTile />
                        <BookmarkTile />
                        <BookmarkTile />
                        <BookmarkTile />
                        <BookmarkTile />
                        <BookmarkTile />
                        <BookmarkTile />
                    </View>
                    :
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        <Card
                            bookTitle="스티브 잡스"
                            bookChapter="15장"
                            bookMark="123"
                            bookContents="1996년 애플이 NeXT를 인수하게 되면서 다시 애플로 돌아오게 되었고 1997년에는 임시 CEO로 애플을 다시 이끌게 되었으며 이후 다시금 애플을 혁신해 시장에서 성공을 거두게 이끌었다. 2001년 아이팟을 출시하여 음악 산업 전체를 뒤바꾸어 놓았다. 또한, 2007년 아이폰을 출시하면서 스마트폰 시장을 바꾸어 놓았고 2010년 아이패드를 출시함으로써 포스트PC 시대(Post-PC era)를 열었다."
                            reverseContents="뒷면"
                            watermark="@jungdongin"
                            cardColor="pink"
                        />
                        <Card
                            bookTitle="스티브 잡스"
                            bookChapter="15장"
                            bookMark="123"
                            bookContents="1996년 애플이 NeXT를 인수하게 되면서 다시 애플로 돌아오게 되었고 1997년에는 임시 CEO로 애플을 다시 이끌게 되었으며 이후 다시금 애플을 혁신해 시장에서 성공을 거두게 이끌었다. 2001년 아이팟을 출시하여 음악 산업 전체를 뒤바꾸어 놓았다. 또한, 2007년 아이폰을 출시하면서 스마트폰 시장을 바꾸어 놓았고 2010년 아이패드를 출시함으로써 포스트PC 시대(Post-PC era)를 열었다."
                            reverseContents="뒷면"
                            watermark="@jungdongin"
                            cardColor="pink"
                        />
                        <Card
                            bookTitle="스티브 잡스"
                            bookChapter="15장"
                            bookMark="123"
                            bookContents="1996년 애플이 NeXT를 인수하게 되면서 다시 애플로 돌아오게 되었고 1997년에는 임시 CEO로 애플을 다시 이끌게 되었으며 이후 다시금 애플을 혁신해 시장에서 성공을 거두게 이끌었다. 2001년 아이팟을 출시하여 음악 산업 전체를 뒤바꾸어 놓았다. 또한, 2007년 아이폰을 출시하면서 스마트폰 시장을 바꾸어 놓았고 2010년 아이패드를 출시함으로써 포스트PC 시대(Post-PC era)를 열었다."
                            reverseContents="뒷면"
                            watermark="@jungdongin"
                            cardColor="pink"
                        />
                    </View>
                }

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

export default BookmarkBook