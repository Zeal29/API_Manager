import React, { useState } from "react";
import classes from "./TextAPI.module.css";
import { AbhiResponse } from "../utils/apiManager/responces";
import { apiManager } from "../utils/apiManager/ApiManager";
import { AxiosRequestConfig } from "axios";
import { LoadingStates } from "../types/index";
export interface TestAPIProps {
	name: string;
	params?: Record<string, any>;
	queryParams?: Record<string, any>;
	config?: AxiosRequestConfig;
}

const TestAPI: React.FC<TestAPIProps> = (props) => {
	const [response, setResponse] = useState<AbhiResponse<any> | null>(null);
	const [LoadingStates, setLoadingStates] = useState<LoadingStates>("before loading");
	async function apiCall() {
		setLoadingStates("loading");
		const { data } = await apiManager.fetch(props);
		setLoadingStates("done loading");
		setResponse(data);
	}

	return (
		<div className={classes.border}>
			<h2>The name of api is {props.name}</h2>

			<button onClick={apiCall}>Call the API</button>

			<div className={classes.codeContainer}>
				{LoadingStates === "before loading" ? (
					<div>Load component</div>
				) : LoadingStates === "loading" ? (
					<div>Loading....</div>
				) : LoadingStates === "done loading" ? (
					<pre>{JSON.stringify(response, null, 2)}</pre>
				) : (
					"There is some problem"
				)}
			</div>
		</div>
	);
};

export default TestAPI;
