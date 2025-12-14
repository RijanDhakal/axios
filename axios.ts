import { HttpError } from "./errorHandler";

type CommonHeaders = {
  Authorization?: string;
  "Content-Type"?: string;
  Accept?: string;
};
type HttpHeader = Record<string, string> & CommonHeaders;

enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

interface config {
  headers?: HttpHeader;
  baseUrl?: string;
  timeout?: number;
}

interface FetchData {
  fetchUrl: string;
  method: Methods;
  data?: options;
}

interface options {
  headers?: HttpHeader;
  getTimeInterval?: boolean;
  payload?: any;
  config?: boolean;
}

interface requestConfig {
  url: string;
  method: Methods;
  requestHeaders: HttpHeader;
}

interface ApiResponse<T = any> {
  data: T;
  statusCode: number;
  headers: HttpHeader;
  timeTaken?: string;
  config?: requestConfig;
}

interface fetchTimoutResponse<T> {
  data: T;
  response: Response;
  config: requestConfig;
}

type getOptions = Omit<options, "headers" | "payload">;

class Axios {
  config: config = {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 1000,
  };

  constructor(config: config) {
    this.config = config;
  }

  private buildFetchUrl(url: string) {
    // todo : check for params
    if (
      url === "" &&
      !(
        this.config.baseUrl?.startsWith("http://") ||
        this.config.baseUrl?.startsWith("https://")
      )
    ) {
      throw new HttpError({
        error: "Client Conflict Error",
        message: "Url with http / https  is required",
        statusCode: 409,
        path: this.config.baseUrl || url,
      });
    }
    if (url.startsWith("https://") || url.startsWith("http://")) return url;
    if (this.config.baseUrl) {
      return `${
        this.config.baseUrl.endsWith("/")
          ? this.config.baseUrl.slice(0, -1)
          : this.config.baseUrl
      }${url.startsWith("/") ? url : "/" + url}`;
    }
    throw new HttpError({
      error: "BadRequestError",
      message: "Base url is required while making req with relative url",
      statusCode: 400,
      path: url,
    });
  }

  private responseBuilder<T>({
    fetchResponse,
    startTime,
    endTime,
    options,
  }: {
    fetchResponse: fetchTimoutResponse<T>;
    startTime: number;
    endTime: number;
    options?: options;
  }) {
    // Convert Headers to plain object
    const headersObj: HttpHeader = {};
    fetchResponse.response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    const response: ApiResponse<T> = {
      data: fetchResponse.data,
      headers: headersObj,
      statusCode: fetchResponse.response.status,
    };
    if (options?.getTimeInterval) {
      response.timeTaken = `${(endTime - startTime).toFixed(2)} ms`;
    }
    if (options?.config) {
      response.config = fetchResponse.config;
    }
    return response;
  }

