import Requestmake from "./RequestMake";

function buildHeaders(user) {
  const headers = { "Content-Type": "application/json" };
  if (user?.token) {
    headers.Authorization = "Bearer " + user.token;
  }
  return headers;
}

export async function getMethod(url, user, params) {
  const requestOptions = {
    method: "GET",
    headers: buildHeaders(user),
    params,
  };
  return Requestmake(url, requestOptions);
}

export async function postMethod(url, user, data) {
  const requestOptions = {
    method: "POST",
    headers: buildHeaders(user),
    body: data,
  };
  return Requestmake(url, requestOptions);
}
