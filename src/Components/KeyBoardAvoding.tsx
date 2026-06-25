import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  backgroundColor?: string;
  bounce?: boolean;
  offset?: number;
  refreshControl?: React.ReactElement<RefreshControlProps> | null;
}

export function KeyboardAvoidingContainer({
  children,
  style,
  scrollEnabled = true,
  backgroundColor = "transparent",
  bounce = true,
  offset = 0,
  refreshControl,
}: KeyboardAvoidingContainerProps) {
  const Content = scrollEnabled ? ScrollView : View;
  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={offset}
    >
      <Content
        bounces={bounce}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        {...(scrollEnabled && refreshControl
          ? { refreshControl } //  pass only if scrollEnabled
          : {})}
        contentContainerStyle={[
          scrollEnabled ? styles.scrollContent : styles.content,
          style,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Content>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
