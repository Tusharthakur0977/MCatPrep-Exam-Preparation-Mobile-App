# React Native Production Build Guide (Using Existing Keystore)

---

## Android Setup

### 1. Use Existing Keystore File

> copy your existing keystore file to: (you can change the name to whatever it is already make sure to use the same name in android/gradle.properties file as well)

    android/app/my-upload-key.keystore

---

### 2. Add in gradle.properties

File location:

    android/gradle.properties

Add the following:

    MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
    MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
    MYAPP_UPLOAD_STORE_PASSWORD=yourpassword
    MYAPP_UPLOAD_KEY_PASSWORD=yourpassword

---

### 3. Update android/app/build.gradle

Make sure `signingConfigs` is properly configured:

```gradle
signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
```

In `buildTypes`:

```gradle
release {
    signingConfig signingConfigs.release
}
```

---

### 4. Generate Release APK

    cd android
    ./gradlew assembleRelease

---

### 5. Generate Release AAB (For Play Store)

    ./gradlew bundleRelease

---

### 6. Output Paths

**APK:**

    android/app/build/outputs/apk/release/

**AAB:**

    android/app/build/outputs/bundle/release/

---

## iOS Setup

### 1. Open Project in Xcode

    cd ios
    open YourApp.xcworkspace

---

### 2. Select ALL Scheme

Select **All** from the Xcode top bar.

---

### 3. Select Device

Choose:

    Generic iOS Device

---

### 4. Archive App

    Product > Archive

---

### 5. Open Organizer

After the archive is completed, Organizer will open automatically.

---

### 6. Distribute App

Click:

    Distribute App

---

### 7. Upload to App Store Connect

Follow the steps to upload your build.

---

## Clean Build

### Android

    cd android
    ./gradlew clean

### iOS

    cd ios
    xcodebuild clean

---

## Metro Reset

    npx react-native start --reset-cache

---

## Install Pods (iOS)

    cd ios
    pod install

---

## Important Notes

- Always use the same keystore for production builds.
- Keep a secure backup of your keystore file.
- Losing the keystore will prevent future Play Store updates.
