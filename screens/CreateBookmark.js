import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Modal, Pressable, useWindowDimensions, ActivityIndicator, Alert, ImageBackground, } from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialIcons, FontAwesome, } from '@expo/vector-icons'; 
import { CardPreview, BlankCardFront, BlankCardChangable, AddBlankCardBack, BlankCardBack } from "../components/Card";
import { InputCard, InvisibleCard, DotInputCard, AlbumList, } from '../components';
import Api from "../lib/Api";
// import * as ImagePicker from 'expo-image-picker';
import bookCover from '../assets/images/steve.jpeg';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import iconCamera from '../assets/images/iconCamera.png';
import iconImage from '../assets/icons/iconImage.png';
import iconCheckmarkCircle from '../assets/icons/iconCheckmarkCircle.png';
import iconArrowForward from '../assets/icons/iconArrowForward.png';
import iconPlus from '../assets/images/iconPlus.png';
import iconPlusCircleOutline from '../assets/icons/iconPlusCircleOutline.png';
import iconPlusCirclePurple from '../assets/icons/iconPlusCirclePurple.png';
import iconToBottom from '../assets/icons/iconToBottom.png';
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
// import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import HTML from 'react-native-render-html';
import { UnTouchableBookmarkList, } from "../components/BookmarkList";
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
import { resetUserInfo, setShouldHomeRefresh, setShouldLibraryRefresh, setShouldUserRefresh, setShouldNemoRefresh, setShouldNemolistRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import ImagePicker from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const webViewProps = {
    originWhitelist: "*"
  };

const CreateBookmark = ({navigation, route}) => {
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
    const [tempVisible, setTempVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    // const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
    // const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const { selectedBook, normal, } = route.params;

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

    // const { ocrImage, } = route.params;
    const [ ocrLoading, setOcrLoading ] = useState(false);
    const [croppedImage, setCroppedImage] = useState(null);
    const { ocrText, setOcrText } = useState('');

    const [albums, setAlbums] = useState(null);
    const [albumId, setAlbumId] = useState('');

    const [align, setAlign] = useState('normal');

    const [createBookLoading, setCreateBookLoading] = useState(false);
    const [createBookmarkLoading, setCreateBookmarkLoading] = useState(false);
    const [tempSaveLoading, setTempSaveLoading] = useState(false);

    const [tempBookmarks, setTempBookmarks] = useState(null);
    
    const isEmpty = (whatChapter.length === 0) || (frontContent.length === 0) || (selectedBook === null);
    const [showMenu, setShowMenu] = useState(false);
    const insets = useSafeAreaInsets();
    const tagRef = useRef();

    const [nemolists, setNemolists] = useState(null);
    const [newNemolistNum, setNewNemolistNum] = useState(0);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [selectedNemolists, setSelectedNemolists] = useState([]);

    const scrollRef = useRef();
   


/////////////////////////////////////////////WYSIWYG 테스트////////////////////////////////////////////////////////////////////////

    const [totalContents, setTotalContents] = useState([]);
    const [contentsByLine2, setContentsByLine2] = useState([]);
    const [contentsByCard2, setContentsByCard2] = useState([]);
    const [cardContents, setCardContents] = useState([]);
    const [inputRefs, setInputRefs] = useState([]);
    const firstInputRef = useRef();
    const inputRef = useRef([]);
    const [ref, setRef] = useState(null);
    const [cardCursorPosition, setCardCursorPosition] = useState([]);
    const [lastLineFirstCursor, setLastLineFirstCursor] = useState([]);


    const isEmpty2 = (totalContents.length === 0) || (selectedBook === null);

    useEffect(() => {
        setInputRefs([
            firstInputRef
        ])
    }, []);

    useEffect(() => {
        if (contentsByCard2.length > 0) {
            // console.log(cardCursorPosition, contentsByCard2[0].join('').length);
            // console.log(cardCursorPosition);
        }
        
    }, [cardCursorPosition, ])

    // totalContents에 따라 카드별로 내용을 저장함
    useEffect(() => {
        // const cardNum = Math.ceil(contentsByLine2.length / 9);
        const cardNum = parseInt(contentsByLine2.length / 9) + 1;
        let copy = [];

        for ( let i = 0; i < cardNum; i++) {
            copy = [...copy, contentsByLine2.slice(i * 9, (i + 1) * 9)]
        }
        setContentsByCard2(copy);
    }, [contentsByLine2]);

    // totalContents의 line number가 변할 때 contentsByCard를 통해 totalContents를 초기화해줌
    useEffect(() => {
        const cardNum = Math.ceil(contentsByLine2.length / 9);
        let copy = [];

        for ( let i = 0; i < cardNum; i++) {
            copy = [...copy, contentsByLine2.slice(i * 9, (i + 1) * 9).join('')]
        }
        setTotalContents(copy);
    }, [contentsByLine2.length]);

    // 각 카드의 마지막 줄의 첫번째 커서 위치 저장
    useEffect(() => {
        const cardNum = Math.ceil(contentsByLine2.length / 9);
        let copy = [];

        if (contentsByCard2.length > 0) {
            for ( let i = 0; i < cardNum; i++) {
                if (contentsByCard2[i].length === 9) {
                    // console.log(contentsByCard2[i].slice(0, -1).join('').length);
                    copy = [...copy, contentsByCard2[i].slice(0, -1).join('').length]
                }
            }
        }
        setLastLineFirstCursor(copy);
        
    }, [contentsByCard2])

    const onChangeTotalContents = (payload, index) => {
        const text = payload.replace(" ", "\u00A0");
        let copy = [...totalContents];
        copy[index] = text;
        // if (contentsByCard2[index].length === 9) {
        //     copy[index] = text.replace(/$/, '\n');
        // }
        

        setTotalContents(copy);
    }

    // 각 카드의 마지막 줄에서 enter 입력할 경우 다음 카드로 넘어감
    const onNextCard = (e, index) => {
        // console.log(contentsByCard2[index].length);

        // if (contentsByCard2[index].length === 9) {
        //     let copy=[...totalContents];
        //     const lastChar = copy[index].slice(-1);
        //     if (lastChar !== '\n') {
        //         copy[index] = copy[index] + '\n'
        //     }
        //     setTotalContents(copy);
        // }

        if ((contentsByCard2[index].length === 9) && (cardCursorPosition[index] >= lastLineFirstCursor[index])) {
            // e.preventDefault();



            const next = inputRef.current[index + 1];
            if (next) {
                next.focus();
            }
            ref.scrollTo({ x: SCREEN_WIDTH * (index + 1), y: 0, animated: true });
        }
    }

    // 각 카드의 0번째 커서에서 backspace 입력할 경우 이전 카드로 넘어감
    const onKeyPress = (e, index) => {
        const key = e.nativeEvent.key;
        if (key === "Backspace") {
            // console.log("back");
            if ((index !== 0) && (cardCursorPosition[index] === 0)) {

                // let copy = [...totalContents];
                // copy[index - 1] = copy[index - 1].replace(/\n*$/, '');
                // setTotalContents(copy);

                const prev = inputRef.current[index - 1];
                if (prev) {
                    prev.focus();
                }
                ref.scrollTo({ x: SCREEN_WIDTH * (index - 1), y: 0, animated: true });
            }
        }
        if (key === ' ') {
            // console.log("space");
        }
    }

    // const onAddBookmark = async() => {
    //     if (isEmpty2 === false) {
    //         setCreateBookmarkLoading(true);
    //         const formData = new FormData();
    //         // console.log(contents);
    //         formData.append('book_id', selectedBook.book_id);
    //         formData.append('chapter_title', whatChapter);
    //         // formData.append('nemos', JSON.stringify(contents));
    //         formData.append('contents', JSON.stringify(contentsByCard2));
    //         formData.append('hex', color);
    //         formData.append('text', info);
    //         formData.append('tags', JSON.stringify(tags));
    //         formData.append('album_id', albumId);
    //         // if (backgroundImage !== null) {
    //         //     const filename = backgroundImage.split('/').pop();
    //         //     const match = /\.(\w+)$/.exec(filename ?? '');
    //         //     const type = match ? `image/${match[1]}` : `image`;
    //         //     formData.append('backgroundimg', {
    //         //         uri: backgroundImage,
    //         //         type: type,
    //         //         name: filename
    //         //     });
    //         // }
    
    //         try {
    //             console.log(formData);
    //             await Api.post("/api/v2/bookmark/create/", formData,
    //                 {
    //                     headers: {
    //                         'content-type': 'multipart/form-data',
    //                     },
    //                 },
    //             )
    //             .then((res) => {
    //                 console.log(res.data);
    //                 navigation.goBack();
    //                 dispatch(setShouldHomeRefresh(true));
    //                 dispatch(setShouldLibraryRefresh(true));
    //                 dispatch(setShouldUserRefresh(true));
    //             })
    //         } catch (err) {
    //             console.error(err);
    //         }
    //         setCreateBookmarkLoading(false);
    //     } else {
    //         Alert.alert("북마크를 완성해주세요", "네모를 완성해주세요!", [
    //             {
    //                 text: "확인",
    //             },
    //         ]);
    //     }


    // }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        updateWatermark();
        // if (ocrImage !== null) {
        //     fetchOCR(ocrImage);
        // }
        console.log(navigation.getParent().name);
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
        // setFrontContent(payload.replace(" ", "\u00A0"));
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

    const onAddBookmark = async() => {
        const nemolistIds = selectedNemolists.map((selectedNemolist) => (selectedNemolist.nemolist_id));
        console.log(typeof(JSON.stringify(tags)));
        console.log(typeof(JSON.stringify(nemolistIds)));
        if (isEmpty === false) {
            setCreateBookmarkLoading(true);
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
                // console.log(formData);
                await Api.post("/api/v2/bookmark/create/", formData,
                    {
                        headers: {
                            'content-type': 'multipart/form-data',
                        },
                    },
                )
                .then((res) => {
                    console.log(res.data);
                    navigation.popToTop();
                    // dispatch(setShouldHomeRefresh(true));
                    // dispatch(setShouldLibraryRefresh(true));
                    // dispatch(setShouldUserRefresh(true));
                    dispatch(setShouldNemoRefresh(true));
                    dispatch(setShouldNemolistRefresh(true));
                })
            } catch (err) {
                console.error(err);
            }
            // setCreateBookmarkLoading(false);
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

    // const pickImage = async () => {
    //     try {
    //       setLoading(true);
    //       if (!status.granted) {
    //         const permission = await requestPermission();
    //         if (!permission.granted) {
    //           return null;
    //         }
    //       }
    
    //       const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         quality: 0.7,
    //       });
      
    //     //   console.log(result.uri);
      
    //       if (!result.cancelled) {
    //         setImage(result.uri);
    //       }
    //     } catch (error) {
    //       console.error(error);
    //     }
    //     setLoading(false);
    // };

    // const pickBackgroundImage = async () => {
    //     try {
    //       setLoading(true);
    //       if (!status.granted) {
    //         const permission = await requestPermission();
    //         if (!permission.granted) {
    //           return null;
    //         }
    //       }
    
    //       const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         aspect: [1, 1],
    //         allowsEditing: true,
    //         quality: 1,
    //       });
      
    //     //   console.log(result.uri);
      
    //       if (!result.cancelled) {
    //         setBackgroundImage(result.uri);
    //         setColor(null);

    //       }
    //     } catch (error) {
    //       console.error(error);
    //     }
    //     setLoading(false);
    // };

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
                // setFrontContent(frontContent + res.data.message);
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
                console.log(res.data);
                // navigation.goBack();
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

    // const changeTag = (payload) => {
    //     if (payload.indexOf(",") !== -1) {
    //         setTags([
    //             ...tags,
    //             payload.split(",")[0]
    //         ]);
    //         setTagValue('');
    //     } else {
    //         setTagValue(payload);
    //     }
    // }

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

    // const reSelectBook = () => {
    //     Alert.alert("Do you want to re-select book?", "확인 버튼을 누르면 취소됩니다.", [
    //         {
    //             text: "No",
    //         },
    //         {
    //             text: "Yes", 
    //             onPress: () => navigation.goBack()
    //         }
    //     ]);
    // }

    const onTempCreate = async() => {
        const formData = new FormData();
        setTempSaveLoading(true);
        formData.append('book_id', selectedBook.book_id);
        formData.append('chapter_title', whatChapter);
        // formData.append('nemos', JSON.stringify(contents));
        formData.append('contents', JSON.stringify(contentsByCard));
        formData.append('hex', color);
        formData.append('text', info);
        formData.append('tags', JSON.stringify(tags));
        formData.append('album_id', albumId);
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
            await Api
            .post("/api/v2/bookmark/temp_create/", formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                },
            )
            .then((res) => {
                console.log(res.data);
                navigation.goBack();
            })

        } catch (err) {
            console.error(err);
        }
        setTempSaveLoading(false);
    }

    const fetchTempBookmarks = async() => {
        try {
            await Api
            .post("/api/v2/bookmark/temp_list/")
            .then((res) => {
                // console.log(res.data);
                setTempBookmarks(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const onApplyTempBookmark = (bookmark) => {
        console.log(bookmark);
        // setSelectedBook({
        //     book_cover: bookmark.book_cover,
        //     book_title: bookmark.book_title,
        //     book_id: bookmark.book_id,
        // });
        setWhatChapter(bookmark.chapter_title);
        setFrontContent(bookmark.contents.flat().join(''));
        // if (!bookmark.backgroundimg) {
        //     setBackgroundImage(bookmark.backgroundimg);
        // }
        setColor(bookmark.hex);
        setInfo(bookmark.text);
        setTags(bookmark.tags.map((tag) => tag.tag));
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

    //////////////////////////////////////////////////CROP IMAGE////////////////////////////////////////////////////////////////////////////////////////
    // if (ocrImage !== null) {
    //     return (
    //         <View style={styles.container}>
    //             <ImageBackground
    //                 resizeMode="contain"
    //                 style={{
    //                     justifyContent: 'center', 
    //                     padding: 20, 
    //                     alignItems: 'center', 
    //                     height: "100%", 
    //                     width: "100%", 
    //                     backgroundColor: 'black',
    //                 }}
    //                 source={{ ocrImage }}
    //             >
    //                 {/* <Button title="Open Image Editor" onPress={() => this.setState({ isVisible: true })} /> */}
    //                 <ImageManipulatorView
    //                     photo={{ ocrImage }}
    //                     isVisible="true"
    //                     onPictureChoosed={(uri) => setCroppedImage(uri)}
    //                     //   onToggleModal={this.onToggleModal}
    //                 />
    //             </ImageBackground>
    //         </View>
    //     )
    // }
    //////////////////////////////////////////////////CROP IMAGE////////////////////////////////////////////////////////////////////////////////////////

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
                    onPress={() => {
                        navigation.goBack();
                        if (normal) {
                            navigation.goBack();
                        }
                        
                    }}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Text style={{ fontSize: regWidth * 17, fontFamily: "NotoSansKR-Medium", marginRight: regWidth * 8, includeFontPadding: false,}} >Cancel</Text>
                </Pressable>
                <Pressable
                    style={{
                        backgroundColor: colors.nemoDark,
                        paddingVertical: regHeight * 5,
                        paddingHorizontal: regWidth * 11,
                        borderRadius: 10,
                    }}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    onPress={onAddBookmark}
                    disabled={createBookmarkLoading ? true : false}
                >
                    {createBookmarkLoading ? 
                        <ActivityIndicator 
                            size="small"
                        />
                        :
                        <Text
                            style={{
                                color: "white",
                                fontSize: regWidth * 17,
                                fontFamily: "NotoSansKR-Bold",
                                includeFontPadding: false,
                            }}
                        >
                            Create Nemo
                        </Text>
                    }

                </Pressable>
                {/* <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Pressable 
                        onPress={reSelectBook}
                        hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                    >
                        <Text style={{ fontSize: regWidth * 15, fontWeight: "500", marginRight: regWidth * 32, color: "#FF4040", }} >취소</Text>
                    </Pressable>
                    {tempSaveLoading ? 
                        <ActivityIndicator 
                            color="black"
                        />
                        :
                        <Pressable 
                            onPress={onTempCreate}
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                        >
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "500", marginRight: regWidth * 32, }} >임시저장</Text>
                        </Pressable>
                    }

                    {createBookmarkLoading ? 
                        <ActivityIndicator 
                            color="#008000"
                        />
                        :
                        <Pressable
                            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                            onPress={onAddBookmark}
                        >
                            <Text style={{ fontSize: regWidth * 15, fontWeight: "500", color: "#008000" }} >완료</Text>
                        </Pressable>
                    }
                </View> */}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                // ref={(ref) => {
                //     setRef(ref);
                // }}
            >
                {/*********************************************** NO WYSIWYG *******************************************************/}

                {/* <BlankCardChangable 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
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
                /> */}
                {/*********************************************** NO WYSIWYG *******************************************************/}

                {/*********************************************** 두루마리 휴지형 *******************************************************/}
                <DotInputCard 
                    color={color} 
                    selectedBook={selectedBook}
                    onChangeChapter={onChangeChapter} 
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
                {/*********************************************** 두루마리 휴지형 *******************************************************/}
                


                {/* <BlankCardFront 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
                    onChangeFront={onChangeFront} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    richText={richText}
                    setIsFocused={setIsFocused}
                    setRichText={setRichText}
                    setFocusNum={setFocusNum}
                    setFirstContents={setFirstContents}
                    backgroundImage={backgroundImage}
                /> */}
                {/* {addedContents.map((contents, index) => (
                    <BlankCardBack 
                        color={color} 
                        onChangeBack={onChangeBack} 
                        watermark={watermark} 
                        richText={richText}
                        setIsFocused={setIsFocused}
                        setRichText={setRichText}
                        setFocusNum={setFocusNum}
                        contents={contents}
                        index={index}
                        writeCard={writeCard}
                        deleteCard={deleteCard}
                        addedContents={addedContents}
                        backgroundImage={backgroundImage}
                        key={index}
                    />
                ))} */}

            {/* <Pressable
                onPress={addCard}
            >
                <AddBlankCardBack
                    color={color}
                    backgroundImage={backgroundImage}
                />
            </Pressable> */}


            {/*********************************************** WYSIWYG *******************************************************/}

                {/* <InputCard 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    backgroundImage={backgroundImage}
                    setContentsByLine={setContentsByLine2}
                    ocrLoading={ocrLoading}
                    align={align}

                    onChangeTotalContents={onChangeTotalContents}
                    cardContents={totalContents}
                /> */}
                {/* {contentsByCard2.length < 2 ? 
                    <InputCard 
                        color={color} 
                        setBookTitle={setBookTitle} 
                        selectedBook={selectedBook}
                        setSelectedBook={setSelectedBook}
                        onChangeChapter={onChangeChapter} 
                        watermark={watermark} 
                        setModalVisible={setModalVisible}
                        backgroundImage={backgroundImage}
                        setContentsByLine={setContentsByLine2}
                        ocrLoading={ocrLoading}
                        align={align}

                        onChangeTotalContents={onChangeTotalContents}
                        cardContents={totalContents[0]}
                        totalContents={totalContents}
                        contentsByCard2={contentsByCard2}
                        onNextCard={onNextCard}
                        inputRef={inputRef}
                        index={0}
                    />
                    :
                    <ScrollView
                        // pagingEnabled
                        // horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={(ref) => {
                            setRef(ref);
                        }}
                    >
                        {contentsByCard2.map((contents, index) => (
                            <InputCard 
                                color={color} 
                                setBookTitle={setBookTitle} 
                                selectedBook={selectedBook}
                                setSelectedBook={setSelectedBook}
                                onChangeChapter={onChangeChapter} 
                                watermark={watermark} 
                                setModalVisible={setModalVisible}
                                backgroundImage={backgroundImage}
                                setContentsByLine={setContentsByLine2}
                                ocrLoading={ocrLoading}
                                align={align}

                                onChangeTotalContents={onChangeTotalContents}
                                cardContents={totalContents[index]}
                                totalContents={totalContents}
                                contentsByCard2={contentsByCard2}
                                onNextCard={onNextCard}
                                inputRef={inputRef}
                                index={index}
                                key={index}
                            />
                        ))}
                    </ScrollView>
                } */}

                {/* {contentsByCard2.length < 2 ? 
                    <InputCard 
                        color={color} 
                        setBookTitle={setBookTitle} 
                        selectedBook={selectedBook}
                        setSelectedBook={setSelectedBook}
                        onChangeChapter={onChangeChapter} 
                        watermark={watermark} 
                        setModalVisible={setModalVisible}
                        backgroundImage={backgroundImage}
                        setContentsByLine={setContentsByLine2}
                        ocrLoading={ocrLoading}
                        align={align}

                        onChangeTotalContents={onChangeTotalContents}
                        cardContents={totalContents[0]}
                        totalContents={totalContents}
                        contentsByCard2={contentsByCard2}
                        onNextCard={onNextCard}
                        inputRef={inputRef}
                        index={0}
                    />
                    :
                    <>
                        {contentsByCard2.map((contents, index) => (
                            <InputCard 
                                color={color} 
                                setBookTitle={setBookTitle} 
                                selectedBook={selectedBook}
                                setSelectedBook={setSelectedBook}
                                onChangeChapter={onChangeChapter} 
                                watermark={watermark} 
                                setModalVisible={setModalVisible}
                                backgroundImage={backgroundImage}
                                setContentsByLine={setContentsByLine2}
                                ocrLoading={ocrLoading}
                                align={align}

                                onChangeTotalContents={onChangeTotalContents}
                                cardContents={totalContents[index]}
                                totalContents={totalContents}
                                contentsByCard2={contentsByCard2}
                                onNextCard={onNextCard}
                                inputRef={inputRef}
                                index={index}
                                key={index}
                            />
                        ))}
                    </>
                } */}

                {/* <ScrollView
                    pagingEnabled
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleCurrentChange}
                    scrollEventThrottle={16}
                    scrollEnabled={contentsByCard2.length === 1 ? false : true}
                    ref={(ref) => {
                        setRef(ref);
                    }}
                >
                    <InputCard 
                        color={color} 
                        setBookTitle={setBookTitle} 
                        selectedBook={selectedBook}
                        setSelectedBook={setSelectedBook}
                        onChangeChapter={onChangeChapter} 
                        watermark={watermark} 
                        setModalVisible={setModalVisible}
                        backgroundImage={backgroundImage}
                        contentsByLine={contentsByLine2}
                        setContentsByLine={setContentsByLine2}
                        ocrLoading={ocrLoading}
                        align={align}

                        onChangeTotalContents={onChangeTotalContents}
                        cardContents={cardContents}
                        totalContents={totalContents}
                        // contentsByCard2={contentsByCard2}
                        contentsByCard2={contentsByCard2.length === 0 ? [[]]: contentsByCard2}
                        onNextCard={onNextCard}
                        onKeyPress={onKeyPress}
                        inputRef={inputRef}
                        cardCursorPosition={cardCursorPosition}
                        setCardCursorPosition={setCardCursorPosition}
                        setShowMenu={setShowMenu}
                        index={0}
                    />

                    {contentsByCard2.slice(1).map((contents, index) => (
                        <InputCard 
                            color={color} 
                            setBookTitle={setBookTitle} 
                            selectedBook={selectedBook}
                            setSelectedBook={setSelectedBook}
                            onChangeChapter={onChangeChapter} 
                            watermark={watermark} 
                            setModalVisible={setModalVisible}
                            backgroundImage={backgroundImage}
                            contentsByLine={contentsByLine2}
                            setContentsByLine={setContentsByLine2}
                            ocrLoading={ocrLoading}
                            align={align}

                            onChangeTotalContents={onChangeTotalContents}
                            cardContents={cardContents}
                            totalContents={totalContents}
                            contentsByCard2={contentsByCard2}
                            onNextCard={onNextCard}
                            onKeyPress={onKeyPress}
                            inputRef={inputRef}
                            index={index + 1}
                            cardCursorPosition={cardCursorPosition}
                            setCardCursorPosition={setCardCursorPosition}
                            setShowMenu={setShowMenu}
                            key={index}
                        />
                    ))}
                </ScrollView>
                {contentsByCard2.length === 1 ? 
                    null
                    :
                    <View style={{
                            flexDirection: "row", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            marginTop: -12, 
                        }}>
                            {contentsByCard2.map((contents, index) => {
                                if (index === current) {
                                    return <Entypo name="dot-single" size={24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                                }
                                return <Entypo name="dot-single" size={24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                            })}
                    </View>
                }


                <InvisibleCard 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
                    frontContent={contents.join('')}
                    
                    onChangeFront={onChangeFront} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    backgroundImage={backgroundImage}
                    setLineNum={setLineNum}
                    setContentsByLine={setContentsByLine2}
                    ocrLoading={ocrLoading}
                    align={align}

                    totalContents={totalContents}
                /> */}

                {/*********************************************** WYSIWYG *******************************************************/}

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
                        {/* <TouchableOpacity 
                            activeOpacity={1} 
                            style={styles.optionBox} 
                            onPress={pickBackgroundImage}
                        >
                            <MaterialIcons name="add-photo-alternate" size={24} color="black" />
                        </TouchableOpacity> */}
                    </View>
                    {/* <View style={{ flexDirection: "row", }} >
                        <Pressable 
                            style={{
                                ...styles.optionBox,
                                borderColor: align === "normal" ? "#FF4040" : "black",
                            }} 
                            onPress={() => setAlign('normal')}
                        >
                            <Feather name="align-justify" size={24} color={align === "normal" ? "#FF4040" : "black"} />
                        </Pressable>
                        <Pressable 
                            style={{
                                ...styles.optionBox,
                                borderColor: align === "center" ? "#FF4040" : "black",
                            }}
                            onPress={() => setAlign('center')}
                        >
                            <Feather name="align-center" size={24} color={align === "center" ? "#FF4040" : "black"} />
                        </Pressable>
                    </View> */}
                </View>
                
                {/* <WebView
                    style={styles.TagAddBox} 
                    source={{ html: firstContents }}
                /> */}
                {/* <HTML source={{ html: firstContents }} contentWidth={250} /> */}

                {/* <RenderHtml 
                    style={styles.TagAddBox} 
                    contentWidth={width}
                    source={{ html: firstContents }}
                    tagsStyles={tagsStyles}
                /> */}
                
                {/* <RenderHtml 
                    style={styles.TagAddBox} 
                    contentWidth={width}
                    source={{ html: '<div><i>asdfㅁㄴ이ㅏ럼;ㅣㄴ아러</i></div>' }}
                    tagsStyles={tagsStyles}
                /> */}


                {/* <Pressable 
                    style={styles.TagAddBox} 
                    // onPress={() => setInfoVisible(true)}    
                >
                    <Entypo name="edit" size={20} color="black" />
                    <Text 
                        style={{ fontSize: 17, fontWeight: "500", marginHorizontal: 8, }}
                        // onTextLayout={onTextLayout}
                    >
                        { frontContent }
                    </Text>
                </Pressable> */}

                {/* <View style={{ alignItems: "center", }}>
                    <Pressable 
                        style={styles.previewBtn} 
                        onPress={() => setPreviewVisible(true)}    
                    >
                        <Text style={{ fontSize: regWidth * 14, fontWeight: "500", marginHorizontal: 8, }} >미리보기</Text>
                    </Pressable>
                </View> */}
                <Pressable 
                    style={styles.TagAddBox} 
                >
                    <Text style={{ fontSize: regWidth * 14, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }} >Description</Text>
                    <TextInput 
                        onChangeText={changeInfo}
                        placeholder="Add a description"
                        style={{
                            height: regWidth * 90,
                            width: "70%",
                            textAlignVertical: "top",
                            // marginLeft: regWidth * 18,
                            fontSize: regWidth * 14,
                            fontFamily: "NotoSansKR-Medium",
                            includeFontPadding: false,
                            padding: 0,
                            // margin: 0,
                            // backgroundColor:"pink"
                        }}
                        multiline={true}
                        onFocus={() => {
                            setShowMenu(true);
                        }}
                        onBlur={() => {
                            setShowMenu(false);
                        }}
                    />
                </Pressable>
                <View 
                    style={styles.TagAddBox} 
                    // onPress={() => setTagVisible(true)}    
                >
                    <Text style={{ fontSize: regWidth * 14, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }} >Tags</Text>
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
                                fontFamily: "NotoSansKR-Medium",
                                includeFontPadding: false,
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
                    <Text style={{ fontSize: regWidth * 14, fontFamily: "NotoSansKR-Bold", includeFontPadding: false, }} >Nemolists</Text>
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
                                fontFamily: "NotoSansKR-Medium",
                                includeFontPadding: false,
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

                {/* <Pressable 
                    style={styles.TagAddBox} 
                    onPress={() => {
                        setTempVisible(true);
                        fetchTempBookmarks();
                    }}    
                >
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "500", }} >임시저장 목록</Text>
                </Pressable> */}

                {/* <View style={{height: 200}} ></View> */}
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
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, includeFontPadding: false, }}>
                            Done
                        </Text>
                    </Pressable>
                    <Text style={{ fontSize: regWidth * 19, fontFamily: "NotoSansKR-Black", includeFontPadding: false, }}>
                        Tags
                    </Text>
                    <Pressable
                        onPress={onCloseTag}
                    >
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, includeFontPadding: false, includeFontPadding: false, }}>
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
                                includeFontPadding: false,
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
                                includeFontPadding: false,
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
                                    includeFontPadding: false,
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
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, includeFontPadding: false, }}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Text style={{ fontSize: regWidth * 19, fontFamily: "NotoSansKR-Black", includeFontPadding: false, }}>
                        Add to Nemolist
                    </Text>
                    <Pressable
                        onPress={onCloseAlbum}
                    >
                        <Text style={{ fontSize: regWidth * 13, fontFamily: "NotoSansKR-Bold", color: colors.textLight, includeFontPadding: false, }}>
                            Done
                        </Text>
                    </Pressable>
                </View>
                <BottomSheetFlatList 
                    data={nemolists}
                    renderItem={renderAlbum}
                />
            </BottomSheetModal>

            {showMenu ? 
                <KeyboardAvoidingView 
                    style={styles.keyboardMenuContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    // behavior={"padding"}
                    // keyboardVerticalOffset={150}
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
                                        backgroundColor: "#ACD8D9",
                                    }} 
                                    onPress={() => {
                                        selectColor("#ACD8D9");
                                        setBackgroundImage(null);
                                    }}
                                >
                                    <Image 
                                        source={iconCheckmarkCircle}
                                        style={{
                                            position: "absolute",
                                            width: regWidth * 20,
                                            height: regWidth * 20,
                                            opacity: color === "#ACD8D9" ? 1 : 0,
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
                                Bottom
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Pressable
                                    onPress={() => {
                                        scrollRef.current.scrollToEnd({ animated: true })
                                    }}
                                >
                                    <Image 
                                        source={iconToBottom}
                                        style={styles.iconImage}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
                :
                null
            }

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
        marginHorizontal: regWidth * 13,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
        // borderColor: "#D3D3D3",
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
        width: regWidth * 45,
        height: regWidth * 45,
    },
    keyboardMenuContainer: {
        position: "absolute", 
        bottom: 0, 
        zIndex: 10, 
        backgroundColor: "white", 
        width: "100%", 
        borderTopWidth: 0.3,
        borderTopColor: "#7341ffcc",
        // backgroundColor:"pink",
        // height: regHeight * 60,
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

export default CreateBookmark;


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