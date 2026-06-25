import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface KeyboardScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  backgroundColor?: string;
  bounce?: boolean;
}

export function KeyboardScrollView({
  children,
  style,
  scrollEnabled = true,
  backgroundColor = 'transparent',
  bounce = true,
}: KeyboardScrollViewProps) {
  const Content = scrollEnabled ? ScrollView : View;
  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Content
        bounces={bounce}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
