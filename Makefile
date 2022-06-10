PROJECT_NAME := knewnnew

setup:
	(yarn)
	(cd ios && pod deintegrate || true && pod install)

clean:
	(rm -rf android/build && rm -rf ios/build)
	(cd android && ./gradlew clean)
	(cd ios && xcodebuild clean -workspace ${PROJECT_NAME}.xcworkspace -scheme ${PROJECT_NAME})

build-android:
	(cd android && ./gradlew build -x lint)

build-ios: setup
	(cd ios && xcodebuild build -workspace ${PROJECT_NAME}.xcworkspace -scheme ${PROJECT_NAME})

run-tests:
	npx jest --testPathIgnorePatterns node_modules/ --runInBand

run-tests-locally: setup
	npx jest --testPathIgnorePatternsnode_modules/

# fetches the latest iOS & Android SDK and put them in the project
update-libs:
	rm -rf acp-sdks # clean if needed
	git clone https://github.com/Adobe-Marketing-Cloud/acp-sdks
	cp -a acp-sdks/iOS/${PROJECT_NAME}/ ios/libs/ # copy iOS lib
	sh update-android-sdk.sh
	rm -rf acp-sdks