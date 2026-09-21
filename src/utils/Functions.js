
// =========================================================
// Functions.js
// =========================================================

import BASE_URL from "../constants/AppUrls";

import {
  getMethod,
  postMethod,
  putMethod
} from "./APIServices";
// =========================================================
// COMMON HELPERS
// =========================================================

function normalizeMobile(mobile) {
  return String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);
}

function requireToken(accessToken) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }
}

function logResponse(title, response) {
  console.log("=================================");
  console.log(title);
  console.log(
    JSON.stringify(response, null, 2)
  );
  console.log("=================================");
}

// =========================================================
// LOGIN API
// POST /api/login
// =========================================================

export async function login(mobile) {
  const normalizedMobile =
    normalizeMobile(mobile);

  if (normalizedMobile.length !== 10) {
    throw new Error(
      "Enter a valid 10-digit mobile number"
    );
  }

  const URL =
    BASE_URL + "/api/login";

  const body = {
    phone: Number(normalizedMobile),
  };

  console.log("=================================");
  console.log("LOGIN API REQUEST");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log(
    "BODY:",
    JSON.stringify(body, null, 2)
  );
  console.log("=================================");

  try {
    const result = await postMethod(
      URL,
      null,
      body
    );

    logResponse(
      "LOGIN API RESPONSE",
      result
    );

    return result;
  } catch (error) {
    console.error(
      "LOGIN API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// SEND LOGIN OTP
// Backward compatibility
// =========================================================

export async function sendLoginOtp(mobile) {
  return login(mobile);
}

// =========================================================
// VERIFY MOBILE / OTP API
// POST /api/verifyMobile
// =========================================================

export async function verifyMobile(
  mobile,
  otp
) {
  const normalizedMobile =
    normalizeMobile(mobile);

  const normalizedOtp = String(otp || "")
    .replace(/\D/g, "")
    .slice(0, 4);

  if (normalizedMobile.length !== 10) {
    throw new Error(
      "Enter a valid 10-digit mobile number"
    );
  }

  if (normalizedOtp.length !== 4) {
    throw new Error(
      "Enter a valid 4-digit OTP"
    );
  }

  const URL =
    BASE_URL + "/api/verifyMobile";

  const body = {
    phone: normalizedMobile,
    otp: normalizedOtp,
  };

  console.log("=================================");
  console.log("VERIFY MOBILE API REQUEST");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log(
    "BODY:",
    JSON.stringify(body, null, 2)
  );
  console.log("=================================");

  try {
    const result = await postMethod(
      URL,
      null,
      body
    );

    logResponse(
      "VERIFY MOBILE API RESPONSE",
      result
    );

    return result;
  } catch (error) {
    console.error(
      "VERIFY MOBILE API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// SIGNUP API
// POST /api/signup
// =========================================================

export async function signup(
  payload = {}
) {
  const phone = String(
    payload.mobile ||
      payload.phone ||
      ""
  )
    .replace(/\D/g, "")
    .slice(-10);

  const body = {
    phone,

    first_name: String(
      payload.firstName || ""
    ).trim(),

    last_name: String(
      payload.lastName || ""
    ).trim(),

    gender: String(
      payload.gender || ""
    )
      .trim()
      .toLowerCase(),

    on_behalf: Number(
      payload.onBehalf || 0
    ),

    date_of_birth:
      payload.dateOfBirth ||
      payload.dob ||
      "",
  };

  const URL =
    BASE_URL + "/api/signup";

  console.log("=================================");
  console.log("SIGNUP API REQUEST");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log(
    "BODY:",
    JSON.stringify(body, null, 2)
  );
  console.log("=================================");

  try {
    const result = await postMethod(
      URL,
      null,
      body
    );

    logResponse(
      "SIGNUP API RESPONSE",
      result
    );

    return result;
  } catch (error) {
    console.error(
      "SIGNUP API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET PROFILE DETAILS
// GET /api/profile_details
// =========================================================

export async function getProfileDetails(
  accessToken
) {
  requireToken(accessToken);

  const URL =
    BASE_URL + "/api/profile_details";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log("GET PROFILE DETAILS");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const result = await getMethod(
      URL,
      user
    );

    logResponse(
      "PROFILE DETAILS RESPONSE",
      result
    );

    return result;
  } catch (error) {
    console.error(
      "PROFILE DETAILS ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER INTRODUCTION
// GET /api/member/introduction
// =========================================================

export async function getMemberIntroduction(
  accessToken
) {
  if (!accessToken) {
    return {
      success: 0,
      result: false,
      message: "Access token is missing",
    };
  }

  const URL =
    BASE_URL +
    "/api/member/introduction";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log(
    "GET MEMBER INTRODUCTION"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      user
    );

    logResponse(
      "MEMBER INTRODUCTION RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "MEMBER INTRODUCTION ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// UPDATE MEMBER INTRODUCTION
// POST /api/member/introduction-update
// =========================================================

export async function updateMemberIntroduction(
  accessToken,
  introduction
) {
  requireToken(accessToken);

  const URL =
    BASE_URL +
    "/api/member/introduction-update";

  const user = {
    token: accessToken,
  };

  const body = {
    introduction: String(
      introduction || ""
    ).trim(),
  };

  console.log("=================================");
  console.log(
    "UPDATE MEMBER INTRODUCTION"
  );
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log(
    "BODY:",
    JSON.stringify(body, null, 2)
  );
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await postMethod(
      URL,
      user,
      body
    );

    logResponse(
      "UPDATE INTRODUCTION RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "UPDATE INTRODUCTION ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER BASIC INFO
// GET /api/member/basic-info
// =========================================================

export async function getMemberBasicInfo(
  accessToken
) {
  requireToken(accessToken);

  const URL =
    BASE_URL +
    "/api/member/basic-info";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log(
    "GET MEMBER BASIC INFO"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      user
    );

    logResponse(
      "GET BASIC INFO RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "GET BASIC INFO ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// UPDATE MEMBER BASIC INFORMATION
// POST /api/member/basic-info/update
// =========================================================

export async function updateMemberBasicInfo(
  accessToken,
  basicInfo = {}
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/basic-info/update";

  const body = {
    first_name: String(
      basicInfo.first_name || ""
    ).trim(),

    last_name: String(
      basicInfo.last_name || ""
    ).trim(),

    email: String(
      basicInfo.email || ""
    ).trim(),

    phone: String(
      basicInfo.phone || ""
    )
      .replace(/\D/g, "")
      .slice(-10),

    gender: Number(
      basicInfo.gender || 0
    ),

    on_behalf: Number(
      basicInfo.on_behalf || 0
    ),

    date_of_birth: String(
      basicInfo.date_of_birth || ""
    ).trim(),

    marital_status: Number(
      basicInfo.marital_status || 0
    ),

    children: Number(
      basicInfo.children || 0
    ),
  };

  console.log(
    "================================="
  );

  console.log(
    "UPDATE BASIC INFORMATION API"
  );

  console.log("METHOD: POST");
  console.log("URL:", URL);

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(body, null, 2)
  );

  console.log(
    "================================="
  );

  try {
    const response = await postMethod(
      URL,
      {
        token: accessToken,
      },
      body
    );

    console.log(
      "================================="
    );

    console.log(
      "UPDATE BASIC INFORMATION RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "================================="
    );

    return response;

  } catch (error) {

    console.error(
      "UPDATE BASIC INFORMATION ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER PRESENT ADDRESS
// GET /api/member/present/address
// =========================================================

export async function getMemberPresentAddress(
  accessToken
) {
  requireToken(accessToken);

  const URL =
    BASE_URL +
    "/api/member/present/address";

  console.log("=================================");
  console.log(
    "GET MEMBER PRESENT ADDRESS"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      {
        token: accessToken,
      }
    );

    logResponse(
      "PRESENT ADDRESS API RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "PRESENT ADDRESS API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER PERMANENT ADDRESS
// GET /api/member/permanent/address
// =========================================================

export async function getMemberPermanentAddress(
  accessToken
) {
  requireToken(accessToken);

  const URL =
    BASE_URL +
    "/api/member/permanent/address";

  console.log("=================================");
  console.log(
    "GET MEMBER PERMANENT ADDRESS"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      {
        token: accessToken,
      }
    );

    logResponse(
      "PERMANENT ADDRESS API RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "PERMANENT ADDRESS API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// UPDATE MEMBER ADDRESS
// POST /api/member/address/update
//
// Request:
// {
//   "country_id": 101,
//   "state_id": 1,
//   "city_id": 1,
//   "postal_code": "515801",
//   "address_type": "present"
// }
//
// address_type:
// "present" | "permanent"
// =========================================================

export async function updateMemberAddress(
  accessToken,
  {
    country_id,
    state_id,
    city_id,
    postal_code,
    address_type = "present",
  } = {}
) {
  requireToken(accessToken);

  const numericCountryId =
    Number(country_id);

  const numericStateId =
    Number(state_id);

  const numericCityId =
    Number(city_id);

  const cleanPostalCode =
    String(postal_code || "").trim();

  const cleanAddressType =
    String(
      address_type || "present"
    )
      .trim()
      .toLowerCase();

  if (
    !Number.isFinite(numericCountryId) ||
    numericCountryId <= 0
  ) {
    throw new Error(
      "Valid country ID is required."
    );
  }

  if (
    !Number.isFinite(numericStateId) ||
    numericStateId <= 0
  ) {
    throw new Error(
      "Valid state ID is required."
    );
  }

  if (
    !Number.isFinite(numericCityId) ||
    numericCityId <= 0
  ) {
    throw new Error(
      "Valid city ID is required."
    );
  }

  if (!cleanPostalCode) {
    throw new Error(
      "Postal code is required."
    );
  }

  if (
    cleanAddressType !== "present" &&
    cleanAddressType !== "permanent"
  ) {
    throw new Error(
      'address_type must be "present" or "permanent".'
    );
  }

  const URL =
    BASE_URL +
    "/api/member/address/update";

  const body = {
    country_id: numericCountryId,
    state_id: numericStateId,
    city_id: numericCityId,
    postal_code: cleanPostalCode,
    address_type: cleanAddressType,
  };

  console.log("=================================");
  console.log(
    "UPDATE MEMBER ADDRESS"
  );
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log(
    "BODY:",
    JSON.stringify(body, null, 2)
  );
  console.log("=================================");

  try {
    const response = await postMethod(
      URL,
      {
        token: accessToken,
      },
      body
    );

    logResponse(
      "UPDATE MEMBER ADDRESS RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "UPDATE MEMBER ADDRESS ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER COUNTRIES
// GET /api/member/countries
// =========================================================

export async function getMemberCountries(
  accessToken
) {
  requireToken(accessToken);

  const URL =
    BASE_URL +
    "/api/member/countries";

  console.log("=================================");
  console.log(
    "GET MEMBER COUNTRIES"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      {
        token: accessToken,
      }
    );

    logResponse(
      "COUNTRIES API RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "COUNTRIES API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER STATES
// GET /api/member/states/{country_id}
//
// Example:
// /api/member/states/101
// =========================================================

export async function getMemberStates(
  accessToken,
  countryId
) {
  requireToken(accessToken);

  const numericCountryId =
    Number(countryId);

  if (
    !Number.isFinite(numericCountryId) ||
    numericCountryId <= 0
  ) {
    throw new Error(
      "Valid country ID is required to load states."
    );
  }

  const URL =
    BASE_URL +
    `/api/member/states/${numericCountryId}`;

  console.log("=================================");
  console.log(
    "GET MEMBER STATES"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "COUNTRY ID:",
    numericCountryId
  );
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      {
        token: accessToken,
      }
    );

    logResponse(
      "STATES API RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "STATES API ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER CITIES
// GET /api/member/cities/{state_id}
//
// Example:
// /api/member/cities/2
// =========================================================

export async function getMemberCities(
  accessToken,
  stateId
) {
  requireToken(accessToken);

  const numericStateId =
    Number(stateId);

  if (
    !Number.isFinite(numericStateId) ||
    numericStateId <= 0
  ) {
    throw new Error(
      "Valid state ID is required to load cities."
    );
  }

  const URL =
    BASE_URL +
    `/api/member/cities/${numericStateId}`;

  console.log("=================================");
  console.log(
    "GET MEMBER CITIES"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log(
    "STATE ID:",
    numericStateId
  );
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      {
        token: accessToken,
      }
    );

    logResponse(
      "CITIES API RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "CITIES API ERROR:",
      error
    );

    throw error;
  }
}


// =========================================================
// UPDATE MEMBER EDUCATION STATUS
// POST /api/member/education-status/update
//
// Request:
// {
//   "id": 3,
//   "status": 1
// }
// =========================================================

export async function updateMemberEducationStatus(
  accessToken,
  educationId,
  status = 1
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const id = Number(educationId);
  const currentStatus = Number(status);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Valid education ID is required."
    );
  }

  if (![0, 1].includes(currentStatus)) {
    throw new Error(
      "Education status must be 0 or 1."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/education-status/update";

  const user = {
    token: accessToken,
  };

  const body = {
    id: id,
    status: currentStatus,
  };

  console.log(
    "================================="
  );
  console.log(
    "EDUCATION STATUS UPDATE REQUEST"
  );
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log(
    "TOKEN LENGTH:",
    accessToken.length
  );
  console.log(
    "EDUCATION ID:",
    id
  );
  console.log(
    "STATUS:",
    currentStatus
  );
  console.log(
    "REQUEST USER:",
    JSON.stringify(user, null, 2)
  );
  console.log(
    "REQUEST BODY:",
    JSON.stringify(body, null, 2)
  );
  console.log(
    "================================="
  );

  try {
    const response = await postMethod(
      URL,
      user,
      body
    );

    console.log(
      "================================="
    );
    console.log(
      "EDUCATION STATUS UPDATE RESPONSE"
    );
    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );
    console.log(
      "================================="
    );

    return response;
  } catch (error) {
    console.error(
      "EDUCATION STATUS UPDATE ERROR:",
      error
    );

    throw error;
  }
}



// =========================================================
// GET MEMBER EDUCATION
// =========================================================

export async function getMemberEducation(
    accessToken
) {

    if (!accessToken) {
        throw new Error(
            "Access token is missing."
        );
    }

    const URL =
        BASE_URL +
        "/api/member/education";


    const user = {
        token: accessToken,
    };


    console.log(
        "======================================"
    );

    console.log(
        "GET MEMBER EDUCATION API"
    );

    console.log(
        "METHOD: GET"
    );

    console.log(
        "URL:",
        URL
    );

    console.log(
        "TOKEN EXISTS:",
        !!accessToken
    );

    console.log(
        "======================================"
    );


    try {

        const response =
            await getMethod(
                URL,
                user
            );


        console.log(
            "======================================"
        );

        console.log(
            "EDUCATION API RESPONSE"
        );

        console.log(
            JSON.stringify(
                response,
                null,
                2
            )
        );

        console.log(
            "======================================"
        );


        return response;

    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "EDUCATION API ERROR"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );

        throw error;
    }
}

// =========================================================
// GET SINGLE MEMBER EDUCATION
// GET /api/member/education/{id}
// =========================================================

export async function getMemberEducationById(
  accessToken,
  educationId
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing."
    );
  }

  const id = Number(educationId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Valid education ID is required."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/education/" +
    id;

  try {
    const response = await getMethod(
      URL,
      { token: accessToken }
    );

    logResponse(
      "SINGLE EDUCATION API RESPONSE",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "SINGLE EDUCATION API ERROR:",
      error
    );

    throw error;
  }
}


// =========================================================
// ADD MEMBER EDUCATION
// POST /api/member/education
//
// Request:
// {
//   "degree": "B.Tech",
//   "institution": "Gates Institute of Technology",
//   "education_start": 2020,
//   "education_end": 2024
// }
// =========================================================

export async function addMemberEducation(
  accessToken,
  education = {}
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL + "/api/member/education";

  // Convert year values to numbers
  const educationStart = Number(
    education.education_start
  );

  const educationEnd = Number(
    education.education_end
  );

  const degreeValue = String(
    education.degree || ""
  ).trim();

  const institutionValue = String(
    education.institution || ""
  ).trim();

  // =======================================================
  // VALIDATION
  // =======================================================

  if (!degreeValue) {
    throw new Error(
      "Degree / Course is required."
    );
  }

  if (!institutionValue) {
    throw new Error(
      "Institution / College is required."
    );
  }

  if (
    !Number.isInteger(educationStart) ||
    educationStart <= 0
  ) {
    throw new Error(
      "Valid education start year is required."
    );
  }

  if (
    !Number.isInteger(educationEnd) ||
    educationEnd <= 0
  ) {
    throw new Error(
      "Valid education end year is required."
    );
  }

  if (educationEnd < educationStart) {
    throw new Error(
      "Education end year cannot be before start year."
    );
  }

  // =======================================================
  // REQUEST BODY
  // =======================================================

  const body = {
    degree: degreeValue,
    institution: institutionValue,
    education_start: educationStart,
    education_end: educationEnd,
  };

  const user = {
    token: accessToken,
  };

  // =======================================================
  // DEBUG LOG
  // =======================================================

  console.log(
    "======================================"
  );

  console.log(
    "ADD MEMBER EDUCATION API"
  );

  console.log(
    "METHOD: POST"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "TOKEN LENGTH:",
    accessToken.length
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "======================================"
  );

  try {

    const response =
      await postMethod(
        URL,
        user,
        body
      );

    // =====================================================
    // RESPONSE LOG
    // =====================================================

    console.log(
      "======================================"
    );

    console.log(
      "ADD EDUCATION API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    return response;

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "ADD EDUCATION API ERROR"
    );

    console.error(error);

    console.error(
      "======================================"
    );

    throw error;
  }
}
// =========================================================
// UPDATE MEMBER EDUCATION
// PUT /api/member/education/{id}
// =========================================================
//
// Request:
//
// {
//   "degree": "B.Tech Computer Science",
//   "institution": "Gates Institute of Technology",
//   "education_start": 2020,
//   "education_end": 2024
// }
//
// =========================================================

export async function updateMemberEducation(
  accessToken,
  educationId,
  education = {}
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // -------------------------------------------------------
  // ID VALIDATION
  // -------------------------------------------------------

  const numericId =
    Number(educationId);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      "Valid education ID is required."
    );
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL +
    `/api/member/education/${numericId}`;

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const degreeValue =
    String(
      education.degree || ""
    ).trim();

  const institutionValue =
    String(
      education.institution || ""
    ).trim();

  const educationStart =
    Number(
      education.education_start
    );

  const educationEnd =
    Number(
      education.education_end
    );

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!degreeValue) {
    throw new Error(
      "Degree / Course is required."
    );
  }

  if (!institutionValue) {
    throw new Error(
      "Institution / College is required."
    );
  }

  if (
    !Number.isInteger(
      educationStart
    ) ||
    educationStart <= 0
  ) {
    throw new Error(
      "Valid education start year is required."
    );
  }

  if (
    !Number.isInteger(
      educationEnd
    ) ||
    educationEnd <= 0
  ) {
    throw new Error(
      "Valid education end year is required."
    );
  }

  if (
    educationEnd <
    educationStart
  ) {
    throw new Error(
      "Education end year cannot be before start year."
    );
  }

  // -------------------------------------------------------
  // REQUEST BODY
  // -------------------------------------------------------

  const body = {
    degree: degreeValue,

    institution:
      institutionValue,

    education_start:
      educationStart,

    education_end:
      educationEnd,
  };

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // LOG REQUEST
  // -------------------------------------------------------

  console.log(
    "================================="
  );

  console.log(
    "UPDATE MEMBER EDUCATION API"
  );

  console.log(
    "METHOD: PUT"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "EDUCATION ID:",
    numericId
  );

  console.log(
    "BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "================================="
  );

  // -------------------------------------------------------
  // CALL PUT API
  // -------------------------------------------------------

  try {
    const response =
      await putMethod(
        URL,
        user,
        body
      );

    console.log(
      "================================="
    );

    console.log(
      "UPDATE EDUCATION RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "================================="
    );

    return response;

  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "UPDATE EDUCATION API ERROR"
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );

    throw error;
  }
}




// =========================================================
// DELETE MEMBER EDUCATION
// DELETE /api/member/education/{id}
// =========================================================

export async function deleteMemberEducation(
  accessToken,
  educationId
) {
  // -------------------------------------------------------
  // VALIDATE TOKEN
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // -------------------------------------------------------
  // VALIDATE EDUCATION ID
  // -------------------------------------------------------

  const id = Number(educationId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      `Invalid education ID: ${educationId}`
    );
  }

  // -------------------------------------------------------
  // API URL
  // -------------------------------------------------------

  const URL =
    `${BASE_URL}/api/member/education/${id}`;

  console.log("========================================");
  console.log("DELETE MEMBER EDUCATION API");
  console.log("METHOD:", "DELETE");
  console.log("URL:", URL);
  console.log("EDUCATION ID:", id);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log("========================================");

  try {
    // -----------------------------------------------------
    // CALL DELETE API
    // -----------------------------------------------------

    const response = await fetch(URL, {
      method: "DELETE",

      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(
      "DELETE HTTP STATUS:",
      response.status
    );

    console.log(
      "DELETE HTTP OK:",
      response.ok
    );

    // -----------------------------------------------------
    // READ RESPONSE
    // -----------------------------------------------------

    const responseText =
      await response.text();

    console.log(
      "DELETE RESPONSE TEXT:",
      responseText
    );

    // -----------------------------------------------------
    // PARSE RESPONSE
    // -----------------------------------------------------

    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log(
          "DELETE RESPONSE IS NOT JSON"
        );

        data = {
          message: responseText,
        };
      }
    }

    console.log(
      "DELETE RESPONSE DATA:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    // -----------------------------------------------------
    // HANDLE API ERROR
    // -----------------------------------------------------

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.msg ||
        data?.error ||
        `Education delete failed with status ${response.status}`;

      console.error(
        "DELETE EDUCATION FAILED:",
        errorMessage
      );

      const error =
        new Error(errorMessage);

      error.response = {
        status: response.status,
        data: data,
      };

      throw error;
    }

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

    const successMessage =
      data?.message ||
      data?.msg ||
      `Education ID ${id} deleted successfully.`;

    console.log(
      "========================================"
    );

    console.log(
      "EDUCATION DELETE SUCCESS"
    );

    console.log(
      "EDUCATION ID:",
      id
    );

    console.log(
      "STATUS:",
      response.status
    );

    console.log(
      "MESSAGE:",
      successMessage
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // RETURN NORMALIZED RESPONSE
    // -----------------------------------------------------

    return {
      success: true,
      result: true,
      statusCode: response.status,
      message: successMessage,
      data: data,
    };

  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "DELETE MEMBER EDUCATION ERROR"
    );

    console.error(
      "EDUCATION ID:",
      id
    );

    console.error(
      "ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "ERROR RESPONSE:",
      error?.response?.data
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER CAREER
// GET /api/member/career
// =========================================================

export async function getMemberCareer(accessToken) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL + "/api/member/career";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log("GET MEMBER CAREER API");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(
      URL,
      user
    );

    console.log("=================================");
    console.log("CAREER API RESPONSE");
    console.log(
      JSON.stringify(response, null, 2)
    );
    console.log("=================================");

    return response;

  } catch (error) {

    console.error(
      "GET MEMBER CAREER API ERROR:",
      error
    );

    throw error;
  }
}


// =========================================================
// ADD MEMBER CAREER
// POST /api/member/career
//
// Request:
// {
//   "company": "ABC Technologies",
//   "designation": "Software Developer",
//   "start": 2024,
//   "end": 2025
// }
// =========================================================

export async function addMemberCareer(
  accessToken,
  career = {}
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }


  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL + "/api/member/career";


  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const companyValue =
    String(career.company || "").trim();

  const designationValue =
    String(career.designation || "").trim();

  const startYear =
    Number(career.start);

  const endYear =
    Number(career.end);


  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!companyValue) {
    throw new Error(
      "Company is required."
    );
  }


  if (!designationValue) {
    throw new Error(
      "Designation is required."
    );
  }


  if (
    !Number.isInteger(startYear) ||
    startYear <= 0
  ) {
    throw new Error(
      "Valid start year is required."
    );
  }


  if (
    !Number.isInteger(endYear) ||
    endYear <= 0
  ) {
    throw new Error(
      "Valid end year is required."
    );
  }


  if (endYear < startYear) {
    throw new Error(
      "End year cannot be before start year."
    );
  }


  // -------------------------------------------------------
  // REQUEST BODY
  // -------------------------------------------------------

  const body = {
    company: companyValue,

    designation: designationValue,

    start: startYear,

    end: endYear,
  };


  // -------------------------------------------------------
  // TOKEN
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };


  // -------------------------------------------------------
  // DEBUG LOG
  // -------------------------------------------------------

  console.log(
    "======================================"
  );

  console.log(
    "ADD MEMBER CAREER API"
  );

  console.log(
    "METHOD: POST"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "TOKEN LENGTH:",
    accessToken.length
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "======================================"
  );


  // -------------------------------------------------------
  // CALL POST API
  // -------------------------------------------------------

  try {

    const response =
      await postMethod(
        URL,
        user,
        body
      );


    // -----------------------------------------------------
    // RESPONSE LOG
    // -----------------------------------------------------

    console.log(
      "======================================"
    );

    console.log(
      "ADD CAREER API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );


    return response;

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "ADD MEMBER CAREER API ERROR"
    );

    console.error(error);

    console.error(
      "======================================"
    );

    throw error;
  }
}


// =========================================================
// GET SINGLE MEMBER CAREER
// GET /api/member/career/{id}
// Example: /api/member/career/1
// =========================================================

export async function getMemberCareerById(
  accessToken,
  careerId
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // -------------------------------------------------------
  // ID VALIDATION
  // -------------------------------------------------------

  const id = Number(careerId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Valid career ID is required."
    );
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL +
    `/api/member/career/${id}`;

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG LOG
  // -------------------------------------------------------

  console.log(
    "======================================"
  );

  console.log(
    "GET SINGLE MEMBER CAREER API"
  );

  console.log(
    "METHOD: GET"
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
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "======================================"
  );

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {

    const response =
      await getMethod(
        URL,
        user
      );

    // -----------------------------------------------------
    // RESPONSE LOG
    // -----------------------------------------------------

    console.log(
      "======================================"
    );

    console.log(
      "SINGLE CAREER API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    return response;

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "SINGLE CAREER API ERROR:",
      error
    );

    console.error(
      "======================================"
    );

    throw error;
  }
}


// =========================================================
// UPDATE SINGLE MEMBER CAREER
// PUT /api/member/career/{id}
//
// Request:
// {
//   "company": "ABC Technologies",
//   "designation": "Software Developer",
//   "start": 2024,
//   "end": 2025
// }
// =========================================================

export async function updateMemberCareerById(
  accessToken,
  careerId,
  career = {}
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // -------------------------------------------------------
  // ID VALIDATION
  // -------------------------------------------------------

  const id = Number(careerId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Valid career ID is required."
    );
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL +
    `/api/member/career/${id}`;

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const companyValue =
    String(career.company || "").trim();

  const designationValue =
    String(career.designation || "").trim();

  const startYear =
    Number(career.start);

  const endYear =
    Number(career.end);

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!companyValue) {
    throw new Error(
      "Company is required."
    );
  }

  if (!designationValue) {
    throw new Error(
      "Designation is required."
    );
  }

  if (
    !Number.isInteger(startYear) ||
    startYear <= 0
  ) {
    throw new Error(
      "Valid start year is required."
    );
  }

  if (
    !Number.isInteger(endYear) ||
    endYear <= 0
  ) {
    throw new Error(
      "Valid end year is required."
    );
  }

  if (endYear < startYear) {
    throw new Error(
      "End year cannot be before start year."
    );
  }

  // -------------------------------------------------------
  // REQUEST BODY
  // -------------------------------------------------------

  const body = {
    company: companyValue,
    designation: designationValue,
    start: startYear,
    end: endYear,
  };

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG
  // -------------------------------------------------------

  console.log(
    "======================================"
  );

  console.log(
    "UPDATE MEMBER CAREER API"
  );

  console.log(
    "METHOD: PUT"
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
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "======================================"
  );

  // -------------------------------------------------------
  // PUT API CALL
  // -------------------------------------------------------

  try {
    const response =
      await putMethod(
        URL,
        user,
        body
      );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log(
      "======================================"
    );

    console.log(
      "UPDATE CAREER API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    return response;

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "UPDATE CAREER API ERROR:",
      error
    );

    console.error(
      "======================================"
    );

    throw error;
  }
}
// =========================================================
// DELETE MEMBER CAREER
// DELETE /api/member/career/{id}
// =========================================================

export async function deleteMemberCareerById(
    accessToken,
    careerId
) {
    // -------------------------------------------------------
    // TOKEN VALIDATION
    // -------------------------------------------------------

    if (!accessToken) {
        throw new Error(
            "Access token is missing. Please login again."
        );
    }

    // -------------------------------------------------------
    // ID VALIDATION
    // -------------------------------------------------------

    const id = Number(careerId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new Error(
            `Invalid career ID: ${careerId}`
        );
    }

    // -------------------------------------------------------
    // URL
    // -------------------------------------------------------

    const URL =
        `${BASE_URL}/api/member/career/${id}`;

    // -------------------------------------------------------
    // DEBUG
    // -------------------------------------------------------

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
        "TOKEN EXISTS:",
        !!accessToken
    );

    console.log(
        "TOKEN LENGTH:",
        accessToken?.length || 0
    );

    console.log(
        "========================================"
    );

    try {
        // ---------------------------------------------------
        // DIRECT DELETE REQUEST
        // ---------------------------------------------------

        const response = await fetch(
            URL,
            {
                method: "DELETE",

                headers: {
                    Accept:
                        "application/json",

                    Authorization:
                        `Bearer ${accessToken}`,
                },
            }
        );

        // ---------------------------------------------------
        // HTTP STATUS
        // ---------------------------------------------------

        console.log(
            "DELETE HTTP STATUS:",
            response.status
        );

        console.log(
            "DELETE HTTP OK:",
            response.ok
        );

        // ---------------------------------------------------
        // READ RESPONSE
        // ---------------------------------------------------

        const responseText =
            await response.text();

        console.log(
            "DELETE RESPONSE TEXT:",
            responseText
        );

        // ---------------------------------------------------
        // PARSE JSON
        // ---------------------------------------------------

        let data = {};

        if (responseText) {
            try {
                data =
                    JSON.parse(
                        responseText
                    );
            } catch (parseError) {
                console.log(
                    "DELETE RESPONSE IS NOT JSON"
                );

                data = {
                    message:
                        responseText,
                };
            }
        }

        console.log(
            "DELETE RESPONSE DATA:",
            JSON.stringify(
                data,
                null,
                2
            )
        );

        // ---------------------------------------------------
        // HTTP FAILURE
        // ---------------------------------------------------

        if (
            !response.ok
        ) {
            const errorMessage =
                data?.message ||
                data?.msg ||
                data?.error ||
                `Delete failed with status ${response.status}`;

            console.error(
                "DELETE CAREER FAILED:",
                errorMessage
            );

            const error =
                new Error(
                    errorMessage
                );

            error.response = {
                status:
                    response.status,

                data:
                    data,
            };

            throw error;
        }

        // ---------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------

        const successMessage =
            data?.message ||
            data?.msg ||
            `Career ID ${id} deleted successfully.`;

        console.log(
            "========================================"
        );

        console.log(
            "CAREER DELETE SUCCESS"
        );

        console.log(
            "CAREER ID:",
            id
        );

        console.log(
            "STATUS:",
            response.status
        );

        console.log(
            "MESSAGE:",
            successMessage
        );

        console.log(
            "========================================"
        );

        // ---------------------------------------------------
        // RETURN NORMALIZED RESPONSE
        // ---------------------------------------------------

        return {
            success: true,
            result: true,
            statusCode:
                response.status,

            message:
                successMessage,

            data:
                data,
        };

    } catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "DELETE MEMBER CAREER ERROR"
        );

        console.error(
            "CAREER ID:",
            id
        );

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "STATUS:",
            error?.response?.status
        );

        console.error(
            "RESPONSE:",
            JSON.stringify(
                error?.response?.data,
                null,
                2
            )
        );

        console.error(
            "========================================"
        );

        throw error;
    }
}


// =========================================================
// GET MEMBER SPIRITUAL & SOCIAL BACKGROUND
// GET /api/member/spiritual-background
// =========================================================

export async function getMemberSpiritualBackground(
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/spiritual-background";

  const user = {
    token: accessToken,
  };

  console.log(
    "========================================"
  );
  console.log(
    "GET MEMBER SPIRITUAL BACKGROUND API"
  );
  console.log("METHOD:", "GET");
  console.log("URL:", URL);
  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );
  console.log(
    "========================================"
  );

  try {
    const response = await getMethod(
      URL,
      user
    );

    console.log(
      "========================================"
    );
    console.log(
      "FULL SPIRITUAL BACKGROUND RESPONSE"
    );
    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );
    console.log(
      "========================================"
    );

    return response;
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "SPIRITUAL BACKGROUND API ERROR"
    );
    console.error(
      "MESSAGE:",
      error?.message
    );
    console.error(
      "STATUS:",
      error?.response?.status
    );
    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data ?? {},
        null,
        2
      )
    );
    console.error(
      "========================================"
    );

    throw error;
  }
}


// =========================================================
// UPDATE MEMBER SPIRITUAL & SOCIAL BACKGROUND
// POST /api/member/spiritual-background/update
// =========================================================

export async function updateMemberSpiritualBackground(
  accessToken,
  spiritualBackground = {}
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/spiritual-background/update";

  const religionId = Number(
    spiritualBackground.religion_id
  );

  const casteId = Number(
    spiritualBackground.caste_id
  );

  const subCasteId = Number(
    spiritualBackground.sub_caste_id
  );

  const familyValueId = Number(
    spiritualBackground.family_value_id
  );

  if (
    !Number.isInteger(religionId) ||
    religionId <= 0
  ) {
    throw new Error(
      "Valid religion ID is required."
    );
  }

  if (
    !Number.isInteger(casteId) ||
    casteId <= 0
  ) {
    throw new Error(
      "Valid caste ID is required."
    );
  }

  if (
    !Number.isInteger(subCasteId) ||
    subCasteId <= 0
  ) {
    throw new Error(
      "Valid sub-caste ID is required."
    );
  }

  if (
    !Number.isInteger(familyValueId) ||
    familyValueId <= 0
  ) {
    throw new Error(
      "Valid family value ID is required."
    );
  }

  const body = {
    religion_id: religionId,
    caste_id: casteId,
    sub_caste_id: subCasteId,

    ethnicity: String(
      spiritualBackground.ethnicity ?? ""
    ).trim(),

    personal_value: String(
      spiritualBackground.personal_value ?? ""
    ).trim(),

    family_value_id: familyValueId,

    community_value: String(
      spiritualBackground.community_value ?? ""
    ).trim(),
  };

  const user = {
    token: accessToken,
  };

  console.log(
    "========================================"
  );

  console.log(
    "UPDATE MEMBER SPIRITUAL BACKGROUND API"
  );

  console.log(
    "METHOD:",
    "POST"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "REQUEST BODY:"
  );

  console.log(
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "========================================"
  );

  try {
    const response =
      await postMethod(
        URL,
        user,
        body
      );

    console.log(
      "========================================"
    );

    console.log(
      "UPDATE SPIRITUAL BACKGROUND RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );

    return response;
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "UPDATE SPIRITUAL BACKGROUND ERROR"
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data ?? {},
        null,
        2
      )
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER ASTRONOMIC INFORMATION
// GET /api/member/astronomic
// =========================================================

export async function getMemberAstronomic(
  accessToken
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL +
    "/api/member/astronomic";

  // -------------------------------------------------------
  // AUTH USER
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG REQUEST
  // -------------------------------------------------------

  console.log(
    "========================================"
  );

  console.log(
    "GET MEMBER ASTRONOMIC API"
  );

  console.log(
    "METHOD:",
    "GET"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "TOKEN LENGTH:",
    accessToken?.length
  );

  console.log(
    "========================================"
  );

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {

    const response =
      await getMethod(
        URL,
        user
      );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log(
      "========================================"
    );

    console.log(
      "ASTRONOMIC API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );

    return response;

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "GET MEMBER ASTRONOMIC API ERROR"
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "ERROR:",
      error
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}



// =========================================================
// UPDATE MEMBER ASTRONOMIC INFORMATION
// POST /api/member/astronomic/update
//
// Request:
//
// {
//   "sun_sign": "Swati Nakshatram",
//   "moon_sign": "Meena rasi",
//   "time_of_birth": "7am",
//   "city_of_birth": "Anantapur"
// }
// =========================================================

export async function updateMemberAstronomic(
  accessToken,
  {
    sun_sign,
    moon_sign,
    time_of_birth,
    city_of_birth,
  } = {}
) {

  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }


  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL +
    "/api/member/astronomic/update";


  // -------------------------------------------------------
  // USER / AUTH
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };


  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const sunSignValue =
    String(sun_sign ?? "").trim();

  const moonSignValue =
    String(moon_sign ?? "").trim();

  const timeOfBirthValue =
    String(time_of_birth ?? "").trim();

  const cityOfBirthValue =
    String(city_of_birth ?? "").trim();


  // -------------------------------------------------------
  // REQUEST BODY
  // -------------------------------------------------------

  const body = {
    sun_sign: sunSignValue,
    moon_sign: moonSignValue,
    time_of_birth: timeOfBirthValue,
    city_of_birth: cityOfBirthValue,
  };


  // -------------------------------------------------------
  // DEBUG LOG
  // -------------------------------------------------------

  console.log(
    "========================================"
  );

  console.log(
    "UPDATE MEMBER ASTRONOMIC API"
  );

  console.log(
    "METHOD:",
    "POST"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "TOKEN LENGTH:",
    accessToken?.length
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "========================================"
  );


  // -------------------------------------------------------
  // POST API
  // -------------------------------------------------------

  try {

    const response =
      await postMethod(
        URL,
        user,
        body
      );


    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log(
      "========================================"
    );

    console.log(
      "UPDATE ASTRONOMIC API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );


    return response;

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "UPDATE MEMBER ASTRONOMIC API ERROR"
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data,
        null,
        2
      )
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}

// =========================================================
// GET MEMBER FAMILY INFORMATION
// GET /api/member/family-info
// =========================================================

export async function getMemberFamilyInfo(
  accessToken
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/family-info";

  const user = {
    token: accessToken,
  };

  console.log(
    "========================================"
  );

  console.log(
    "GET MEMBER FAMILY INFORMATION API"
  );

  console.log(
    "METHOD:",
    "GET"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "TOKEN LENGTH:",
    accessToken?.length || 0
  );

  console.log(
    "========================================"
  );

  try {
    const response =
      await getMethod(
        URL,
        user
      );

    console.log(
      "========================================"
    );

    console.log(
      "FAMILY INFORMATION API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );

    return response;
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "GET MEMBER FAMILY INFORMATION API ERROR"
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data,
        null,
        2
      )
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}


// =========================================================
// UPDATE MEMBER FAMILY INFORMATION
// POST /api/member/family-info/update
// =========================================================

export async function updateMemberFamilyInfo(
  accessToken,
  familyInfo = {}
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/family-info/update";

  const user = {
    token: accessToken,
  };

  const fatherValue =
    String(
      familyInfo.father ?? ""
    ).trim();

  const motherValue =
    String(
      familyInfo.mother ?? ""
    ).trim();

  const siblingValue =
    String(
      familyInfo.sibling ?? ""
    ).trim();

  if (!fatherValue) {
    throw new Error(
      "Father name is required."
    );
  }

  if (!motherValue) {
    throw new Error(
      "Mother name is required."
    );
  }

  if (!siblingValue) {
    throw new Error(
      "Sibling information is required."
    );
  }

  const body = {
    father: fatherValue,
    mother: motherValue,
    sibling: siblingValue,
  };

  console.log(
    "========================================"
  );

  console.log(
    "UPDATE MEMBER FAMILY INFORMATION API"
  );

  console.log(
    "METHOD:",
    "POST"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "TOKEN LENGTH:",
    accessToken.length
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "========================================"
  );

  try {
    const response =
      await postMethod(
        URL,
        user,
        body
      );

    console.log(
      "========================================"
    );

    console.log(
      "UPDATE FAMILY INFORMATION RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );

    return response;
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "UPDATE FAMILY INFORMATION API ERROR"
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data,
        null,
        2
      )
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}
// =========================================================
// GET MEMBER LANGUAGES
// GET /api/member/languages
// =========================================================

export async function getMemberLanguages(accessToken) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL + "/api/member/languages";

  const user = {
    token: accessToken,
  };

  console.log("========================================");
  console.log("GET MEMBER LANGUAGES API");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("========================================");

  try {
    const response = await getMethod(
      URL,
      user
    );

    console.log("========================================");
    console.log("MEMBER LANGUAGES API RESPONSE");
    console.log(
      JSON.stringify(response, null, 2)
    );
    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");
    console.error("GET MEMBER LANGUAGES ERROR");
    console.error("MESSAGE:", error?.message);
    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data,
        null,
        2
      )
    );
    console.error("========================================");

    throw error;
  }
}


// =========================================================
// UPDATE MEMBER LANGUAGES
// POST /api/member/language/update
// =========================================================

export async function updateMemberLanguages(
  accessToken,
  {
    mother_tongue,
    known_languages,
  } = {}
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // IMPORTANT:
  // singular "language", NOT "languages"
  const URL =
    BASE_URL +
    "/api/member/language/update";

  const user = {
    token: accessToken,
  };

  const body = {
    mother_tongue:
      String(
        mother_tongue ?? ""
      ).trim(),

    known_languages:
      Array.isArray(
        known_languages
      )
        ? known_languages
            .map((item) =>
              String(item ?? "").trim()
            )
            .filter(Boolean)
        : [],
  };

  console.log(
    "========================================"
  );

  console.log(
    "UPDATE MEMBER LANGUAGES API"
  );

  console.log(
    "METHOD: POST"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "REQUEST BODY:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "========================================"
  );

  try {

    const response =
      await postMethod(
        URL,
        user,
        body
      );

    console.log(
      "========================================"
    );

    console.log(
      "UPDATE MEMBER LANGUAGES RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "========================================"
    );

    return response;

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "UPDATE MEMBER LANGUAGES ERROR"
    );

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data,
        null,
        2
      )
    );

    console.error(
      "========================================"
    );

    throw error;
  }
}



// =========================================================
// GET MEMBER RELIGIONS
// GET /api/member/religions
// =========================================================

export async function getMemberReligions(accessToken) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL =
    BASE_URL + "/api/member/religions";

  // -------------------------------------------------------
  // TOKEN
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG
  // -------------------------------------------------------

  console.log(
    "======================================"
  );

  console.log(
    "GET MEMBER RELIGIONS API"
  );

  console.log(
    "METHOD:",
    "GET"
  );

  console.log(
    "URL:",
    URL
  );

  console.log(
    "TOKEN EXISTS:",
    !!accessToken
  );

  console.log(
    "======================================"
  );

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {
    const response = await getMethod(
      URL,
      user
    );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log(
      "======================================"
    );

    console.log(
      "RELIGIONS API RESPONSE"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    return response;

  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "RELIGIONS API ERROR"
    );

    console.error(error);

    console.error(
      "ERROR RESPONSE:",
      JSON.stringify(
        error?.response?.data ??
          error,
        null,
        2
      )
    );

    console.error(
      "======================================"
    );

    throw error;
  }
}



export async function getMemberCasts(
  accessToken,
  religionId
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const id = Number(religionId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `Invalid religion ID: ${religionId}`
    );
  }

  const URL =
    BASE_URL +
    `/api/member/casts/${id}`;

  console.log(
    "========================================"
  );
  console.log("GET MEMBER CASTS");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("RELIGION ID:", id);
  console.log(
    "========================================"
  );

  try {
    const response =
      await getMethod(
        URL,
        {
          token: accessToken,
        }
      );

    console.log(
      "CAST API RESPONSE:"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    return response;
  } catch (error) {
    console.error(
      "CAST API ERROR:",
      error
    );

    console.error(
      "CAST API ERROR RESPONSE:",
      JSON.stringify(
        error?.response?.data ?? {},
        null,
        2
      )
    );

    throw error;
  }
}


export async function getMemberSubCasts(
  accessToken,
  casteId
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const id = Number(casteId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `Invalid caste ID: ${casteId}`
    );
  }

  const URL =
    BASE_URL +
    `/api/member/sub-casts/${id}`;

  console.log(
    "========================================"
  );
  console.log(
    "GET MEMBER SUB CASTES API"
  );
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("CASTE ID:", id);
  console.log(
    "========================================"
  );

  try {
    const response =
      await getMethod(
        URL,
        {
          token: accessToken,
        }
      );

    console.log(
      "SUB CASTES API RESPONSE:"
    );

    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );

    return response;
  } catch (error) {
    console.error(
      "SUB CASTES API ERROR:",
      error
    );

    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data ?? {},
        null,
        2
      )
    );

    throw error;
  }
}




// =========================================================
// GET MEMBER FAMILY VALUES
// GET /api/member/family-values
// =========================================================

export async function getMemberFamilyValues(accessToken) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing. Please login again."
    );
  }

  const URL =
    BASE_URL + "/api/member/family-values";

  const user = {
    token: accessToken,
  };

  console.log("========================================");
  console.log("GET MEMBER FAMILY VALUES");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("========================================");

  try {
    const response = await getMethod(
      URL,
      user
    );

    console.log("========================================");
    console.log("FAMILY VALUES API RESPONSE");
    console.log(
      JSON.stringify(response, null, 2)
    );
    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");
    console.error("FAMILY VALUES API ERROR");
    console.error("MESSAGE:", error?.message);
    console.error(
      "STATUS:",
      error?.response?.status
    );
    console.error(
      "RESPONSE:",
      JSON.stringify(
        error?.response?.data ?? {},
        null,
        2
      )
    );
    console.error("========================================");

    throw error;
  }
}