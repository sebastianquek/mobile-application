import React, { useState, FunctionComponent } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { size, color, borderRadius, fontSize } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { loginRequest } from "../../services/auth";
import { mobileNumberValidator, countryCodeValidator } from "./utils";

const styles = StyleSheet.create({
  inputAndButtonWrapper: {
    marginTop: size(3)
  },
  numberWrapper: {
    marginBottom: size(2)
  },
  label: {
    fontFamily: "brand-bold"
  },
  inputsWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  countryCode: {
    minHeight: size(6),
    paddingHorizontal: size(1),
    marginTop: size(1),
    backgroundColor: color("grey", 0),
    borderWidth: 1,
    borderRadius: borderRadius(2),
    borderColor: color("grey", 30),
    fontSize: fontSize(0),
    color: color("blue", 50),
    minWidth: size(7)
  },
  numberInput: {
    flex: 1,
    minHeight: size(6),
    paddingHorizontal: size(1),
    marginTop: size(1),
    backgroundColor: color("grey", 0),
    borderWidth: 1,
    borderRadius: borderRadius(2),
    borderColor: color("grey", 40),
    fontSize: fontSize(0),
    color: color("blue", 50)
  },
  hyphen: {
    marginRight: size(1),
    marginLeft: size(1),
    fontSize: fontSize(3)
  }
});

interface LoginMobileNumberCard {
  onSuccess: (loginToken: string) => void;
}

export const LoginMobileNumberCard: FunctionComponent<LoginMobileNumberCard> = ({
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+65");
  const [mobileNumberValue, setMobileNumberValue] = useState("");

  const onChangeCountryCode = (value: string): void => {
    if (value.length <= 4) {
      const valueWithPlusSign = value[0] === "+" ? value : `+${value}`;
      setCountryCode(valueWithPlusSign);
    }
  };

  const onChangeMobileNumber = (text: string): void => {
    /^\d*$/.test(text) && setMobileNumberValue(text);
  };

  const startLoginRequest = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await loginRequest(mobileNumberValue);
      setIsLoading(false);
      onSuccess(response.loginUuid);
    } catch (e) {
      setIsLoading(false);
      alert(e);
    }
  };

  const onSubmitMobileNumber = (): void => {
    if (!countryCodeValidator(countryCode)) {
      alert("Invalid country code");
    } else if (!mobileNumberValidator(countryCode, mobileNumberValue)) {
      alert("Invalid mobile phone number");
    } else {
      startLoginRequest();
    }
  };

  return (
    <Card>
      <AppText>
        Please enter your mobile phone number to receive a one-time password.
      </AppText>
      <View style={styles.inputAndButtonWrapper}>
        <View style={styles.numberWrapper}>
          <AppText style={styles.label}>Mobile phone number</AppText>
          <View style={styles.inputsWrapper}>
            <TextInput
              style={styles.countryCode}
              keyboardType="phone-pad"
              value={countryCode}
              onChange={({ nativeEvent: { text } }) =>
                onChangeCountryCode(text)
              }
              editable={false} // Temporarily disable changing of country code
            />
            <AppText style={styles.hyphen}>-</AppText>
            <TextInput
              style={styles.numberInput}
              keyboardType="phone-pad"
              value={mobileNumberValue}
              onChange={({ nativeEvent: { text } }) =>
                onChangeMobileNumber(text)
              }
              onSubmitEditing={onSubmitMobileNumber}
            />
          </View>
        </View>
        <DarkButton
          text="Send OTP"
          onPress={onSubmitMobileNumber}
          fullWidth={true}
          isLoading={isLoading}
        />
      </View>
    </Card>
  );
};
