import { IRequestError } from "../models/IRequestError";

export function isRequestError(obj: any | IRequestError): obj is IRequestError {
  return "statusCode" in obj;
}
