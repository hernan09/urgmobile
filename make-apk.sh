#!/bin/sh
# Generacion de apks firmados
# Basado en http://ionicframework.com/docs/guide/publishing.html
set -e

KEYSTORE_PATH="./urg.jks"
KEY_ALIAS="urg"
APK_NAME="urg-movil.apk"

APK_PATH="./platforms/android/build/outputs/apk/release"
OUT_PATH="."

UNSIGNED_APK="$APK_PATH/android-release-unsigned.apk"
SIGNED_APK="$APK_PATH/android-release-signed.apk"
SIGNED_ALIGNED_APK="$APK_PATH/android-release-signed-aligned.apk"

echo "Building apk..."
#ionic cordova plugin rm cordova-plugin-console
ionic cordova build android --prod --release

echo "Signing apk..."
cp "$UNSIGNED_APK" "$SIGNED_APK"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "$KEYSTORE_PATH" "$SIGNED_APK" "$KEY_ALIAS"

echo "Aligning apk..."
rm -f "$SIGNED_ALIGNED_APK"
#zipalign -v 4 "$SIGNED_APK" "$SIGNED_ALIGNED_APK"
~/Android/Sdk/build-tools/27.0.3/zipalign -v 4 "$SIGNED_APK" "$SIGNED_ALIGNED_APK"

echo "Copying & renaming apk..."
cp "$SIGNED_ALIGNED_APK" "$OUT_PATH/$APK_NAME"

echo "Apk generada con exito en: $OUT_PATH/$APK_NAME"
