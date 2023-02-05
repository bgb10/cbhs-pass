import React, { useRef, useState, useEffect, Component } from 'react'
import { AppState, SafeAreaView, StatusBar } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'

const App = () => {
  const [isLoginSuccess, setIsLoginSuccess] = useState(false)

  const run = `
  // 한 번이라도 로그인을 성공하면 자동 로그인이 되고, 4분 30초마다 로그인이 갱신된다.
  if(window.location.href.includes('myInfo')) {
    window.ReactNativeWebView.postMessage('loginSuccess');

    setTimeout(() => {window.location.href = 'http://115.92.96.29:8080/employee/login.jsp'}, 10000)
  }

  // 로그인을 성공했을 때에만 자동 로그인이 시도된다.
  if(${isLoginSuccess}) {
    document.getElementById('USER_ID').value = '202051'
    document.getElementById('EMP_PW').value = '001028'
    document.getElementById('SAVE_PW').checked = true

    document.getElementById('LoginForm').submit()
  }
  
  true; // note: this is required, or you'll sometimes get silent failures
`

  const handleEvent = (e) => {
    setIsLoginSuccess(true)
  }

  return (
    <View
      style={{
        flex: 1
      }}
    >
      <WebView
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        injectedJavaScript={run}
        onMessage={handleEvent}
      />
    </View>
  )
}

export default App
