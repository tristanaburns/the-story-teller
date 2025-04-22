// NestJS type declarations
declare module '@nestjs/common' {
  export const Injectable: (...args: any[]) => ClassDecorator;
  export const Logger: any;
  export interface LoggerService {
    log(message: any, ...optionalParams: any[]): any;
    error(message: any, ...optionalParams: any[]): any;
    warn(message: any, ...optionalParams: any[]): any;
    debug?(message: any, ...optionalParams: any[]): any;
    verbose?(message: any, ...optionalParams: any[]): any;
  }
  export const Scope: any;
  export const UseInterceptors: (...args: any[]) => MethodDecorator & ClassDecorator;
  export const NestInterceptor: any;
  export const ExecutionContext: any;
  export const CallHandler: any;
}

declare module '@nestjs/config' {
  export class ConfigService {
    get<T = any>(key: string): T;
    get<T = any>(key: string, defaultValue: T): T;
  }
}

declare module 'nestjs-cls' {
  export class ClsService {
    get<T = any>(key: string): T;
    set<T = any>(key: string, value: T): void;
  }
}

declare module 'rxjs' {
  export interface Observable<T> {
    pipe(...operators: any[]): Observable<T>;
    subscribe(observer?: any): any;
  }
}

declare module 'rxjs/operators' {
  export function tap<T>(fn: (value: T) => void): any;
  export function catchError<T, R>(fn: (err: any) => Observable<R>): any;
}

declare module 'winston' {
  export interface Logger {
    log(level: string, message: string, meta?: any): Logger;
    error(message: string, meta?: any): Logger;
    warn(message: string, meta?: any): Logger;
    info(message: string, meta?: any): Logger;
    debug(message: string, meta?: any): Logger;
    [key: string]: any;
  }
  
  export const format: any;
  export function createLogger(options: any): Logger;
  export const transports: any;
}

declare module 'winston-mongodb' {
  // Just declare the module exists
} 