  private async handleTimeOut<T>(fetchData: FetchData) {
    const controller = new AbortController();
    const timeOutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);
    const options: RequestInit = {
      signal: controller.signal,
      method: fetchData.method,
      // the default headers ius for the GET req beacuse we donot accpet options for get here
      // beacuse we dont expect body or external headers to be passed with get
      headers: fetchData.data?.headers || {
        "Content-Type": "application/json",
      },
    };
    if (
      fetchData.method !== Methods.GET &&
      fetchData.method !== Methods.DELETE
    ) {
      if (!fetchData.data?.payload) {
        throw new HttpError({
          error: "BadRequestError",
          message: `Payload is required to ${fetchData.method} !`,
          statusCode: 400,
          path: fetchData.fetchUrl,
        });
      }
      options.body = JSON.stringify(fetchData.data.payload);
    }
    let fetchApi;
    try {
      fetchApi = await fetch(fetchData.fetchUrl, options);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === "AbortError") {
        throw new HttpError({
          error: "RequestTimeOut",
          message: "Failed to process request in time. Please try again.",
          statusCode: 408,
          path: fetchData.fetchUrl,
        });
      } else {
        throw new HttpError({
          error: err.name,
          message: err.message,
          statusCode: 500,
          path: fetchData.fetchUrl,
        });
      }
    } finally {
      clearTimeout(timeOutId);
    }
    if (!fetchApi) {
      throw new HttpError({
        error: "NotFoundError",
        message: "No response is send by the server",
        statusCode: 404,
        path: fetchData.fetchUrl,
      });
    }
    const JsonResponse = await fetchApi.json();
    if (!fetchApi.ok) {
      throw new HttpError({
        error: JsonResponse.message || fetchApi.type,
        message: JsonResponse.message || fetchApi.statusText,
        statusCode: fetchApi.status,
        path: fetchData.fetchUrl,
      });
    }
    const res: fetchTimoutResponse<T> = {
      data: JsonResponse as T,
      response: fetchApi,
      config: {
        url: fetchData.fetchUrl,
        method: fetchData.method,
        requestHeaders: options.headers,
      } as requestConfig,
    };
    return res;
  }

  async get<T = any>(url: string, options?: getOptions) {
    const fetchUrl = this.buildFetchUrl(url);
    const startTime = performance.now();
    const fetchResponse = await this.handleTimeOut<T>({
      fetchUrl: fetchUrl,
      method: Methods.GET,
    });
    const endTime = performance.now();
    return this.responseBuilder<T>({
      endTime: endTime,
      startTime: startTime,
      fetchResponse: fetchResponse,
      options: options ?? {},
    });
  }

  async post<T = any>(url: string, options?: options) {
    const fetchUrl = this.buildFetchUrl(url ?? "");
    if (!options || Object.keys(options).length === 0 || !options.payload) {
      throw new HttpError({
        error: "NotFoundError",
        message: "MetaData must be passed",
        statusCode: 404,
        path: fetchUrl,
      });
    }
    const startTime = performance.now();
    const fetchResponse = await this.handleTimeOut<T>({
      fetchUrl: fetchUrl,
      method: Methods.POST,
      data: options,
    });
    const endTime = performance.now();
    return this.responseBuilder<T>({
      endTime: endTime,
      startTime: startTime,
      fetchResponse: fetchResponse,
      options: options,
    });
  }

  async patch<T = any>(url: string, options?: options) {
    const fetchUrl = this.buildFetchUrl(url ?? "");
    if (!options || Object.keys(options).length === 0 || !options.payload) {
      throw new HttpError({
        error: "NotFoundError",
        message: "MetaData must be passed",
        statusCode: 404,
        path: fetchUrl,
      });
    }
    const startTime = performance.now();
    const fetchResponse = await this.handleTimeOut<T>({
      fetchUrl: fetchUrl,
      method: Methods.PATCH,
      data: options,
    });
    const endTime = performance.now();
    return this.responseBuilder<T>({
      endTime: endTime,
      startTime: startTime,
      fetchResponse: fetchResponse,
      options: options,
    });
  }

  async delete<T = any>(url: string, options?: options) {
    // User can delete it directly from id in the api as well as pass some metadata and delete on the basis of where
    const fetchUrl = this.buildFetchUrl(url);
    let fetchResponse: fetchTimoutResponse<T>;
    const startTime = performance.now();
    if (
      options &&
      options.payload &&
      Object.keys(options.payload).length !== 0
    ) {
      fetchResponse = await this.handleTimeOut<T>({
        fetchUrl: fetchUrl,
        method: Methods.DELETE,
        data: options.payload,
      });
    } else {
      fetchResponse = await this.handleTimeOut<T>({
        fetchUrl: fetchUrl,
        method: Methods.DELETE,
      });
    }
    const endTime = performance.now();
    return this.responseBuilder<T>({
      endTime: endTime,
      startTime: startTime,
      fetchResponse: fetchResponse,
      options: options ?? {},
    });
  }
}

function create(conf: config) {
  return new Axios(conf);
}

export default {
  create,
};
