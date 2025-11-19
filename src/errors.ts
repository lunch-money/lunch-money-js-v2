import type { components } from "./types.generated";

export type ErrorResponse = components["schemas"]["errorResponseObject"];
export type ErrorDetail = ErrorResponse["errors"][number];

export class LunchMoneyError extends Error {
	public readonly errors: ErrorDetail[];

	constructor(
		message: string,
		public readonly status?: number,
		public readonly data?: unknown,
		errors?: ErrorDetail[],
	) {
		super(message);
		this.name = "LunchMoneyError";
		this.errors = errors || [];
	}
}
