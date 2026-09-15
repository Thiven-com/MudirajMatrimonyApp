
import Requestmake from "./RequestMake";

/**
 * Build common request headers
 *
 * Expected user object:
 * {
 *   token: "your-access-token"
 * }
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
 * GET API
 *
 * Usage:
 * const result = await getMethod(url, user, params);
 */
export async function getMethod(url, user = null, params = undefined) {
  const requestOptions = {
    method: "GET",
    headers: buildHeaders(user),
  };

  // Add params only when provided
  if (params) {
    requestOptions.params = params;
  }

  console.log("=================================");
  console.log("GET REQUEST");
  console.log("URL:", url);
  console.log(
    "HEADERS:",
    JSON.stringify(
      {
        ...requestOptions.headers,
        Authorization: user?.token
          ? "Bearer ***TOKEN***"
          : undefined,
      },
      null,
      2
    )
  );

  if (params) {
    console.log("PARAMS:", JSON.stringify(params, null, 2));
  }

  console.log("=================================");

  try {
    const result = await Requestmake(url, requestOptions);

    console.log("GET RESPONSE:");
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.log("GET ERROR:", error);
    throw error;
  }
}

/**
 * POST API
 *
 * Usage:
 * const result = await postMethod(url, user, data);
 */
export async function postMethod(url, user = null, data = {}) {
  const requestOptions = {
    method: "POST",
    headers: buildHeaders(user),
    body: data,
  };

  console.log("=================================");
  console.log("POST REQUEST");
  console.log("URL:", url);
  console.log(
    "HEADERS:",
    JSON.stringify(
      {
        ...requestOptions.headers,
        Authorization: user?.token
          ? "Bearer ***TOKEN***"
          : undefined,
      },
      null,
      2
    )
  );
  console.log("BODY:", JSON.stringify(data, null, 2));
  console.log("=================================");

  try {
    const result = await Requestmake(url, requestOptions);

    console.log("POST RESPONSE:");
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.log("POST ERROR:", error);
    throw error;
  }
}


// =========================================================
// PUT METHOD
// =========================================================

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
      data = text ? JSON.parse(text) : {};
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
// =========================================================
// DELETE METHOD
// =========================================================

export async function deleteMemberCareerById(
    accessToken,
    careerId
) {

    console.log(
        "========================================"
    );

    console.log(
        "DELETE MEMBER CAREER FUNCTION"
    );

    console.log(
        "CAREER ID RECEIVED:",
        careerId
    );

    console.log(
        "TOKEN EXISTS:",
        !!accessToken
    );

    console.log(
        "========================================"
    );


    if (!accessToken) {

        throw new Error(
            "Access token is missing. Please login again."
        );
    }


    const id =
        Number(careerId);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        throw new Error(
            `Invalid career ID: ${careerId}`
        );
    }


    const URL =
        BASE_URL +
        `/api/member/career/${id}`;


    console.log(
        "========================================"
    );

    console.log(
        "DELETE MEMBER CAREER API"
    );

    console.log(
        "METHOD:",
        "DELETE"
    );

    console.log(
        "URL:",
        URL
    );

    console.log(
        "CAREER ID:",
        id
    );

    console.log(
        "========================================"
    );


    try {

        const response =
            await deleteMethod(
                URL,
                {
                    token:
                        accessToken,
                }
            );


        console.log(
            "========================================"
        );

        console.log(
            "DELETE MEMBER CAREER RESPONSE"
        );

        console.log(
            JSON.stringify(
                response,
                null,
                2
            )
        );

        console.log(
            "STATUS CODE:",
            response?.statusCode
        );

        console.log(
            "MESSAGE:",
            response?.message
        );

        console.log(
            "========================================"
        );


        return response;

    } catch (error) {

        console.error(
            "DELETE MEMBER CAREER ERROR"
        );

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "STATUS:",
            error?.status
        );

        throw error;
    }
}