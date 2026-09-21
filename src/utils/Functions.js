import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../constants/AppUrls";
import { getMethod, postMethod } from "./APIServices";

// ==================== SHARED AUTH TOKEN HELPER ====================
// Centralized token lookup — checks the primary "authToken" key, then
// falls back to a parsed "userdata" blob, then a handful of legacy/
// alternate key names various screens have used historically.
export const getToken = async () => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");
    if (authToken) return authToken;

    const userdata = await AsyncStorage.getItem("userdata");
    if (userdata) {
      try {
        const parsed = JSON.parse(userdata);
        const token =
          parsed?.data?.token || parsed?.token || parsed?.access_token || null;
        if (token) return token;
      } catch (error) {
        console.log("getToken userdata parse error:", error);
      }
    }

    const fallbackKeys = [
      "token",
      "access_token",
      "userToken",
      "auth_token",
      "user",
      "user_data",
    ];
    for (const key of fallbackKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        // Some of these keys store a raw token string, others store a
        // JSON blob with the token nested inside — handle both.
        try {
          const parsed = JSON.parse(value);
          const nested =
            parsed?.token || parsed?.access_token || parsed?.data?.token;
          if (nested) return nested;
        } catch {
          // Not JSON — treat the raw string as the token itself.
          return value;
        }
      }
    }

    return null;
  } catch (error) {
    console.log("getToken Error:", error);
    return null;
  }
};

// ==================== SHARED DEBUG / VALIDATION HELPERS ====================

// Throws a consistent error when a required access token is missing.
// Used at the top of every authenticated API call below.
function requireToken(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }
}

// Consistent, safe console logging for API responses.
// Wrapped in try/catch so a circular-reference or huge payload never
// crashes the caller just because logging failed.
function logResponse(label, response) {
  try {
    console.log("=================================");
    console.log(label);
    console.log(JSON.stringify(response, null, 2));
    console.log("=================================");
  } catch (e) {
    console.log(label, response);
  }
}

function normalizeMobile(mobile) {
  return String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);
}

