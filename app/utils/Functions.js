import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../constants/AppUrls";
import { getMethod, postMethod } from "./APIServices";

// === SHARED AUTH TOKEN HELPER ===
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

// === SHARED DEBUG / VALIDATION HELPERS ===

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
    // console.log("===");
    // console.log(label);
    // console.log(JSON.stringify(response, null, 2));
    // console.log("===");
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

// === REGISTRATION API ===
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
    const result = await postMethod(URL, null, payload);

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

// === LOGIN OTP API ===
export async function sendLoginOtp(mobile) {
  const URL = apiUrl("/api/login");

  const payload = {
    phone: normalizeMobile(mobile),
  };

  try {
    const result = await postMethod(URL, null, payload);
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

// === VERIFY OTP API ===
export async function verifyLoginOtp(mobile, code, sessionToken) {
  const URL = apiUrl("/api/verifyMobile");

  const payload = {
    phone: normalizeMobile(mobile),
    otp: code || "",
  };

  try {
    const result = await postMethod(URL, null, payload);

    if (result?.result === true || result?.success === 1) {

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

// === HOME SCREEN API ===
// GET /api/home
// Expected to return everything the Home screen needs in one call:
// quick stats (matches/visitors/likes/messages/shortlist counts),
// recommended matches, and any banner/announcement data.
export async function getHomeData(token) {
  const URL = apiUrl("/api/home");

  try {
    const result = await getMethod(URL, token);
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

// === TRUSTED BY MILLIONS API ===
// GET /api/home/trusted-by-millions
export async function getTrustedByMillionsData(token) {
  const URL = apiUrl("/api/home/trusted-by-millions");

  try {
    const result = await getMethod(URL, token);

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

// === HAPPY STORIES API ===
// GET /api/home/happy-stories
export async function getHappyStoriesData(token) {
  const URL = apiUrl("/api/home/happy-stories");

  try {
    const result = await getMethod(URL, token);

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

// === PACKAGES API ===
// GET /api/home/packages
export async function getPackagesData(token) {
  const URL = apiUrl("/api/home/packages");

  try {
    const result = await getMethod(URL, token);

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

// === NEW MEMBERS API ===
// GET /api/home/new-members
export async function getNewMembersData(token) {
  const URL = apiUrl("/api/home/new-members");

  try {
    const result = await getMethod(URL, token);

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
// === PREMIUM MEMBERS API ===
// GET /api/home/premium-members
export async function getPremiumMembersData(token) {
  const URL = apiUrl("/api/home/premium-members");

  try {
    const result = await getMethod(URL, token);

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
// === BANNER API ===
// GET /api/home/banner
export async function getBannerData(token) {
  const URL = apiUrl("/api/home/banner");

  try {
    const result = await getMethod(URL, token);

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
// === HOW IT WORKS API ===
// GET /api/home/how-it-works
export async function getHowItWorksData(token) {
  const URL = apiUrl("/api/home/how-it-works");

  try {
    const result = await getMethod(URL, token);

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

// === REVIEWS API ===
// GET /api/home/reviews
export async function getReviewsData(token) {
  const URL = apiUrl("/api/home/reviews");

  try {
    const result = await getMethod(URL, token);

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

// === BLOGS API ===
// GET /api/home/blogs
export async function getBlogsData(token) {
  const URL = apiUrl("/api/home/blogs");

  try {
    const result = await getMethod(URL, token);

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
// === MEMBER LISTING API ===
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

    const result = await getMethod(URL, token);

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
// === PUBLIC PROFILE API ===
// GET /api/member/public-profile/:id
export async function getPublicProfile(memberId, token) {
  const URL = apiUrl(`/api/member/public-profile/${memberId}`);

  try {

    const result = await getMethod(URL, token);

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

// === EXPRESS INTEREST API ===
// POST /api/member/express-interest
// payload: { user_id: <target member id> }
export async function expressInterest(userId, token) {
  const URL = apiUrl("/api/member/express-interest");

  const payload = {
    user_id: userId,
  };

  try {

    const result = await postMethod(URL, token, payload);

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

// === INTEREST REQUESTS API ===
// GET /api/member/interest-requests
// Interests other members have sent TO the logged-in user.
export async function getInterestRequests(token) {
  const URL = apiUrl("/api/member/interest-requests");

  try {

    const result = await getMethod(URL, token);

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

// === ACCEPT INTEREST API ===
// POST /api/member/interest-accept
// payload: { interest_id }
export async function acceptInterest(token, interestId) {
  const URL = apiUrl("/api/member/interest-accept");

  const payload = {
    interest_id: interestId,
  };

  try {

    const result = await postMethod(URL, token, payload);

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

// === REJECT INTEREST API ===
// POST /api/member/interest-reject
// payload: { interest_id }
export async function rejectInterest(token, interestId) {
  const URL = apiUrl("/api/member/interest-reject");

  const payload = {
    interest_id: interestId,
  };

  try {

    const result = await postMethod(URL, token, payload);

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

// === MY SHORTLISTS API ===
// GET /api/member/my-shortlists
export async function getMyShortlists(token) {
  const URL = apiUrl("/api/member/my-shortlists");

  try {

    const result = await getMethod(URL, token);

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

// === ADD TO SHORTLIST API ===
// POST /api/member/add-to-shortlist
// payload: { user_id }
export async function addToShortlist(userId, token) {
  const URL = apiUrl("/api/member/add-to-shortlist");

  const payload = {
    user_id: userId,
  };

  try {

    const result = await postMethod(URL, token, payload);

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

// === REMOVE FROM SHORTLIST API ===
// POST /api/member/remove-from-shortlist
// payload: { user_id }  <-- confirm this matches add-to-shortlist's shape;
// some backends expect { shortlist_id } instead. If this errors, switch it.
export async function removeFromShortlist(userId, token) {
  const URL = apiUrl("/api/member/remove-from-shortlist");

  const payload = {
    user_id: userId,
  };

  try {

    const result = await postMethod(URL, token, payload);

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
// === CHAT LIST API ===
// GET /api/member/chat-list
export async function getChatList(token) {
  const URL = apiUrl("/api/member/chat-list");

  try {

    const result = await getMethod(URL, token);

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
// === CHAT VIEW API ===
// GET /api/member/chat-view/:id
// Returns the chat partner's info and message history for a conversation.
export async function getChatView(memberId, token) {
  const URL = apiUrl(`/api/member/chat-view/${memberId}`);

  try {
    const result = await getMethod(URL, token);

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
// === CHAT REPLY API ===
// POST /api/member/chat-reply
// payload: { chat_thread_id, message }
export async function sendChatReply(chatThreadId, message, token) {
  const URL = apiUrl("/api/member/chat-reply");

  const payload = {
    chat_thread_id: chatThreadId,
    message,
  };

  try {

    const result = await postMethod(URL, token, payload);

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

  try {
    const result = await getMethod(URL, user);

    return result;
  } catch (error) {
    console.error("PROFILE DETAILS ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER INTRODUCTION
// GET /api/member/introduction
// ===

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


  try {
    const response = await getMethod(URL, user);

    return response;
  } catch (error) {
    console.error("MEMBER INTRODUCTION ERROR:", error);

    throw error;
  }
}

// ===
// UPDATE MEMBER INTRODUCTION
// POST /api/member/introduction-update
// ===

export async function updateMemberIntroduction(accessToken, introduction) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/introduction-update";

  const user = {
    token: accessToken,
  };

  const body = {
    introduction: String(introduction || "").trim(),
  };

  try {
    const response = await postMethod(URL, user, body);
    return response;
  } catch (error) {
    console.error("UPDATE INTRODUCTION ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER BASIC INFO
// GET /api/member/basic-info
// ===

export async function getMemberBasicInfo(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/basic-info";

  const user = {
    token: accessToken,
  };

  try {
    const response = await getMethod(URL, user);

    return response;
  } catch (error) {
    console.error("GET BASIC INFO ERROR:", error);

    throw error;
  }
}

// ===
// UPDATE MEMBER BASIC INFORMATION
// POST /api/member/basic-info/update
// ===

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


  try {
    const response = await postMethod(
      URL,
      {
        token: accessToken,
      },
      body,
    );

    return response;
  } catch (error) {
    console.error("UPDATE BASIC INFORMATION ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER PRESENT ADDRESS
// GET /api/member/present/address
// ===

export async function getMemberPresentAddress(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/present/address";

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    return response;
  } catch (error) {
    console.error("PRESENT ADDRESS API ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER PERMANENT ADDRESS
// GET /api/member/permanent/address
// ===

export async function getMemberPermanentAddress(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/permanent/address";


  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    return response;
  } catch (error) {
    console.error("PERMANENT ADDRESS API ERROR:", error);

    throw error;
  }
}

// ===
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
// ===

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

  try {
    const response = await postMethod(
      URL,
      {
        token: accessToken,
      },
      body,
    );
    return response;
  } catch (error) {
    console.error("UPDATE MEMBER ADDRESS ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER COUNTRIES
// GET /api/member/countries
// ===

export async function getMemberCountries(accessToken) {
  requireToken(accessToken);

  const URL = BASE_URL + "/api/member/countries";

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });

    return response;
  } catch (error) {
    console.error("COUNTRIES API ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER STATES
// GET /api/member/states/{country_id}
//
// Example:
// /api/member/states/101
// ===

export async function getMemberStates(accessToken, countryId) {
  requireToken(accessToken);

  const numericCountryId = Number(countryId);

  if (!Number.isFinite(numericCountryId) || numericCountryId <= 0) {
    throw new Error("Valid country ID is required to load states.");
  }

  const URL = BASE_URL + `/api/member/states/${numericCountryId}`;

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });
    return response;
  } catch (error) {
    console.error("STATES API ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER CITIES
// GET /api/member/cities/{state_id}
//
// Example:
// /api/member/cities/2
// ===

export async function getMemberCities(accessToken, stateId) {
  requireToken(accessToken);

  const numericStateId = Number(stateId);

  if (!Number.isFinite(numericStateId) || numericStateId <= 0) {
    throw new Error("Valid state ID is required to load cities.");
  }

  const URL = BASE_URL + `/api/member/cities/${numericStateId}`;

  try {
    const response = await getMethod(URL, {
      token: accessToken,
    });
    return response;
  } catch (error) {
    console.error("CITIES API ERROR:", error);

    throw error;
  }
}

// ===
// UPDATE MEMBER EDUCATION STATUS
// POST /api/member/education-status/update
//
// Request:
// {
//   "id": 3,
//   "status": 1
// }
// ===

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

  try {
    const response = await postMethod(URL, user, body);

    return response;
  } catch (error) {
    console.error("EDUCATION STATUS UPDATE ERROR:", error);

    throw error;
  }
}

// ===
// GET MEMBER EDUCATION
// ===

export async function getMemberEducation(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/member/education";

  const user = {
    token: accessToken,
  };


  try {
    const response = await getMethod(URL, user);

    return response;
  } catch (error) {

    console.error("EDUCATION API ERROR", error);

    throw error;
  }
}

// ===
// GET SINGLE MEMBER EDUCATION
// GET /api/member/education/{id}
// ===

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

// ===
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
// ===

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

  // ====
  // VALIDATION
  // ====

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

  // ====
  // REQUEST BODY
  // ====

  const body = {
    degree: degreeValue,
    institution: institutionValue,
    education_start: educationStart,
    education_end: educationEnd,
  };

  const user = {
    token: accessToken,
  };

  try {
    const response = await postMethod(URL, user, body);
    return response;
  } catch (error) {
    console.error("===");

    console.error("ADD EDUCATION API ERROR");

    console.error(error);

    console.error("===");

    throw error;
  }
}
// ===
// UPDATE MEMBER EDUCATION
// PUT /api/member/education/{id}
// ===
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
// ===

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
    if (!response.ok) {
      throw new Error(responseData?.message || "Education update failed");
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

/* ===
   DELETE MEMBER EDUCATION
   DELETE /api/member/education/{id}
=== */

export async function deleteMemberEducation(accessToken, educationId) {
  const URL = apiUrl(`/api/member/education/${educationId}`);

  try {

    const response = await fetch(URL, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.message || "Education delete failed");
    }

    return responseData;
  } catch (error) {
    console.error("DELETE API ERROR:", error);
    throw error;
  }
}

// ===
// GET MEMBER CAREER
// GET /api/member/career
// ===

export async function getMemberCareer(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing. Please login again.");
  }

  const URL = BASE_URL + "/api/member/career";

  const user = {
    token: accessToken,
  };

  try {
    const response = await getMethod(URL, user);

    return response;
  } catch (error) {
    console.error("GET MEMBER CAREER API ERROR:", error);

    throw error;
  }
}

// ===
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
// ===

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


  try {
    const response = await postMethod(URL, user, body);

    return response;
  } catch (error) {
    console.error("===");

    console.error("ADD MEMBER CAREER API ERROR");

    console.error(error);

    console.error("===");

    throw error;
  }
}

// ===
// GET SINGLE MEMBER CAREER
// GET /api/member/career/{id}
// Example: /api/member/career/1
// ===

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

  try {
    const response = await getMethod(URL, user);

    return response;
  } catch (error) {
    console.error("===");

    console.error("SINGLE CAREER API ERROR:", error);

    console.error("===");

    throw error;
  }
}
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


  try {
    const response = await postMethod(URL, user, body);
    return response;
  } catch (error) {
    console.error("===");

    console.error("UPDATE CAREER API ERROR:", error);

    console.error("===");

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

// ===
// GET MEMBER SPIRITUAL & SOCIAL BACKGROUND
// GET /api/member/spiritual-background
// ===

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

  try {
    const response = await getMethod(URL, user);
    return response;
  } catch (error) {
    console.error("===");

    console.error("SPIRITUAL BACKGROUND API ERROR");

    console.error(error);

    console.error("===");

    throw error;
  }
}

// ===
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
// ===
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
  const user = {
    token: accessToken,
  };

  return await postMethod(URL, user, body);
}

// ===
// GET MEMBER ASTRONOMIC INFORMATION
// GET /api/member/astronomic
// ===

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
  try {
    const response = await getMethod(URL, user);
    return response;
  } catch (error) {
    console.error("=====");

    console.error("GET MEMBER ASTRONOMIC API ERROR");

    console.error("MESSAGE:", error?.message);

    console.error("ERROR:", error);

    console.error("=====");

    throw error;
  }
}

// ===
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
// ===

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

  try {
    const response = await postMethod(URL, user, body);
    return response;
  } catch (error) {
    console.error("=====");

    console.error("UPDATE MEMBER ASTRONOMIC API ERROR");

    console.error("MESSAGE:", error?.message);

    console.error("RESPONSE:", JSON.stringify(error?.response?.data, null, 2));

    console.error("=====");

    throw error;
  }
}

// ===
// GET MEMBER FAMILY INFORMATION
// GET /api/member/family-info
// ===

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

  try {
    const response = await getMethod(URL, user);
    return response;
  } catch (error) {
    console.error("=====");

    console.error("GET MEMBER FAMILY INFORMATION API ERROR");

    console.error("MESSAGE:", error?.message);

    console.error("RESPONSE:", JSON.stringify(error?.response?.data, null, 2));

    console.error("=====");

    throw error;
  }
}

// ===
// UPDATE MEMBER FAMILY INFORMATION
// POST /api/member/family-info/update
//
// Request:
// {
//   "father": "Sudhakar",
//   "mother": "Swaroopa",
//   "sibling": "2"
// }
// ===

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

  try {
    const response = await postMethod(URL, user, body);
    return response;
  } catch (error) {
    console.error("=====");

    console.error("UPDATE FAMILY INFORMATION API ERROR");

    console.error(error);

    console.error("MESSAGE:", error?.message);

    console.error("RESPONSE:", JSON.stringify(error?.response?.data, null, 2));

    console.error("=====");

    throw error;
  }
}

// ===
// GET MEMBER LANGUAGES
// GET /api/member/language
// ===

export async function getMemberLanguages(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/member/language";

  const user = {
    token: accessToken,
  };

  try {
    const response = await getMethod(URL, user);
    return response;
  } catch (error) {
    console.error("=====");
    console.error("GET MEMBER LANGUAGES ERROR");
    console.error(error);
    console.error("=====");

    throw error;
  }
}
// ===
// UPDATE MEMBER LANGUAGES
// POST /api/member/language/update
// ===

// ===
// UPDATE MEMBER LANGUAGES
// POST /api/member/language/update
// ===

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

  try {
    const response = await postMethod(URL, user, body);
    return response;
  } catch (error) {
    console.error("=====");
    console.error("UPDATE MEMBER LANGUAGES ERROR");
    console.error(error);
    console.error(
      "ERROR RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.error("=====");

    throw error;
  }
}
// ===
// GET ALL LANGUAGES
// GET /api/get_languages
// ===

export async function getLanguages(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is missing.");
  }

  const URL = BASE_URL + "/api/get_languages";

  const user = {
    token: accessToken,
  };

  try {
    const response = await getMethod(URL, user);

    return response;
  } catch (error) {
    console.error("GET ALL LANGUAGES ERROR:", error);
    throw error;
  }
}
