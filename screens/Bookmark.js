import { 
  View, 
  SafeAreaView,
  Text, 
  Button, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
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

import blankBookCover from '../assets/images/blankBookImage.png';
import userImage from '../assets/images/userImage.jpeg';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, bookmarkSelector } from '../modules/hooks';
import { resetUserInfo, setShouldStorageRefresh, } from '../modules/user';
import { loadBookmarks } from '../modules/bookmarks';
import blankAvatar from '../assets/images/peopleicon.png';
import { regHeight, regWidth } from "../config/globalStyles";

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const Bookmark = ({navigation}) => {
  const dispatch = useDispatch();
  const categories = ["최신 순으로 정렬", "책 별로 분류", "유저 별로 분류", ];
  const alignment = ["new", "book", "user", ];
  const [whichCategory, setWhichCategory] = useState(0);
  const [isTile, setIsTile] = useState(true);
  const { accessToken, shouldStorageRefresh, } = useSelector(userSelector);
  const { bookmarked, } = useSelector(bookmarkSelector);

  const [books, setBooks] = useState(null);
  const [users, setUsers] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const ref = useRef();
  useScrollToTop(ref);
  

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchBookmarks();
  //   }, [whichCategory])
  // );
  useEffect(() => {
    fetchBookmarks();
  }, [whichCategory]);

  useEffect(() => {
    if (shouldStorageRefresh === true) {
      fetchBookmarks();
      dispatch(setShouldStorageRefresh(false));
    }
  }, [shouldStorageRefresh]);



  const onArrange = () => {
    setIsTile(!isTile);
  }

  const onRefresh = useCallback(async() => {
    setRefreshing(true);
    await fetchBookmarks()
    .then(() => setRefreshing(false));
  }, []);

  const fetchBookmarks = async() => {
    try {
      setLoading(true);
      await Api.post("/api/v1/user/scrap_list/", 
        {
          alignment: alignment[whichCategory],
        },
      )
      .then((res) => {
        if (whichCategory === 1) {
          setBooks(res.data);
          
        }
        else if (whichCategory === 2) {
          setUsers(res.data);
          console.log(res.data);
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
          <SafeAreaView style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Storage
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
                dropdownStyle={{borderRadius: 18, marginTop: -regHeight * 34, }}
                rowStyle={styles.rowStyle}
                rowTextStyle={styles.arrangeText}
                selectedRowStyle={{...styles.rowStyle, backgroundColor: "white", }}
              />
              {/* <TouchableOpacity activeOpacity={1} onPress={onArrange}>
                  <MaterialCommunityIcons name={ isTile ? "square-outline" : "view-grid-outline" } size={30} color="black" />
              </TouchableOpacity> */}
          </SafeAreaView>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            ref={ref}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            {loading ? (
              // <ActivityIndicator 
              //   color="black" 
              //   style={{marginTop: 100}} 
              //   size="large"
              // />
              null
            ) : (
              <>
                { bookmarks && bookmarks.length !== 0 ? 
                  <View>
                    {bookmarks && bookmarks.map((bookmark, index) => (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarks: bookmarks, subTitle: "최신순", title: "내 북마크", index: index, })} 
                        key={index}
                      >
                        <BookmarkList bookmark={bookmark} navigation={navigation} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  :
                  <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: regHeight * 300,
                      }}
                  >
                    <Text
                      style={{
                        fontSize: regWidth * 20,
                        fontWeight: "500",
                        color: "grey",
                      }}
                    >
                      북마크를 스크랩해보세요
                    </Text>
                  </View>
                }

              </>
            )}
          </ScrollView>
        </View>
      );

    // 오래된 순으로 정렬
    // case 1:
    //   return (
    //     <View style={styles.container}>
    //       <View style={styles.header} >
    //           <Text style={{
    //               fontSize: 25,
    //               fontWeight: "900",
    //           }}>
    //               Storage
    //           </Text>

    //           <SelectDropdown
    //             data={categories}
    //             onSelect={(selectedItem, index) => {
    //               setWhichCategory(index);
    //             }}
    //             buttonTextAfterSelection={(selectedItem, index) => {
    //               // text represented after item is selected
    //               // if data array is an array of objects then return selectedItem.property to render after item is selected
    //               return selectedItem
    //             }}
    //             rowTextForSelection={(item, index) => {
    //               // text represented for each item in dropdown
    //               // if data array is an array of objects then return item.property to represent item in dropdown
    //               return item
    //             }}
    //             buttonStyle={styles.arrange}
    //             buttonTextStyle={styles.arrangeText}
    //             renderDropdownIcon={isOpened => {
    //               return <Feather name={isOpened ? 'chevron-up' : 'chevron-down'} size={24} color="black" />
    //             }}
    //             dropdownIconPosition={'right'}
    //             defaultValueByIndex={0}
    //             dropdownStyle={{borderRadius: 18, }}
    //             rowStyle={styles.rowStyle}
    //             rowTextStyle={styles.arrangeText}
    //             selectedRowStyle={{...styles.rowStyle, backgroundColor: "pink", }}
    //           />
    //           {/* <MaterialCommunityIcons name="view-grid-outline" size={30} color="black" /> */}
    //       </View>
    //       <ScrollView showsVerticalScrollIndicator={false}>
    //         {loading ? (
    //             <ActivityIndicator 
    //               color="black" 
    //               style={{marginTop: 100}} 
    //               size="large"
    //             />
    //           ) : (
    //             <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
    //               {/* <TouchableOpacity onPress={autoScroll} >
    //                 <BookmarkTile navigation={navigation} />
    //               </TouchableOpacity>
    //               <BookmarkTile navigation={navigation} /> */}
    //               {bookmarks && bookmarks.map((bookmark, index) => (
    //                 <TouchableOpacity 
    //                   activeOpacity={1}
    //                   onPress={() => navigation.navigate('BookmarkNewDetail', {bookmarks: bookmarks, index: index, })} 
    //                   key={index}
    //                 >
    //                   <BookmarkTile bookmark={bookmark} />
    //                 </TouchableOpacity>
    //               ))}
    //             </View>
    //           )}
    //       </ScrollView>
    //     </View>
    //   );

    //책 별로 정렬
    case 1:
      return (
        <View style={styles.container}>
          <SafeAreaView style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Storage
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
                dropdownStyle={{borderRadius: 18, marginTop: -regHeight * 34, }}
                rowStyle={styles.rowStyle}
                rowTextStyle={styles.arrangeText}
                selectedRowStyle={{...styles.rowStyle, backgroundColor: "white", }}
              />
              {/* <View style={{ opacity: 0, }} >
                  <MaterialCommunityIcons name="square-outline" size={30} color="black" />
              </View> */}
          </SafeAreaView>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            // ref={(ref) => {
            //   console.log(true);
            //   setRef(ref);
            // }}
          >
            {loading ? (
              // <ActivityIndicator 
              //   color="black" 
              //   style={{marginTop: 100}} 
              //   size="large"
              // />
              null
            ) : (
              <>
                { books && books.length !== 0 ? 
                  <>
                    {books && books.map((book, index) => (
                      <BookList book={book} navigation={navigation} key={index} />
                    ))}
                  </>
                  :
                  <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: regHeight * 300,
                      }}
                  >
                    <Text
                      style={{
                        fontSize: regWidth * 20,
                        fontWeight: "500",
                        color: "grey",
                      }}
                    >
                      북마크를 스크랩해보세요
                    </Text>
                  </View>
                }

              </>
            )}
          </ScrollView>
        </View>
      );

    // 생성자 별로 정렬
    case 2:
      return (
        <View style={styles.container}>
          <SafeAreaView style={styles.header} >
              <Text style={{
                  fontSize: 25,
                  fontWeight: "900",
              }}>
                  Storage
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
                dropdownStyle={{ borderRadius: 18, marginTop: -regHeight * 34, }}
                rowStyle={styles.rowStyle}
                rowTextStyle={styles.arrangeText}
                selectedRowStyle={{...styles.rowStyle, backgroundColor: "white", }}
              />
              {/* <View style={{ opacity: 0, }} >
                  <MaterialCommunityIcons name="square-outline" size={30} color="black" />
              </View> */}
          </SafeAreaView>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            {loading ? (
              // <ActivityIndicator 
              //   color="black" 
              //   style={{marginTop: 100}} 
              //   size="large"
              // />
              null
            ) : (
              <>
                { users && users.length !== 0 ? 
                  <>
                    {users && users.map((user, index) => (
                        <UserList user={user} navigation={navigation} key={index} />
                    ))}
                  </>
                  :
                  <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: regHeight * 300,
                      }}
                  >
                    <Text
                      style={{
                        fontSize: regWidth * 20,
                        fontWeight: "500",
                        color: "grey",
                      }}
                    >
                      북마크를 스크랩해보세요
                    </Text>
                  </View>
                }
              </>

            )}
          </ScrollView>
        </View>
      );
  }
}

