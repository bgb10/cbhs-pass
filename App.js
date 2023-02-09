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

const AUTO_LOGIN_KEY = 'q21'
const PRIVACY_KEY = 'w21'
let id = ''
let pw = ''

const App = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(true)
  // const [id, setId] = useState('')
  // const [pw, setPw] = useState('')
  const [isPrivacyStored, setIsPrivacyStored] = useState(false)

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
    getData(PRIVACY_KEY).then((privacy) => {
      if (privacy === null) {
        setIsPrivacyStored(false)
      } else {
        setIsPrivacyStored(true)
        id = privacy.id
        pw = privacy.pw
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
  })

  const getInjectScript = () => {
    const str = `
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

      if(${isAutoLoginEnabled} && ${isPrivacyStored}) {
        document.getElementById('USER_ID').value = '${id}'
        document.getElementById('EMP_PW').value = '${pw}'
        document.getElementById('SAVE_PW').checked = true
        
        document.getElementById('LoginForm').submit()
      }
    }
    else if(window.location.href.includes('myInfo')) {
      window.ReactNativeWebView.postMessage('save')
    }
  `
    return str
  }

  const messageHandler = (event) => {
    const message = event.nativeEvent.data
    if (message === 'save') {
      // save in DB for auto-login
      storeData(PRIVACY_KEY, JSON.stringify({ id, pw }))

      setIsPrivacyStored(true)
    } else {
      // temporarily save
      const privacy = JSON.parse(message)
      id = privacy.id
      pw = privacy.pw
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        injectedJavaScript={getInjectScript()}
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
