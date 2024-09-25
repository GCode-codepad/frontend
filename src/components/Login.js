import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    getAdditionalUserInfo,
} from "firebase/auth";
import { auth, provider, signInWithPopup } from "../firebase-config.js";
import { GoogleOutlined } from "@ant-design/icons";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);
    const [error, setError] = useState("");
    const [isConfirm, setIsConfirm] = useState(false);
    const [userName, setUserName] = useState("");
    const [token, setToken] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();
    const currentDate = new Date();
    const subscriptionExpiryDate = new Date(
        currentDate.setDate(currentDate.getDate() + 1),
    ).toISOString();
    auth.languageCode = "it";

    useEffect(() => {}, []);

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setError("");
    };

    const checkPasswordRequirements = (password) => {
        const length = password.length >= 8;
        const upper = /[A-Z]/.test(password);
        const lower = /[a-z]/.test(password);
        const number = /\d/.test(password);
        const special = /[@$!%*?&]/.test(password);
        return { length, upper, lower, number, special };
    };

    const passwordRequirements = checkPasswordRequirements(password);
    const confirmMatched = confirmPassword === password;

    const passwordTooltip = (
        <div>
            <p
                className={
                    passwordRequirements.length ? "text-green-500" : "text-red-500"
                }
            >
                at least 8 characters
            </p>
            <p
                className={
                    passwordRequirements.upper ? "text-green-500" : "text-red-500"
                }
            >
                Uppercase letter
            </p>
            <p
                className={
                    passwordRequirements.lower ? "text-green-500" : "text-red-500"
                }
            >
                Lowercase letter
            </p>
            <p
                className={
                    passwordRequirements.number ? "text-green-500" : "text-red-500"
                }
            >
                Number
            </p>
            <p
                className={
                    passwordRequirements.special ? "text-green-500" : "text-red-500"
                }
            >
                Special character
            </p>
        </div>
    );



    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );
            // Signed in
            const user = userCredential.user;
            console.log("User signed in:", user);
            navigate("/");
        } catch (error) {
            console.error("Error signing in:", error);
            setError(error.message);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );
            const user = userCredential.user;
            console.log("User registered:", user);

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/users`, {
                id: user.uid,
                email: user.email,
                displayName: userName,
                photoURL: 'https://firebasestorage.googleapis.com/v0/b/gcode-45b7f.appspot.com/o/user-circle.1024x1024.png?alt=media&token=080ae93b-626b-4289-a0dd-d4a5b3f2190d',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            navigate("/");
        } catch (error) {
            console.error("Error signing up:", error);
            setError(error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Google user:", user);
            const { isNewUser } = getAdditionalUserInfo(result);
            if (isNewUser) {
                await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/users`, {
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
            // const idToken = await user.getIdToken();
            // setToken(idToken);

            navigate("/");
        } catch (error) {
            console.error("Google loginError:", error.message);
        }
    };



    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-3">

            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden">

                <div className="md:w-1/2 p-4">
                    <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                        alt="Phone"
                        className="object-cover w-full h-full"
                    />
                </div>

                <div className="md:w-1/2 p-8">
                    <div
                        className={`transform transition-transform duration-500 ${
                            isSignUp ? 'translate-x-0 opacity-100' : 'opacity-100'
                        }`}
                    >
                        <div className={`transition-opacity duration-500 ${isSignUp ? 'opacity-100' : 'opacity-0 h-0'}`}>
                            {isSignUp && (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                            Username
                                        </label>
                                        <input
                                            id="username"
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-4 transition-opacity duration-500">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="mb-4 transition-opacity duration-500">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <Tooltip
                                title={passwordTooltip}
                                open={isFocused && isSignUp}
                                color={"#112A46"}
                                placement={"bottom"}
                            >
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Enter your password"
                                    required
                                />
                            </Tooltip>
                        </div>

                        {/* 如果是注册表单，显示确认密码 */}
                        <div className={`transition-opacity duration-500 ${isSignUp ? 'opacity-100' : 'opacity-0 h-0'}`}>
                            {isSignUp && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <Tooltip
                                        title={
                                            <p
                                                className={
                                                    confirmMatched ? "text-green-500" : "text-red-500"
                                                }
                                            >
                                                {confirmMatched
                                                    ? "Password matched"
                                                    : "Password did not match"}
                                            </p>
                                        }
                                        open={confirmFocused}
                                        color={"#112A46"}
                                        placement={"bottom"}
                                    >
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onFocus={() => setConfirmFocused(true)}
                                            onBlur={() => setConfirmFocused(false)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            placeholder="Confirm your password"
                                            required
                                        />
                                    </Tooltip>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <label className="flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"/>
                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                            </label>
                            <a
                                href="#!"
                                className="text-sm text-blue-600 hover:underline"
                                onClick={handleToggle}
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </a>
                        </div>

                        <button onClick={isSignUp? handleSignUp : handleSignIn} className="w-full bg-blue-600 text-white py-2 rounded-lg text-lg mb-4 hover:bg-blue-700 focus:outline-none">
                            {isSignUp ? 'Sign up' : 'Sign in'}
                        </button>

                        <div className={`transition-opacity duration-500 ${isSignUp ? 'opacity-0 scale-0 h-0' : 'opacity-100 scale-100'}`}>
                            {!isSignUp && (
                                <div className="relative text-center my-4">
                                    <span className="bg-white px-2 text-gray-700 font-bold">OR</span>
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                </div>
                            )}

                            {!isSignUp && (
                                <div>
                                    <button onClick={handleGoogleSignIn} className="w-full bg-blue-800 text-white py-2 rounded-lg text-lg flex justify-center items-center mb-4 hover:bg-blue-900 focus:outline-none">
                                        <i className="fab fa-facebook-f mr-2"></i>
                                        Continue with Google
                                    </button>

                                    <button className="w-full bg-blue-400 text-white py-2 rounded-lg text-lg flex justify-center items-center hover:bg-blue-500 focus:outline-none">
                                        <i className="fab fa-twitter mr-2"></i>
                                        Continue with Github
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;