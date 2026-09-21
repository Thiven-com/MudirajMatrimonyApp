import Requestmake from "./RequestMake";

/**
 * Build common request headers
 */
function buildHeaders(user) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }

  return headers;
}

/**
 * =========================================================
 * GET METHOD
 * =========================================================
 */
export async function getMethod(
  url,
  user = null,
  params = undefined
) {
  const requestOptions = {
    method: "GET",
    headers: buildHeaders(user),
  };

  if (params) {
    requestOptions.params = params;
  }

  console.log("=================================");
  console.log("GET REQUEST");
  console.log("URL:", url);
  console.log(
    "TOKEN EXISTS:",
    !!user?.token
  );

  try {
    const result = await Requestmake(
      url,
      requestOptions
    );

    console.log("GET RESPONSE:");
    console.log(
      JSON.stringify(result, null, 2)
    );

    return result;
  } catch (error) {
    console.error("GET ERROR:", error);
    throw error;
  }
}

/**
 * =========================================================
 * POST METHOD
 * =========================================================
 */
export async function postMethod(
  url,
  user = null,
  data = {}
) {
  const requestOptions = {
    method: "POST",
    headers: buildHeaders(user),
    body: data,
  };

  console.log("=================================");
  console.log("POST REQUEST");
  console.log("URL:", url);
  console.log(
    "TOKEN EXISTS:",
    !!user?.token
  );
  console.log(
    "BODY:",
    JSON.stringify(data, null, 2)
  );

  try {
    const result = await Requestmake(
      url,
      requestOptions
    );

    console.log("POST RESPONSE:");
    console.log(
      JSON.stringify(result, null, 2)
    );

    return result;
  } catch (error) {
    console.error("POST ERROR:", error);
    throw error;
  }
}

/**
 * =========================================================
 * PUT METHOD
 * =========================================================
 */
export async function putMethod(
  URL,
  user = null,
  body = {}
) {
  try {
    console.log("=================================");
    console.log("PUT API REQUEST");
    console.log("URL:", URL);
    console.log(
      "BODY:",
      JSON.stringify(body, null, 2)
    );
    console.log(
      "TOKEN EXISTS:",
      !!user?.token
    );
    console.log("=================================");

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (user?.token) {
      headers.Authorization =
        `Bearer ${user.token}`;
    }

    const response = await fetch(URL, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const text = await response.text();

    let data = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch (parseError) {
      data = {
        message: text,
      };
    }

    console.log("=================================");
    console.log("PUT API RESPONSE");
    console.log("STATUS:", response.status);
    console.log(
      JSON.stringify(data, null, 2)
    );
    console.log("=================================");

    if (!response.ok) {
      const error = new Error(
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      "PUT API ERROR:",
      error
    );

    throw error;
  }
}

/**
 * =========================================================
 * DELETE METHOD
 * =========================================================
 *
 * Generic DELETE API
 *
 * Usage:
 *
 * const response = await deleteMethod(
 *   url,
 *   { token: accessToken }
 * );
 */
export async function deleteMethod(
  URL,
  user = null
) {
  try {
    console.log("=================================");
    console.log("DELETE API REQUEST");
    console.log("URL:", URL);
    console.log(
      "TOKEN EXISTS:",
      !!user?.token
    );
    console.log("=================================");

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (user?.token) {
      headers.Authorization =
        `Bearer ${user.token}`;
    }

    console.log(
      "DELETE HEADERS:",
      JSON.stringify(
        {
          Accept: headers.Accept,
          "Content-Type":
            headers["Content-Type"],
          Authorization: user?.token
            ? "Bearer ***TOKEN***"
            : undefined,
        },
        null,
        2
      )
    );

    const response = await fetch(URL, {
      method: "DELETE",
      headers,
    });

    console.log(
      "DELETE HTTP STATUS:",
      response.status
    );

    console.log(
      "DELETE HTTP OK:",
      response.ok
    );

    const text = await response.text();

    console.log(
      "DELETE RESPONSE TEXT:",
      text
    );

    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = {
          message: text,
        };
      }
    }

    console.log("=================================");
    console.log("DELETE API RESPONSE");
    console.log(
      JSON.stringify(data, null, 2)
    );
    console.log("=================================");

    /**
     * DELETE successful:
     *
     * 200
     * 202
     * 204
     * etc.
     */
    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.msg ||
        data?.error ||
        `Delete request failed with status ${response.status}`;

      const error = new Error(
        errorMessage
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    /**
     * Normalize response
     */
    return {
      ...data,

      success:
        data?.success !== undefined
          ? data.success
          : true,

      result:
        data?.result !== undefined
          ? data.result
          : true,

      statusCode:
        data?.statusCode !== undefined
          ? data.statusCode
          : response.status,

      message:
        data?.message ||
        data?.msg ||
        `Deleted successfully.`,
    };
  } catch (error) {
    console.error(
      "DELETE API ERROR:",
      error
    );

    console.error(
      "DELETE ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "DELETE ERROR STATUS:",
      error?.status
    );

    throw error;
  }
}