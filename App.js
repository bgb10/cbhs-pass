import React, { useRef, useState, useEffect } from 'react'
import { AppState, TouchableOpacity } from 'react-native'
import { Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  loginDataInterceptor,
  getLoginScript
} from './webViewInjectableScripts.js'

const AUTO_LOGIN_FLAG_KEY = 'qqq28'
const PRIVACY_KEY = 'www28'

let tId = ''
let tPw = ''

const App = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(true)
  const [isPrivacyStored, setIsPrivacyStored] = useState(false)
  const [privacy, setPrivacy] = useState(null)
  const [currentPage, setCurrentPage] = useState('init')
  const webViewRef = useRef()
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  // only runs at whenComponentMounted!
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PRIVACY_KEY),
      AsyncStorage.getItem(AUTO_LOGIN_FLAG_KEY)
    ]).then((res) => {
      const [savedSerializedPrivacy, savedSerializedIsAutoLoginEnabled] = res

      if (savedSerializedPrivacy === null) {
        setIsPrivacyStored(false)
      } else {
        setIsPrivacyStored(true)

        const savedParsedPrivacy = JSON.parse(savedSerializedPrivacy)
        setPrivacy(savedParsedPrivacy)
        tId = savedParsedPrivacy.id
        tPw = savedParsedPrivacy.pw
      }

      if (savedSerializedIsAutoLoginEnabled === 'false') {
        setIsAutoLoginEnabled(false)
      } else {
        setIsAutoLoginEnabled(true)
      }
    })
  }, [])

  useEffect(() => {
    AsyncStorage.setItem(
      AUTO_LOGIN_FLAG_KEY,
      JSON.stringify(isAutoLoginEnabled)
    )
  }, [isAutoLoginEnabled])

  useEffect(() => {
    if (privacy !== null) {
      AsyncStorage.setItem(PRIVACY_KEY, JSON.stringify(privacy))

      setIsPrivacyStored(true)
    }
  }, [privacy])

  const messageHandler = (event) => {
    const serializedMessage = event.nativeEvent.data
    const message = JSON.parse(serializedMessage)

    tId = message.id
    tPw = message.pw
    // TODO: 이 부분 어떻게 개선할지 생각
  }

  const handleWebViewNavigationStateChange = (newNavState) => {
    // newNavState looks something like this:
    // {
    //   url?: string;
    //   title?: string;
    //   loading?: boolean;
    //   canGoBack?: boolean;
    //   canGoForward?: boolean;
    // }
    const { url, loading } = newNavState
    if (!url || loading) return

    const currentPage = url.split('/')[4].slice(0, -4) // TODO: regex

    setCurrentPage((prevPage) => {
      if (prevPage === 'login' && currentPage === 'myInfo') {
        // TODO: id, pw 갱신
        // but, message 를 받지 못한 상태에서 갱신을 하면 문제가 생길텐데 어떻게 하지?
        // message 를 받는 것과, page 변경 event 를 받는 것 모두 언제 일어났는지 모른다.
        // 둘다 일어났을 때 비로소 데이터를 갱신할 수 있다.
        // message 를 waiting 하면서 message 가 오면 그때 저장하는거 어때? privacy 를 갱신하는거지.
        setPrivacy({ id: tId, pw: tPw })
      } else if (
        (prevPage === 'init' || prevPage === 'myInfo') &&
        currentPage === 'login'
      ) {
        webViewRef.current.injectJavaScript(loginDataInterceptor)

        if (isAutoLoginEnabled && isPrivacyStored) {
          webViewRef.current.injectJavaScript(
            getLoginScript(privacy.id, privacy.pw)
          )
        }
      } else if (prevPage === 'login' && currentPage === 'login') {
        // setIsAutoLoginEnabled(false)
        webViewRef.current.injectJavaScript(loginDataInterceptor)
      }

      return currentPage
    })

    // messageHandler 가 여러가지 일들을 처리했었는데, 이제 페이지 이동 등은 별도의 handler 가 처리하기.  공식 문서는 킹이야...
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ uri: 'http://115.92.96.29:8080/employee/login.jsp' }}
        ref={webViewRef}
        onMessage={messageHandler}
        onNavigationStateChange={handleWebViewNavigationStateChange}
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
        onPress={() => setIsAutoLoginEnabled(!isAutoLoginEnabled)}
      >
        <Text style={{ color: 'white' }}>자동 로그인</Text>
      </TouchableOpacity>
    </View>
  )
}

export default App
