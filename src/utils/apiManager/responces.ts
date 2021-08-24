import { ServiceConfigJson, ServiceConfigurations } from "./types";
export interface AbhiResponse<T extends object> {
	data: T;
	message: string;
	status: string | number;
}

export interface LoginRes {
	token: string;
	data: null;
}

export interface SystemConfigRes {
	result: ServiceConfigurations;
}
