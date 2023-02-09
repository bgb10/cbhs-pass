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

const AUTO_LOGIN_KEY = 'isAutoLoginEnabled'
const PRIVACY_KEY = 'privacy'

const App = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(false)
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')

  const getData = async (AUTO_LOGIN_KEY) => {
    try {
      const value = await AsyncStorage.getItem(AUTO_LOGIN_KEY)
      return value // null or value
    } catch (e) {
      // error reading value
    }
  }

  const storeData = async (AUTO_LOGIN_KEY, value) => {
    try {
      await AsyncStorage.setItem(AUTO_LOGIN_KEY, value)
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
  })

  const run = ` 
    if (
      document.getElementById('USER_ID') &&
      document.getElementById('EMP_PW') &&
      document.getElementById('SAVE_PW') &&
      document.getElementById('USER_ID').value &&
      document.getElementById('EMP_PW').value &&
      document.getElementById('SAVE_PW').checked
      ) {
      document.getElementById('LoginForm').submit()
    }

    // 한 번이라도 로그인을 성공하면 자동 로그인이 되고, 4분 30초마다 로그인이 갱신된다.
    if(window.location.href.includes('myInfo')) {
      window.ReactNativeWebView.postMessage('loginSuccess');

      setTimeout(() => {window.location.href = 'http://115.92.96.29:8080/employee/login.jsp'}, 240000)
    }

    // 로그인을 성공했을 때에만 자동 로그인이 시도된다.
    if(${true}) {
      document.getElementById('USER_ID').value = '202051'
      document.getElementById('EMP_PW').value = '001028'
      document.getElementById('SAVE_PW').checked = true

      document.getElementById('LoginForm').submit()
    }
    
    true; // note: this is required, or you'll sometimes get silent failures
`

  const injectScript = `
    true;

    if(window.location.href.includes('login')) {
      document.getElementById('LoginForm').addEventListener('submit', (e) => {
        const form = e.target
        const id = form.querySelector('#USER_ID').value
        const pw = form.querySelector('#EMP_PW').value
        const privacy = {id, pw}
        const serializedPrivacy = JSON.stringify(privacy)
        
        window.ReactNativeWebView.postMessage(serializedPrivacy)
      })
    }
    else if(window.location.href.includes('myInfo')) {
      window.ReactNativeWebView.postMessage('save')
    }
    
  `

  const messageHandler = (event) => {
    const message = event.nativeEvent.data
    if (message === 'save') {
      // save in DB for auto-login
      storeData(PRIVACY_KEY, JSON.stringify({ id, pw }))
    } else {
      // temporarily save
      const privacy = JSON.parse(message)
      setId(privacy.id)
      setPw(privacy.pw)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        injectedJavaScript={injectScript}
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
