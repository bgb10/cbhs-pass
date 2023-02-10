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

const getLoginScript = (id, pw) => `
document.getElementById('USER_ID').value = '${id}'
document.getElementById('EMP_PW').value = '${pw}'
document.getElementById('SAVE_PW').checked = true
    
document.getElementById('LoginForm').submit()
`

const moveToLoginPageScript = `
window.location.href = 'http://115.92.96.29:8080/employee/login.jsp'
`

export {
  loginDataInterceptor,
  sendMessageOfPageUrl,
  getLoginScript,
  moveToLoginPageScript
}
