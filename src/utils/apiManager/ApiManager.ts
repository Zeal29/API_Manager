import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AbhiResponse, LoginRes, SystemConfigRes } from "./responces";
import { APIList, ServiceConfigJson, Initiator, ServiceConfigurations } from "./types";

export interface FetchParams<Params extends Record<string, any>, queryParams extends Record<string, any>> {
	name: string;
	params?: Params;
	queryParams?: queryParams;
	config?: AxiosRequestConfig;
	pathVariables?: Record<string, string>;
}

export interface ApiManagerOptions {
	readonly tokenSetter: (value: string) => Promise<void>;
	readonly tokenGetter: () => Promise<string>;
}

export type RequestInterceptor = (value: AxiosRequestConfig) => AxiosRequestConfig;
export type ResponseInterceptor = (value: AxiosResponse) => AxiosResponse;

export class ApiManage {
	private apiBank: APIList | null = null;

	systemConfig: ServiceConfigurations | null = null;

	private lastLogin: Date | null = null;

	axiosInstance = axios.create({});

	private readonly requestInterceptors: RequestInterceptor[] = [];
	private readonly responseInterceptors: ResponseInterceptor[] = [];
	private readonly onLoginListeners: (() => void)[] = [];

	get isTokenExpired() {
		const TwentyFourHoursTicks = 24 * 60 * 60 * 1000;

		if (this.lastLogin == null) return true;

		const expireDate = this.lastLogin.getTime() + TwentyFourHoursTicks;

		return expireDate < new Date().getTime();
	}
	get isLoggedIn() {
		return Boolean(this.apiBank) && Boolean(this.systemConfig);
	}

	onLogin(listeners: () => void) {
		this.onLoginListeners.push(listeners);
	}

	constructor(public IndexUrl: string, public initiator: Initiator, private options: ApiManagerOptions) {
		this.axiosInstance.interceptors.request.use(this.requestInterceptor);
		this.axiosInstance.interceptors.response.use(this.responseInterceptor);
	}

	public addRequestInterceptor = (requestInterceptor: RequestInterceptor) => this.requestInterceptors.push(requestInterceptor);
	public addResponseInterceptor = (responseInterceptor: ResponseInterceptor) => this.responseInterceptors.push(responseInterceptor);

	public removeRequestInterceptor = (Interceptor: RequestInterceptor) => {
		let idx = this.requestInterceptors.indexOf(Interceptor);
		if (idx === -1) return false;

		this.requestInterceptors.splice(idx, 1);
		return true;
	};

	public removeResponseInterceptor = (Interceptor: ResponseInterceptor) => {
		let idx = this.responseInterceptors.indexOf(Interceptor);
		if (idx === -1) return false;

		this.responseInterceptors.splice(idx, 1);
		return true;
	};

	private requestInterceptor = async (value: AxiosRequestConfig) => {
		value.headers["Authorization"] = `Bearer ${await this.options.tokenGetter()}`;
		this.requestInterceptors.reduce((acc, Interceptor) => Interceptor(acc), value);

		return value;
	};
	private responseInterceptor = (value: AxiosResponse) => {
		this.responseInterceptors.reduce((acc, Interceptor) => Interceptor(acc), value);

		return value;
	};

	login = async (userName: string, password: string) => {
		const res = await this.axiosInstance.post<AbhiResponse<LoginRes>>(`${this.IndexUrl}/auth/login`, {
			username: userName,
			password,
		});

		await this.options.tokenSetter(res.data.data.token);

		const {
			data: {
				data: { result },
			},
		} = await this.axiosInstance.get<AbhiResponse<SystemConfigRes>>(`${this.IndexUrl}/system/settings/${this.initiator}`);

		this.systemConfig = result;

		this.apiBank = { ...this.systemConfig.jsonConfig.apis.private, ...this.systemConfig.jsonConfig.apis.public };

		this.lastLogin = new Date();
		this.onLoginListeners.forEach((listener) => listener());

		return res;
	};

	async fetch<
		Response extends object,
		Params extends Record<string, any> = Record<string, any>,
		queryParams extends Record<string, any> = Record<string, any>,
	>({ name, config, params, queryParams, pathVariables }: FetchParams<Params, queryParams>): Promise<AxiosResponse<AbhiResponse<Response>>> {
		if (!this.isLoggedIn) {
			throw new Error("Please Log in first before using any api.");
		}

		if (this.isTokenExpired) {
			throw new Error("You token is expired please login again.");
		}

		const apiInfo = this.apiBank?.[name];

		if (apiInfo == null) {
			throw new Error(`unable to find "${name}" named end point.`);
		}

		let url = apiInfo.path;

		for (const [param, value] of Object.entries(pathVariables ?? {})) {
			url = url.replace(new RegExp(`{${param}}`), value);
		}

		const queryParamsEntries = Object.entries(queryParams ?? {});

		if (queryParamsEntries.length > 0) {
			url += "?";
			for (const [param, value] of queryParamsEntries) {
				url += `${param}=${value}&`;
			}
		}

		return await this.axiosInstance.request<AbhiResponse<Response>>({
			url: url,
			params: params,
			method: apiInfo.method,
			...config,
		});
	}
}

/////////////// User File

const TOKEN_ID = "@@API_MANAGER:USER_API_TOKEN@@";

const tokenSetter = async (token: string) => localStorage.setItem(TOKEN_ID, token);
const tokenGetter = async () => {
	const token = localStorage.getItem(TOKEN_ID);

	return token ?? "";
};

export const apiManager = new ApiManage("https://api-dev.abhi.com.pk", "admin_web", {
	tokenSetter: tokenSetter,
	tokenGetter: tokenGetter,
});
