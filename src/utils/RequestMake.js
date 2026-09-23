// ---------------------------------------------------------
// Requestmake — thin axios wrapper used by every API call in
// the app. On success it returns the raw response data as-is.
// On failure it does NOT throw — it returns
//   { success: 0, message: "..." }
// so callers check `response?.success === 0` instead of try/catch.
// ---------------------------------------------------------
import axios from "axios";

export default async function Requestmake(url, options = {}) {
  try {
    let response = null;
    const axiosConfig = {
      headers: options.headers || {},
      timeout: 15000, // 15 second timeout
    };

    if (options.method === "GET") {
      axiosConfig.params = options.params;
      const result = await axios.get(url, axiosConfig);
      response = result?.data;
    } else {
      const result = await axios.post(url, options.body, axiosConfig);
      response = result?.data;
    }

    if (response && typeof response === "object") {
      if (response.result === undefined && "success" in response) {
        response.result = response.success === 1 || response.success === true;
      }
      if (response.success === undefined && "result" in response) {
        response.success = response.result === true ? 1 : 0;
      }
    }

    return response;
  } catch (error) {
    console.log("=================================");
    console.log("API ERROR");
    console.log("URL:", url);
    console.log("STATUS:", error.response?.status);
    console.log(
      "ERROR DATA:",
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );
    console.log("ERROR MESSAGE:", error.message);
    console.log("=================================");

    const responseData = error.response?.data;

    console.log("RequestMake Error Details:", {
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      message: error.message,
      url: url,
      status: error.response?.status,
    });

    if (error.response) {
      message =
        responseData?.message ||
        responseData?.error ||
        (responseData?.errors
          ? JSON.stringify(responseData.errors)
          : undefined) ||
        "Validation failed";
    } else if (error.request) {
      message = `No response from server (${error.message})`;
    } else {
      message = "Request error: " + error.message;
    }

    return {
      success: 0,
      result: false,
      message:
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "Request failed",
      statusCode: error.response?.status || null,
    };
  }
}