// Joins BASE_URL + path safely, collapsing any accidental double slash
// (e.g. if BASE_URL has a trailing slash configured in AppUrls.js).
function apiUrl(path) {
  return `${String(BASE_URL).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

// Converts "DD/MM/YYYY" or "DD / MM / YYYY" -> "YYYY-MM-DD" for the API.
// Falls back to returning the original string unchanged if it doesn't
// match the expected shape, rather than throwing.
function normalizeDob(dob) {
  if (!dob) return "";
  const parts = String(dob)
    .split("/")
    .map((p) => p.trim());
  if (parts.length !== 3) return dob;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return dob;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

// ==================== REGISTRATION API ====================
export async function signup(userData) {
  const URL = apiUrl("/api/signup");

  const payload = {
    first_name: userData.firstName || "",
    last_name: userData.lastName || "",
    email: userData.email,
    phone: normalizeMobile(userData.mobile),
    date_of_birth: normalizeDob(userData.dob),
    gender: (userData.gender || "").toLowerCase(),
    on_behalf: parseInt(userData.onBehalf) || 0, // Integer value
  };

  try {
    console.log("signup request URL:", URL);
    console.log("signup request payload:", payload);
    const result = await postMethod(URL, null, payload);

    console.log("signup response:", JSON.stringify(result));

    if (result?.result === true || result?.success === 1) {
      return {
        success: 1,
        result: true,
        message: "Registration successful",
        user: result?.user || result?.data,
      };
    }

    // Handle validation errors from API
    let errorMessage = "Unable to register. Please try again.";
    if (typeof result?.message === "object" && result?.message !== null) {
      // Format: { "field_name": ["error message"] }
      const errors = Object.values(result.message).flat().filter(Boolean);
      errorMessage = errors.length > 0 ? errors[0] : errorMessage;
    } else if (typeof result?.message === "string") {
      errorMessage = result.message;
    }

    return {
      success: 0,
      result: false,
      message: errorMessage,
      user: null,
    };
  } catch (error) {
    console.log("signup Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Registration failed.",
      user: null,
    };
  }
}

// ==================== LOGIN OTP API ====================
export async function sendLoginOtp(mobile) {
  const URL = apiUrl("/api/login");

  const payload = {
    phone: normalizeMobile(mobile),
  };

  try {
    console.log("sendLoginOtp request URL:", URL);
    console.log("sendLoginOtp request payload:", payload);
    const result = await postMethod(URL, null, payload);

    console.log("sendLoginOtp response:", JSON.stringify(result));

    if (result?.result === true || result?.success === 1) {
      return {
        success: 1,
        result: true,
        message: result?.message || "OTP sent successfully",
        userNotFound: false,
      };
    }

    // Check if user not found
    if (
      result?.message?.toLowerCase().includes("user not found") ||
      result?.message?.toLowerCase().includes("no user")
    ) {
      return {
        success: 0,
        result: false,
        message: result?.message || "User not found",
        userNotFound: true,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to send OTP. Please try again.",
      userNotFound: false,
    };
  } catch (error) {
    console.log("sendLoginOtp Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to send OTP.",
      userNotFound: false,
    };
  }
}

// ==================== VERIFY OTP API ====================
export async function verifyLoginOtp(mobile, code, sessionToken) {
  const URL = apiUrl("/api/verifyMobile");

  const payload = {
    phone: normalizeMobile(mobile),
    otp: code || "",
  };

  try {
    console.log("verifyLoginOtp request URL:", URL);
    console.log("verifyLoginOtp request payload:", payload);

    const result = await postMethod(URL, null, payload);

    console.log("verifyLoginOtp response:", JSON.stringify(result));

    if (result?.result === true || result?.success === 1) {
      console.log("token:", result?.access_token);

      return {
        success: 1,
        result: true,
        message: result?.message || "OTP verified successfully",
        user: result?.user,
        token: result?.access_token,
        tokenType: result?.token_type,
        userNotFound: false,
      };
    }

    // Check if user not found
    if (
      result?.message?.toLowerCase().includes("user not found") ||
      result?.message?.toLowerCase().includes("no user")
    ) {
      return {
        success: 0,
        result: false,
        message: result?.message || "User not found",
        userNotFound: true,
      };
    }

    // Check if OTP is invalid
    if (
      result?.message?.toLowerCase().includes("invalid") ||
      result?.message?.toLowerCase().includes("expired") ||
      result?.message?.toLowerCase().includes("mismatch")
    ) {
      return {
        success: 0,
        result: false,
        message: result?.message || "Invalid or expired OTP",
        userNotFound: false,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to verify OTP. Please try again.",
      userNotFound: false,
    };
  } catch (error) {
    console.log("verifyLoginOtp Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to verify OTP.",
      userNotFound: false,
    };
  }
}

// ==================== HOME SCREEN API ====================
// GET /api/home
// Expected to return everything the Home screen needs in one call:
// quick stats (matches/visitors/likes/messages/shortlist counts),
// recommended matches, and any banner/announcement data.
export async function getHomeData(token) {
  const URL = apiUrl("/api/home");

  try {
    console.log("getHomeData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getHomeData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.matches || result.stats))
    ) {
      const responseData = result?.data || result;
      return {
        success: 1,
        result: true,
        message: result?.message || "Home data fetched successfully",
        data: {
          stats: responseData?.stats || result?.stats || [],
          matches:
            responseData?.matches ||
            result?.matches ||
            responseData?.recommended_matches ||
            result?.recommended_matches ||
            [],
          banners: responseData?.banners || result?.banners || [],
        },
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch home data.",
      data: null,
    };
  } catch (error) {
    console.log("getHomeData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch home data.",
      data: null,
    };
  }
}

// ==================== TRUSTED BY MILLIONS API ====================
// GET /api/home/trusted-by-millions
export async function getTrustedByMillionsData(token) {
  const URL = apiUrl("/api/home/trusted-by-millions");

  try {
    console.log("getTrustedByMillionsData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getTrustedByMillionsData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result && !result.error && (result.data || Array.isArray(result)))
    ) {
      const items =
        result?.data?.items ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message:
          result?.message || "Trusted by millions data fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch trusted by millions data.",
      data: null,
    };
  } catch (error) {
    console.log("getTrustedByMillionsData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch trusted by millions data.",
      data: null,
    };
  }
}

// ==================== HAPPY STORIES API ====================
// GET /api/home/happy-stories
export async function getHappyStoriesData(token) {
  const URL = apiUrl("/api/home/happy-stories");

  try {
    console.log("getHappyStoriesData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getHappyStoriesData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.stories || Array.isArray(result)))
    ) {
      const items =
        result?.data?.stories ||
        result?.stories ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "Happy stories fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch happy stories.",
      data: null,
    };
  } catch (error) {
    console.log("getHappyStoriesData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch happy stories.",
      data: null,
    };
  }
}

// ==================== PACKAGES API ====================
// GET /api/home/packages
export async function getPackagesData(token) {
  const URL = apiUrl("/api/home/packages");

  try {
    console.log("getPackagesData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getPackagesData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.packages || Array.isArray(result)))
    ) {
      const items =
        result?.data?.packages ||
        result?.packages ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "Packages fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch packages.",
      data: null,
    };
  } catch (error) {
    console.log("getPackagesData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch packages.",
      data: null,
    };
  }
}

// ==================== NEW MEMBERS API ====================
// GET /api/home/new-members
export async function getNewMembersData(token) {
  const URL = apiUrl("/api/home/new-members");

  try {
    console.log("getNewMembersData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getNewMembersData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.members || Array.isArray(result)))
    ) {
      const items =
        result?.data?.members ||
        result?.members ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "New members fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch new members.",
      data: null,
    };
  } catch (error) {
    console.log("getNewMembersData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch new members.",
      data: null,
    };
  }
}
// ==================== PREMIUM MEMBERS API ====================
// GET /api/home/premium-members
export async function getPremiumMembersData(token) {
  const URL = apiUrl("/api/home/premium-members");

  try {
    console.log("getPremiumMembersData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getPremiumMembersData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.members || Array.isArray(result)))
    ) {
      const items =
        result?.data?.members ||
        result?.members ||
        result?.data?.premium_members ||
        result?.premium_members ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "Premium members fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch premium members.",
      data: null,
    };
  } catch (error) {
    console.log("getPremiumMembersData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch premium members.",
      data: null,
    };
  }
}
// ==================== BANNER API ====================
// GET /api/home/banner
export async function getBannerData(token) {
  const URL = apiUrl("/api/home/banner");

  try {
    console.log("getBannerData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getBannerData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.banners || Array.isArray(result)))
    ) {
      const items =
        result?.data?.banners ||
        result?.banners ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "Banner data fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch banner data.",
      data: null,
    };
  } catch (error) {
    console.log("getBannerData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch banner data.",
      data: null,
    };
  }
}
// ==================== HOW IT WORKS API ====================
// GET /api/home/how-it-works
export async function getHowItWorksData(token) {
  const URL = apiUrl("/api/home/how-it-works");

  try {
    console.log("getHowItWorksData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getHowItWorksData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.steps || Array.isArray(result)))
    ) {
      const items =
        result?.data?.steps ||
        result?.steps ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "How it works data fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch how it works data.",
      data: null,
    };
  } catch (error) {
    console.log("getHowItWorksData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch how it works data.",
      data: null,
    };
  }
}

// ==================== REVIEWS API ====================
// GET /api/home/reviews
export async function getReviewsData(token) {
  const URL = apiUrl("/api/home/reviews");

  try {
    console.log("getReviewsData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getReviewsData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.reviews || Array.isArray(result)))
    ) {
      const items =
        result?.data?.reviews ||
        result?.reviews ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "Reviews fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch reviews.",
      data: null,
    };
  } catch (error) {
    console.log("getReviewsData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch reviews.",
      data: null,
    };
  }
}

// ==================== BLOGS API ====================
// GET /api/home/blogs
export async function getBlogsData(token) {
  const URL = apiUrl("/api/home/blogs");

  try {
    console.log("getBlogsData request URL:", URL);
    const result = await getMethod(URL, token);

    console.log("getBlogsData response:", JSON.stringify(result));

    if (
      result?.result === true ||
      result?.success === 1 ||
      result?.success === true ||
      result?.status === true ||
      result?.status === 200 ||
      (result &&
        !result.error &&
        (result.data || result.blogs || Array.isArray(result)))
    ) {
      const items =
        result?.data?.blogs ||
        result?.blogs ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      return {
        success: 1,
        result: true,
        message: result?.message || "Blogs fetched successfully",
        data: items,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to fetch blogs.",
      data: null,
    };
  } catch (error) {
    console.log("getBlogsData Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to fetch blogs.",
      data: null,
    };
  }
}

const HOME_URL = BASE_URL + "/api/home/";

export async function getPremiumMembers() {
  const URL = HOME_URL + "premium-members";

  try {
    const result = await getMethod(URL);
    return result;
  } catch (error) {
    console.log("getPremiumMembers Error:", error);
    throw error;
  }
}
// ==================== MEMBER LISTING API ====================
// POST /api/member/member-listing
export async function postMemberListing(filters = {}, token) {
  const URL = apiUrl("/api/member/member-listing");

  const payload = {
    age_from: filters.ageFrom ?? 18,
    age_to: filters.ageTo ?? 60,
    member_code: filters.memberCode ?? "",
    marital_status: filters.maritalStatus ?? null,
    religion_id: filters.religionId ?? null,
    caste_id: filters.casteId ?? null,
    sub_caste_id: filters.subCasteId ?? null,
    mother_tongue: filters.motherTongue ?? "",
    profession: filters.profession ?? "",
    country_id: filters.countryId ?? null,
    state_id: filters.stateId ?? null,
    city_id: filters.cityId ?? null,
    min_height: filters.minHeight ?? null,
    max_height: filters.maxHeight ?? null,
    member_type: filters.memberType ?? null,
  };

  try {
    console.log("getMemberListing request URL:", URL);
    console.log("getMemberListing request payload:", payload);

    const result = await postMethod(URL, token, payload);

    return result;
  } catch (error) {
    console.log("postMemberListing Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load member listing.",
      data: [],
    };
  }
}
export async function getMyInterests(token) {
  const URL = apiUrl("/api/member/my-interests");

  try {
    console.log("getMyInterests request URL:", URL);

    const result = await getMethod(URL, token);

    console.log("getMyInterests response:", JSON.stringify(result));

    return result;
  } catch (error) {
    console.log("getMyInterests Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load interests.",
      data: [],
    };
  }
}
export const getMemberInfo = async (memberId, token) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/member/member-info/${memberId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return await response.json();
  } catch (error) {
    console.log("getMemberInfo Error:", error);
    throw error;
  }
};
// ==================== PUBLIC PROFILE API ====================
// GET /api/member/public-profile/:id
export async function getPublicProfile(memberId, token) {
  const URL = apiUrl(`/api/member/public-profile/${memberId}`);

  try {
    console.log("getPublicProfile request URL:", URL);

    const result = await getMethod(URL, token);

    console.log("getPublicProfile response:", JSON.stringify(result));

    return result;
  } catch (error) {
    console.log("getPublicProfile Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load public profile.",
      data: null,
    };
  }
}

// ==================== EXPRESS INTEREST API ====================
// POST /api/member/express-interest
// payload: { user_id: <target member id> }
export async function expressInterest(userId, token) {
  const URL = apiUrl("/api/member/express-interest");

  const payload = {
    user_id: userId,
  };

  try {
    console.log("expressInterest request URL:", URL);
    console.log("expressInterest request payload:", payload);

    const result = await postMethod(URL, token, payload);

    console.log("expressInterest response:", JSON.stringify(result));

    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message || "Interest sent successfully",
        data: result?.data ?? null,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to send interest.",
      data: null,
    };
  } catch (error) {
    console.log("expressInterest Error:", error);

    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to send interest.",
      data: null,
    };
  }
}

// ==================== INTEREST REQUESTS API ====================
// GET /api/member/interest-requests
// Interests other members have sent TO the logged-in user.
export async function getInterestRequests(token) {
  const URL = apiUrl("/api/member/interest-requests");

  try {
    console.log("getInterestRequests request URL:", URL);

    const result = await getMethod(URL, token);

    console.log("getInterestRequests response:", JSON.stringify(result));

    return result;
  } catch (error) {
    console.log("getInterestRequests Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load interest requests.",
      data: [],
    };
  }
}

// ==================== ACCEPT INTEREST API ====================
// POST /api/member/interest-accept
// payload: { interest_id }
export async function acceptInterest(token, interestId) {
  const URL = apiUrl("/api/member/interest-accept");

  const payload = {
    interest_id: interestId,
  };

  try {
    console.log("acceptInterest request URL:", URL);
    console.log("acceptInterest request payload:", payload);

    const result = await postMethod(URL, token, payload);

    console.log("acceptInterest response:", JSON.stringify(result));

    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message || "Interest accepted",
        data: result?.data ?? null,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to accept interest.",
      data: null,
    };
  } catch (error) {
    console.log("acceptInterest Error:", error);

    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to accept interest.",
      data: null,
    };
  }
}

// ==================== REJECT INTEREST API ====================
// POST /api/member/interest-reject
// payload: { interest_id }
export async function rejectInterest(token, interestId) {
  const URL = apiUrl("/api/member/interest-reject");

  const payload = {
    interest_id: interestId,
  };

  try {
    console.log("rejectInterest request URL:", URL);
    console.log("rejectInterest request payload:", payload);

    const result = await postMethod(URL, token, payload);

    console.log("rejectInterest response:", JSON.stringify(result));

    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message || "Interest rejected",
        data: result?.data ?? null,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to reject interest.",
      data: null,
    };
  } catch (error) {
    console.log("rejectInterest Error:", error);

    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to reject interest.",
      data: null,
    };
  }
}

// ==================== MY SHORTLISTS API ====================
// GET /api/member/my-shortlists
export async function getMyShortlists(token) {
  const URL = apiUrl("/api/member/my-shortlists");

  try {
    console.log("getMyShortlists request URL:", URL);

    const result = await getMethod(URL, token);

    console.log("getMyShortlists response:", JSON.stringify(result));

    return result;
  } catch (error) {
    console.log("getMyShortlists Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load shortlists.",
      data: [],
    };
  }
}

// ==================== ADD TO SHORTLIST API ====================
// POST /api/member/add-to-shortlist
// payload: { user_id }
export async function addToShortlist(userId, token) {
  const URL = apiUrl("/api/member/add-to-shortlist");

  const payload = {
    user_id: userId,
  };

  try {
    console.log("addToShortlist request URL:", URL);
    console.log("addToShortlist request payload:", payload);

    const result = await postMethod(URL, token, payload);

    console.log("addToShortlist response:", JSON.stringify(result));

    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message || "Added to shortlist",
        data: result?.data ?? null,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to add to shortlist.",
      data: null,
    };
  } catch (error) {
    console.log("addToShortlist Error:", error);

    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to add to shortlist.",
      data: null,
    };
  }
}

// ==================== REMOVE FROM SHORTLIST API ====================
// POST /api/member/remove-from-shortlist
// payload: { user_id }  <-- confirm this matches add-to-shortlist's shape;
// some backends expect { shortlist_id } instead. If this errors, switch it.
export async function removeFromShortlist(userId, token) {
  const URL = apiUrl("/api/member/remove-from-shortlist");

  const payload = {
    user_id: userId,
  };

  try {
    console.log("removeFromShortlist request URL:", URL);
    console.log("removeFromShortlist request payload:", payload);

    const result = await postMethod(URL, token, payload);

    console.log("removeFromShortlist response:", JSON.stringify(result));

    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message || "Removed from shortlist",
        data: result?.data ?? null,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to remove from shortlist.",
      data: null,
    };
  } catch (error) {
    console.log("removeFromShortlist Error:", error);

    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to remove from shortlist.",
      data: null,
    };
  }
}
// ==================== CHAT LIST API ====================
// GET /api/member/chat-list
export async function getChatList(token) {
  const URL = apiUrl("/api/member/chat-list");

  try {
    console.log("getChatList request URL:", URL);

    const result = await getMethod(URL, token);

    console.log("getChatList response:", JSON.stringify(result));

    return result;
  } catch (error) {
    console.log("getChatList Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load chat list.",
      data: [],
    };
  }
}
// ==================== CHAT VIEW API ====================
// GET /api/member/chat-view/:id
// Returns the chat partner's info and message history for a conversation.
export async function getChatView(memberId, token) {
  const URL = apiUrl(`/api/member/chat-view/${memberId}`);

  try {
    console.log("getChatView request URL:", URL);

    const result = await getMethod(URL, token);

    console.log("getChatView response:", JSON.stringify(result));

    return result;
  } catch (error) {
    console.log("getChatView Error:", error);

    return {
      success: 0,
      message: error?.message || "Unable to load chat.",
      data: null,
    };
  }
}
// ==================== CHAT REPLY API ====================
// POST /api/member/chat-reply
// payload: { chat_thread_id, message }
export async function sendChatReply(chatThreadId, message, token) {
  const URL = apiUrl("/api/member/chat-reply");

  const payload = {
    chat_thread_id: chatThreadId,
    message,
  };

  try {
    console.log("sendChatReply request URL:", URL);
    console.log("sendChatReply request payload:", payload);

    const result = await postMethod(URL, token, payload);

    console.log("sendChatReply response:", JSON.stringify(result));

    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message || "Message sent",
        data: result?.data ?? null,
      };
    }

    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to send message.",
      data: null,
    };
  } catch (error) {
    console.log("sendChatReply Error:", error);
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to send message.",
      data: null,
    };
  }
}
export async function getOldMessages(firstMessageId, token) {
  const URL = apiUrl("/api/member/chat/old-messages");
  const payload = { first_message_id: firstMessageId };

  try {
    const result = await postMethod(URL, token, payload);
    if (result?.success === 1 || result?.result === true) {
      return {
        success: 1,
        result: true,
        message: result?.message,
        data: result?.data ?? [],
      };
    }
    return {
      success: 0,
      result: false,
      message: result?.message || "Unable to load older messages.",
      data: [],
    };
  } catch (error) {
    return {
      success: 0,
      result: false,
      message: error?.message || "Failed to load older messages.",
      data: [],
    };
  }
}
export async function getProfileDetails(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/profile_details";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log("GET PROFILE DETAILS");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const result = await getMethod(URL, user);

    logResponse("PROFILE DETAILS RESPONSE", result);

    return result;
  } catch (error) {
    console.error("PROFILE DETAILS ERROR:", error);

    throw error;
  }
}

// =========================================================
// GET MEMBER INTRODUCTION
// GET /api/member/introduction
// =========================================================

export async function getMemberIntroduction(accessToken) {
  if (!accessToken) {
    return {
      success: 0,
      result: false,
      message: "Access token is missing",
    };
  }

  const URL = BASE_URL + "/api/member/introduction";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log("GET MEMBER INTRODUCTION");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, user);

    logResponse("MEMBER INTRODUCTION RESPONSE", response);

    return response;
  } catch (error) {
    console.error("MEMBER INTRODUCTION ERROR:", error);

    throw error;
  }
}

// =========================================================
// UPDATE MEMBER INTRODUCTION
// POST /api/member/introduction-update
// =========================================================

export async function updateMemberIntroduction(accessToken, introduction) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/introduction-update";

  const user = {
    token: accessToken,
  };

  const body = {
    introduction: String(introduction || "").trim(),
  };

  console.log("=================================");
  console.log("UPDATE MEMBER INTRODUCTION");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log("BODY:", JSON.stringify(body, null, 2));
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await postMethod(URL, user, body);

    logResponse("UPDATE INTRODUCTION RESPONSE", response);

    return response;
  } catch (error) {
    console.error("UPDATE INTRODUCTION ERROR:", error);

    throw error;
  }
}

// =========================================================
// GET MEMBER BASIC INFO
// GET /api/member/basic-info
// =========================================================

export async function getMemberBasicInfo(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/basic-info";

  const user = {
    token: accessToken,
  };

  console.log("=================================");
  console.log("GET MEMBER BASIC INFO");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, user);

    logResponse("GET BASIC INFO RESPONSE", response);

    return response;
  } catch (error) {
    console.error("GET BASIC INFO ERROR:", error);

    throw error;
  }
}

// =========================================================
// UPDATE MEMBER BASIC INFORMATION
// POST /api/member/basic-info/update
// =========================================================

export async function updateMemberBasicInfo(accessToken, basicInfo = {}) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  const URL = BASE_URL + "/api/member/basic-info/update";

  const body = {
    first_name: String(basicInfo.first_name || "").trim(),

    last_name: String(basicInfo.last_name || "").trim(),

    email: String(basicInfo.email || "").trim(),

    gender: Number(basicInfo.gender || 0),

    on_behalf: Number(basicInfo.on_behalf || 0),

    date_of_birth: String(basicInfo.date_of_birth || "").trim(),

    marital_status: Number(basicInfo.marital_status || 0),

    children: Number(basicInfo.children || 0),
  };

  console.log("=================================");

  console.log("UPDATE BASIC INFORMATION API");

  console.log("METHOD: POST");
  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  console.log("=================================");

  try {
    const response = await postMethod(
      URL,
      {
        token: accessToken,
      },
      body,
    );

    console.log("=================================");

    console.log("UPDATE BASIC INFORMATION RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("=================================");

    return response;
  } catch (error) {
    console.error("UPDATE BASIC INFORMATION ERROR:", error);

    throw error;
  }
}

// =========================================================
// GET MEMBER PRESENT ADDRESS
// GET /api/member/present/address
// =========================================================

export async function getMemberPresentAddress(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/present/address";

  console.log("=================================");
  console.log("GET MEMBER PRESENT ADDRESS");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    logResponse("PRESENT ADDRESS API RESPONSE", response);

    return response;
  } catch (error) {
    console.error("PRESENT ADDRESS API ERROR:", error);

    throw error;
  }
}

// =========================================================
// GET MEMBER PERMANENT ADDRESS
// GET /api/member/permanent/address
// =========================================================

export async function getMemberPermanentAddress(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/permanent/address";

  console.log("=================================");
  console.log("GET MEMBER PERMANENT ADDRESS");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    logResponse("PERMANENT ADDRESS API RESPONSE", response);

    return response;
  } catch (error) {
    console.error("PERMANENT ADDRESS API ERROR:", error);

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
  { country_id, state_id, city_id, postal_code, address_type = "present" } = {},
) {
  requireToken(accessToken);

  const numericCountryId = Number(country_id);

  const numericStateId = Number(state_id);

  const numericCityId = Number(city_id);

  const cleanPostalCode = String(postal_code || "").trim();

  const cleanAddressType = String(address_type || "present")
    .trim()
    .toLowerCase();

  if (!Number.isFinite(numericCountryId) || numericCountryId <= 0) {
    throw new Error("Valid country ID is required.");
  }

  if (!Number.isFinite(numericStateId) || numericStateId <= 0) {
    throw new Error("Valid state ID is required.");
  }

  if (!Number.isFinite(numericCityId) || numericCityId <= 0) {
    throw new Error("Valid city ID is required.");
  }

  if (!cleanPostalCode) {
    throw new Error("Postal code is required.");
  }

  if (cleanAddressType !== "present" && cleanAddressType !== "permanent") {
    throw new Error('address_type must be "present" or "permanent".');
  }

  const URL = BASE_URL + "/api/member/address/update";

  const body = {
    country_id: numericCountryId,
    state_id: numericStateId,
    city_id: numericCityId,
    postal_code: cleanPostalCode,
    address_type: cleanAddressType,
  };

  console.log("=================================");
  console.log("UPDATE MEMBER ADDRESS");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("BODY:", JSON.stringify(body, null, 2));
  console.log("=================================");

  try {
    const response = await postMethod(
      URL,
      {
        token: accessToken,
      },
      body,
    );

    logResponse("UPDATE MEMBER ADDRESS RESPONSE", response);

    return response;
  } catch (error) {
    console.error("UPDATE MEMBER ADDRESS ERROR:", error);

    throw error;
  }
}

// =========================================================
// GET MEMBER COUNTRIES
// GET /api/member/countries
// =========================================================

export async function getMemberCountries(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/countries";

  console.log("=================================");
  console.log("GET MEMBER COUNTRIES");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    logResponse("COUNTRIES API RESPONSE", response);

    return response;
  } catch (error) {
    console.error("COUNTRIES API ERROR:", error);

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

export async function getMemberStates(accessToken, countryId) {
  requireToken(accessToken);

  const numericCountryId = Number(countryId);

  if (!Number.isFinite(numericCountryId) || numericCountryId <= 0) {
    throw new Error("Valid country ID is required to load states.");
  }

  const URL = BASE_URL + `/api/member/states/${numericCountryId}`;

  console.log("=================================");
  console.log("GET MEMBER STATES");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("COUNTRY ID:", numericCountryId);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    logResponse("STATES API RESPONSE", response);

    return response;
  } catch (error) {
    console.error("STATES API ERROR:", error);

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

export async function getMemberCities(accessToken, stateId) {
  requireToken(accessToken);

  const numericStateId = Number(stateId);

  if (!Number.isFinite(numericStateId) || numericStateId <= 0) {
    throw new Error("Valid state ID is required to load cities.");
  }

  const URL = BASE_URL + `/api/member/cities/${numericStateId}`;

  console.log("=================================");
  console.log("GET MEMBER CITIES");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("STATE ID:", numericStateId);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("=================================");

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    logResponse("CITIES API RESPONSE", response);

    return response;
  } catch (error) {
    console.error("CITIES API ERROR:", error);

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
  status = 1,
) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  const id = Number(educationId);
  const currentStatus = Number(status);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid education ID is required.");
  }

  if (![0, 1].includes(currentStatus)) {
    throw new Error("Education status must be 0 or 1.");
  }

  const URL = BASE_URL + "/api/member/education-status/update";

  const user = {
    token: accessToken,
  };

  const body = {
    id: id,
    status: currentStatus,
  };

  console.log("=================================");
  console.log("EDUCATION STATUS UPDATE REQUEST");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("TOKEN LENGTH:", accessToken.length);
  console.log("EDUCATION ID:", id);
  console.log("STATUS:", currentStatus);
  console.log("REQUEST USER:", JSON.stringify(user, null, 2));
  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));
  console.log("=================================");

  try {
    const response = await postMethod(URL, user, body);

    console.log("=================================");
    console.log("EDUCATION STATUS UPDATE RESPONSE");
    console.log(JSON.stringify(response, null, 2));
    console.log("=================================");

    return response;
  } catch (error) {
    console.error("EDUCATION STATUS UPDATE ERROR:", error);

    throw error;
  }
}

// =========================================================
// GET MEMBER EDUCATION
// =========================================================

export async function getMemberEducation(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/member/education";

  const user = {
    token: accessToken,
  };

  console.log("======================================");

  console.log("GET MEMBER EDUCATION API");

  console.log("METHOD: GET");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("======================================");

  try {
    const response = await getMethod(URL, user);

    console.log("======================================");

    console.log("EDUCATION API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("======================================");

    return response;
  } catch (error) {
    console.error("======================================");

    console.error("EDUCATION API ERROR");

    console.error(error);

    console.error("======================================");

    throw error;
  }
}

// =========================================================
// GET SINGLE MEMBER EDUCATION
// GET /api/member/education/{id}
// =========================================================

export async function getMemberEducationById(accessToken, educationId) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const id = Number(educationId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid education ID is required.");
  }

  const URL = BASE_URL + "/api/member/education/" + id;

  try {
    const response = await getMethod(URL, { token: accessToken });

    logResponse("SINGLE EDUCATION API RESPONSE", response);

    return response;
  } catch (error) {
    console.error("SINGLE EDUCATION API ERROR:", error);

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

export async function addMemberEducation(accessToken, education = {}) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  const URL = BASE_URL + "/api/member/education";

  // Convert year values to numbers
  const educationStart = Number(education.education_start);

  const educationEnd = Number(education.education_end);

  const degreeValue = String(education.degree || "").trim();

  const institutionValue = String(education.institution || "").trim();

  // =======================================================
  // VALIDATION
  // =======================================================

  if (!degreeValue) {
    throw new Error("Degree / Course is required.");
  }

  if (!institutionValue) {
    throw new Error("Institution / College is required.");
  }

  if (!Number.isInteger(educationStart) || educationStart <= 0) {
    throw new Error("Valid education start year is required.");
  }

  if (!Number.isInteger(educationEnd) || educationEnd <= 0) {
    throw new Error("Valid education end year is required.");
  }

  if (educationEnd < educationStart) {
    throw new Error("Education end year cannot be before start year.");
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

  console.log("======================================");

  console.log("ADD MEMBER EDUCATION API");

  console.log("METHOD: POST");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("TOKEN LENGTH:", accessToken.length);

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  console.log("======================================");

  try {
    const response = await postMethod(URL, user, body);

    // =====================================================
    // RESPONSE LOG
    // =====================================================

    console.log("======================================");

    console.log("ADD EDUCATION API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("======================================");

    return response;
  } catch (error) {
    console.error("======================================");

    console.error("ADD EDUCATION API ERROR");

    console.error(error);

    console.error("======================================");

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
  education = {},
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // ID VALIDATION
  // -------------------------------------------------------

  const numericId = Number(educationId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("Valid education ID is required.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + `/api/member/education/${numericId}`;

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const degreeValue = String(education.degree || "").trim();

  const institutionValue = String(education.institution || "").trim();

  const educationStart = Number(education.education_start);

  const educationEnd = Number(education.education_end);

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!degreeValue) {
    throw new Error("Degree / Course is required.");
  }

  if (!institutionValue) {
    throw new Error("Institution / College is required.");
  }

  if (!Number.isInteger(educationStart) || educationStart <= 0) {
    throw new Error("Valid education start year is required.");
  }

  if (!Number.isInteger(educationEnd) || educationEnd <= 0) {
    throw new Error("Valid education end year is required.");
  }

  if (educationEnd < educationStart) {
    throw new Error("Education end year cannot be before start year.");
  }

  // -------------------------------------------------------
  // REQUEST BODY
  // -------------------------------------------------------

  const body = {
    degree: degreeValue,

    institution: institutionValue,

    education_start: educationStart,

    education_end: educationEnd,
  };

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // LOG REQUEST
  // -------------------------------------------------------

  console.log("=================================");

  console.log("UPDATE MEMBER EDUCATION API");

  console.log("METHOD: PUT");

  console.log("URL:", URL);

  console.log("EDUCATION ID:", numericId);

  console.log("BODY:", JSON.stringify(body, null, 2));

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("=================================");

  // -------------------------------------------------------
  // CALL PUT API
  // -------------------------------------------------------

  try {
    const response = await fetch(URL, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();
    console.log("STATUS:", response.status);
    console.log("RESPONSE DATA:", responseData);

    if (!response.ok) {
      throw new Error(responseData?.message || "Education update failed");
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

/* =========================================================
   DELETE MEMBER EDUCATION
   DELETE /api/member/education/{id}
========================================================= */

export async function deleteMemberEducation(accessToken, educationId) {
  const URL = apiUrl(`/api/member/education/${educationId}`);

  try {
    console.log("DELETE URL:", URL);

    const response = await fetch(URL, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseData = await response.json();

    console.log("DELETE RESPONSE:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      throw new Error(responseData?.message || "Education delete failed");
    }

    return responseData;
  } catch (error) {
    console.error("DELETE API ERROR:", error);
    throw error;
  }
}

// =========================================================
// GET MEMBER CAREER
// GET /api/member/career
// =========================================================

export async function getMemberCareer(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  const URL = BASE_URL + "/api/member/career";

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
    const response = await getMethod(URL, user);

    console.log("=================================");
    console.log("CAREER API RESPONSE");
    console.log(JSON.stringify(response, null, 2));
    console.log("=================================");

    return response;
  } catch (error) {
    console.error("GET MEMBER CAREER API ERROR:", error);

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

export async function addMemberCareer(accessToken, career = {}) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + "/api/member/career";

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const companyValue = String(career.company || "").trim();

  const designationValue = String(career.designation || "").trim();

  const startYear = Number(career.start);

  const endYear = Number(career.end);

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!companyValue) {
    throw new Error("Company is required.");
  }

  if (!designationValue) {
    throw new Error("Designation is required.");
  }

  if (!Number.isInteger(startYear) || startYear <= 0) {
    throw new Error("Valid start year is required.");
  }

  if (!Number.isInteger(endYear) || endYear <= 0) {
    throw new Error("Valid end year is required.");
  }

  if (endYear < startYear) {
    throw new Error("End year cannot be before start year.");
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

  console.log("======================================");

  console.log("ADD MEMBER CAREER API");

  console.log("METHOD: POST");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("TOKEN LENGTH:", accessToken.length);

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  console.log("======================================");

  // -------------------------------------------------------
  // CALL POST API
  // -------------------------------------------------------

  try {
    const response = await postMethod(URL, user, body);

    // -----------------------------------------------------
    // RESPONSE LOG
    // -----------------------------------------------------

    console.log("======================================");

    console.log("ADD CAREER API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("======================================");

    return response;
  } catch (error) {
    console.error("======================================");

    console.error("ADD MEMBER CAREER API ERROR");

    console.error(error);

    console.error("======================================");

    throw error;
  }
}

// =========================================================
// GET SINGLE MEMBER CAREER
// GET /api/member/career/{id}
// Example: /api/member/career/1
// =========================================================

export async function getMemberCareerById(accessToken, careerId) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // ID VALIDATION
  // -------------------------------------------------------

  const id = Number(careerId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid career ID is required.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + `/api/member/career/${id}`;

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG LOG
  // -------------------------------------------------------

  console.log("======================================");

  console.log("GET SINGLE MEMBER CAREER API");

  console.log("METHOD: GET");

  console.log("URL:", URL);

  console.log("CAREER ID:", id);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("======================================");

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {
    const response = await getMethod(URL, user);

    // -----------------------------------------------------
    // RESPONSE LOG
    // -----------------------------------------------------

    console.log("======================================");

    console.log("SINGLE CAREER API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("======================================");

    return response;
  } catch (error) {
    console.error("======================================");

    console.error("SINGLE CAREER API ERROR:", error);

    console.error("======================================");

    throw error;
  }
}
// =========================================================
// UPDATE SINGLE MEMBER CAREER
// PUT /api/member/career/{id}
//
// NOTE ON METHOD:
// The Laravel route only accepts GET, HEAD, PUT, PATCH, DELETE
// (per the "The POST method is not supported..." error). This
// function now sends the request with postMethod(), but includes
// Laravel's method-spoofing field "_method": "PUT" in the body.
// Laravel's framework-level middleware reads that field and
// routes the request as if it were a real PUT — this is the
// standard workaround when a client can't (or shouldn't) send a
// raw PUT request directly.
//
// IMPORTANT CAVEAT: Laravel's method spoofing is only applied
// automatically for form submissions
// (application/x-www-form-urlencoded or multipart/form-data).
// If postMethod() sends this body as raw JSON
// (Content-Type: application/json), Laravel will NOT read
// "_method" from a JSON body by default, and this will hit the
// same 405 error again. If that happens, the real fix is either:
//   (a) send this request as application/x-www-form-urlencoded
//       instead of JSON, or
//   (b) revert to putMethod() and instead fix why putMethod()
//       was producing a POST request on the wire in the first
//       place (that's almost certainly a bug inside
//       APIServices.js's putMethod implementation).
//
// Request body sent to the server:
// {
//   "company": "ABC Technologies",
//   "designation": "Software Developer",
//   "start": 2024,
//   "end": 2025,
//   "_method": "PUT"
// }
// =========================================================

export async function updateMemberCareerById(
  accessToken,
  careerId,
  career = {},
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // ID VALIDATION
  // -------------------------------------------------------

  const id = Number(careerId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid career ID is required.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + `/api/member/career/${id}`;

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const companyValue = String(career.company || "").trim();

  const designationValue = String(career.designation || "").trim();

  const startYear = Number(career.start);

  const endYear = Number(career.end);

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!companyValue) {
    throw new Error("Company is required.");
  }

  if (!designationValue) {
    throw new Error("Designation is required.");
  }

  if (!Number.isInteger(startYear) || startYear <= 0) {
    throw new Error("Valid start year is required.");
  }

  if (!Number.isInteger(endYear) || endYear <= 0) {
    throw new Error("Valid end year is required.");
  }

  if (endYear < startYear) {
    throw new Error("End year cannot be before start year.");
  }

  // -------------------------------------------------------
  // REQUEST BODY
  //
  // "_method": "PUT" tells Laravel to route this POST request
  // as a PUT (method spoofing). See the note above this
  // function for the caveat about JSON vs form-encoded bodies.
  // -------------------------------------------------------

  const body = {
    company: companyValue,
    designation: designationValue,
    start: startYear,
    end: endYear,
    _method: "PUT",
  };

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG
  // -------------------------------------------------------

  console.log("======================================");

  console.log("UPDATE MEMBER CAREER API");

  console.log("METHOD: POST (spoofed as PUT via _method)");

  console.log("URL:", URL);

  console.log("CAREER ID:", id);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  console.log("======================================");

  // -------------------------------------------------------
  // POST API CALL (was putMethod)
  // -------------------------------------------------------

  try {
    const response = await postMethod(URL, user, body);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log("======================================");

    console.log("UPDATE CAREER API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("======================================");

    return response;
  } catch (error) {
    console.error("======================================");

    console.error("UPDATE CAREER API ERROR:", error);

    console.error("======================================");

    throw error;
  }
}
export async function deleteMemberCareerById(accessToken, careerId) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  const id = Number(careerId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid career ID: ${careerId}`);
  }

  const URL = BASE_URL + `/api/member/career/${id}`;

  try {
    console.log("DELETE CAREER URL:", URL);
    console.log("DELETE CAREER ID:", id);

    const response = await fetch(URL, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseText = await response.text();

    let responseData = {};

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = {
        message: responseText,
      };
    }

    console.log(
      "DELETE CAREER RESPONSE:",
      JSON.stringify(responseData, null, 2),
    );

    if (!response.ok) {
      throw new Error(responseData?.message || "Career delete failed");
    }

    return {
      ...responseData,
      statusCode: response.status,
    };
  } catch (error) {
    console.error("DELETE CAREER API ERROR:", error);
    throw error;
  }
}

