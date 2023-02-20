# 충북학사 서서울관 입출입 PASS

<div align="center">
<img src="https://user-images.githubusercontent.com/25452313/220155278-ddaa07f8-444e-4f0d-80e3-a629981c4cc1.jpeg"  width="40%" height="">
<img src="https://user-images.githubusercontent.com/25452313/220155000-9cc7b8e5-819d-4abe-8eba-6a8ff4758450.jpeg"  width="40%" height="">
</div>

<br />

충북학사 서서울관에서 입출입 PASS를 찍을 때마다 페이지 들어가서 로그인 버튼 누르는게 귀찮아서🫢 만든 앱입니다.

```
"충격!!! 불편한 입출입 PASS를 편하게 사용하게 해주는 앱이 있다?!😮"

[중요: "삼성"과 같은 Android 폰만 가능🙆합니다. iOS 정책상 "아이폰"은 설치가 불가능❌합니다.]

안녕하세요! 충북학사에 재사중인 중앙대 소프트웨어학부 학생입니다.
여러분들 혹시 입출입 시스템이 바뀌고 나서 불편을 겪으시지 않았나요?
웹페이지에 직접 들어가서 로그인 버튼을 눌러야 하고, 종종 만료가 되어서 로그인을 다시 해야 하기도 합니다.

저 또한 이 문제를 겪고 있어서, 저희를 편하게 만들어줄 간단한 앱을 만들었습니다!
앱에서 제공하는 기능은 아래와 같습니다.

- 자동 로그인 활성화 / 비활성화
- 아이디 자동 저장
- QR코드 만료 방지를 위해 백그라운드에서 활성화 상태로 될시 QR코드 초기화

[설치시에 뜨는 보안 메시지는 무시하셔도 됩니다! 정보는 모두 핸드폰 내에만 저장됩니다. 소스코드 올려놓았습니다. 😉]

설치 링크 🫱: https://expo.dev/artifacts/eas/2HWTowQSG4NRGevT6fFoS6.apk
홍보 페이지 🤲: https://rounded-reading-870.notion.site/CBHS-ccdb7aa571a942a9b2b25df8ad09625d
설치 방법 문서 📜: https://rounded-reading-870.notion.site/e632f25168264922aa5175aa729e9ced
Github: https://github.com/bgb10/cbhs-pass (충북학사 재사중이신 개발자 분들이라면 ⭐️ 한번씩 부탁드립니다!)
```

# 기술 스택

- React Native, Expo Go, JavaScript

# 기능

- 자동 로그인 활성화 / 비활성화
- 아이디 자동 저장
- QR코드 만료 방지를 위해 백그라운드에서 활성화 상태로 될시 QR코드 초기화
- QR코드가 나오는 화면의 경우 화면 밝기 최대로 변경 (Expo Go 에서는 정상 작동하나, apk 설치 후에는 제대로 작동 안하는 문제 존재)

# 구현

## 로그인 정보 저장

1. `/login` 화면의 경우 `loginDataInterceptor script` 를 `webview` 에 inject 한다.
2. 사용자가 아이디와 비밀번호를 입력한다.
3. form 이 submit 될 경우, inject 된 script 가 실행되면서 react app 에 message 를 보낸다. react app 은 전송된 temporary privacy 를 메모리에 저장한다(non-state variable).
4. 로그인이 성공할 경우, webview 의 화면이 `/login` 에서 `/myInfo` 로 넘어가고, 해당 화면 전환이 일어날 경우 `handleWebViewNavigationStateChange()` 에서 자동 로그인에 사용할 privacy 정보를 갱신한다.
5. privacy 는 state 로, useEffect hook 이 적용되어 있다. 변경이 감지될 경우 내부 저장소에 privacy 를 저장한다.

## 자동 로그인

1. `/login` 화면에서 자동 로그인 기능이 켜져있고 privacy 가 내부 저장소에 저장되어 있을 경우 자동 로그인을 시도한다.
2. 자동 로그인은 내부 저장소에 저장된 privacy 를 가져와서 `getLoginScript()` 함수를 실행해 `auto-login script` 를 webview 에 inject 한다.

- 만약에 자동 로그인이 실패했을 경우 script 를 삽입하지 않는다.

## QR 코드 갱신

1. QR 코드는 5분마다 만료되는 것으로 추측되는데, 5분 동안 QR 코드 화면을 계속 켜놓는 사람은 거의 없을 것이다.
2. 따라서, 앱이 백그라운드 상태(화면이 꺼지거나, 다른 앱으로 이동하거나)에서 다시 활성화 상태로 올 때 재로그인을 하도록 했다.
3. 이 경우 webview 에게 `redirection script` 를 inject 하여 로그인 페이지로 이동하도록 한다.
4. 위의 ‘자동 로그인 원리’ 에 의해 자동 로그인이 작동되고 QR 코드가 갱신된다.
