export class ApiResponse<T = any>  {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T

  constructor(statusCode: number, message: string, data?: any) {

    this.statusCode = statusCode
    this.success = statusCode < 400
    this.message = message
    this.data = data
  }
}

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}