// =========================================================
// GET MEMBER SPIRITUAL & SOCIAL BACKGROUND
// GET /api/member/spiritual-background
// =========================================================

export async function getMemberSpiritualBackground(accessToken) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + "/api/member/spiritual-background";

  // -------------------------------------------------------
  // TOKEN
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG
  // -------------------------------------------------------

  console.log("======================================");

  console.log("GET MEMBER SPIRITUAL BACKGROUND API");

  console.log("METHOD:", "GET");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("======================================");

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {
    const response = await getMethod(URL, user);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log("======================================");

    console.log("SPIRITUAL BACKGROUND API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("======================================");

    return response;
  } catch (error) {
    console.error("======================================");

    console.error("SPIRITUAL BACKGROUND API ERROR");

    console.error(error);

    console.error("======================================");

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
  spiritualBackground,
) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/member/spiritual-background/update";

  const body = {
    religion_id: Number(spiritualBackground.religion_id),

    caste_id: Number(spiritualBackground.caste_id),

    sub_caste_id: Number(spiritualBackground.sub_caste_id),

    ethnicity: String(spiritualBackground.ethnicity || "").trim(),

    personal_value: String(spiritualBackground.personal_value || "").trim(),

    family_value_id: Number(spiritualBackground.family_value_id),

    community_value: String(spiritualBackground.community_value || "").trim(),
  };

  console.log("========== SPIRITUAL UPDATE API ==========");

  console.log("URL:", URL);

  console.log("METHOD: POST");

  console.log("BODY:", JSON.stringify(body, null, 2));

  console.log("===========================================");

  const user = {
    token: accessToken,
  };

  return await postMethod(URL, user, body);
}

