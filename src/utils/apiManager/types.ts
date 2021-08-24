import { Method } from "axios";

export type Initiator = "employee_web" | "employee_mobile" | "employer_web" | "admin_web" | "ussd" | "other";

export interface API {
	method: Method;
	path: string;
	description: string;
	payload: {
		[typeKeyName: string]: string;
	};
}

export type APIList = {
	[APIKey: string]: API;
};

export interface ServiceConfigurations {
	createdBy?: string;
	createdById: string;
	createdAt: Date;
	deletedDate: Date;
	updatedBy?: string;
	updatedById: string;
	updatedAt: Date;
	version: number;
	id: string;

	platformService?: string;
	platformServiceId: string;
	jsonConfig: ServiceConfigJson;
}

export interface ServiceConfigJson {
	appVersion: number;
	passwordAge: number; // in term of days
	passwordPattern: string; // regex for password pattern
	transactionCancellationDuration: number; //(default: 5) // 5 seconds
	defaultPaymentProcessor: string; // (default: '1Link')
	backOffPolicy: "absolute" | "exponential"; //  (default: 'absolute', 'exponential')
	backOffPolicyDurationInSeconds: number; // default: 30 seconds
	maxInvalidAttemptsToKickStartBackOffPolicy: number; // 5
	transactionDeltaOffset: number; // (default: 10) // 10 seconds delay to initiate the transaction
	notificationDisseminationPolicies: "email" | "sms" | "both"; // enum: email, sms, both . default:both
	maxDurationToCancelTransaction: number; // default: 10 // in seconds
	deductServiceFeeFromEmployee: boolean; // default: true // Otherwise employer

	bronzeLimit: number; //(default: 50%)
	silverLimit: number; //(default: 75%)
	goldLimit: number; //(default: 100%)
	platinumLimit: number; //(default: 100%)
	bronzeLimitAutoApprove: boolean; //default true
	silverLimitAutoApprove: boolean; //default true
	goldLimitAutoApprove: boolean; //default true
	platinumLimitAutoApprove: boolean; //default true

	deductUnpaidLeaves: boolean; // (default: true)
	defaultAnnualPaidLeaves: number; // (default: 21)
	autoApprove: boolean; // (default: true - false means manual approval)

	supportPhoneNo: string; // TBD
	supportWhatsAppNo: string; // TBD
	supportEmailId: string; // default: support@abhi.com.pk

	pillConfig: {
		displayPills: { value: number; policy: "absolute" | "percentage" }[];
	};

	minimumAppVersion: number;
	apis: {
		private?: APIList;
		public: APIList;
	};
}
