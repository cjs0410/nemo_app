import { StyleSheet, View, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Foundation, Feather, Entypo, Ionicons } from '@expo/vector-icons';
import { Card, BookmarkTile, } from '../components';
import { CardForCreate, } from "../components/Card";
import SelectDropdown from 'react-native-select-dropdown';
import Api from "../lib/Api";

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetUserInfo } from '../modules/user';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const EditPost = ({route, navigation}) => {
    const categories = ["최신 순으로 정렬", "오래된 순으로 정렬", "책 별로 정렬", "생성자 별로 정렬", ];
    const [whichCategory, setWhichCategory] = useState(0);
    const alignment = ["new", "old", "book", "writer", ];
    const { accessToken, } = useSelector(userSelector);

    const [books, setBooks] = useState(null);
    const [users, setUsers] = useState(null);
    const [bookmarks, setBookmarks] = useState(null);
    const { post, } = route.params;
    const [selectedBookmarks, setSelectedBookmarks] = useState([]);

    useEffect(() => {
        fetchBookmark();
        setSelectedBookmarks(post.bookmarks);
    }, [whichCategory])

    const fetchBookmark = async() => {
        try {
            await Api.post("/api/v2/bookmark/list/", 
            {
                alignment: alignment[whichCategory],
            },
            )
            .then((res) => {
                if (whichCategory === 2) {
                    setBooks(res.data.books);
                }
                else if (whichCategory === 3) {
                    setUsers(res.data.users);
                }
                else {
                    setBookmarks(res.data.bookmarks);
                }
            })
        } catch (err) {
            console.error(err);
        }

    }

    const selectBookmark = (bookmark) => {
        if (selectedBookmarks.findIndex(selectedBookmark => Number(selectedBookmark.bookmark_id) === Number(bookmark.bookmark_id)) === -1) {
            setSelectedBookmarks([
                ...selectedBookmarks,
                bookmark,
            ]);
        } else {
            setSelectedBookmarks(
                selectedBookmarks.filter(selectedBookmark => Number(selectedBookmark.bookmark_id) !== Number(bookmark.bookmark_id))
            )
        }
    }

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={1} onPress={() => navigation.goBack()} >
                    <Entypo name="cross" size={28} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 19, fontWeight: "700", color: "white",}}>
                    북마크 재선택
                </Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('SubmitEditedPost', {
                        selectedBookmarks: selectedBookmarks, post: post,
                    })}
                >
                    <Text style={{ fontSize: 14, fontWeight: "500", color: "#008000",}}>
                        다음
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >

                {selectedBookmarks.length === 0 ? 
                    <View style={styles.postContentsScrollBox}>
                        <Text style={{ textAlign: "center", color: "white", fontSize: 30, fontWeight: "700", }} >
                            북마크를 선택하세요
                        </Text>
                    </View>
                    :
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                    >
                        {selectedBookmarks.map((selectedBookmark, index) => (
                            <CardForCreate bookmark={selectedBookmark} key={index} />
                        ))}
                    </ScrollView>
                }
                
                <View style={{ paddingHorizontal: 13, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "white", }}>
                    <SelectDropdown
                        data={categories}
                        onSelect={(selectedItem, index) => {
                        setWhichCategory(index);
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem
                        }}
                        rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item
                        }}
                        buttonStyle={styles.arrange}
                        buttonTextStyle={styles.arrangeText}
                        renderDropdownIcon={isOpened => {
                        return <Feather name={isOpened ? 'chevron-up' : 'chevron-down'} size={24} color="black" />
                        }}
                        dropdownIconPosition={'right'}
                        defaultValueByIndex={0}
                        dropdownStyle={{borderRadius: 18, }}
                        rowStyle={styles.rowStyle}
                        rowTextStyle={styles.arrangeText}
                        selectedRowStyle={{...styles.rowStyle, backgroundColor: "pink", }}
                    />
                </View>
                {bookmarks === null ? (
                    <ActivityIndicator 
                        color="white" 
                        style={{marginTop: 10}} 
                        size="large"
                    />
                    ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {bookmarks.map((bookmark, index) => (
                        <View key={index}>
                            <TouchableOpacity 
                                onPress={() => selectBookmark(bookmark)} 
                                activeOpacity={1}
                                style={{ opacity: selectedBookmarks.findIndex(selectedBookmark => Number(selectedBookmark.bookmark_id) === Number(bookmark.bookmark_id)) === -1 ? 1 : 0.5 }}
                            >
                                <BookmarkTile bookmark={bookmark} />
                            </TouchableOpacity>
                            {selectedBookmarks.findIndex(selectedBookmark => Number(selectedBookmark.bookmark_id) === Number(bookmark.bookmark_id)) === -1 ?
                                null
                                :
                                <View style={styles.numbering}>
                                    <Text style={{ fontSize: 16, fontWeight: "500", color: "white", }}>
                                        {Number(selectedBookmarks.findIndex(selectedBookmark => Number(selectedBookmark.bookmark_id) === Number(bookmark.bookmark_id))) + 1}
                                    </Text>
                                </View>
                            }
                        </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    header: {
        // backgroundColor: "red",
        marginTop: 60,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

    },
    arrange: {
        backgroundColor: "#DDDDDD",
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        width: 160,
        height: 30,
    },
    rowStyle: {
        backgroundColor: "#DDDDDD",
        alignItems: "center",
        justifyContent: "center",
        width: 160,
        height: 40,
    },
    arrangeText: {  
        fontSize: 15,
        fontWeight: "500",
        marginHorizontal: -1,
    },
    postContentsScrollBox: {
        // flex: 1,
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "center",
    },
    numbering: {
        position: "absolute",
        backgroundColor: "#008000",
        width: SCREEN_WIDTH * 0.1,
        height: SCREEN_WIDTH * 0.1,
        marginTop: 10,
        marginLeft: SCREEN_WIDTH * 0.5 - 55,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "white",
        opacity: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    postTitleInput: {
        backgroundColor: "#CCCCCC",
        borderRadius: 10,
        marginHorizontal: 13,
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    postContentsInput: {
        backgroundColor: "#CCCCCC",
        marginTop: 13,
        borderRadius: 10,
        marginHorizontal: 13,
        paddingVertical: 40,
        paddingHorizontal: 10,
    },
})

export default EditPost;

const SubmitEditedPost = ({route, navigation}) => {
    const { selectedBookmarks, post, } = route.params;
    const bookmarkIds = selectedBookmarks.map((selectedBookmark) => (selectedBookmark.bookmark_id))
    const [postTitle, setPostTitle] = useState(post.title);
    const [postContents, setPostContents] = useState(post.text);
    const { accessToken, } = useSelector(userSelector);

    const onChangePostTitle = (payload) => setPostTitle(payload);

    const onChangePostContents = (payload) => setPostContents(payload);

    const submitEditedPost = async() => {
        try {
            // console.log(selectedBookmarks)
            console.log(
                post.post_id,
                bookmarkIds,
                postTitle,
                postContents,
            )

            await Api.post("/api/v4/post/edit/", 
                {
                    post_id: Number(post.post_id),
                    bookmarks: bookmarkIds,
                    post_title: postTitle,
                    text: postContents,
                },
            )
            .then((res) => {
                console.log(res.data);
                navigation.popToTop();
                // navigation.navigate('PostDetail', { 
                //     post: post 
                // })
            })
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={{...styles.container, backgroundColor: "white", }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={{ fontSize: 19, fontWeight: "700",}}>
                    게시물 수정
                </Text>
                <TouchableOpacity onPress={submitEditedPost}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: "#008000",}}>
                        게시
                    </Text>
                </TouchableOpacity>
            </View>
            <TextInput 
                style={styles.postTitleInput}
                // placeholder="제목을 입력하세요."
                placeholder={post.title.length > 0 ? post.title : "제목을 입력하세요."}
                onChangeText={onChangePostTitle}
            />
            <TextInput 
                style={styles.postContentsInput}
                // placeholder="설명을 추가하세요."
                placeholder={post.text.length > 0 ? post.text : "설명을 추가하세요."}
                onChangeText={onChangePostContents}
            />
            <View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                >
                    {selectedBookmarks.map((selectedBookmark, index) => (
                        <CardForCreate bookmark={selectedBookmark} key={index} />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

export {SubmitEditedPost};