// =========================================================
// GET MEMBER ASTRONOMIC INFORMATION
// GET /api/member/astronomic
// =========================================================

export async function getMemberAstronomic(accessToken) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + "/api/member/astronomic";

  // -------------------------------------------------------
  // AUTH USER
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG REQUEST
  // -------------------------------------------------------

  console.log("========================================");

  console.log("GET MEMBER ASTRONOMIC API");

  console.log("METHOD:", "GET");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("TOKEN LENGTH:", accessToken?.length);

  console.log("========================================");

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {
    const response = await getMethod(URL, user);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log("========================================");

    console.log("ASTRONOMIC API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");

    console.error("GET MEMBER ASTRONOMIC API ERROR");

    console.error("MESSAGE:", error?.message);

    console.error("ERROR:", error);

    console.error("========================================");

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
  { sun_sign, moon_sign, time_of_birth, city_of_birth } = {},
) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + "/api/member/astronomic/update";

  // -------------------------------------------------------
  // USER / AUTH
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const sunSignValue = String(sun_sign ?? "").trim();

  const moonSignValue = String(moon_sign ?? "").trim();

  const timeOfBirthValue = String(time_of_birth ?? "").trim();

  const cityOfBirthValue = String(city_of_birth ?? "").trim();

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

  console.log("========================================");

  console.log("UPDATE MEMBER ASTRONOMIC API");

  console.log("METHOD:", "POST");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("TOKEN LENGTH:", accessToken?.length);

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  console.log("========================================");

  // -------------------------------------------------------
  // POST API
  // -------------------------------------------------------

  try {
    const response = await postMethod(URL, user, body);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log("========================================");

    console.log("UPDATE ASTRONOMIC API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");

    console.error("UPDATE MEMBER ASTRONOMIC API ERROR");

    console.error("MESSAGE:", error?.message);

    console.error("RESPONSE:", JSON.stringify(error?.response?.data, null, 2));

    console.error("========================================");

    throw error;
  }
}

