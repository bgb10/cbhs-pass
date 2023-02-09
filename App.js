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

const KEY = 'isAutoLoginEnabled'

const App = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(false)

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

    storeData(KEY, 'true')
  }

  const disableAutoLogin = () => {
    setIsAutoLoginEnabled(false)

    storeData(KEY, 'false')
  }

  useEffect(() => {
    getData(KEY).then((flag) => {
      if (flag === null) {
        storeData(KEY, 'false')
      } else {
        if (flag === 'true') {
          setIsAutoLoginEnabled(true)

          // 자동 로그인 수행
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

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        injectedJavaScript={run}
        // onMessage={handleEvent}
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
