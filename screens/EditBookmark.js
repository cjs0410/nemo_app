import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Modal, Pressable, useWindowDimensions, Alert, ActivityIndicator, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialIcons, } from '@expo/vector-icons'; 
import { CardPreview, BlankCardFront, BlankCardChangable, AddBlankCardBack, BlankCardBack, } from "../components/Card";
import { InputCard, InvisibleCard, DotInputCard, AlbumList, } from '../components';
import Api from "../lib/Api";
import ImagePicker from 'react-native-image-crop-picker';
import bookCover from '../assets/images/steve.jpeg';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import iconCamera from '../assets/images/iconCamera.png';
import iconImage from '../assets/icons/iconImage.png';
import iconCheckmarkCircle from '../assets/icons/iconCheckmarkCircle.png';
import iconArrowForward from '../assets/icons/iconArrowForward.png';
import iconPlusCircleOutline from '../assets/icons/iconPlusCircleOutline.png';
import iconPlusCirclePurple from '../assets/icons/iconPlusCirclePurple.png';

import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
// import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import HTML from 'react-native-render-html';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetTextInput,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, setShouldNemoRefresh, setShouldNemolistRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const webViewProps = {
    originWhitelist: "*"
  };

const EditBookmark = ({navigation, route}) => {
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const [whatBook, setWhatBook] = useState('');
    const [bookTitle, setBookTitle] = useState('');
    const [whatChapter, setWhatChapter] = useState('');
    const [frontContent, setFrontContent] = useState('');
    const [backContent, setBackContent] = useState('');
    const [watermark, setWatermark] = useState('');
    const { accessToken, } = useSelector(userSelector);
    const [bookList, setBookList] = useState(null);
    const [color, setColor] = useState("#D9D9D9");

    const [modalVisible, setModalVisible] = useState(false);
    const [infoVisible, setInfoVisible] = useState(false);
    const [tagVisible, setTagVisible] = useState(false);
    const [albumVisible, setAlbumVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);

    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);

    const [addedNum, setAddedNum] = useState(0);
    const [firstContents, setFirstContents] = useState('');
    const [addedContents, setAddedContents] = useState([]);
    const [contents, setContents] = useState([]);
    const [info, setInfo] = useState('');
    const [tags, setTags] = useState([]);
    const [tagValue, setTagValue] = useState('');
    // const richText = useRef();
    const [richText, setRichText] = useState([]);
    const [isFocused, setIsFocused] = useState(true);
    const [focusNum, setFocusNum] = useState(0);

    const [contentsByNum, setContentsByNum] = useState([]);
    const [lineNum, setLineNum] = useState(0);
    const [cutIndex, setCutIndex] = useState([0, ]);
    const [current, setCurrent] = useState(0);
    const [contentsByLine, setContentsByLine] = useState([]);
    const [contentsByCard, setContentsByCard] = useState([]);

    const { bookmark, } = route.params;
    const [ ocrLoading, setOcrLoading ] = useState(false);
    const { ocrText, setOcrText } = useState('');

    const [albums, setAlbums] = useState(null);
    const [albumId, setAlbumId] = useState('');

    const [createBookLoading, setCreateBookLoading] = useState(false);
    const [editBookmarkLoading, setEditBookmarkLoading] = useState(false);

    const isEmpty = (frontContent.length === 0) || (selectedBook === null);
    const [showMenu, setShowMenu] = useState(false);
    const [align, setAlign] = useState('normal');
    const tagRef = useRef();
    const insets = useSafeAreaInsets();
    
    const [nemolists, setNemolists] = useState(null);
    const [newNemolistNum, setNewNemolistNum] = useState(0);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [selectedNemolists, setSelectedNemolists] = useState([]);

    useEffect(() => {
        updateWatermark();
        
        setSelectedBook({
            book_cover: bookmark.book_cover,
            book_title: bookmark.book_title,
            book_id: bookmark.book_id,
        });
        setWhatChapter(bookmark.chapter_title);
        setFrontContent(bookmark.contents.flat().join(''));
        if (bookmark.backgroundimg !== null) {
            setBackgroundImage(bookmark.backgroundimg);
        }
        setColor(bookmark.hex);
        setInfo(bookmark.text);
        setTags(bookmark.tags.map((tag) => tag.tag));
        console.log(bookmark);
    }, []);

    useEffect(() => {
        const cardNum = Math.ceil(contentsByLine.length / 9);
        let copy = [];

        for ( let i = 0; i < cardNum; i++) {
            copy = [...copy, contentsByLine.slice(i * 9, (i + 1) * 9)]
        }
        setContentsByCard(copy);
    }, [contentsByLine]);


    useEffect(() => {
        setContents([
            firstContents,
            ...addedContents
        ])
    }, [firstContents, addedContents]);

    // useEffect(() => {
    //     console.log(richText);
    //     console.log(richText[focusNum]);
    //     console.log(focusNum);
    // }, [richText]);


    const updateWatermark = async() => {
        await Api
        .get("/api/v2/bookmark/")
        .then((res) => {
            setWatermark(res.data.user_tag);
            // console.log(res.data);
        })
    }

    const onChangeChapter = (payload) => {
        setWhatChapter(payload);
    }

    const onChangeFront = (payload) => {
        setFrontContent(payload);
    }

    const onTextLayout = (e) => {
        console.log(e.nativeEvent.lines.length);
        console.log(e.nativeEvent);
    }

    const onChangeBack = (payload) => {
        setBackContent(payload);
    }

    const selectColor = (selectedColor) => {
        setColor(selectedColor);
    }

    const editBookmark = async() => {
        const nemolistIds = selectedNemolists.map((selectedNemolist) => (selectedNemolist.nemolist_id));
        console.log(JSON.stringify(tags));
        console.log(JSON.stringify(nemolistIds));
        if (isEmpty === false) {
            setEditBookmarkLoading(true);
            const formData = new FormData();
            // console.log(contents);
            formData.append('book_id', selectedBook.book_id);
            formData.append('chapter_title', whatChapter);
            // formData.append('nemos', JSON.stringify(contents));
            formData.append('contents', JSON.stringify(contentsByCard));
            formData.append('hex', color);
            formData.append('text', info);
            formData.append('tags', JSON.stringify(tags));
            formData.append('nemolist_id', JSON.stringify(nemolistIds));
            formData.append('bookmark_id', bookmark.bookmark_id);
            // if (backgroundImage !== null) {
            //     const filename = backgroundImage.split('/').pop();
            //     const match = /\.(\w+)$/.exec(filename ?? '');
            //     const type = match ? `image/${match[1]}` : `image`;
            //     formData.append('backgroundimg', {
            //         uri: backgroundImage,
            //         type: type,
            //         name: filename
            //     });
            // }
            
            try {
                console.log(formData);
                await Api.post("/api/v2/bookmark/edit/", formData,
                    {
                        headers: {
                            'content-type': 'multipart/form-data',
                        },
                    },
                )
                .then((res) => {
                    console.log(res.data);
                    navigation.goBack();
                    dispatch(setShouldNemoRefresh(true));
                    dispatch(setShouldNemolistRefresh(true));
                })
            } catch (err) {
                console.error(err);
            }
            setEditBookmarkLoading(false);
        } else {
            Alert.alert("북마크를 완성해주세요", "네모를 완성해주세요!", [
                {
                    text: "확인",
                },
            ]);
        }

    }

    const makeOcrImage = async () => {
        try {
          ImagePicker.openCamera({
            width: 1200,
            height: 1500,
            cropping: true,
            freeStyleCropEnabled: true,
          }).then(image => {
            console.log(image);
            fetchOCR(`file://${image.path}`);
          });
    
        } catch (error) {
          console.error(error);
    
        }
    };
    const pickOcrImage = async () => {
        try {
          ImagePicker.openPicker({
            width: 1200,
            height: 1500,
            cropping: true,
            freeStyleCropEnabled: true,
          }).then(image => {
            console.log(image);
            fetchOCR(`file://${image.path}`);
          });
    
        } catch (error) {
          console.error(error);
        }
    };

    const fetchOCR = async (ocrImage) => {
        const formData = new FormData();
        const filename = ocrImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', {
            uri: ocrImage,
            type: type,
            name: filename
        });

        try {
            setOcrLoading(true);
            await Api
            .put('/api/v2/bookmark/ocr/', formData, 
            {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            }
            )
            .then((res) => {
                console.log(res.data);
                setFrontContent((prevState) => {
                    return prevState + res.data.message;
                })
            })
        } catch (err) {
            console.error(err)
        }
        setOcrLoading(false);
    };


    const CreateBook = async() => {
        const formData = new FormData();
        setCreateBookLoading(true);
        if (image !== null) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('book_cover', {
                uri: image,
                type: type,
                name: filename
            });
        }

        formData.append('book_title', newBookTitle);
        formData.append('book_author', newBookAuthor);

        try {
            await Api
            .put("/api/v3/book/add/", formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
            )
            .then((res) => {
                // console.log(res.data);
                // navigation.goBack();
                setSelectedBook(res.data);
                setModalVisible(false);
            })
        } catch (err) {
            console.error(err);
        }
        setCreateBookLoading(false);
    }

    const addCard = () => {
        setAddedNum(addedNum + 1);
        setAddedContents([
            ...addedContents,
            '',
        ])
    }

    const writeCard = (payload, index) => {
        let copy = [...addedContents];
        copy[index] = payload;
        setAddedContents([
            ...copy
        ]);
        // console.log(addedContents);
    }

    const deleteCard = (index) => {
        setAddedNum(addedNum - 1);
        // console.log(addedContents);
        let copy = [...addedContents];
        copy.splice(index, 1);
        setAddedContents([
            ...copy,
        ]);
    }

    const changeInfo = (payload) => setInfo(payload);

    const changeTag = (e) => {
        console.log(e.nativeEvent.text);
        setTagValue(e.nativeEvent.text);
    };

    const submitTag = (e) => {
        if (tagValue.length > 0) {
            setTags([
                ...tags,
                tagValue,
            ]);
            setTagValue('');
            tagRef.current.clear();
        }
    }

    const deleteTag = (index) => {
        let copy = [...tags];
        copy.splice(index, 1);
        setTags(copy);
    }

    const handleCurrentChange = (e) => {
        const nextCurrent = Math.floor(
            e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 26),
        );
        if (nextCurrent < 0) {
            return;
        }
        // console.log(nextCurrent);
        setCurrent(nextCurrent);
    };

    const fetchAlbumList = async() => {
        try {
            await Api
            .get("/api/v4/album/list/")
            .then((res) => {
                console.log(res.data);
                setAlbums(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const exit = () => {
        Alert.alert("북마크 수정을 취소하시겠습니까?", "확인 버튼을 누르면 취소됩니다.", [
            {
                text: "취소",
            },
            {
                text: "확인", 
                onPress: () => navigation.goBack()
            }
        ]);
    }

    const selectNemolist = (nemolist) => {
        if (selectedNemolists.findIndex(selectedNemolist => selectedNemolist.nemolist_id === nemolist.nemolist_id) === -1) {
            setSelectedNemolists([
                ...selectedNemolists,
                nemolist,
            ]);
        } else {
            setSelectedNemolists(
                selectedNemolists.filter(selectedNemolist => selectedNemolist.nemolist_id !== nemolist.nemolist_id)
            )
        }
    }

    const renderAlbum = ({ item, index }) => (
        <View
            onPress={() => selectNemolist(item)}
            style={{ justifyContent: "center",  }}
        >
            <AlbumList album={item} navigation={navigation} isDefault={false} />
            <Pressable
                onPress={() => selectNemolist(item)}
                style={{
                    position: "absolute",
                    right: 0,
                    marginHorizontal: regWidth * 12,
                }}
            >
                <Image 
                    source={selectedNemolists.findIndex(selectedNemolist => selectedNemolist.nemolist_id === item.nemolist_id) === -1 ? iconPlusCircleOutline : iconPlusCirclePurple}
                    style={{
                        width: regWidth * 40,
                        height: regWidth * 40,
                    }}
                />
            </Pressable>
        </View>
    )

    const fetchNemolist = async(sortNum) => {
        try {
            await Api
            .post("/api/v4/album/list/", {
                bookmark_id: bookmark.bookmark_id,
                sort: "recents",
                items: 0,
            })
            .then((res) => {
                console.log(res.data);
                setNemolists(res.data);
                setNewNemolistNum(res.data.length);
                onPressAlbum();
            })
        } catch (err) {
            console.error(err);
        }
    };

    const onEndReached = () => {
    	if(!scrollLoading) {
        	getNemolist();
        }
    };

    const getNemolist = async() => {
        if (nemolists.length >= 16 && newNemolistNum >= 16) {
            try {
                setScrollLoading(true);
                await Api
                .post("/api/v4/album/list/", {
                    bookmark_id: bookmark.bookmark_id,
                    sort: sortList[sort],
                    items: nemolists.length,
                })
                .then((res) => {
                    // console.log([...bookmarks, ...res.data, ]);
                    // console.log(res.data);
                    setNemolists([...nemolists, ...res.data.Nemolists, ]);
                    setNewNemolistNum(res.data.length);
                })
            } catch (err) {
                console.error(err);
            }
            setScrollLoading(false);
        }
    }

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="close"
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                // animatedIndex={{
                //     value: 0,
                // }}
            />
        ),
        []
    );

    const tagModalRef = useRef();
    const snapPoints = useMemo(() => [regHeight * 765], []);
    const onPressTag = useCallback(() => {
        tagModalRef.current.present();
    }, [tagModalRef]);

    const onCloseTag = useCallback(() => {
        tagModalRef.current.dismiss();
    }, [tagModalRef]);

    const albumModalRef = useRef();
    const onPressAlbum = useCallback(() => {
        albumModalRef.current.present();
    }, [albumModalRef]);

    const onCloseAlbum = useCallback(() => {
        albumModalRef.current.dismiss();
    }, [albumModalRef]);


    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View
                style={{
                    ...styles.header,
                    paddingTop: insets.top,
                    paddingBottom: 0,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }}
            >
                <Pressable 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "500", marginRight: regWidth * 8, }} >Cancel</Text>
                </Pressable>
                <Pressable
                    style={{
                        backgroundColor: colors.nemoDark,
                        paddingVertical: regHeight * 5,
                        paddingHorizontal: regWidth * 11,
                        borderRadius: 10,
                    }}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    onPress={editBookmark}
                    disabled={editBookmarkLoading ? true : false}
                >
                    {editBookmarkLoading ? 
                        <ActivityIndicator 
                            size="small"
                        />
                        :
                        <Text
                            style={{
                                color: "white",
                                fontSize: regWidth * 17,
                                fontWeight: "700",
                            }}
                        >
                            Edit Nemo
                        </Text>
                    }

                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {/* <BlankCardChangable 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
                    whatChapter={whatChapter}
                    frontContent={frontContent}
                    onChangeFront={onChangeFront} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    backgroundImage={backgroundImage}
                    setLineNum={setLineNum}
                    contentsByLine={contentsByLine}
                    setContentsByLine={setContentsByLine}
                    setContentsByCard={setContentsByCard}
                    ocrLoading={ocrLoading}
                /> */}
                
                <DotInputCard 
                    color={color} 
                    selectedBook={selectedBook}
                    onChangeChapter={onChangeChapter} 
                    whatChapter={whatChapter}
                    frontContent={frontContent}
                    onChangeFront={onChangeFront} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    backgroundImage={backgroundImage}
                    setLineNum={setLineNum}
                    contentsByLine={contentsByLine}
                    setContentsByLine={setContentsByLine}
                    setContentsByCard={setContentsByCard}
                    ocrLoading={ocrLoading}
                    setShowMenu={setShowMenu}
                    align={align}
                />
                
                <View style={styles.optionBar}>
                    <View style={{ flexDirection: "row", }} >
                        {/* <TouchableOpacity 
                            activeOpacity={1} 
                            style={{
                                ...styles.optionBox, 
                                backgroundColor: "#D9D9D9",
                                borderColor: color === "#D9D9D9" ? "#FF4040" : "black"
                            }}
                            onPress={() => {
                                selectColor("#D9D9D9");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{
                                ...styles.optionBox,
                                backgroundColor: "#FFCECE",
                                borderColor: color === "#FFCECE" ? "#FF4040" : "black"
                            }} 
                            onPress={() => {
                                selectColor("#FFCECE");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{
                                ...styles.optionBox, 
                                backgroundColor: "#FFF0BC",
                                borderColor: color === "#FFF0BC" ? "#FF4040" : "black"
                            }} 
                            onPress={() => {
                                selectColor("#FFF0BC");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{
                                ...styles.optionBox, 
                                backgroundColor: "#A0D88D",
                                borderColor: color === "#A0D88D" ? "#FF4040" : "black"
                            }} 
                            onPress={() => {
                                selectColor("#A0D88D");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{
                                ...styles.optionBox, 
                                backgroundColor: "#8BB7EA",
                                borderColor: color === "#8BB7EA" ? "#FF4040" : "black"
                            }} 
                            onPress={() => {
                                selectColor("#8BB7EA");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{
                                ...styles.optionBox, 
                                backgroundColor: "#D2BDFF",
                                borderColor: color === "#D2BDFF" ? "#FF4040" : "black"
                            }} 
                            onPress={() => {
                                selectColor("#D2BDFF");
                                setBackgroundImage(null);
                            }}
                        /> */}
                    </View>
                </View>
                
                <Pressable 
                    style={styles.TagAddBox} 
                >
                    <Text style={{ fontSize: regWidth * 14, fontWeight: "700", }} >Description</Text>
                    <TextInput 
                        onChangeText={changeInfo}
                        placeholder="Add a description"
                        style={{
                            height: 90,
                            width: "70%",
                            textAlignVertical: "top",
                            // marginLeft: regWidth * 18,
                            fontSize: regWidth * 14,
                            fontWeight: "500",
                            lineHeight: regWidth * 20,
                            padding: 0,
                            // margin: 0,
                            // backgroundColor:"pink"
                        }}
                        multiline={true}
                        value={info}
                    />
                </Pressable>
                <View 
                    style={styles.TagAddBox} 
                    // onPress={() => setTagVisible(true)}    
                >
                    <Text style={{ fontSize: regWidth * 14, fontWeight: "700",  }} >Tags</Text>
                    <Pressable
                        style={{
                            width: "70%",
                            // backgroundColor:"pink",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                        onPress={onPressTag}
                        // onPress={() => {
                        //     setTagVisible(true);
                        // }}
                    >
                        <TextInput 
                            placeholder="Add your tags"
                            style={{
                                width: "70%",
                                textAlignVertical: "top",
                                // marginLeft: regWidth * 18,
                                fontSize: regWidth * 14,
                                fontWeight: "500",
                                // lineHeight: regWidth * 20,
                                // backgroundColor:"pink"
                                color: colors.nemoDark,
                            }}
                            editable={false}
                            pointerEvents="none"
                            value={tags.map((tag) => `#${tag}`).join(', ')}
                            multiline={true}
                        />
                        <Image 
                            source={iconArrowForward}
                            style={{
                                width: regWidth * 24,
                                height: regWidth * 24,
                            }}
                        />
                    </Pressable>
                </View>

                <View 
                    style={{
                        ...styles.TagAddBox,
                        borderBottomWidth: 0.5,
                    }} 
                    // onPress={() => {
                    //     setAlbumVisible(true);
                    //     fetchAlbumList();
                    // }}    
                >
                    <Text style={{ fontSize: regWidth * 14, fontWeight: "700", }} >Nemolists</Text>
                    <Pressable
                        style={{
                            width: "70%",
                            // backgroundColor:"pink",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                        onPress={() => {
                            fetchNemolist();
                        }}
                    >
                        <TextInput 
                            placeholder="Add to your Nemolists"
                            style={{
                                width: "70%",
                                textAlignVertical: "top",
                                // marginLeft: regWidth * 18,
                                fontSize: regWidth * 14,
                                fontWeight: "500",
                                // lineHeight: regWidth * 20,
                                // backgroundColor:"pink"
                            }}
                            editable={false}
                            pointerEvents="none"
                            value={selectedNemolists.map((nemolist) => nemolist.nemolist_title).join(', ')}
                            multiline={true}
                        />
                        <Image 
                            source={iconArrowForward}
                            style={{
                                width: regWidth * 24,
                                height: regWidth * 24,
                            }}
                        />
                    </Pressable>
                </View>
            </ScrollView>

            <BottomSheetModal
                index={0}
                ref={tagModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View style={styles.modalHeader}>
                    <Pressable
                        // onPress={onCloseTag}
                        style={{opacity: 0}}
                    >
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, }}>
                            Done
                        </Text>
                    </Pressable>
                    <Text style={{ fontSize: regWidth * 19, fontFamily: "NotoSansKR-Black", }}>
                        Tags
                    </Text>
                    <Pressable
                        onPress={onCloseTag}
                    >
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, }}>
                            Done
                        </Text>
                    </Pressable>
                </View>
                <View
                    style={{
                        marginHorizontal: regWidth * 13,
                        marginTop: regWidth * 13,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            width: regWidth * 350,
                            height: regHeight * 40,
                            borderRadius: regWidth * 10,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: regWidth * 12,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: regWidth * 14,
                                fontFamily: "NotoSansKR-Medium",
                            }}
                        >
                            {"# "}
                        </Text>
                        <TextInput 
                            style={{
                                // backgroundColor: "pink",
                                height: "100%",
                                width: "90%",
                                fontSize: regWidth * 14,
                                fontFamily: "NotoSansKR-Medium",
                            }}
                            // value={tagValue}
                            onChange={changeTag}
                            onSubmitEditing={submitTag}
                            blurOnSubmit={false}
                            ref={tagRef}
                        />
                    </View>
                    {tags.map((tag, index) => (
                        <View 
                            style={{
                                marginTop: regHeight * 18,
                                flexDirection: "row",
                                alignItems: "center",
                                marginHorizontal: regWidth * 12,
                            }}
                            key={index}
                        >
                            <Text
                                style={{
                                    fontSize: regWidth * 14,
                                    fontFamily: "NotoSansKR-Medium",
                                    color: colors.nemoDark,
                                }}
                            >
                                {`# ${tag}`}
                            </Text>
                            <Pressable
                                onPress={() => deleteTag(index)}
                                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                style={{ marginHorizontal: regWidth * 4, }}
                            >
                                <Feather name="x" size={20} color={colors.textDark} />
                            </Pressable>
                        </View>
                    ))}
                </View>
            </BottomSheetModal>
            <BottomSheetModal
                index={0}
                ref={albumModalRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: "#D9D9D9"}}
            >
                <View style={styles.modalHeader}>
                    <Pressable
                        // onPress={onCloseAlbum}
                        style={{ opacity: 0, }}
                    >
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, }}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Text style={{ fontSize: regWidth * 19, fontFamily: "NotoSansKR-Black", }}>
                        Add to Nemolist
                    </Text>
                    <Pressable
                        onPress={onCloseAlbum}
                    >
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, }}>
                            Done
                        </Text>
                    </Pressable>
                </View>
                <BottomSheetFlatList 
                    data={nemolists}
                    renderItem={renderAlbum}
                />
            </BottomSheetModal>

            {/* {richText.length !== 0 ? 
                <KeyboardAvoidingView 
                    style={{ 
                        position: "absolute", 
                        bottom: 0, 
                        zIndex: 10, 
                        backgroundColor: "white", 
                        width: "100%", 
                        borderTopWidth: 0.3,
                        borderTopColor: "grey",
                    }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <RichToolbar
                        editor={richText[focusNum]}
                        selectedIconTint="red"
                        iconTint="#312921"
                        actions={[
                            actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.keyboard,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                        ]}
                        style={{ backgroundColor: "white", }}
                    />
                </KeyboardAvoidingView>
                : 
                null
            } */}

            {showMenu ? 
                <KeyboardAvoidingView 
                    style={styles.keyboardMenuContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View
                        style={{
                            height: regHeight * 60,
                            
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                paddingHorizontal: regWidth * 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: regWidth * 9,
                                    fontWeight: "400",
                                    justifyContent: "center",
                                }}
                            >
                                Scan text from
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Pressable
                                    onPress={makeOcrImage}
                                >
                                    <Image 
                                        source={iconCamera}
                                        style={styles.iconImage}
                                    />
                                </Pressable>
                                <Pressable
                                    onPress={pickOcrImage}
                                >
                                    <Image
                                        source={iconImage}
                                        style={{
                                            ...styles.iconImage,
                                            marginHorizontal: 8,
                                        }}
                                    />
                                </Pressable>
                            </View>
                        </View>
    
                        <View style={styles.separator}/>
    
                        <View
                            style={{
                                paddingHorizontal: regWidth * 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: regWidth * 9,
                                    fontWeight: "400",
                                }}
                            >
                                Background
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Pressable 
                                    style={{
                                        ...styles.optionBox, 
                                        backgroundColor: "#D9D9D9",
                                        borderColor: color === "#D9D9D9" ? "#FF4040" : "black"
                                    }}
                                    onPress={() => {
                                        selectColor("#D9D9D9");
                                        setBackgroundImage(null);
                                    }}
                                >
                                    <Image 
                                        source={iconCheckmarkCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                            opacity: color === "#D9D9D9" ? 1 : 0,
                                        }}
                                    />
                                </Pressable>
                                <Pressable 
                                    style={{
                                        ...styles.optionBox, 
                                        backgroundColor: "#FED2B5",
                                    }} 
                                    onPress={() => {
                                        selectColor("#FED2B5");
                                        setBackgroundImage(null);
                                    }}
                                >
                                    <Image 
                                        source={iconCheckmarkCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                            opacity: color === "#FED2B5" ? 1 : 0,
                                        }}
                                    />
                                </Pressable>
                                <Pressable 
                                    style={{
                                        ...styles.optionBox, 
                                        backgroundColor: "#EDF3C3",
                                    }} 
                                    onPress={() => {
                                        selectColor("#EDF3C3");
                                        setBackgroundImage(null);
                                    }}
                                >
                                    <Image 
                                        source={iconCheckmarkCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                            opacity: color === "#EDF3C3" ? 1 : 0,
                                        }}
                                    />
                                </Pressable>
                                <Pressable 
                                    style={{
                                        ...styles.optionBox, 
                                        backgroundColor: "#DBE5F1",
                                    }} 
                                    onPress={() => {
                                        selectColor("#DBE5F1");
                                        setBackgroundImage(null);
                                    }}
                                >
                                    <Image 
                                        source={iconCheckmarkCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                            opacity: color === "#DBE5F1" ? 1 : 0,
                                        }}
                                    />
                                </Pressable>
                                {/* <Pressable>
                                    <Image 
                                        source={iconImage}
                                        style={{
                                            ...styles.iconImage,
                                            // marginLeft: 8,
                                        }}
                                    />
                                </Pressable> */}
                            </View>
                        </View>

                        {/* <View style={styles.separator}/>

                        <View
                            style={{
                                paddingHorizontal: regWidth * 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: regWidth * 9,
                                    fontWeight: "400",
                                }}
                            >
                                Add sheet
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Pressable>
                                    <Image 
                                        source={iconPlus}
                                        style={styles.iconImage}
                                    />
                                </Pressable>
                            </View>
                        </View> */}
                    </View>
                </KeyboardAvoidingView>
                :
                null
            }
        </KeyboardAvoidingView>
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
    searchInput: {
        backgroundColor: "#EEEEEE",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginVertical: 13,
        marginHorizontal: 20,
        fontSize: 18,
    },
    optionBar: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginHorizontal: 8,
        marginVertical: 20,
    },
    optionBox: {
        // borderWidth: 1,
        // borderColor: "black",
        height: regWidth * 30,
        width: regWidth * 30,
        marginTop: regWidth * 6,
        justifyContent: "center",
        alignItems: "center",
        marginRight: regWidth * 10,
        borderRadius: 3,
    },
    TagAddBox: {
        flexDirection: "row",
        borderTopWidth: 0.5,
        borderTopColor: colors.bgdNormal,
        borderBottomColor: colors.bgdNormal,
        paddingVertical: regHeight * 10,
        marginHorizontal: regWidth * 13,
        alignItems: "center",
        justifyContent: "space-between"
    },
    modal: {
        width: '100%', 
        // height: '35%',
        height: regHeight * 220, 
        position: 'absolute', 
        // bottom: 0, 
        backgroundColor: 'white', 
        borderRadius: 10, 
        paddingTop: 10,
    },
    addBook: {
        marginTop: 18,
        // flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookCoverImage: {
        width: regWidth * 130,
        height: regWidth * 130,
        resizeMode: "contain",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: regHeight * 8,
        alignItems: "center",
        marginHorizontal: regWidth * 20,
        // marginHorizontal: regWidth * 18, 
    },
    modalInput: {
        backgroundColor: "#EEEEEE",
        marginHorizontal: regWidth * 22,
        marginVertical: regHeight * 22,
        borderRadius: 10,
        height: "25%",
        paddingHorizontal: regWidth * 8,
        fontSize: regWidth * 15,
        fontWeight:"500",
    },
    tagContainer: {
        backgroundColor: "#EEEEEE",
        borderRadius: 999,
        paddingVertical: regHeight * 8,
        paddingHorizontal: regWidth * 8, 
        marginHorizontal: regWidth * 8, 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
    },
    previewBtn: {
        borderWidth: 2,
        borderColor: "#D3D3D3",
        borderRadius: 999,
        width: regWidth * 99,
        marginBottom: 28,
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    albumListContainer: {
        backgroundColor: "#EEEEEE",
        width: regWidth * 350,
        height: regHeight * 350,
        borderRadius: 10,
        marginTop: 18,
    },
    albumList: {
        borderBottomWidth: 0.3,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    albumImage: {
        width: 45,
        height: 45,
    },
    keyboardMenuContainer: {
        position: "absolute", 
        bottom: 0, 
        zIndex: 10, 
        backgroundColor: "white", 
        width: "100%", 
        borderTopWidth: 0.3,
        borderTopColor: "#7341ffcc",
    },
    iconImage: {
        width: regWidth * 36,
        height: regWidth * 36,
    },
    separator: {
        width: 0.7,
        height: regHeight * 49,
        backgroundColor: "#7341ffcc",
    }
})

const tagsStyles = {
    div: {
        color: 'green',
        fontWeight: "500",
        fontSize: 16,
    },
    span: {
        color: 'green',
        fontWeight: "500",
        fontSize: 16,
    },
    // i: {
    //     fontStyle: "italic",
    // }
};

export default EditBookmark;


function useDebounce(value, delay = 500) {
    const [debounceVal, setDebounceVal] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceVal(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debounceVal;
}