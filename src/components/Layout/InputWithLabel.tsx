import React, { forwardRef } from "react";
import { TextInput, View, StyleSheet, TextInputProps } from "react-native";
import { size, color, borderRadius, fontSize } from "../../common/styles";
import { AppText } from "./AppText";

const styles = StyleSheet.create({
  label: {
    fontFamily: "brand-bold"
  },
  input: {
    minHeight: size(6),
    paddingHorizontal: size(1),
    marginTop: size(1),
    backgroundColor: color("grey", 0),
    borderWidth: 1,
    borderRadius: borderRadius(2),
    borderColor: color("grey", 40),
    fontFamily: "brand-regular",
    fontSize: fontSize(0),
    color: color("grey", 70)
  }
});

interface InputWithLabel extends TextInputProps {
  label: string;
}

// eslint-disable-next-line react/display-name
export const InputWithLabel = forwardRef<TextInput, InputWithLabel>(
  ({ label, ...props }, ref) => (
    <View>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput style={styles.input} {...props} ref={ref} />
    </View>
  )
);
