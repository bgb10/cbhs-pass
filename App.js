import React, { useRef, useState, useEffect } from 'react'
import { AppState, TouchableOpacity } from 'react-native'
import { Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  loginDataInterceptor,
  sendMessageOfPageUrl,
  getLoginScript,
  moveToLoginPageScript
} from './webViewInjectableScripts.js'

const AUTO_LOGIN_KEY = 'qqq12'
const PRIVACY_KEY = 'www12'
let isPrivacyStored = false

const App = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(true)
  const [tempId, setTempId] = useState('')
  const [tempPw, setTempPw] = useState('')
  const [currentPage, setCurrentPage] = useState('login')
  const webViewRef = useRef()
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const movedToLoginPage = () => {
    if (currentPage === 'login') {
      isPrivacyStored = false
    }

    setCurrentPage('login')
  }

  const movedToMyInfoPage = () => {
    setCurrentPage('myInfo')
  }

  const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value // null or value
    } catch (e) {
      // error reading value
    }
  }

  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      // saving error
    }
  }

  const enableAutoLogin = () => {
    setIsAutoLoginEnabled(true)

    storeData(AUTO_LOGIN_KEY, 'true')
  }

  const disableAutoLogin = () => {
    setIsAutoLoginEnabled(false)

    storeData(AUTO_LOGIN_KEY, 'false')
  }

  useEffect(() => {
    console.log('when this call?')

    if (currentPage === 'login') {
      isPrivacyStored = false
    }

    getData(PRIVACY_KEY).then((privacy) => {
      if (privacy === null) {
        isPrivacyStored = false
      } else {
        isPrivacyStored = true
      }
    })

    getData(AUTO_LOGIN_KEY).then((flag) => {
      if (flag === null) {
        storeData(AUTO_LOGIN_KEY, 'false')
      } else {
        if (flag === 'true') {
          setIsAutoLoginEnabled(true)

          // TODO: 자동 로그인 수행
        } else {
          // do nothing
        }
      }
    })

    // movedToLoginPage() 왜 여기에 이거 넣으면 promise 가 너무 많이 호출되었다고 하지 501?

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!')
        webViewRef.current.injectJavaScript(moveToLoginPageScript)
      }

      appState.current = nextAppState
      setAppStateVisible(appState.current)
      console.log('AppState', appState.current)
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const messageHandler = (event) => {
    const serializedMessage = event.nativeEvent.data
    const message = JSON.parse(serializedMessage)

    console.log(message)

    if (message.type === 'page') {
      if (message.data === 'login') {
        movedToLoginPage()

        webViewRef.current.injectJavaScript(loginDataInterceptor)

        console.log(isAutoLoginEnabled)
        console.log(isPrivacyStored)
        if (isAutoLoginEnabled && isPrivacyStored) {
          console.log('여기 안들어가나?')

          getData(PRIVACY_KEY).then((serializedPrivacy) => {
            const privacy = JSON.parse(serializedPrivacy)

            webViewRef.current.injectJavaScript(
              getLoginScript(privacy.id, privacy.pw)
            )
          })
        }
      } else if (message.data === 'myInfo') {
        movedToMyInfoPage()
        console.log('message info page')
        // tempId, tempPw 영구 저장
        storeData(PRIVACY_KEY, JSON.stringify({ id: tempId, pw: tempPw })).then(
          () => {
            isPrivacyStored = true
          }
        )
      }
    } else if (message.type === 'privacy') {
      setTempId(message.data.id)
      setTempPw(message.data.pw)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        injectedJavaScript={sendMessageOfPageUrl}
        ref={webViewRef}
        onMessage={messageHandler}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          alignSelf: 'center',
          backgroundColor: isAutoLoginEnabled ? '#4cbb17' : 'gray',
          width: 80,
          height: 35,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3.5
        }}
        onPress={() =>
          isAutoLoginEnabled ? disableAutoLogin() : enableAutoLogin()
        }
      >
        <Text style={{ color: 'white' }}>자동 로그인</Text>
      </TouchableOpacity>
    </View>
  )
}

export default App