const BookList = ({book, navigation,}) => {
  return (
    <>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => navigation.navigate('BookmarkBook', { book: book, bookId: book.book_id, })} 
      >
        <View style={styles.List} >
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <Image 
              source={ book.book_cover !== null ? { uri: book.book_cover } : blankBookCover} 
              style={styles.bookImage}
            />
            <View style={{ marginHorizontal: 8, }}>
              <Text 
                style={styles.listTitle}
                numberOfLines={2}
                ellipsizeMode='tail'
              >
                {book.book_title}
              </Text>
              <Text style={styles.listAuthor}>{book.book_author}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 4,}}>
              <Feather name="bookmark" size={18} color="#606060" />
              <Text style={{ fontSize: 15, fontWeight: "500", color: "#606060", marginHorizontal: 4, }}>
                  {book.count}
              </Text>
          </View>
        </View>
      </TouchableOpacity>
    </>
  )
}

const UserList = ({user, navigation,}) => {
  return (
    <>
      <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate('BookmarkUser', { user: user, userTag: user.user_tag, })} >
        <View style={styles.List} >
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <Image 
              source={ user.avatar !== null ? { uri: user.avatar } : blankAvatar} 
              style={styles.userImage} 
            />
            <View style={{ marginHorizontal: 8, }}>
              <Text 
                style={styles.listTitle} 
                numberOfLines={2}
                ellipsizeMode='tail'
              >
                {user.name}
              </Text>
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
      </TouchableOpacity>
    </>
  )
}


const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "white",
  },
  header: {
    // backgroundColor: "red",
    marginVertical: 10,
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
    borderBottomWidth: 0.3,
    borderBottomColor: "#808080",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookImage: {
    width: regWidth * 92,
    height: regWidth * 92,
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
    fontSize: regWidth * 18,
    fontWeight: "700",
    width: regWidth * 230,
  },
  listAuthor: {
    fontSize: regWidth * 15,
    fontWeight: "400",
    marginTop: regHeight * 8,
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

