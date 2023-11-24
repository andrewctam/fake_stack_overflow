import axios from 'axios';
import { useEffect, useState } from 'react';
import { config } from '../utils';

export default function Welcome(props) {
    const { login } = props;
    const [selected, setSelected] = useState("");
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [error, setError] = useState("")

    useEffect(() => {
        setError("")
        setUsername("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setUsernameError("")
        setEmailError("")
        setPasswordError("")
    }, [selected])

    const loginUser = async (e) => {
        e.preventDefault();
        
        let error = false;
        if (!email) {
            setEmailError("Email field is empty")
            error = true;
        }

        if (!password) {
            setPasswordError("Password field is empty");
            error = true;
        }

        if (error) return;

        const url = `http://localhost:8000/users/login`;
        const body = {
            email, password
        }

        await axios.post(url, body, config)
            .then((res) => {
                console.log(res)

                if (res.status === 200) {
                    login(res?.data);
                } else {
                    setError(res)
                }
            })
            .catch((err) => {
                console.log(err)
                setError(err?.response?.data)
            });
    }

    const registerUser = async (e) => {
        e.preventDefault();

        let error = false;
        if (!email) {
            setEmailError("Email field is empty")
            error = true;
        }
        if (!username) {
            setUsernameError("Username field is empty")
            error = true;
        }

        if (!password) {
            setPasswordError("Password field is empty");
            error = true;
        }
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            error = true;
        }

        if (error) return;

        const url = `http://localhost:8000/users/register`;
        const body = {
            username, email, password
        }

        await axios.post(url, body, config)
            .then((res) => {
                console.log(res)

                if (res.status === 200) {
                    login(username);
                } else {
                    setError(res)
                }

            })
            .catch((err) => {
                console.log(err)
                setError(err?.response?.data)
            });
    }

    return (
        <>
            <h1 className="welcome">
                Welcome to Fake Stack Overflow
            </h1>

            <div className="welcomeOptions">
                <button onClick={() => setSelected("login")}>
                    Log in as Existing User
                </button>

                {selected === "login" && (
                    <form className="accountForm" onSubmit={registerUser}>
                        Login Form
                        <div>
                            <label>Email: </label> 
                            <input value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label className="loginError">{emailError}</label>
                        </div>

                        <div>
                            <label>Password: </label> 
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                            <label className="loginError">{passwordError}</label>
                        </div>

                        <button onClick={loginUser}> Login </button>
                        <label className="loginError">{error}</label>
                    </form>
                )}

                <button onClick={() => setSelected("register")}>
                    Register as new User
                </button>

                {selected === "register" && (
                    <form className="accountForm" onSubmit={registerUser}>
                        Register Form
                        <div>
                            <label>Email: </label> 
                            <input value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label className="loginError">{emailError}</label>
                        </div>
                        <div>
                            <label>Username: </label> 
                            <input value={username} onChange={(e) => setUsername(e.target.value)} />
                            <label className="loginError">{usernameError}</label>
                        </div>

                        <div>
                            <label>Password: </label> 
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                            <label className="loginError">{passwordError}</label>
                        </div>
                        <div>
                            <label>Confirm Password: </label> 
                            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
                        </div>

                        <button onClick={registerUser}> Register </button>
                        <label className="loginError">{error}</label>
                    </form>
                )}

                <button onClick={() => login("")}>
                    Continue as Guest
                </button>
            </div>
        </>
    )
}