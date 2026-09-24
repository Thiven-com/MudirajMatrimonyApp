import Requestmake from "./RequestMake";

function buildHeaders(user) {
  const headers = { "Content-Type": "application/json" };
  if (!user) return headers;

  if (typeof user === "string") {
    headers.Authorization = user.startsWith("Bearer ")
      ? user
      : "Bearer " + user;
  } else if (user?.token) {
    const tokenStr = String(user.token);
    headers.Authorization = tokenStr.startsWith("Bearer ")
      ? tokenStr
      : "Bearer " + tokenStr;
  } else if (user?.Authorization || user?.authorization) {
    headers.Authorization = user.Authorization || user.authorization;
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

export async function putMethod(url, user, data) {
  const requestOptions = {
    method: "PUT",
    headers: buildHeaders(user),
    body: data,
  };
  return Requestmake(url, requestOptions);
}

export async function deleteMethod(url, user, params) {
  const requestOptions = {
    method: "DELETE",
    headers: buildHeaders(user),
    params,
  };
  return Requestmake(url, requestOptions);
}
