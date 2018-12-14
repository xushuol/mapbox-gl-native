#!/usr/bin/env node

const fs = require('fs');
const zlib = require('zlib');
const AWS = require('aws-sdk');

const date = new Date();

// iOS builds
// "build/ios/pkg/dynamic/Mapbox-stripped-armv7"
// "build/ios/pkg/dynamic/Mapbox-stripped-arm64"
// "build/ios/pkg/dynamic/Mapbox-stripped-x86_64"
// "build/ios/pkg/dynamic/Mapbox-stripped"

// Android builds:
// "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/armeabi-v7a/libmapbox-gl.so"
// "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/arm64-v8a/libmapbox-gl.so"
// "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/x86/libmapbox-gl.so"
// "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/x86_64/libmapbox-gl.so"
// "platform/android/MapboxGLAndroidSDK/build/outputs/aar/MapboxGLAndroidSDK-release.aar"

// All binaries being measured
const binaries = [
  ["iOS", "universal", "build/ios/pkg/dynamic/Mapbox-stripped"],
  ["iOS", "armv7", "build/ios/pkg/dynamic/Mapbox-stripped-armv7"],
  ["iOS", "arm64", "build/ios/pkg/dynamic/Mapbox-stripped-arm64"],
  ["iOS", "x86_64", "build/ios/pkg/dynamic/Mapbox-stripped-x86_64"]
  // ["Android", "Android AAR", "platform/android/MapboxGLAndroidSDK/build/outputs/aar/MapboxGLAndroidSDK-release.aar"],
  // ["Android", "armv7", "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/armeabi-v7a/libmapbox-gl.so"],
  // ["Android", "arm64-v8a", "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/arm64-v8a/libmapbox-gl.so"],
  // ["Android", "x86", "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/x86/libmapbox-gl.so"],
  // ["Android", "x86_64", "platform/android/MapboxGLAndroidSDK/build/intermediates/intermediate-jars/release/jni/x86_64/libmapbox-gl.so"]
]

const binaryMetricsPayload = binaries.map(binary => {
  return JSON.stringify({
      'sdk': 'maps',
      'platform' : binary[0],
      'arch': binary[1],
      'size' : fs.statSync(binary[2]).size,
      'commit': `${process.env['CIRCLE_SHA1']}`,
      'created_at': `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
  })
});

var params = {
    Body: binaryMetricsPayload.join('\n'),
    Bucket: 'mapbox-loading-dock',
    Key: `raw/mobile_tmp.binary_size/${process.env['CIRCLE_SHA1']}.json`,
    CacheControl: 'max-age=300',
    ContentEncoding: 'utf8',
    ContentType: 'application/json'
};

return new AWS.S3({region: 'us-east-1'}).putObject(params, function (err, res) {
  if (err) {
    console.log("Error sending publishing metrics: ", err);
  } else {
    console.log("Binary size logged to S3 successfully")
  }
});