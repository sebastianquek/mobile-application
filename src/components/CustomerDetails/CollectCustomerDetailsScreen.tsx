import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Vibration,
  Platform,
  BackHandler,
  Keyboard
} from "react-native";
import { size } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { TopBackground } from "../Layout/TopBackground";
import { Credits } from "../Credits";
import {
  withNavigationFocus,
  NavigationFocusInjectedProps
} from "react-navigation";
import { BarCodeScannedCallback } from "expo-barcode-scanner";
import { InputNricSection } from "./InputNricSection";
import { AppHeader } from "../Layout/AppHeader";
import * as Sentry from "sentry-expo";
import { HelpButton } from "../Layout/Buttons/HelpButton";
import { HelpModalContext } from "../../context/help";
import { FeatureToggler } from "../FeatureToggler/FeatureToggler";
import { Banner } from "../Layout/Banner";
import { ImportantMessageContentContext } from "../../context/importantMessage";
import { useCheckUpdates } from "../../hooks/useCheckUpdates";
import { Scanner } from "./Scanner";
import { UpdateCountStatusModal } from "./UpdateCountStatusModal/UpdateCountStatusModal";
import { useAuthenticationContext } from "../../context/auth";
import { useConfigContext } from "../../context/config";
import { useValidateExpiry } from "../../hooks/useValidateExpiry";
import { MetaDataCard } from "./MetaDataCard";
import { useClickerCount } from "../../hooks/useClickerCount/useClickerCount";
import { useClickerDetails } from "../../hooks/useClickerDetails/useClickerDetails";

const styles = StyleSheet.create({
  content: {
    position: "relative",
    padding: size(2),
    paddingVertical: size(8),
    height: "100%",
    width: 512,
    maxWidth: "100%"
  },
  headerBar: {
    marginBottom: size(4)
  },
  rowWrapper: {
    marginBottom: size(1.5)
  }
});

const showAlert = (message: string, onDismiss: () => void): void =>
  Alert.alert("Error", message, [{ text: "Dimiss", onPress: onDismiss }], {
    onDismiss // for android outside alert clicks
  });

const CollectCustomerDetailsScreen: FunctionComponent<NavigationFocusInjectedProps> = ({
  navigation,
  isFocused
}) => {
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "navigation",
      message: "CollectCustomerDetailsScreen"
    });
  }, []);

  const messageContent = useContext(ImportantMessageContentContext);
  const [shouldShowCamera, setShouldShowCamera] = useState(false);
  const [nricInput, setNricInput] = useState("");
  const showHelpModal = useContext(HelpModalContext);
  const checkUpdates = useCheckUpdates();
  const { sessionToken } = useAuthenticationContext();
  const { config } = useConfigContext();
  const {
    getClickerDetails,
    count,
    name,
    isLoading,
    error: detailsError,
    setCount
  } = useClickerDetails(sessionToken);

  useEffect(() => {
    if (sessionToken) {
      getClickerDetails();
    }
  }, [getClickerDetails, sessionToken]);
  // Close camera when back action is triggered
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (shouldShowCamera) {
          setShouldShowCamera(false);
          return true;
        }
        return false;
      }
    );
    return () => {
      backHandler.remove();
    };
  }, [shouldShowCamera]);

  // Dismiss keyboard whenever camera is shown
  useEffect(() => {
    if (shouldShowCamera) {
      Keyboard.dismiss();
    }
  }, [shouldShowCamera]);

  // Check for updates whenever this screen is focused
  // and when the camera is hidden
  useEffect(() => {
    if (isFocused && !shouldShowCamera) {
      checkUpdates();
    }
  }, [isFocused, checkUpdates, shouldShowCamera]);

  // Check whether the session token is valid whenever
  // this screen is focused and when camera is hidden
  const validateTokenExpiry = useValidateExpiry(navigation.dispatch);
  useEffect(() => {
    if (isFocused && !shouldShowCamera) {
      validateTokenExpiry();
    }
  }, [isFocused, validateTokenExpiry, shouldShowCamera]);

  const {
    updateCountState,
    updateCount,
    updateCountResult,
    error: countError,
    resetState
  } = useClickerCount(sessionToken);

  const onCancel = useCallback((): void => {
    setNricInput("");
    resetState();
  }, [resetState]);

  useEffect(() => {
    setNricInput("");
    if (detailsError) {
      showAlert(detailsError.message, onCancel);
    } else if (countError) {
      showAlert(countError.message, onCancel);
    }
  }, [onCancel, detailsError, countError]);

  // Vibrate when clicker is updating its count
  useEffect(() => {
    if (Platform.OS === "android" && updateCountState === "UPDATING_COUNT") {
      Vibration.vibrate(50);
    }
  }, [updateCountState]);

  useEffect(() => {
    if (updateCountResult && updateCountResult.count != null) {
      setCount(updateCountResult.count);
    }
  }, [setCount, updateCountResult]);

  const isScanningEnabled =
    isFocused &&
    updateCountState === "DEFAULT" &&
    !(detailsError || countError);
  const onBarCodeScanned: BarCodeScannedCallback = event => {
    if (isScanningEnabled && event.data) {
      updateCount(event.data, config.gantryMode);
    }
  };

  const forceUpdateCount = (id: string): void => {
    updateCount(id, config.gantryMode, true);
  };

  return (
    <>
      <TopBackground />
      <ScrollView
        contentContainerStyle={{ alignItems: "center" }}
        scrollIndicatorInsets={{ right: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.content}>
            <View style={styles.headerBar}>
              <AppHeader />
            </View>
            {messageContent && (
              <View style={styles.rowWrapper}>
                <Banner {...messageContent} />
              </View>
            )}

            <View style={styles.rowWrapper}>
              <MetaDataCard
                clickerName={name}
                count={count}
                isLoading={isLoading}
                refreshCallback={getClickerDetails}
              />
            </View>
            <Card>
              <AppText>Scan NRIC/FIN or manually enter it</AppText>
              <InputNricSection
                openCamera={() => setShouldShowCamera(true)}
                nricInput={nricInput}
                setNricInput={setNricInput}
                submitNric={(bypassRestriction?: boolean) =>
                  updateCount(nricInput, config.gantryMode, bypassRestriction)
                }
              />
            </Card>
            <FeatureToggler feature="HELP_MODAL">
              <HelpButton onPress={showHelpModal} />
            </FeatureToggler>
            <Credits style={{ marginTop: size(5) }} />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      {shouldShowCamera && (
        <Scanner
          isScanningEnabled={isScanningEnabled}
          onBarCodeScanned={onBarCodeScanned}
          onCancel={() => setShouldShowCamera(false)}
          cancelButtonText="Enter NRIC manually"
        />
      )}
      <UpdateCountStatusModal
        updateCountResult={updateCountResult}
        updateCountState={updateCountState}
        onExit={onCancel}
        forceUpdateCount={forceUpdateCount}
      />
    </>
  );
};

export const CollectCustomerDetailsScreenContainer = withNavigationFocus(
  CollectCustomerDetailsScreen
);
