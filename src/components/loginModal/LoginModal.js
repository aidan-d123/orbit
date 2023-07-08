// styles & images
import "./LoginModal.css"
import { useState } from "react"
import { useLogin } from "../../hooks/firebase/useLogin"
import { useSignup } from "../../hooks/firebase/useSignup"
import { useForgotPassword } from "../../hooks/firebase/useForgotPassword"

export default function LoginModal(props) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [signingUp, setSigningUp] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null)
    const { signup, signupError, isSignupPending } = useSignup()
    const { login, loginError, isLoginPending } = useLogin()
    const { forgotPassword, isForgotPasswordPending, forgotPasswordError } = useForgotPassword()
    const { setShowModal } = props

    const handleLogin = e => {
        e.preventDefault()
        login(loginEmail, loginPassword)
        setLoginEmail("")
        setLoginPassword("")
    }

    const handleSignup = e => {
        e.preventDefault()
        signup(email, password, displayName)
        setEmail("")
        setPassword("")
        setDisplayName("")
    }

    const handleForgotPassword = e => {
        e.preventDefault()
        forgotPassword(forgotPasswordEmail)
        setForgotPasswordMessage(`Password reset link has been emailed to ${forgotPasswordEmail}`)
    }

    return (
        <div className="modal-backdrop" onMouseDown={e => {
            if (e.target !== e.currentTarget) {
                return;
            } else {
                setShowModal(false);
            }
        }}>
            <div className="center" >
                {!signingUp && !isForgotPassword && (
                    <form onSubmit={handleLogin}>
                        <h1>Login</h1>
                        <div className="txt_field">
                            <input
                                required
                                type="email"
                                value={loginEmail}
                                onChange={e => { setLoginEmail(e.target.value) }} />
                            <span></span>
                            <label>Email</label>
                        </div>
                        <div className="txt_field">
                            <input
                                required
                                type="password"
                                value={loginPassword}
                                onChange={e => { setLoginPassword(e.target.value) }} />
                            <span></span>
                            <label>Password</label>
                        </div>
                        <div className="pass" onClick={() => { setIsForgotPassword(true) }}>Forgot Password?</div>
                        <input className="submit" type="submit" value="Login" />
                        <div className="signup_link">
                            Don't have an account? <a href="#" onClick={() => setSigningUp(true)}>Signup</a>
                        </div>
                    </form>)}

                {signingUp && !isForgotPassword && (
                    <form onSubmit={handleSignup} >
                        <h1>Sign Up</h1>
                        <div className="txt_field">
                            <input
                                required
                                type="text"
                                value={displayName}
                                onChange={e => { setDisplayName(e.target.value) }} />
                            <span></span>
                            <label>First Name</label>
                        </div>
                        <div className="txt_field">
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value) }} />
                            <span></span>
                            <label>Email</label>
                        </div>
                        <div className="txt_field">
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value) }} />
                            <span></span>
                            <label>Password</label>
                        </div>
                        <div className="pass" onClick={() => { setIsForgotPassword(true) }}>Forgot Password?</div>
                        <input className="submit" type="submit" value="Sign up" />
                        <div className="signup_link">
                            Already have an account? <a href="#" onClick={() => setSigningUp(false)}>Login</a>
                        </div>
                    </form>
                )}

                {isForgotPassword && (
                    <form onSubmit={handleForgotPassword}>
                        <h1>Forgot Password</h1>
                        <div className="txt_field">
                            <input
                                required
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={e => { setForgotPasswordEmail(e.target.value) }} />
                            <span></span>
                            <label>Email</label>
                        </div>
                        <input className="submit" type="submit" value="Submit" />
                        <div className="signup_link">
                            Already have an account? <a href="#" onClick={() => {
                                setSigningUp(false)
                                setIsForgotPassword(false)
                                setForgotPasswordMessage(null)
                            }}>Login</a>
                        </div>
                    </form>
                )}
                {loginError && <p className="error form-error">{loginError}</p>}
                {signupError && <p className="error form-error">{signupError}</p>}
                {forgotPasswordError && <p className="error form-error">{forgotPasswordError}</p>}
                {forgotPasswordMessage && isForgotPassword && <p className="success form-error">{forgotPasswordMessage}</p>}
            </div>
        </div >
    )
}