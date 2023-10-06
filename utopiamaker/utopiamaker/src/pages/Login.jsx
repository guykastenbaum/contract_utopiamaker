import React, { useState } from 'react'
import SignIn from "../Components/SignIn";
import SignUp from '../Components/SignUp';
import '../public/css/Login.css'

function Login() {
  
    const [isSingIn, setIsSingIn] = useState(false);
  
  return (
    <>
    <div className='page'>
        <div className='login-info-container'>
            <h1>Welcome</h1>
            <h2>Subtitle here</h2>
        </div>
        <div className='login-container f-height'>
            <div className='form-container'>
                <ul className='login-navbar'>
                    <li className={'login-navbar-item'+(isSingIn?'-selected':'')} onClick={(e) => {e.preventDefault(); setIsSingIn(true)}}>Iniciar sesión</li>
                    <li className={'login-navbar-item'+(isSingIn?'':'-selected')} onClick={(e) => {e.preventDefault(); setIsSingIn(false)}}>Registrarse</li>
                </ul>
                {isSingIn? <SignIn/> : <SignUp/>}
            </div>
        </div>
    </div>
    </>
  )
}

export default Login