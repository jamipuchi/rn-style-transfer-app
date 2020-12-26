import React, { Fragment, Component } from "react";
import ImagePicker from "react-native-image-picker";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  BackHandler,
  Image,
} from "react-native";
import CameraRoll from "@react-native-community/cameraroll";
import Icon from "react-native-vector-icons/Ionicons";
import IconAlt from "react-native-vector-icons/Entypo";
import apiKey from "./config";
import LinearGradient from "react-native-linear-gradient";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import styles, { isDarkMode } from "./styles/AppStyles";
import styleImage from "./clients/StylizeClient";
import ImageResizer from "react-native-image-resizer";
import Share from "react-native-share";

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const environment = {
  NONE: 0,
  PROD: 1,
  LOCALHOST: 2,
  THIRD_PARTY: 3,
};

const paintingStyles = [
  {
    display_image:
      "http://teresabernardart.com/wp-content/uploads/2015/08/painterly-art-style-Matisse_-_Vase_of_Sunflowers_1898.jpg",
    name: "Vase of sunflowers",
  },
  {
    display_image:
      "http://teresabernardart.com/wp-content/uploads/2015/08/example-of-impressionistic-Camille_Pissarro.jpg",
    name: "Camille Pissarro",
  },
  {
    display_image:
      "http://teresabernardart.com/wp-content/uploads/2015/08/example-of-abstract-art-by-Robert-Delaunay.jpg",
    name: "Abstract",
  },
  {
    display_image:
      "http://teresabernardart.com/wp-content/uploads/2015/08/example-of-surrealism-the-persistance-of-memory.jpg",
    name: "Surrealism",
  },
  {
    display_image:
      "http://teresabernardart.com/wp-content/uploads/2015/08/andy-warhol-pop-art.jpg",
    name: "Pop art",
  },
];

const activeEnvironment = environment.LOCALHOST;

