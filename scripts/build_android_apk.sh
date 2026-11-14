#!/usr/bin/env bash
set -e

echo "=== Building Official Campus Drivers Android APK (v1.0.0) ==="

SDK_ROOT="/Users/aabhiraj/Library/Android/sdk"
BUILD_TOOLS="$SDK_ROOT/build-tools/34.0.0"
PLATFORM="$SDK_ROOT/platforms/android-34/android.jar"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$BUILD_TOOLS:$PATH"

WORKDIR="$(pwd)/android-builder"
mkdir -p "$WORKDIR/build/compiled_res"
mkdir -p "$WORKDIR/build/gen"
mkdir -p "$WORKDIR/build/classes"
mkdir -p "$WORKDIR/build/apk"

# 1. Compile resources
echo "1. Compiling Android Resources with AAPT2..."
"$BUILD_TOOLS/aapt2" compile --dir "$WORKDIR/res" -o "$WORKDIR/build/compiled_res.zip"

# 2. Link resources and generate R.java
echo "2. Linking resources and generating binary AndroidManifest.xml..."
"$BUILD_TOOLS/aapt2" link -I "$PLATFORM" \
  "$WORKDIR/build/compiled_res.zip" \
  --manifest "$WORKDIR/AndroidManifest.xml" \
  -o "$WORKDIR/build/unaligned.apk" \
  --java "$WORKDIR/build/gen" \
  --auto-add-overlay

# 3. Compile Java sources
echo "3. Compiling Java classes with javac..."
"$JAVA_HOME/bin/javac" -source 8 -target 8 \
  -bootclasspath "$PLATFORM" \
  -d "$WORKDIR/build/classes" \
  "$WORKDIR/build/gen/com/campusdrivers/cuup/R.java" \
  "$WORKDIR/src/com/campusdrivers/cuup/MainActivity.java"

# 4. Convert classes to DEX bytecode
echo "4. Converting Java bytecode to Dalvik Executable (classes.dex) with D8..."
"$BUILD_TOOLS/d8" --min-api 24 \
  --output "$WORKDIR/build/apk" \
  "$WORKDIR/build/classes/com/campusdrivers/cuup/"*.class

# 5. Add classes.dex and assets into APK
echo "5. Packaging classes.dex and assets into APK..."
cd "$WORKDIR/build/apk"
zip -u "../unaligned.apk" classes.dex
cd "$WORKDIR"
zip -u -r "build/unaligned.apk" assets
cd ..

# 6. Align APK
echo "6. Aligning APK with zipalign..."
"$BUILD_TOOLS/zipalign" -v -p -f 4 "$WORKDIR/build/unaligned.apk" "$WORKDIR/build/aligned.apk"

# 7. Generate Keystore if needed
if [ ! -f "$WORKDIR/release.keystore" ]; then
  echo "7. Generating official release keystore..."
  "$JAVA_HOME/bin/keytool" -genkey -v \
    -keystore "$WORKDIR/release.keystore" \
    -alias campusdrivers \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass campusdrivers123 -keypass campusdrivers123 \
    -dname "CN=Campus Drivers, OU=CUUP, O=Chandigarh University, L=Lucknow, ST=Uttar Pradesh, C=IN"
fi

# 8. Sign APK with apksigner (v1 + v2 + v3 signatures)
echo "8. Signing APK with apksigner (enforcing V1 JAR + V2 + V3 signatures for all Android phones)..."
"$BUILD_TOOLS/apksigner" sign \
  --ks "$WORKDIR/release.keystore" \
  --ks-pass pass:campusdrivers123 \
  --ks-key-alias campusdrivers \
  --key-pass pass:campusdrivers123 \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$WORKDIR/CampusDrivers_v1.0.0.apk" \
  "$WORKDIR/build/aligned.apk"

# 9. Verify APK signature
echo "9. Verifying APK signature..."
"$BUILD_TOOLS/apksigner" verify --verbose "$WORKDIR/CampusDrivers_v1.0.0.apk"

# 10. Copy APK to downloads directories
echo "10. Copying verified APK to public downloads..."
mkdir -p admin-web/public/downloads
mkdir -p admin-web/dist/downloads
mkdir -p backend/public/downloads

cp "$WORKDIR/CampusDrivers_v1.0.0.apk" admin-web/public/downloads/CampusDrivers_v1.0.0.apk
cp "$WORKDIR/CampusDrivers_v1.0.0.apk" admin-web/public/downloads/CampusDrivers_v1.0.1.apk
cp "$WORKDIR/CampusDrivers_v1.0.0.apk" admin-web/dist/downloads/CampusDrivers_v1.0.0.apk
cp "$WORKDIR/CampusDrivers_v1.0.0.apk" admin-web/dist/downloads/CampusDrivers_v1.0.1.apk
cp "$WORKDIR/CampusDrivers_v1.0.0.apk" backend/public/downloads/CampusDrivers_v1.0.0.apk
cp "$WORKDIR/CampusDrivers_v1.0.0.apk" backend/public/downloads/CampusDrivers_v1.0.1.apk

# Clean intermediate compiler artifacts to save disk space
echo "11. Cleaning intermediate build cache..."
rm -rf "$WORKDIR/build"

echo "=== APK Build Succeeded! ==="
ls -lh "$WORKDIR/CampusDrivers_v1.0.0.apk"

