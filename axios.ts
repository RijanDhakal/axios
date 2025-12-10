interface config {
  headers?: Record<string, string>;
  baseUrl?: string;
  timeout?: number;
}

class Axios {
  config: config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  constructor(config: config) {
    this.config = config;
  }
  async get(url?: string) {
    if (!this.config.baseUrl) return;
    const fetchResponse = await fetch(this.config.baseUrl + url);
    const resJson = await fetchResponse.json();
    return resJson;
  }
}

function create(conf: config) {
  return new Axios(conf);
}

export default {
  create,
};
