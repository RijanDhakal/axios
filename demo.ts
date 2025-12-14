import axios from "./axios";

interface Student {
  id?: string;
  studentId: number;
  name: string;
  address: string;
  contact: string;
  grade: number;
  section: number;
  stream: string;
  password: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const api = axios.create({
  baseUrl: "http://localhost:3000",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

const asyncFunction = async () => {
  // GET
  // const res = await api.get<ApiResponse<Student[]>>("/students/get", {
  //   getTimeInterval: true,
  //   config: true,
  // });

  // POST
  const res = await api.post("/students/create", {
    payload: {
      studentId: 27,
      name: "test",
      address: "sunwal",
      contact: "6767327832",
      grade: 12,
      section: 106,
      stream: "SCIENCE",
      password: "123456",
    },
    headers: {
      "content-type": "application/json",
    },
    getTimeInterval: true,
    config: true,
  });

  // PATCH
  // const res = await api.patch<ApiResponse<Student>>("/students/update/2", {
  //   getTimeInterval: true,
  //   payload: {
  //     name: "I did change it man",
  //   },
  //   // config: true,
  // });

  // DELETE
  // const res = await api.delete<ApiResponse<[]>>("/students/delete/24");
  console.log(res);
};
asyncFunction();
