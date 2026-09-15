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
    const method = String(options.method || "GET").toUpperCase();

    console.log("=================================");
    console.log("API REQUEST");
    console.log("METHOD:", method);
    console.log("URL:", url);

    console.log(
      "HEADERS:",
      JSON.stringify(
        {
          ...options.headers,
          Authorization: options.headers?.Authorization
            ? "Bearer ***TOKEN***"
            : undefined,
        },
        null,
        2
      )
    );

    console.log("=================================");

    let response;

    if (method === "GET") {
      response = await axios.get(url, {
        headers: options.headers || {},
        params: options.params || undefined,
      });
    } else if (method === "POST") {
      response = await axios.post(
        url,
        options.body || {},
        {
          headers: options.headers || {},
          params: options.params || undefined,
        }
      );
    } else {
      return {
        success: 0,
        result: false,
        message: `Unsupported HTTP method: ${method}`,
      };
    }

    console.log("=================================");
    console.log("API RESPONSE");
    console.log("STATUS:", response.status);
    console.log(
      "DATA:",
      JSON.stringify(response.data, null, 2)
    );
    console.log("=================================");

    return response.data;

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
