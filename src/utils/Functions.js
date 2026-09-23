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
export async function acceptInterest(interestId, token) {
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
export async function rejectInterest(interestId, token) {
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
