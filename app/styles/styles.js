import { Dimensions } from "react-native";
import { scale } from "react-native-size-matters";
import { appColors } from "./appColors";

const { height, width } = Dimensions.get("screen");

export var containerStyles = {
    flex: 1,
    height: height,
    width: width,
    backgroundColor: appColors.white
}

export var inputFiled = { borderRadius: scale(20), backgroundColor: appColors.background, height: 42, fontFamily: appColors.fontBody };
export var inputContainer = { paddingVertical: scale(5), width: "100%" };
export var buttonStyle30 = { borderRadius: 10, borderWidth: 2, height: 30, padding: 0 };
export var buttonStyle35 = { borderRadius: 10, borderWidth: 2, height: 35, padding: 0 };
export var buttonStyle45 = { borderRadius: 10, borderWidth: 2, height: 45 };
export var headerStyle = { fontSize: 16, fontFamily: appColors.fontHeading, color: appColors.black };
export var headerStyle2 = { fontSize: 18, fontFamily: appColors.fontHeading, color: appColors.black };
export var f24 = { fontSize: 24 };
export var f16 = { fontSize: 16 };
export var f12 = { fontSize: 12 };
export var f13 = { fontSize: 13 };
export var f14 = { fontSize: 14 };
export var f18 = { fontSize: 18 };
export var textStyle = { fontSize: 14, fontFamily: appColors.fontBody, color: appColors.black };
export var textCenter = { textAlign: "center" };
export var textRight = { textAlign: "right" };
export var textJustify = { textAlign: "justify" };
export var textStyle2 = { fontSize: 14, fontFamily: appColors.fontBody, color: appColors.black };
export var row = { width: "100%", flexDirection: "row" };
export var rowFlex = { width: "100%", flexDirection: "row", flexWrap: "wrap" };
export var col50 = { width: "50%" };
export var col5 = { width: "5%" };
export var col15 = { width: "15%" };
export var col10 = { width: "10%" };
export var col20 = { width: "20%" };
export var col30 = { width: "30%" };
export var col40 = { width: "40%" };
export var col25 = { width: "25%" };
export var col33 = { width: "33.33%" };
export var col60 = { width: "60%" };
export var col65 = { width: "65%" };
export var col70 = { width: "70%" };
export var col75 = { width: "75%" };
export var col80 = { width: "80%" };
export var col85 = { width: "85%" };
export var col90 = { width: "90%" };
export var col100 = { width: "100%" };
export var textCapital = { textTransform: "capitalize" };
export var justifyContent = { justifyContent: "center" };
export var alignCenter = { alignItems: "center" };
export var alignRight = { alignItems: "right" };
export var primaryColor = { color: appColors.primary };
export var blackColor = { color: appColors.black };
export var whiteColor = { color: appColors.white };
export var bprimaryColor = { backgroundColor: appColors.primary };
export var bcreamColor = { backgroundColor: appColors.creamColor };
export var backgroundColor = { backgroundColor: appColors.background };
export var blprimaryColor = { backgroundColor: appColors.lightPrimary };
export var bwhiteColor = { backgroundColor: appColors.white };
export var bgreyColor = { backgroundColor: appColors.lightGray };
export var bredColor = { backgroundColor: appColors.error };
export var bgreenColor = { backgroundColor: appColors.green };
export var redColor = { color: appColors.error };
export var greenColor = { color: appColors.green };
export var greyColor = { color: appColors.grey };
export var m10 = { margin: 10 };
export var m5 = { margin: 5 };
export var mt5 = { marginTop: 5 };
export var mt10 = { marginTop: 10 };
export var mt15 = { marginTop: 15 };
export var mt20 = { marginTop: 20 };
export var mt30 = { marginTop: 30 };
export var mt40 = { marginTop: 40 };
export var mt60 = { marginTop: 60 };
export var mb10 = { marginBottom: 10 };
export var mb15 = { marginBottom: 15 };
export var mb20 = { marginBottom: 20 };
export var mb30 = { marginBottom: 30 };
export var mb40 = { marginBottom: 40 };
export var mb50 = { marginBottom: 50 };
export var p10 = { padding: 10 };
export var p16 = { padding: 16 };
export var p20 = { padding: 20 };
export var pl10 = { paddingLeft: 10 };
export var pr10 = { paddingRight: 10 };
export var ph10 = { paddingHorizontal: 10 };
export var ph20 = { paddingHorizontal: 20 };
export var ph30 = { paddingHorizontal: 30 };
export var p5 = { padding: 5 };
export var pt5 = { paddingTop: 5 };
export var pb5 = { paddingBottom: 5 };
export var pt10 = { paddingTop: 10 };
export var pt15 = { paddingTop: 15 };
export var pt20 = { paddingTop: 20 };
export var pt40 = { paddingTop: 40 };
export var pt60 = { paddingTop: 60 };
export var pb10 = { paddingBottom: 10 };
export var pb15 = { paddingBottom: 15 };
export var pb20 = { paddingBottom: 20 };
export var br10 = { borderRadius: 10 };
export var br20 = { borderRadius: 20 };
export var br30 = { borderRadius: 30 };
export var br8 = { borderRadius: 8 };
export var br4 = { borderRadius: 4 };
export var brw1 = { borderWidth: 1 };
export var brw02 = { borderWidth: 0.2 };
export var brw2 = { borderWidth: 2 };
export var brcp = { borderColor: appColors.primary };
export var brcred = { borderColor: appColors.red };
export var brcg = { borderColor: appColors.gray };
export var brcc = { borderColor: appColors.creamColor };
export var brcb = { borderColor: appColors.background };
export var disableStyle = { backgroundColor: appColors.darkGray, borderColor: appColors.darkGray };


// Styles

export var backBtn = {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
};

export var pageHeader = {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}