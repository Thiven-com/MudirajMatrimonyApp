
// =========================================================
// Functions.js
// =========================================================

import BASE_URL from "../constants/AppUrls";

import {
  deleteMethod,
  getMethod,
  postMethod,
  putMethod,
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





/* =========================================================
   DELETE MEMBER EDUCATION
   DELETE /api/member/education/{id}
========================================================= */

export async function deleteMemberEducation(
    accessToken,
    educationId
) {
    try {
        const id = Number(educationId);

        if (!accessToken) {
            throw new Error("Access token is missing.");
        }

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(`Invalid education ID: ${educationId}`);
        }

        const url =
            `${BASE_URL}/api/member/education/${id}`;

        console.log("================================");
        console.log("DELETE API START");
        console.log("URL:", url);
        console.log("METHOD: DELETE");
        console.log("ID:", id);
        console.log("TOKEN:", accessToken ? "YES" : "NO");
        console.log("================================");

        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        console.log("DELETE STATUS:", res.status);

        const text = await res.text();

        console.log("DELETE RESPONSE TEXT:", text);

        let data = {};

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = {
                    message: text,
                };
            }
        }

        console.log(
            "DELETE RESPONSE JSON:",
            JSON.stringify(data, null, 2)
        );

        if (res.status >= 200 && res.status < 300) {
            return {
                success: true,
                result: true,
                statusCode: res.status,
                data,
            };
        }

        throw new Error(
            data?.message ||
            data?.error ||
            `DELETE failed with status ${res.status}`
        );

    } catch (error) {

        console.error(
            "DELETE MEMBER EDUCATION ERROR:",
            error
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



// =========================================================
// GET MEMBER SPIRITUAL & SOCIAL BACKGROUND
// GET /api/member/spiritual-background
// =========================================================

export async function getMemberSpiritualBackground(
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
    "/api/member/spiritual-background";

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
    "GET MEMBER SPIRITUAL BACKGROUND API"
  );

  console.log("METHOD:", "GET");

  console.log("URL:", URL);

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
      "SPIRITUAL BACKGROUND API RESPONSE"
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
      "SPIRITUAL BACKGROUND API ERROR"
    );

    console.error(error);

    console.error(
      "======================================"
    );

    throw error;
  }
}





// =========================================================
// UPDATE MEMBER SPIRITUAL & SOCIAL BACKGROUND
// POST /api/member/spiritual-background/update
//
// Request:
// {
//   "religion_id": 1,
//   "caste_id": 2,
//   "sub_caste_id": 3,
//   "ethnicity": "American Indians",
//   "personal_value": "Yes",
//   "family_value_id": 1,
//   "community_value": "Yes"
// }
// =========================================================
export async function updateMemberSpiritualBackground(
  accessToken,
  spiritualBackground
) {
  if (!accessToken) {
    throw new Error(
      "Access token is missing."
    );
  }

  const URL =
    BASE_URL +
    "/api/member/spiritual-background/update";

  const body = {
    religion_id: Number(
      spiritualBackground.religion_id
    ),

    caste_id: Number(
      spiritualBackground.caste_id
    ),

    sub_caste_id: Number(
      spiritualBackground.sub_caste_id
    ),

    ethnicity: String(
      spiritualBackground.ethnicity || ""
    ).trim(),

    personal_value: String(
      spiritualBackground.personal_value || ""
    ).trim(),

    family_value_id: Number(
      spiritualBackground.family_value_id
    ),

    community_value: String(
      spiritualBackground.community_value || ""
    ).trim(),
  };

  console.log(
    "========== SPIRITUAL UPDATE API =========="
  );

  console.log("URL:", URL);

  console.log("METHOD: POST");

  console.log(
    "BODY:",
    JSON.stringify(body, null, 2)
  );

  console.log(
    "==========================================="
  );

  const user = {
    token: accessToken,
  };

  return await postMethod(
    URL,
    user,
    body
  );
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
    "/api/member/family-info";


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
//
// Request:
// {
//   "father": "Sudhakar",
//   "mother": "Swaroopa",
//   "sibling": "2"
// }
// =========================================================

export async function updateMemberFamilyInfo(
  accessToken,
  familyInfo = {}
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
    "/api/member/family-info/update";

  // -------------------------------------------------------
  // AUTH USER
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const fatherValue = String(
    familyInfo.father ?? ""
  ).trim();

  const motherValue = String(
    familyInfo.mother ?? ""
  ).trim();

  const siblingValue = String(
    familyInfo.sibling ?? ""
  ).trim();

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!fatherValue) {
    throw new Error("Father name is required.");
  }

  if (!motherValue) {
    throw new Error("Mother name is required.");
  }

  if (!siblingValue) {
    throw new Error("Sibling information is required.");
  }

  // -------------------------------------------------------
  // REQUEST BODY
  // -------------------------------------------------------

  const body = {
    father: fatherValue,
    mother: motherValue,
    sibling: siblingValue,
  };

  // -------------------------------------------------------
  // DEBUG LOG
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // API CALL
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
      error
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


export async function getMemberLanguages(accessToken) {
  try {
    console.log("========================================");
    console.log("GET MEMBER LANGUAGES FUNCTION");
    console.log("TOKEN EXISTS:", !!accessToken);
    console.log("TOKEN LENGTH:", accessToken?.length);
    console.log("========================================");

    const URL =
      BASE_URL + "/api/member/languages";

    const user = {
      token: accessToken,
    };

    console.log("LANGUAGES GET URL:", URL);
    console.log(
      "LANGUAGES GET USER:",
      {
        tokenExists: !!user.token,
      }
    );

    const response =
      await getMethod(
        URL,
        user
      );

    console.log("========================================");
    console.log("GET MEMBER LANGUAGES RAW RESPONSE");
    console.log(
      JSON.stringify(
        response,
        null,
        2
      )
    );
    console.log("========================================");

    return response;

  } catch (error) {

    console.error("========================================");
    console.error("GET MEMBER LANGUAGES ERROR");
    console.error(error);

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "ERROR DATA:",
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

  const URL =
    BASE_URL +
    "/api/member/language/update";

  const user = {
    token: accessToken,
  };

  const cleanMotherTongue =
    String(
      mother_tongue ?? ""
    ).trim();

  const cleanKnownLanguages =
    Array.isArray(known_languages)
      ? [
          ...new Map(
            known_languages
              .map((item) =>
                String(
                  item ?? ""
                ).trim()
              )
              .filter(Boolean)
              .map((item) => [
                item.toLowerCase(),
                item,
              ])
          ).values(),
        ]
      : [];

  const body = {
    mother_tongue:
      cleanMotherTongue,

    known_languages:
      cleanKnownLanguages,
  };

  console.log(
    "========================================"
  );

  console.log(
    "UPDATE MEMBER LANGUAGES"
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