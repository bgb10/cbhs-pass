import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'

export default function App() {
  const runFirst = `
      document.getElementById('USER_ID').value = '202051'
      document.getElementById('EMP_PW').value = '001028'
      document.getElementById('SAVE_PW').checked = true
      document.getElementById('LoginForm').submit()
      true; // note: this is required, or you'll sometimes get silent failures
    `

  return (
    <View
      style={{
        flex: 1
      }}
    >
      <WebView
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        onMessage={(event) => {}}
        injectedJavaScript={runFirst}
      />
    </View>
  )
}
