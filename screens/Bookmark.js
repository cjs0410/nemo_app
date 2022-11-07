import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons';
import {
  useNavigation,
  useFocusEffect,
  useScrollToTop,
} from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';
import { Card, BookmarkTile, BookmarkList, } from '../components';
import Api from "../lib/Api";

import bookCover from '../assets/images/steve.jpeg'
import userImage from '../assets/images/userImage.jpeg';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetUserInfo } from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';
import blankAvatar from '../assets/images/peopleicon.png';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Bookmark = ({navigation}) => {
  const dispatch = useDispatch();
  const categories = ["최신 순으로 정렬", "오래된 순으로 정렬", "책 별로 정렬", "생성자 별로 정렬", ];
  const alignment = ["new", "old", "book", "writer", ];
  const [whichCategory, setWhichCategory] = useState(0);
  const [isTile, setIsTile] = useState(true);
  const { accessToken, } = useSelector(userSelector);
  const { bookmarked, } = useSelector(bookmarkSelector);

  const [books, setBooks] = useState(null);
  const [users, setUsers] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  useScrollToTop(ref);
  

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchBookmarks();
  //   }, [whichCategory])
  // );
  useEffect(() => {
    fetchBookmarks();
  }, [whichCategory])

  const onArrange = () => {
    setIsTile(!isTile);
  }


  const fetchBookmarks = async() => {
    try {
      setLoading(true);
      await Api.post("/api/v1/user/scrap_list/", 
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
          setBookmarks(res.data);
          dispatch(loadBookmarks(res.data));
        }

      })
    } catch (err) {
      console.error(err);
    }
    setLoading(false);

  }


  switch(whichCategory) {
    // 최신순으로 정렬
    case 0:
      return (
        <View style={styles.container}>
          <View style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Bookmark
              </Text>

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
              {/* <TouchableOpacity activeOpacity={1} onPress={onArrange}>
                  <MaterialCommunityIcons name={ isTile ? "square-outline" : "view-grid-outline" } size={30} color="black" />
              </TouchableOpacity> */}
          </View>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            ref={ref}
          >
            {loading ? (
              <ActivityIndicator 
                color="black" 
                style={{marginTop: 100}} 
                size="large"
              />
            ) : (
              <>
                <View>
                  {bookmarks && bookmarks.map((bookmark, index) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarks: bookmarks, index: index, })} 
                      key={index}
                    >
                      <BookmarkList bookmark={bookmark} navigation={navigation} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      );

    // 오래된 순으로 정렬
    case 1:
      return (
        <View style={styles.container}>
          <View style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Bookmark
              </Text>

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
              {/* <MaterialCommunityIcons name="view-grid-outline" size={30} color="black" /> */}
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {loading ? (
                <ActivityIndicator 
                  color="black" 
                  style={{marginTop: 100}} 
                  size="large"
                />
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {/* <TouchableOpacity onPress={autoScroll} >
                    <BookmarkTile navigation={navigation} />
                  </TouchableOpacity>
                  <BookmarkTile navigation={navigation} /> */}
                  {bookmarks && bookmarks.map((bookmark, index) => (
                    <TouchableOpacity 
                      activeOpacity={1}
                      onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarks: bookmarks, index: index, })} 
                      key={index}
                    >
                      <BookmarkTile bookmark={bookmark} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
          </ScrollView>
        </View>
      );

    //책 별로 정렬
    case 2:
      return (
        <View style={styles.container}>
          <View style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Bookmark
              </Text>

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
              {/* <View style={{ opacity: 0, }} >
                  <MaterialCommunityIcons name="square-outline" size={30} color="black" />
              </View> */}
          </View>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            // ref={(ref) => {
            //   console.log(true);
            //   setRef(ref);
            // }}
          >
            {loading ? (
              <ActivityIndicator 
                color="black" 
                style={{marginTop: 100}} 
                size="large"
              />
            ) : (
              <>
                {books && books.map((book, index) => (
                  <BookList book={book} navigation={navigation} key={index} />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      );

    // 생성자 별로 정렬
    case 3:
      return (
        <View style={styles.container}>
          <View style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Bookmark
              </Text>

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
                dropdownStyle={{ borderRadius: 18, }}
                rowStyle={styles.rowStyle}
                rowTextStyle={styles.arrangeText}
                selectedRowStyle={{...styles.rowStyle, backgroundColor: "pink", }}
              />
              {/* <View style={{ opacity: 0, }} >
                  <MaterialCommunityIcons name="square-outline" size={30} color="black" />
              </View> */}
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator 
                color="black" 
                style={{marginTop: 100}} 
                size="large"
              />
            ) : (
              <>
                {users && users.map((user, index) => (

                    <UserList user={user} navigation={navigation} key={index} />
                  
                ))}
              </>
            )}
          </ScrollView>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "white",
  },
  header: {
    // backgroundColor: "red",
    marginTop: 60,
    marginHorizontal: 20,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between"
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
  List: {
    // backgroundColor: "blue",
    paddingVertical: 4,
    paddingHorizontal: 4,
    flexDirection: "row",
    borderTopWidth: 0.3,
    borderTopColor: "#808080",
  },
  bookImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    resizeMode: "cover",
    marginVertical: 5,
    marginHorizontal: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  listAuthor: {
    fontSize: 10,
    fontWeight: "400",
    marginTop: -5,
    paddingHorizontal: 8,
  },
  bookMarkTileBox: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  bookMarkTile: {
      flex: 1,
      // borderWidth: 3,
      // borderColor: "white",
      paddingHorizontal: 2,
      borderRadius: 2,
  },
  bookMarkTitle: {
      // backgroundColor: "blue",
      flex: 0.6,
      flexDirection: "row",
      justifyContent: "space-between",
  },
  bookMarkContent: {
      flex: 2,
  },
  bookMarkWatermark: {
      flex: 0.3,
      alignItems: "flex-start",
  },
})

export default Bookmark;

const BookList = ({book, navigation,}) => {
  const bookmarks = book.bookmarks;

  return (
    <>
      {/* <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => navigation.navigate('BookmarkBook')} 
      > */}
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
      {/* </TouchableOpacity> */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {bookmarks.map((bookmark, index) => (
          <TouchableOpacity 
            activeOpacity={1}
            onPress={() => navigation.navigate('BookmarkBookDetail', {book: book, index: index, })} 
            key={index}
          >
            <BookmarkTile bookmark={bookmark} key={index} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  )
}

const UserList = ({user, navigation,}) => {
  const bookmarks = user.bookmarks;
  return (
    <>
    {/* <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate('BookmarkUser')} > */}
      <View style={styles.List} >
          <Image 
            source={ user.avatar !== null ? { uri: `http://3.38.228.24${user.avatar}`} : blankAvatar} 
            style={styles.userImage} 
          />
          <View>
            <Text style={{...styles.listTitle, }} >{user.name}</Text>
            <Text style={{...styles.listAuthor, color: "#008000", marginTop: -8, }} >{`@${user.watermark}`}</Text>
          </View>
      </View>
    {/* </TouchableOpacity> */}
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {bookmarks.map((bookmark, index) => (
          <TouchableOpacity 
            activeOpacity={1}
            onPress={() => navigation.navigate('BookmarkUserDetail', {user: user, index: index, })} 
            key={index}
          >
            <BookmarkTile bookmark={bookmark} key={index} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  )
}