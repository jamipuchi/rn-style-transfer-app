import { StyleSheet, Appearance, StatusBar, Platform } from "react-native";

const isDarkMode = Appearance.getColorScheme() === "dark";

export { isDarkMode };
export default StyleSheet.create({
  background: {
    backgroundColor: !isDarkMode ? "#F2F2F7FF" : "#000000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
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
    width: "80%",
    height: 50,
    backgroundColor: "#006ee6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    marginBottom: 10,
    marginTop: 20,
  },
  cancelButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#181818",
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
  topButtonsContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    left: 20,
    height: 30,
  },
  btnSavePicture: {
    position: "absolute",
    right: 0,
    width: 30,
    height: 30,
  },
  btnSharePicture: {
    position: "absolute",
    right: 40,
    width: 30,
    height: 30,
  },
  btnBack: {
    position: "absolute",
    left: 0,
    width: 30,
    height: 30,
  },
  bottomContainer: {
    width: "100%",
    height: "100%",
  },
  stylesScrollView: { marginLeft: -20, marginRight: -20 },
  styleCard: {
    width: 120,
    height: 120,
    marginLeft: 20,
    borderRadius: 7,
    overflow: "hidden",
  },
  styleWhiteOverlay: {
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
  },
  styleImage: { height: "100%", width: "100%" },
  shimmeryCard: {
    width: 120,
    height: 120,
    marginLeft: 20,
    borderRadius: 7,
    overflow: "hidden",
  },
  premiumContainer: { display: "flex", flexDirection: "column" },
  premiumCTA: {
    color: isDarkMode ? "white" : "black",
    width: "100%",
    alignSelf: "stretch",
    textAlign: "center",
  },
  btnPremium: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    marginBottom: 10,
    marginTop: 20,
  },
  imageContainer: { width: "100%", height: "100%" },
  imageTouchable: {
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  noImageView: {
    backgroundColor: isDarkMode ? "#1C1C1EFF" : "#D1D1D6FF",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageViewText: {
    textAlign: "center",
    fontSize: 20,
    paddingBottom: 10,
    color: !isDarkMode ? "#3C3C434D" : "#EBEBF54D",
  },
});
