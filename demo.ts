import axios from "./axios";

const api = axios.create({
  baseUrl: "http://localhost:3000",
  timeout: 40,
  headers: {
    "Content-Type": "application/json",
  },
});

const asyncFunction = async () => {
  const res = await api.get("/students/get");
  //   console.log("res :", res);
  // const res = await api.post({
  //   url: "/students/create",
  //   payload: {
  //     studentId: 10,
  //     name: "test",
  //     address: "sunwal",
  //     contact: "6767327832",
  //     grade: 12,
  //     section: 106,
  //     stream: "SCIENCE",
  //     password: "123456",
  //   },
  // });
  console.log("res :", res);
};
asyncFunction();
