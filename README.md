# 🎓 MCatPrep Mobile App

*A comprehensive, high-performance mobile application designed to help medical students prepare for the MCAT through interactive video lessons, 3D flashcards, and advanced progress tracking.*

## 🚀 Tech Stack

Built with a modern, robust React Native ecosystem focusing on performance and fluid UX.

*   **Framework:** React Native 0.81.0, React 19.1.0
*   **State Management:** Redux Toolkit & React-Redux
*   **Navigation:** React Navigation 7 (Native Stack & Bottom Tabs)
*   **Animation & Gestures:** React Native Reanimated v4, React Native Gesture Handler
*   **Video Playback:** React Native Video v7
*   **In-App Purchases:** React Native IAP
*   **Authentication:** React Native Auth0
*   **Storage & File System:** React Native FS, AsyncStorage
*   **UI/Visuals:** React Native Linear Gradient, SVG, Chart Kit, Calendars

## ⭐ Spotlight Feature: High-Performance 3D Flashcard Engine

The most technically complex feature of this application is the interactive, gesture-driven 3D flashcard deck (`FlashCard.tsx`).

**Why it was difficult:**
Building a Tinder-style swipeable card deck that also supports 3D flipping (front/back) is notoriously difficult to get right in React Native. Handling rapid user inputs on the JavaScript thread typically leads to frame drops and sluggish interactions.

**How it works under the hood:**
*   **UI Thread Offloading:** The component heavily utilizes `react-native-reanimated` and `react-native-gesture-handler`. By declaring functions as `'worklet'`s, all gesture calculations (pan, tap) and animation updates are executed strictly on the UI thread, completely bypassing the asynchronous React Native bridge.
*   **Complex Gesture Coordination:** It uses `Gesture.Simultaneous(panGesture, tapGesture)` to allow users to flip the card (via tap) or drag it (via pan) seamlessly without the gestures canceling each other out.
*   **Dynamic Feedback Engine:** A `useDerivedValue` hook continuously monitors the pan translation coordinates to determine "swipe confidence" (Left = Negative, Right = Positive, Down = Neutral). This dynamically drives the styling of a gradient overlay, providing real-time visual feedback before the swipe is committed.
*   **3D Matrix Transformations:** The card utilizes advanced perspective transformations (`perspective: 1000`) and interpolates Y-axis rotation for a realistic 3D flip effect, while dynamically calculating `zIndex` and static tilt angles to simulate a realistic stacked deck.

**Problems Solved:**
This engine guarantees fluid 60FPS animations, prevents main-thread blocking, and cleanly orchestrates state updates by utilizing `scheduleOnRN` to communicate back to the JS thread only when a swipe action is finalized, preventing unnecessary re-renders during the drag state.

## 🛠 Key Features

*   **Advanced Video Learning Hub:** Custom integration of `react-native-video` supporting dynamic resolution switching (720p, 540p, 360p), persistent progress tracking via debounced backend synchronization, and real-time conversion of SRT files to VTT for native subtitle rendering.
*   **Premium Content Gating:** A custom `PremiumGuard` component integrated with `react-native-iap` seamlessly restricts and grants access to premium video lessons and study materials.
*   **Interactive Whiteboard & Notes:** Users can access linked whiteboard sketches and detailed lecture notes directly synchronized with the current video player context.
*   **Study Progress Tracking:** Visualizes learning milestones using `react-native-chart-kit` and organizes study schedules with `react-native-calendars`.

## 💡 Why This Stands Out

Building the MCatPrep app required overcoming significant performance bottlenecks associated with continuous gesture animations and complex media handling. By architecting the flashcard engine entirely on the UI thread using Reanimated worklets, and by building a resilient video player that handles dynamic subtitle conversion, on-the-fly resolution switching, and intelligent API progress syncing, I ensured the application maintains a premium, native-feeling experience. This project demonstrates my deep understanding of React Native's architecture, thread management, and my capability to deliver highly interactive, production-ready mobile architectures.