// =========================================================
// GET MEMBER FAMILY INFORMATION
// GET /api/member/family-info
// =========================================================

export async function getMemberFamilyInfo(accessToken) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + "/api/member/family-info";

  // -------------------------------------------------------
  // AUTH USER
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // DEBUG REQUEST
  // -------------------------------------------------------

  console.log("========================================");

  console.log("GET MEMBER FAMILY INFORMATION API");

  console.log("METHOD:", "GET");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("TOKEN LENGTH:", accessToken?.length || 0);

  console.log("========================================");

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {
    const response = await getMethod(URL, user);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    console.log("========================================");

    console.log("FAMILY INFORMATION API RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");

    console.error("GET MEMBER FAMILY INFORMATION API ERROR");

    console.error("MESSAGE:", error?.message);

    console.error("RESPONSE:", JSON.stringify(error?.response?.data, null, 2));

    console.error("========================================");

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

export async function updateMemberFamilyInfo(accessToken, familyInfo = {}) {
  // -------------------------------------------------------
  // TOKEN VALIDATION
  // -------------------------------------------------------

  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  const URL = BASE_URL + "/api/member/family-info/update";

  // -------------------------------------------------------
  // AUTH USER
  // -------------------------------------------------------

  const user = {
    token: accessToken,
  };

  // -------------------------------------------------------
  // CLEAN VALUES
  // -------------------------------------------------------

  const fatherValue = String(familyInfo.father ?? "").trim();

  const motherValue = String(familyInfo.mother ?? "").trim();

  const siblingValue = String(familyInfo.sibling ?? "").trim();

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

  console.log("========================================");

  console.log("UPDATE MEMBER FAMILY INFORMATION API");

  console.log("METHOD:", "POST");

  console.log("URL:", URL);

  console.log("TOKEN EXISTS:", !!accessToken);

  console.log("TOKEN LENGTH:", accessToken.length);

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  console.log("========================================");

  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {
    const response = await postMethod(URL, user, body);

    // -----------------------------------------------------
    // RESPONSE LOG
    // -----------------------------------------------------

    console.log("========================================");

    console.log("UPDATE FAMILY INFORMATION RESPONSE");

    console.log(JSON.stringify(response, null, 2));

    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");

    console.error("UPDATE FAMILY INFORMATION API ERROR");

    console.error(error);

    console.error("MESSAGE:", error?.message);

    console.error("RESPONSE:", JSON.stringify(error?.response?.data, null, 2));

    console.error("========================================");

    throw error;
  }
}

// =========================================================
// GET MEMBER LANGUAGES
// GET /api/member/language
// =========================================================

export async function getMemberLanguages(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/member/language";

  const user = {
    token: accessToken,
  };

  console.log("========================================");
  console.log("GET MEMBER LANGUAGES");
  console.log("METHOD: GET");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("========================================");

  try {
    const response = await getMethod(URL, user);

    console.log("========================================");
    console.log("MEMBER LANGUAGES API RESPONSE");
    console.log(JSON.stringify(response, null, 2));
    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");
    console.error("GET MEMBER LANGUAGES ERROR");
    console.error(error);
    console.error("========================================");

    throw error;
  }
}
// =========================================================
// UPDATE MEMBER LANGUAGES
// POST /api/member/language/update
// =========================================================

// =========================================================
// UPDATE MEMBER LANGUAGES
// POST /api/member/language/update
// =========================================================

export async function updateMemberLanguages(
  accessToken,
  { mothere_tongue, mother_tongue, known_languages = [] } = {},
) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/member/language/update";

  const user = {
    token: accessToken,
  };

  // Backend expects mother tongue ID
  const motherTongueId = mothere_tongue ?? mother_tongue ?? null;

  // Backend expects known language IDs
  const knownLanguageIds = Array.isArray(known_languages)
    ? known_languages
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return Number(item.id);
          }

          return Number(item);
        })
        .filter((id) => Number.isInteger(id) && id > 0)
    : [];

  const uniqueKnownLanguageIds = [...new Set(knownLanguageIds)];

  const body = {
    mothere_tongue: Number(motherTongueId),
    known_languages: uniqueKnownLanguageIds,
  };

  console.log("========================================");
  console.log("UPDATE MEMBER LANGUAGES");
  console.log("METHOD: POST");
  console.log("URL:", URL);
  console.log("TOKEN EXISTS:", !!accessToken);
  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));
  console.log("========================================");

  try {
    const response = await postMethod(URL, user, body);

    console.log("========================================");
    console.log("UPDATE MEMBER LANGUAGES RESPONSE");
    console.log(JSON.stringify(response, null, 2));
    console.log("========================================");

    return response;
  } catch (error) {
    console.error("========================================");
    console.error("UPDATE MEMBER LANGUAGES ERROR");
    console.error(error);
    console.error(
      "ERROR RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.error("========================================");

    throw error;
  }
}
// =========================================================
// GET ALL LANGUAGES
// GET /api/get_languages
// =========================================================

export async function getLanguages(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/get_languages";

  const user = {
    token: accessToken,
  };

  console.log("GET ALL LANGUAGES URL:", URL);

  try {
    const response = await getMethod(URL, user);

    console.log(
      "GET ALL LANGUAGES RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    return response;
  } catch (error) {
    console.error("GET ALL LANGUAGES ERROR:", error);
    throw error;
  }
}
