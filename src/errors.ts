import type { components } from "./types.generated";

export type ErrorResponse = components["schemas"]["errorResponseObject"];
export type ErrorDetail = ErrorResponse["errors"][number];

export class LunchMoneyError extends Error {
	public readonly errors: ErrorDetail[];

	constructor(
		message: string,
		public readonly status?: number,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		public readonly data?: any,
		errors?: ErrorDetail[],
	) {
		super(message);
		this.name = "LunchMoneyError";
		this.errors = errors || [];
	}
}
