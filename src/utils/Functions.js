import BASE_URL from "../constants/AppUrls";
import { postMethod } from "./APIServices";

function normalizeMobile(mobile) {
  return String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);
}

export async function sendLoginOtp(mobile) {
  const normalizedMobile = normalizeMobile(mobile);
  const endpointCandidates = [
    BASE_URL + "/api/sendLoginOtp",
    BASE_URL + "/api/customer/sendLoginOtp",
    BASE_URL + "/api/send-login-otp",
    BASE_URL + "/api/customer/send-login-otp",
    BASE_URL + "/api/signin",
    BASE_URL + "/api/customer/signin",
  ];

  const payloadCandidates = [
    { mobile: normalizedMobile },
    { email_or_phone: normalizedMobile },
    { phone: normalizedMobile },
    { mobile_number: normalizedMobile },
  ];

  for (const URL of endpointCandidates) {
    for (const payload of payloadCandidates) {
      try {
        const result = await postMethod(URL, null, payload);
        if (result && typeof result === "object") {
          return result;
        }
      } catch (error) {
        console.log("sendLoginOtp Error:", error);
      }
    }
  }

  return {
    result: false,
    message: "Unable to send OTP right now.",
    user: null,
  };
}

export async function signup(payload = {}) {
  const normalizedMobile = normalizeMobile(payload.mobile || payload.phone);
  const endpointCandidates = [
    BASE_URL + "/api/signup",
    BASE_URL + "/api/customer/signup",
    BASE_URL + "/api/register",
    BASE_URL + "/api/customer/register",
  ];

  const bodyCandidates = [
    {
      full_name: payload.fullName,
      name: payload.fullName,
      mobile: normalizedMobile,
      email: payload.email,
      dob: payload.dob,
      gender: payload.gender,
      agreed: payload.agreed,
    },
    {
      fullName: payload.fullName,
      mobile: normalizedMobile,
      email: payload.email,
      dob: payload.dob,
      gender: payload.gender,
      agreed: payload.agreed,
    },
    {
      first_name: payload.fullName,
      mobile: normalizedMobile,
      email: payload.email,
      dob: payload.dob,
      gender: payload.gender,
      agreed: payload.agreed,
    },
  ];

  for (const URL of endpointCandidates) {
    for (const body of bodyCandidates) {
      try {
        const result = await postMethod(URL, null, body);
        if (result && typeof result === "object") {
          return result;
        }
      } catch (error) {
        console.log("signup Error:", error);
      }
    }
  }

  return {
    result: false,
    message: "Unable to create account right now.",
    user: null,
  };
}

export async function login(mobile) {
  const normalizedMobile = normalizeMobile(mobile);
  const URL = BASE_URL + "/api/signin";

  try {
    const result = await postMethod(URL, null, {
      email_or_phone: normalizedMobile,
    });

    console.log("Signin response:", result);

    return result;
  } catch (error) {
    console.log("Signin Error:", error);
    throw error;
  }
}
