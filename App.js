import React, { useRef, useState, useEffect, Component } from 'react'
import {
  Alert,
  AppState,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Button,
  Touchable,
  TouchableOpacity
} from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AUTO_LOGIN_KEY = 'qqq11'
const PRIVACY_KEY = 'www11'

const App = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(true)
  const [tempId, setTempId] = useState('')
  const [tempPw, setTempPw] = useState('')
  const [isPrivacyStored, setIsPrivacyStored] = useState(false)
  const [currentPage, setCurrentPage] = useState('login')
  const webViewRef = useRef()

  const movedToLoginPage = () => {
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
      console.log('흠 페이지가 제대로 안잡히나?')
      setIsPrivacyStored(false)
    }

    getData(PRIVACY_KEY).then((privacy) => {
      if (privacy === null) {
        setIsPrivacyStored(false)
      } else {
        setIsPrivacyStored(true)
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
  })

  const getLoginScript = (id, pw) => `
    document.getElementById('USER_ID').value = '${id}'
    document.getElementById('EMP_PW').value = '${pw}'
    document.getElementById('SAVE_PW').checked = true
        
    document.getElementById('LoginForm').submit()
  `

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
            console.log(serializedPrivacy)
            const privacy = JSON.parse(serializedPrivacy)

            console.log(privacy)

            const a = privacy.id
            const b = privacy.pw
            console.log(a)
            console.log(b)

            const script = getLoginScript(a, b)
            console.log(script)

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
            setIsPrivacyStored(true)
          }
        )
      }
    } else if (message.type === 'privacy') {
      setTempId(message.data.id)
      setTempPw(message.data.pw)
    }
  }

  const loginDataInterceptor = `
    document.getElementById('LoginForm').addEventListener('submit', (e) => {
      const form = e.target
      const id = form.querySelector('#USER_ID').value
      const pw = form.querySelector('#EMP_PW').value
      const privacy = {id, pw}
      const message = {type: "privacy", data: privacy}
      const serializedMessage = JSON.stringify(message)
      
      window.ReactNativeWebView.postMessage(serializedMessage)
    })
  `

  // TODO: regex 로 추출하기 (*.jsp 부분)
  const sendMessageOfPageUrl = `
    true;
    const data = window.location.href.split('/')[4].slice(0, -4)
    const message = {type:"page", data: data}
    const serializedMessage = JSON.stringify(message)
    window.ReactNativeWebView.postMessage(serializedMessage)
  `

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
