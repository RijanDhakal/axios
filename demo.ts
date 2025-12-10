import axios from "./axios";

const api = axios.create({
  baseUrl: "https://randomuser.me",
});

const asyncFunction = async () => {
  const res = await api.get("/api");
  console.log(res);
};
asyncFunction();
