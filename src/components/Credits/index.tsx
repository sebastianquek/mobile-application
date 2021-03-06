import React, { FunctionComponent, useState } from "react";
import HiveLogo from "../../../assets/icons/hive-logo.svg";
import {
  View,
  StyleSheet,
  ViewProps,
  TouchableWithoutFeedback
} from "react-native";
import { AppText } from "../Layout/AppText";
import { size, fontSize } from "../../common/styles";

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: size(2),
    marginBottom: size(2)
  },
  content: {
    marginLeft: size(1)
  },
  text: {
    fontSize: fontSize(-4),
    fontFamily: "brand-bold",
    color: "#CCCCCC"
  },
  subText: {
    fontSize: fontSize(-4),
    color: "#CCCCCC"
  }
});

const contributors = [
  "Chow Ruijie",
  "Raymond Yeh",
  "Sebastian Quek",
  "Immanuella Lim",
  "Tang Li Ren",
  "Lim Zui Young"
];

const THRESHOLD_CLICKS = 3;

export const Credits: FunctionComponent<ViewProps> = ({ style }) => {
  const [clicks, setClicks] = useState(0);
  const onPress = (): void => {
    setClicks(c => c + 1);
  };
  const displayedText =
    clicks < THRESHOLD_CLICKS
      ? ""
      : contributors[(clicks - THRESHOLD_CLICKS) % contributors.length];

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.wrapper, style]}>
        <HiveLogo />
        <View style={styles.content}>
          <AppText style={styles.text}>Built by GDS, GovTech Singapore</AppText>
          {displayedText.length > 0 && (
            <AppText style={styles.subText}>{displayedText}</AppText>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
