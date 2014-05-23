pack-pal
========

# Overview

Pack-pal is a NodeJS-based harness that compiles, packages and launches cross-platform mobile apps.
This project attempts to address the following needs in the mobile app. development workflow:
* Build and install apps. from the command line, without a monolithic IDE.
* Simplify some some the arcane configurations involved in mobile app. development.  
* Make the build process easy to automate for continuous integration.
* Easily launch apps. in a simulator for ad-hoc and automated testing.

The initial version of this project supports Adobe Air packaging only. Future versions could support haXe and HTML5.

# Installation 

Git clone this repo and cd into it. Note, this project uses the [nopt](https://github.com/npm/nopt) module to parse arguments. 

````
npm install
chmod u+x /path/to/pack.js
````
Then, you probably want to add something along these lines to your .profile:
````
alias pack='node /path/to/pack.js'
````


# Configuration
Download and install the latest [Adobe Air SDK](http://www.adobe.com/devnet/air/air-sdk-download.html).

Make sure you have the latest version of XCode if you want to run builds in the iOS simulator.

To test your app. on a device, you need to create a .p12 certificate and (for iOS) provisioning profile. Please refer to [Adobe's Documentation](http://help.adobe.com/en_US/as3/iphone/WS144092a96ffef7cc-33e1d8031250a54a821-7fff.html) for instructions.

Now, you should create a .json file for your project as follows:
````
{
    "compiler_args": additional arguments for mxmlc (e.g.: -source-path),
    "ios_certificate_path": path to .p12 certificate file for iOS,
    "android_certificate_path": path to .p12 certificate file for Android,
    "profile_path": path to provisioning profile for iOS,
    "certificate_password": certificate password,
    "build_path": path where build artificats will be written,
    "executable_name": name of the apk or ipa file to be generated,
    "descriptor_path": path to Adobe Air descriptor XML file for this app.,
    "app_id": app ID,
    "ios_sim_path": path to iOS simulator, e.g.: "/./Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator7.1.sdk",
    "air_sdk_path": path to Air SDK
	"ext_dirs": array of paths to ANEs used in project. 
}
````

# Usage


This repo includes an example project that can help you get started.  Note that you will need to set some of the properties in pack.json for the example to build.

To run these commands, cd into the 'example_project' directory.

Basic compilation and launch in Adobe Air simulator (with sample output):
````
node ../pack.js -s
{ launch: 'simulator',
  argv:
   { remain: [],
     cooked: [ '--launch', 'simulator' ],
     original: [ '-s' ] } }
Network IP=10.0.1.4
[exec] echo "COMPILING..."
[out] COMPILING...
[exec] /Users/adampasz/airhome/bin/mxmlc +AIR_HOME=/Users/adampasz/airhome Example.as -output Example.swf -debug=false -omit-trace-statements=true -verbose-stacktraces=false
[out] Loading configuration: /Users/adampasz/airhome/frameworks/flex-config.xml

572 bytes written to /Users/adampasz/post/gh/adampasz/pack-pal/example_project/Example.swf in 1.201 seconds
[exec] echo "PACKAGING"
[out] PACKAGING
[exec] echo "Nothing to package. Target not specified."
[out] Nothing to package. Target not specified.
[exec] echo "LAUNCHING..."
[out] LAUNCHING...
[exec] /Users/adampasz/airhome/bin/adl -profile extendedMobileDevice -screensize '768x1004:768x1024' 'descriptor.xml' root-directory '.' > /dev/null &
````

Build and deploy debug build on iOS Simulator:
````
node ../pack.js -d -i -s

````

Build and deploy debug build on Android device (over USB):
````
node ../pack.js -d -a
````









