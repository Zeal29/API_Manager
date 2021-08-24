import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import TestAPI from "./components/TestAPI";
import { apiManager, ResponseInterceptor, RequestInterceptor } from "./utils/apiManager/ApiManager";

type AppState = "Login done" | "doing Login" | "not Login";

function App() {
	const [appState, setAppState] = useState<AppState>("not Login");

	useEffect(() => {
		apiManager.onLogin(() => setAppState("Login done"));

		const res: ResponseInterceptor = (value) => {
			console.log("there is a response:", apiManager);
			return value;
		};

		const req: RequestInterceptor = (value) => {
			console.log("there is a request:", apiManager);
			return value;
		};

		apiManager.addResponseInterceptor(res);
		apiManager.addRequestInterceptor(req);

		// apiManager.removeResponseInterceptor(res);
		// apiManager.removeRequestInterceptor(req);
	}, []);

	function login() {
		setAppState("doing Login");
		apiManager.login("anawaz@abhi.com", "1122");
	}

	return (
		<div className="App">
			<button onClick={login}>LOGIN</button>
			{appState === "not Login" ? (
				<div>Please Login First</div>
			) : appState === "doing Login" ? (
				<div>Loading... login in progress....</div>
			) : appState === "Login done" ? (
				<TestAPI name={"Get Available Balance"} />
			) : (
				"There is some problem please refresh"
			)}
		</div>
	);
}

export default App;
