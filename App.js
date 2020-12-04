import React, { Fragment, Component } from "react";
import ImagePicker from "react-native-image-picker";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Animated,
  Easing,
  TouchableOpacity,
  Appearance,
  Alert,
  Platform,
  PermissionsAndroid,
  BackHandler,
  Image,
} from "react-native";
import CameraRoll from "@react-native-community/cameraroll";
import Icon from "react-native-vector-icons/Ionicons";
import apiKey from "./config";

const CHOOSING = "CHOOSING";
const CONVERTING = "CONVERTING";
const CONVERTED = "CONVERTED";

const paintingStyles = [
  "http://teresabernardart.com/wp-content/uploads/2015/08/painterly-art-style-Matisse_-_Vase_of_Sunflowers_1898.jpg",
  "http://teresabernardart.com/wp-content/uploads/2015/08/example-of-impressionistic-Camille_Pissarro.jpg",
  "http://teresabernardart.com/wp-content/uploads/2015/08/example-of-abstract-art-by-Robert-Delaunay.jpg",
  "http://teresabernardart.com/wp-content/uploads/2015/08/example-of-surrealism-the-persistance-of-memory.jpg",
  "http://teresabernardart.com/wp-content/uploads/2015/08/andy-warhol-pop-art.jpg",
];

const isDarkMode = Appearance.getColorScheme() === "dark";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUri: "",
      selectedStyle: 0,
      display: CHOOSING,
      marginTopAnim: new Animated.Value(0),
      marginBottomAnim: new Animated.Value(220),
      selectionOpacity: new Animated.Value(1),
      cancelOpacity: new Animated.Value(0),
      topButtonsOpacity: new Animated.Value(0),
      imageBlurRadius: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (this.state.display !== CHOOSING) {
        this.toChoosing;
      }
    });
  }

  toChoosing = () => {
    this.setState({ display: CHOOSING });
    Animated.timing(this.state.selectionOpacity, {
      useNativeDriver: false,
      toValue: 1,
      delay: 300,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    }).start();
    Animated.timing(this.state.marginTopAnim, {
      useNativeDriver: true,
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
      useNativeDriver: true,
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
        Animated.timing(this.state.imageBlurRadius, {
          useNativeDriver: false,
          toValue: 20,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }).start(() => {
          this.setState({ fileUri: url });
          Animated.timing(this.state.imageBlurRadius, {
            useNativeDriver: false,
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }).start();
        });
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
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
        alert(response.customButton);
      } else {
        const source = { uri: response.uri };
        this.setState({
          fileUri: "data:image/jpeg;base64," + response.data,
        });
      }
    });
  };

  getImageFromEndpoint = async () => {
    var myHeaders = new Headers();
    myHeaders.append("api-key", apiKey);

    var formdata = new FormData();
    formdata.append("content", {
      uri: this.state.fileUri,
      type: "image/jpeg",
      name: "photo.jpg",
    }), //this.state.fileUri);
      formdata.append("style", paintingStyles[this.state.selectedStyle]);

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
  };

  renderFileUri() {
    return (
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          transform: [{ translateY: this.state.marginTopAnim }],
          paddingBottom: 220,
        }}
      >
        <TouchableOpacity
          disabled={this.state.display != CHOOSING}
          onPress={this.chooseImage}
          style={{
            height: "100%",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {this.state.fileUri || this.state.display === CONVERTED ? (
            <Animated.Image
              blurRadius={this.state.imageBlurRadius}
              source={{
                uri: this.state.fileUri,
              }}
              style={styles.images}
            />
          ) : (
            <View
              style={{
                ...styles.images,
                backgroundColor: isDarkMode ? "#1C1C1EFF" : "#D1D1D6FF",
                aligncontent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  paddingBottom: 10,
                  color: !isDarkMode ? "#3C3C434D" : "#EBEBF54D",
                }}
              >
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
      <SafeAreaView
        style={{
          backgroundColor: !isDarkMode ? "#F2F2F7FF" : "#000000",
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
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
                position: "absolute",
                top: 20,
                right: 20,
                left: 20,
                height: 30,
                opacity: this.state.topButtonsOpacity,
              }}
            >
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 0,
                  width: 30,
                  height: 30,
                }}
                onPress={this.savePicture}
              >
                <Icon
                  name="ios-download"
                  size={30}
                  color={!this.state.isDarkMode ? "#FFF" : "#000"}
                  type="Ionicons"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  left: 0,
                  width: 30,
                  height: 30,
                }}
                onPress={() => this.toChoosing()}
              >
                <Icon
                  name="ios-arrow-back"
                  size={30}
                  color={!this.state.isDarkMode ? "#FFF" : "#000"}
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
            {this.state.display === CHOOSING && (
              <Animated.View
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: this.state.selectionOpacity,
                }}
              >
                <ScrollView
                  style={{ marginLeft: -20, marginRight: -20 }}
                  horizontal={true}
                >
                  {paintingStyles.map((image, index, arr) => (
                    <TouchableOpacity
                      key={image}
                      style={{
                        height: "100%",
                        width: 120,
                        height: 120,
                        marginLeft: 20,
                        marginRight: index === arr.length - 1 ? 20 : 0,
                        borderRadius: 7,
                        overflow: "hidden",
                      }}
                      onPress={() => this.setState({ selectedStyle: index })}
                    >
                      {this.state.selectedStyle == index && (
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 2,
                          }}
                        >
                          <Icon
                            name="ios-checkmark-circle-outline"
                            size={40}
                            color={!this.state.isDarkMode ? "#FFF" : "#000"}
                            type="Ionicons"
                          />
                        </View>
                      )}
                      <Image
                        style={{ height: "100%", width: "100%" }}
                        source={{ uri: image }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={{ ...styles.btnSection }}
                  onPress={() => {
                    this.toConverting();
                  }}
                >
                  <Text style={styles.btnText}>Convert</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            {this.state.display === CONVERTING && (
              <Animated.View style={{ opacity: this.state.cancelOpacity }}>
                <TouchableOpacity
                  style={styles.btnSection}
                  onPress={() => this.toChoosing()}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    height: "100%",
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
  },
  images: {
    width: "100%",
    height: "100%",
  },
  btnParentSection: {
    alignItems: "center",
    marginTop: 10,
  },
  btnSection: {
    width: "100%",
    height: 50,
    backgroundColor: "#006ee6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    marginBottom: 10,
    marginTop: 20,
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
