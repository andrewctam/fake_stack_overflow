import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Welcome(props) {
    const { login } = props;
    const [selected, setSelected] = useState("");
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [error, setError] = useState("")

    useEffect(() => {
        setError("")
        setUsername("")
        setEmail("")
        setPassword("")
        setUsernameError("")
        setEmailError("")
        setPasswordError("")
    }, [selected])

    const loginUser = async () => {
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

        await axios.post(url, body)
            .then((res) => {
                console.log(res)

                if (res.status === 200) {
                    login(res.username);
                } else {
                    setError(res)
                }

            })
            .catch((err) => {
                console.log(err)
                setError(err?.response?.data)
            });
    }

    const registerUser = async () => {
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

        if (error) return;

        const url = `http://localhost:8000/users/register`;
        const body = {
            username, email, password
        }

        await axios.post(url, body)
            .then((res) => {
                console.log(res)

                if (res.status === 200) {
                    login(res.username);
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
                    <div className="accountForm">
                        <div>
                            <label>Email:</label> 
                            <input value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label className="loginError">{emailError}</label>
                        </div>

                        <div>
                            <label>Password:</label> 
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                            <label className="loginError">{passwordError}</label>
                        </div>

                        <button onClick={loginUser}> Login </button>
                        <label className="loginError">{error}</label>
                    </div>
                )}

                <button onClick={() => setSelected("register")}>
                    Register as new User
                </button>

                {selected === "register" && (
                    <div className="accountForm">
                        <div>
                            <label>Email:</label> 
                            <input value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label className="loginError">{emailError}</label>
                        </div>
                        <div>
                            <label>Username:</label> 
                            <input value={username} onChange={(e) => setUsername(e.target.value)} />
                            <label className="loginError">{usernameError}</label>
                        </div>

                        <div>
                            <label>Password:</label> 
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                            <label className="loginError">{passwordError}</label>
                        </div>

                        <button onClick={registerUser}> Register </button>
                        <label className="loginError">{error}</label>
                    </div>
                )}

                <button>
                    Continue as Guest
                </button>
            </div>
        </>
    )
}