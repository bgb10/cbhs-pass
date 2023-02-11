const loginDataInterceptor = `
document.getElementById('LoginForm').addEventListener('submit', (e) => {
  const form = e.target
  const id = form.querySelector('#USER_ID').value
  const pw = form.querySelector('#EMP_PW').value
  const privacy = {id, pw}
  const serializedMessage = JSON.stringify(privacy)
  
  window.ReactNativeWebView.postMessage(serializedMessage)
})
`

const getLoginScript = (id, pw) => `
true;
document.getElementById('USER_ID').value = '${id}'
document.getElementById('EMP_PW').value = '${pw}'
document.getElementById('SAVE_PW').checked = true
  
document.getElementById('LoginForm').submit()
`
export { loginDataInterceptor, getLoginScript }
