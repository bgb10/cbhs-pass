import React, { useRef, useState, useEffect, Component } from 'react'
import { AppState, SafeAreaView, StatusBar } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'

const firstRun = `
  document.getElementById('USER_ID').value = '202051'
  document.getElementById('EMP_PW').value = '001028'
  document.getElementById('SAVE_PW').checked = true
  document.getElementById('LoginForm').submit()
`

const run = `
if(window.location.href.includes('myInfo')) {
  window.location.href = 'http://115.92.96.29:8080/employee/login.jsp'
}

  ${firstRun}
  
  true; // note: this is required, or you'll sometimes get silent failures
`

class App extends Component {
  render() {
    setInterval(() => {
      this.webref.injectJavaScript(run)
    }, 45000)

    return (
      <View
        style={{
          flex: 1
        }}
      >
        <WebView
          originWhitelist={['*']}
          source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
          ref={(r) => (this.webref = r)}
          injectedJavaScript={firstRun}
        />
      </View>
    )
  }
}

export default App
