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

const api = axios.create({
  baseUrl: "http://localhost:3000",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

const asyncFunction = async () => {
  // GET
  const res = await api.get("/students/get", {
    getTimeInterval: true,
  });
  // console.log("res :", res);

  // POST
  // const res = await api.post("/students/create", {
  //   payload: {
  //     studentId: 23,
  //     name: "test",
  //     address: "sunwal",
  //     contact: "6767327832",
  //     grade: 12,
  //     section: 106,
  //     stream: "SCIENCE",
  //     password: "123456",
  //   },
  //   headers: {
  //     "Content-Type": "Application/Json",
  //   },
  //   getTimeInterval: true,
  // });

  // PATCH
  // const res = await api.patch("/students/update/2",{
  //   getTimeInterval : true,
  //   payload:{
  //     name : "hahaha"
  //   }
  // });

  // DELETE
  // const res = await api.delete({
  //   url: "/students/delete",
  //   payload: {
  //     studentId: 4,
  //   },
  // });
  console.log(res);
};
asyncFunction();