const CHOOSING_MODIFICATION = "CHOOSING_MODIFICATION";
const CHOOSING_STYLE = "CHOOSING_STYLE";
const CONVERTING = "CONVERTING";
const CONVERTED = "CONVERTED";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUri: "",
      selectedStyle: 0,
      display: CHOOSING_MODIFICATION,
      marginTopAnim: new Animated.Value(0),
      marginBottomAnim: new Animated.Value(220),
      selectionOpacity: new Animated.Value(1),
      cancelOpacity: new Animated.Value(0),
      topButtonsOpacity: new Animated.Value(0),
      imageSpacing: new Animated.Value(220),
      choosingSpacing: new Animated.Value(0),
      changedImage: false,
      imageStyles:
        activeEnvironment === environment.THIRD_PARTY ? paintingStyles : [],
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (this.state.display !== CHOOSING_STYLE) {
        this.toChoosing;
      }
    });
    if (activeEnvironment !== environment.THIRD_PARTY) {
      this.getAvailableStylesFromEndpoint();
    }
  }

  toMain = () => {
    Animated.timing(this.state.choosingSpacing, {
      useNativeDriver: false,
      toValue: 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.selectionOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  toChoosing = (fromMain = false) => {
    if (this.state.fileUri == "") {
      this.chooseImage();
      return;
    }

    Animated.timing(this.state.choosingSpacing, {
      useNativeDriver: false,
      toValue: 400,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    }).start();

    Animated.timing(this.state.selectionOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 0,
      easing: Easing.inOut(Easing.ease),
    }).start();

    this.setState({ display: CHOOSING_STYLE });
    Animated.timing(this.state.selectionOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 0,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.imageSpacing, {
      useNativeDriver: false,
      toValue: 220,
      delay: 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.selectionOpacity, {
      useNativeDriver: false,
      toValue: 1,
      delay: fromMain ? 100 : 300,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.marginTopAnim, {
      useNativeDriver: false,
      toValue: 0,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.marginBottomAnim, {
      useNativeDriver: true,
      toValue: 220,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }).start(({ finished }) => {
      Animated.timing(this.state.marginBottomAnim, {
        useNativeDriver: true,
        toValue: 220,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
      }).start(({ finished }) => {});
    });
  };

  toConverting = () => {
    if (this.state.fileUri == "") {
      this.chooseImage();
      return;
    }

    Animated.timing(this.state.selectionOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.marginTopAnim, {
      useNativeDriver: false,
      toValue: 100,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.marginBottomAnim, {
      useNativeDriver: true,
      toValue: 120,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }).start(({ finished }) => {
      if (this.state.display !== CONVERTED) {
        this.setState({ display: CONVERTING });
        Animated.timing(this.state.cancelOpacity, {
          useNativeDriver: true,
          toValue: 1,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
        }).start();
        this.getImageFromEndpoint();
      }
    });
  };

  toConverted = (url) => {
    Animated.timing(this.state.cancelOpacity, {
      useNativeDriver: true,
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      if (this.state.display === CONVERTING) {
        this.setState({ display: CONVERTED });
        this.setState({ fileUri: url });
        Animated.timing(this.state.topButtonsOpacity, {
          useNativeDriver: true,
          toValue: 1,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
        }).start();
      }
    });
  };

  hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === "granted";
  };

  savePicture = async () => {
    if (Platform.OS === "android" && !(await this.hasAndroidPermission())) {
      return;
    }

    CameraRoll.save(this.state.fileUri, "photo");
    Alert.alert(
      "Image Saved",
      "The converted image was saved to your gallery",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  };

  chooseImage = () => {
    let options = {
      title: "Select Image",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
      tintColor: isDarkMode ? "white" : "black",
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
        alert(response.customButton);
      } else {
        ImageResizer.createResizedImage(
          response.uri,
          500,
          500,
          "JPEG",
          90,
          0,
          undefined,
          false,
          { mode: "cover", onlyScaleDown: false }
        ).then((response) => {
          this.setState({
            fileUri: response.uri,
          });
        });
        const source = { uri: response.uri };
      }
    });
  };

  getAvailableStylesFromEndpoint = async () => {
    fetch("http://localhost:8000/api/styles")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.styles);
        this.setState({
          imageStyles: data.styles,
        });
      });
  };

  getImageFromEndpoint = async () => {
    const photo = {
      uri: this.state.fileUri,
      type: "image/jpeg",
      name: "photo.jpg",
    };
    const form = new FormData();
    form.append("file", photo);
    form.append("style", this.state.imageStyles[this.state.selectedStyle].name);

    switch (activeEnvironment) {
      case environment.THIRD_PARTY:
        var myHeaders = new Headers();
        myHeaders.append("api-key", apiKey);

        var formdata = new FormData();
        formdata.append("content", {
          uri: this.state.fileUri,
          type: "image/jpeg",
          name: "photo.jpg",
        }), //this.state.fileUri);
          formdata.append(
            "style",
            paintingStyles[this.state.selectedStyle].display_image
          );

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formdata,
        };

        fetch("https://api.deepai.org/api/fast-style-transfer", requestOptions)
          .then((response) => response.json())
          .then((result) => {
            this.toConverted(result.output_url);
          })
          .catch((error) => console.log("error", error));

        break;
      case environment.PROD:
        fetch("http://51.38.233.111:8000/api/stylize/", {
          body: form,
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then((response) => response.blob())
          .then((images) => this.toConverted(URL.createObjectURL(images)))
          .catch((error) => {
            this.toChoosing();
            Alert.alert(
              "Error",
              "Please check your internet connection and try again",
              [{ text: "OK" }],
              { cancelable: false }
            );
          });
        break;
      case environment.LOCALHOST:
        const style = this.state.imageStyles[this.state.selectedStyle].name;
        const stylizedImage = await styleImage(this.state.fileUri, style);
        this.toConverted(stylizedImage);
        break;
      case environment.NONE:
        // code block
        setTimeout(() => this.toConverted(this.state.fileUri), 1000);
        break;
      default:
        console.log("PLEASE SET YOUR ENVIRONMENT VARIABLE " + environment);
        break;
    }
  };

  renderFileUri() {
    return (
      <Animated.View
        style={{
          ...styles.imageContainer,
          transform: [{ translateY: this.state.marginTopAnim }],
          paddingBottom: this.state.imageSpacing,
        }}
      >
        <TouchableOpacity
          disabled={
            this.state.display === CONVERTING ||
            this.state.display === CONVERTED
          }
          onPress={this.chooseImage}
          style={styles.imageTouchable}
        >
          {this.state.fileUri || this.state.display === CONVERTED ? (
            <Animated.Image
              source={{
                uri: this.state.fileUri,
              }}
              style={styles.images}
            />
          ) : (
            <View
              style={{
                ...styles.images,
                ...styles.noImageView,
              }}
            >
              <Text style={styles.noImageViewText}>
                Click here to choose an image
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.background}>
        <StatusBar />
        <View
          style={{
            ...styles.body,
          }}
        >
          {this.renderFileUri()}

          {this.state.display == CONVERTED && (
            <Animated.View
              style={{
                ...styles.topButtonsContainer,
                opacity: this.state.topButtonsOpacity,
              }}
            >
              <TouchableOpacity
                style={styles.btnSavePicture}
                onPress={this.savePicture}
              >
                <Icon
                  name="ios-download"
                  size={30}
                  color={isDarkMode ? "white" : "black"}
                  type="Ionicons"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnBack}
                onPress={() => this.toChoosing()}
              >
                <Icon
                  name="ios-arrow-back"
                  size={30}
                  color={isDarkMode ? "white" : "black"}
                  type="Ionicons"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSharePicture}
                onPress={() => {
                  console.log(this.state.fileUri);
                  Share.open({ url: this.state.fileUri })
                    .then((res) => {
                      console.log(res);
                    })
                    .catch((err) => {
                      err && console.log(err);
                    });
                }}
              >
                <Icon
                  name="ios-share"
                  size={30}
                  color={isDarkMode ? "white" : "black"}
                  type="Ionicons"
                />
              </TouchableOpacity>
            </Animated.View>
          )}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              left: 20,
            }}
          >
            {(this.state.display === CHOOSING_MODIFICATION ||
              this.state.display === CHOOSING_STYLE) && (
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 0,
                  flexWrap: "wrap",
                  backgroundColor: "#121212",
                  height: 250,
                  marginLeft: -20,
                  marginRight: -20,
                  marginBottom: -50,
                  borderRadius: 20,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  padding: 20,
                  transform: [{ translateY: this.state.choosingSpacing }],
                  zIndex: 100,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(() => (
                  <TouchableOpacity
                    style={{
                      aspectRatio: 1,
                      backgroundColor: "#1C1C1EFF",
                      height: 75,
                      borderRadius: 50,
                      marginBottom: 20,
                      alignContent: "center",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      this.toChoosing(true);
                    }}
                  >
                    <Icon
                      name="ios-checkmark-circle-outline"
                      size={60}
                      color={isDarkMode ? "#000" : "#FFF"}
                      type="Ionicons"
                    />
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
            {this.state.display === CHOOSING_STYLE && (
              <Animated.View
                style={{
                  ...styles.bottomContainer,
                  opacity: this.state.selectionOpacity,
                }}
              >
                <ScrollView style={styles.stylesScrollView} horizontal={true}>
                  {this.state.imageStyles.length !== 0
                    ? this.state.imageStyles.map((image, index, arr) => (
                        <TouchableOpacity
                          key={image.name}
                          style={{
                            ...styles.styleCard,
                            marginRight: index === arr.length - 1 ? 20 : 0,
                          }}
                          onPress={() =>
                            this.setState({ selectedStyle: index })
                          }
                        >
                          {this.state.selectedStyle == index && (
                            <View style={styles.styleWhiteOverlay}>
                              <Icon
                                name="ios-checkmark-circle-outline"
                                size={40}
                                color={isDarkMode ? "#FFF" : "#000"}
                                type="Ionicons"
                              />
                            </View>
                          )}
                          <Image
                            style={styles.styleImage}
                            source={{ uri: image.display_image }}
                          />
                        </TouchableOpacity>
                      ))
                    : [1, 2, 3, 4, 5].map((num, index, arr) => (
                        <ShimmerPlaceHolder
                          shimmerColors={
                            isDarkMode
                              ? ["#1C1C1EFF", "black", "#1C1C1EFF"]
                              : ["#D1D1D6FF", "white", "#D1D1D6FF"]
                          }
                          duration={2000}
                          style={{
                            ...styles.styleCard,
                            marginRight: index === arr.length - 1 ? 20 : 0,
                          }}
                        />
                      ))}
                </ScrollView>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{
                      width: "20%",
                      height: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 7,
                      marginBottom: 10,
                      marginTop: 20,
                    }}
                    onPress={this.toMain}
                  >
                    <IconAlt
                      name="chevron-up"
                      size={40}
                      color={isDarkMode ? "white" : "black"}
                      type="Ionicons"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ ...styles.btnSection }}
                    onPress={() => {
                      this.toConverting();
                    }}
                  >
                    <Text style={styles.btnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
            {this.state.display === CONVERTING && (
              <Animated.View style={{ opacity: this.state.cancelOpacity }}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => this.toChoosing()}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            {this.state.display === CONVERTED && (
              <Animated.View
                style={{
                  ...styles.premiumContainer,
                  opacity: this.state.topButtonsOpacity,
                }}
              >
                <Text style={styles.premiumCTA} adjustsFontSizeToFit>
                  Do you want your photos to have full quality?
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "You need to pay to unlock this feature",
                      "You need to pay just a little bit but it will be worth it",
                      [
                        {
                          text: "OK",
                        },
                      ],
                      { cancelable: false }
                    )
                  }
                >
                  <LinearGradient
                    colors={["#203a43", "#2c5364"]}
                    style={styles.btnPremium}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    onPress={() => this.toChoosing()}
                  >
                    <Text style={styles.btnText}>Buy premium</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
