import { HttpError } from "./errorHandler";

interface config {
  headers?: Record<string, string>;
  baseUrl?: string;
  timeout?: number;
}

interface FetchData {
  fetchUrl: string;
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  data?: options;
}

interface options {
  headers?: Record<string, string>;
  getTimeInterval?: boolean;
  payload?: any;
}

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
  private async handleTimeOut(fetchData: FetchData) {
    const controller = new AbortController();
    const timeOutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);
    const options: RequestInit = {
      signal: controller.signal,
      method: fetchData.method,
      headers: fetchData.data?.headers || {
        "Content-Type": "application/json",
      },
    };
    if (fetchData.method !== "GET") {
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
        error: JsonResponse.message,
        message: JsonResponse.message || fetchApi.type,
        statusCode: fetchApi.status,
        path: fetchApi.url,
      });
    }
    return JsonResponse;
  }

  async get(url?: string, options?: options) {
    const fetchUrl = this.buildFetchUrl(url ?? "");
    const startTime = performance.now();
    const fetchResponse = await this.handleTimeOut({
      fetchUrl: fetchUrl,
      method: "GET",
    });
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    if (options?.getTimeInterval) {
      return {
        data: fetchResponse,
        timeTaken: `${timeTaken} ms`,
      };
    }
    return fetchResponse;
  }

  async post(url?: string, options?: options) {
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
    const fetchResponse = await this.handleTimeOut({
      fetchUrl: fetchUrl,
      method: "POST",
      data: options,
    });
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    if (options.getTimeInterval) {
      return {
        data: fetchResponse,
        timeTaken: `${timeTaken} ms`,
      };
    }
    return fetchResponse;
  }

  async patch(url?: string, options?: options) {
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
    const fetchResponse = await this.handleTimeOut({
      fetchUrl: fetchUrl,
      method: "PATCH",
      data: options,
    });
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    if (options.getTimeInterval) {
      return {
        data: fetchResponse,
        timeTaken: `${timeTaken} ms`,
      };
    }
    return fetchResponse;
  }


}

function create(conf: config) {
  return new Axios(conf);
}

export default {
  create,
};
