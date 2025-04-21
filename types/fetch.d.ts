/**
 * Extension for fetch API types
 * 
 * Extends the Request and URL interfaces from fetch API to include additional properties
 * used in our client logging system.
 */

interface Request {
  url: string;
  method: string;
}

interface URL {
  url: string;
}

interface XMLHttpRequest {
  __logInfo?: {
    url: string;
    method: string;
    startTime: number;
  };
} 