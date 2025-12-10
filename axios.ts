interface config {
  headers: Record<string, string>;
  baseUrl?: string;
  timeout?: number;
}

interface FetchData {
  fetchUrl: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  data?: string;
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

  private async handleTimeOut(fetchData: FetchData) {
    if (!this.config.baseUrl) return;
    const controller = new AbortController();
    const timeOutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    if (fetchData.method === "GET") {
      let fetchApi;
      try {
        fetchApi = await fetch(fetchData.fetchUrl, {
          signal: controller.signal,
        });
      } catch (error: any) {
        if (error.name === "AbortError") {
          throw new Error("Request time out");
        } else {
          throw error;
        }
      }
      clearTimeout(timeOutId);
      const JsonResponse = await fetchApi?.json();
      if (!fetchApi) {
        throw new Error("no fetch data found");
      }
      return JsonResponse;
    }
    if (fetchData.method === "POST") {
      let fetchApi;
      try {
        fetchApi = await fetch(fetchData.fetchUrl, {
          signal: controller.signal,
          method: fetchData.method,
          headers: this.config.headers,
          body: JSON.stringify(fetchData.data),
        });
      } catch (error: any) {
        if (error.name === "AbortError") {
          throw new Error("Request time out");
        }
        throw error;
      }
      clearTimeout(timeOutId);
      const JsonResponse = await fetchApi?.json();
      if (!fetchApi) {
        throw new Error("no fetch data found");
      }
      return JsonResponse;
    }
  }

  async get(url?: string) {
    if (!this.config.baseUrl) return;
    const fetchUrl = this.config.baseUrl + url;
    const fetchResponse = await this.handleTimeOut({
      fetchUrl: fetchUrl,
      method: "GET",
    });
    if (!fetchResponse) {
      throw new Error("No response received");
    }
    if (!(fetchResponse.statusCode === 200)) {
      throw new Error(fetchResponse);
    }
    return fetchResponse;
  }

  async post({ url, payload }: { url: string; payload: any }) {
    if (!url || !this.config.baseUrl) {
      throw new Error("No url received !");
    }
    const fetchUrl = this.config.baseUrl + url;
    const fetchResponse = await this.handleTimeOut({
      fetchUrl: fetchUrl,
      method: "POST",
      data: payload,
    });
    if (!fetchResponse) {
      throw new Error("No response received");
    }
    if (!(fetchResponse.statusCode === 201)) {
      throw new Error(fetchResponse.message);
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
