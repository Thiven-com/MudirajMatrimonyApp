import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import RazorpayCheckout from 'react-native-razorpay';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";

import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

import {
  createPayment,
  getPackageDetails,
  getPaymentTypes,
  getToken,
  getUserData,
  successPayment
} from "../utils/Functions";

const DEFAULT_PLAN = {
  name: "Premium Membership",
  duration: "12 Months Plan",
  badge: "Best Value",
  price: 2999,
  originalPrice: 4999,
  discountPercent: 40,
};


const FALLBACK_PAYMENT_METHODS = [
  {
    key: "upi",
    icon: "flash-outline",
    label: "UPI",
    subtitle: "Pay using any UPI App",
    recommended: true,
  },
  {
    key: "card",
    icon: "card-outline",
    label: "Debit / Credit Cards",
    subtitle: "Visa, MasterCard, RuPay",
    recommended: false,
  },
  {
    key: "netbanking",
    icon: "business-outline",
    label: "Net Banking",
    subtitle: "All major banks supported",
    recommended: false,
  },
  {
    key: "wallet",
    icon: "wallet-outline",
    label: "Wallets",
    subtitle: "PhonePe, Paytm, Amazon Pay & more",
    recommended: false,
  },
  {
    key: "emi",
    icon: "calendar-outline",
    label: "EMI / Pay Later",
    subtitle: "Pay in easy installments",
    recommended: false,
  },
];


const TRUST_BADGES = [
  {
    icon: "shield-checkmark-outline",
    title: "100% Secure",
    subtitle: "Your payments are safe with us",
  },
  {
    icon: "ribbon-outline",
    title: "Trusted by Thousands",
    subtitle: "Join 1L+ happy Mudhiraj families",
  },
  {
    icon: "headset-outline",
    title: "24/7 Support",
    subtitle: "We're here to help you anytime",
  },
];


const getPaymentIcon = (value) => {
  const text = String(value || "").toLowerCase();

  if (text.includes("upi")) {
    return "flash-outline";
  }

  if (
    text.includes("card") ||
    text.includes("credit") ||
    text.includes("debit")
  ) {
    return "card-outline";
  }

  if (text.includes("bank") || text.includes("netbank")) {
    return "business-outline";
  }

  if (
    text.includes("wallet") ||
    text.includes("paytm") ||
    text.includes("phonepe")
  ) {
    return "wallet-outline";
  }

  if (text.includes("emi") || text.includes("later")) {
    return "calendar-outline";
  }

  return "card-outline";
};

const getPaymentLabel = (item) => {
  return (
    item?.label ||
    item?.name ||
    item?.title ||
    item?.payment_method_name ||
    item?.payment_type_name ||
    item?.payment_method ||
    "Payment"
  );
};

const getPaymentKey = (item, index) => {
  const value =
    item?.key ||
    item?.slug ||
    item?.code ||
    item?.payment_method ||
    item?.payment_type ||
    item?.name ||
    item?.title;

  if (value) {
    return String(value).toLowerCase().trim().replace(/\s+/g, "_");
  }

  return `payment_${index}`;
};

const extractPackageData = (response) => {
  if (!response) {
    return null;
  }

  let data = response?.data;

  if (data?.package) {
    data = data.package;
  }

  if (data?.package_details) {
    data = data.package_details;
  }

  if (data?.packageDetails) {
    data = data.packageDetails;
  }

  if (!data && response?.package) {
    data = response.package;
  }

  if (!data && response?.package_details) {
    data = response.package_details;
  }

  if (!data && response?.packageDetails) {
    data = response.packageDetails;
  }

  if (!data && typeof response === "object") {
    data = response;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data;
};

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // React Native CLI:
  // navigation.navigate("PaymentScreen", {
  //   packageId: 3,
  // });

  const { packageId } = route.params || {};

  const [plan, setPlan] = useState(DEFAULT_PLAN);

  const [paymentMethods, setPaymentMethods] = useState(
    FALLBACK_PAYMENT_METHODS,
  );

  const [selectedMethod, setSelectedMethod] = useState("upi");

  const [isLoadingPackage, setIsLoadingPackage] = useState(true);

  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(true);

  const [isPaying, setIsPaying] = useState(false);


  const selectedPackageId = Number(
    Array.isArray(packageId) ? packageId[0] : packageId,
  );

  useEffect(() => {
    loadPackageDetails();
    loadPaymentTypes();
  }, [packageId]);

  const loadPackageDetails = async () => {
    try {
      setIsLoadingPackage(true);

      console.log("Package ID:", selectedPackageId);

      if (!selectedPackageId || Number.isNaN(selectedPackageId)) {
        console.log("Package ID is missing.");

        Alert.alert(
          "Error",
          "Package ID is missing. Please select a package again.",
        );

        return;
      }

      const token = await getToken();

      console.log("Token exists:", !!token);

      if (!token) {
        Alert.alert("Login Required", "Please login again.");

        return;
      }

      const response = await getPackageDetails(
        token,
        selectedPackageId,
      );
      console.log(JSON.stringify(response, null, 2));
      if (
        response?.success === 0 ||
        response?.success === false ||
        response?.result === false
      ) {
        Alert.alert(
          "Package Error",
          response?.message ||
          "Unable to load package details.",
        );

        return;
      }

      const data = extractPackageData(response);

      console.log("Extracted package data:", data);

      if (!data) {
        console.log("Package data not found in response.");

        return;
      }

      const packageName =
        data?.name ||
        data?.package_name ||
        data?.packageName ||
        data?.title ||
        "Premium Membership";

      let duration =
        data?.duration ||
        data?.validity ||
        data?.package_duration ||
        data?.package_validity ||
        data?.duration_text ||
        "";

      if (!duration && data?.duration_days) {
        duration = `${data.duration_days} Days`;
      }

      if (!duration && data?.validity_days) {
        duration = `${data.validity_days} Days`;
      }

      if (!duration) {
        duration = "12 Months Plan";
      }

      const price = Number(
        data?.price ??
        data?.amount ??
        data?.package_price ??
        data?.selling_price ??
        data?.discounted_price ??
        DEFAULT_PLAN.price,
      );

      const originalPrice = Number(
        data?.original_price ??
        data?.originalPrice ??
        data?.mrp ??
        data?.regular_price ??
        data?.actual_price ??
        price,
      );

      let discountPercent = 0;

      if (originalPrice > price) {
        discountPercent = Math.round(
          ((originalPrice - price) / originalPrice) * 100,
        );
      }

      if (!discountPercent && data?.discount_percentage) {
        discountPercent = Number(
          data.discount_percentage,
        );
      }

      if (!discountPercent && data?.discountPercent) {
        discountPercent = Number(
          data.discountPercent,
        );
      }

      const badge =
        data?.badge ||
        data?.label ||
        data?.package_badge ||
        (discountPercent > 0 ? "Best Value" : "Popular");

      setPlan({
        name: packageName,
        duration,
        badge,
        price,
        originalPrice,
        discountPercent,
      });
    } catch (error) {
  

      console.error(
        "GET PACKAGE DETAILS ERROR",
      );

      console.error(error);

      console.error(
        "Error message:",
        error?.message,
      );

      Alert.alert(
        "Package Error",
        error?.message ||
        "Something went wrong while loading package details.",
      );
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // ===================================================
  // LOAD PAYMENT TYPES
  // ===================================================

  const loadPaymentTypes = async () => {
    try {
      setIsLoadingPaymentTypes(true);
      console.log("GET PAYMENT TYPES");
      const token = await getToken();
      console.log("Token exists:", !!token);
      if (!token) {
        console.log(
          "Token not available. Using fallback payment methods.",
        );
        setPaymentMethods(
          FALLBACK_PAYMENT_METHODS,
        );
        return;
      }
      const response = await getPaymentTypes(token);

    
     
      console.log(JSON.stringify(response, null, 2));
      if (
        response?.success === 0 ||
        response?.success === false ||
        response?.result === false
      ) {
        console.log(
          "Payment types API failed. Using fallback.",
        );

        setPaymentMethods(
          FALLBACK_PAYMENT_METHODS,
        );

        return;
      }

      let methods = [];

      if (Array.isArray(response)) {
        methods = response;
      } else if (Array.isArray(response?.data)) {
        methods = response.data;
      } else if (
        Array.isArray(response?.data?.payment_types)
      ) {
        methods = response.data.payment_types;
      } else if (
        Array.isArray(response?.data?.paymentTypes)
      ) {
        methods = response.data.paymentTypes;
      } else if (
        Array.isArray(response?.payment_types)
      ) {
        methods = response.payment_types;
      } else if (
        Array.isArray(response?.paymentTypes)
      ) {
        methods = response.paymentTypes;
      } else if (
        Array.isArray(response?.types)
      ) {
        methods = response.types;
      }

      if (!methods.length) {
        console.log(
          "No payment methods received. Using fallback.",
        );

        setPaymentMethods(
          FALLBACK_PAYMENT_METHODS,
        );

        return;
      }

      const mappedMethods = methods.map(
        (item, index) => {
          const label = getPaymentLabel(item);

          const key = getPaymentKey(
            item,
            index,
          );

          const icon =
            item?.icon ||
            getPaymentIcon(
              `${label} ${key}`,
            );

          return {
            key,
            icon,
            label,
            subtitle:
              item?.subtitle ||
              item?.description ||
              item?.details ||
              "",
            recommended:
              item?.recommended === true ||
              item?.is_recommended === true ||
              key === "upi",
          };
        },
      );

      setPaymentMethods(mappedMethods);

      const selectedStillExists =
        mappedMethods.some(
          (item) =>
            item.key === selectedMethod,
        );

      if (!selectedStillExists) {
        setSelectedMethod(
          mappedMethods[0]?.key || "upi",
        );
      }
    } catch (error) {
     
      console.error(error);

      setPaymentMethods(
        FALLBACK_PAYMENT_METHODS,
      );
    } finally {
      setIsLoadingPaymentTypes(false);
    }
  };

  // ===================================================
  // PAY
  // ===================================================

  const handlePay = async () => {
    if (isPaying) {
      return;
    }

    // -----------------------------------------------
    // PACKAGE ID
    // -----------------------------------------------

    if (
      !selectedPackageId ||
      Number.isNaN(selectedPackageId)
    ) {
      Alert.alert(
        "Payment Error",
        "Package ID is missing.",
      );

      return;
    }

    // -----------------------------------------------
    // PAYMENT METHOD
    // -----------------------------------------------

    if (!selectedMethod) {
      Alert.alert(
        "Payment Error",
        "Please select a payment method.",
      );

      return;
    }

    try {
      setIsPaying(true);
      const token = await getToken();
      const user = await getUserData();
      console.log("User data:", user);
      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session has expired. Please login again.",
        );

        return;
      }
      const amount = Number(plan.price);

      if (!amount || amount <= 0) {
        Alert.alert(
          "Payment Error",
          "Invalid package amount.",
        );

        return;
      }
      const response = await createPayment(
        token,
        selectedPackageId,
        amount,
        selectedMethod,
      );
      if (!response) {
        Alert.alert(
          "Payment Failed",
          "No response received from the server.",
        );

        return;
      }
      if (
        response.success === 0 ||
        response.success === false ||
        response.result === false
      ) {
        Alert.alert(
          "Payment Failed",
          response.message ||
          "Unable to create payment.",
        );

        return;
      }
      if (
        response.success === 1 ||
        response.success === true
      ) {
        const razorpayOrderId = response.paymentOrderId;

        if (!razorpayOrderId) {
          Alert.alert(
            "Payment Error",
            "Razorpay order ID was not received.",
          );

          return;
        }
        try {
          console.log(selectedMethod);

          const RAZORPAY_KEY = response?.razorpay_key || "rzp_test_R9GdWcNAde0fOH";
          const amountInPaisa = Math.round(response?.amount) + "00";

          const options = {
            description: 'Mudiraj Matrimony Payment',
            currency: 'INR',
            key: RAZORPAY_KEY,
            amount: amountInPaisa,
            name: 'Mudiraj Matrimony',
            order_id: razorpayOrderId,
            prefill: {
              name: user?.data?.name || '',
              email: user?.data?.email || '',
              contact: user?.data?.mobile || '',
            },
            theme: {
              color: Colors.primaryRed,
            },
          };


          RazorpayCheckout.open(options).then(
            async data => {
              let params = {
                razorpay_payment_id: data?.razorpay_payment_id,
                razorpay_order_id: data?.razorpay_order_id,
                package_id: selectedPackageId,
                payment_method: response?.payment_method,
                amount: response?.amount,
                payment_type: "package_payment"
              }
              const resp = await successPayment(
                token,
                params,
              );
              if (resp?.success === 1 || resp?.success === true) {
                Alert.alert(
                  "Package Activated",
                  "Your package has been activated successfully.",
                );
              } else {
                Alert.alert(
                  "Package Activation Failed",
                  resp?.message || "Failed to activate the package.",
                );
              }
            },
          ).catch(error => {
            Alert.alert(
              "Payment Failed",
              `Payment failed or was cancelled. Please try again. Error: ${error?.description || error?.message || 'Unknown error'}`,
            );
          });

        } catch (error) {
          Alert.alert(
            "Error",
            `Payment Error`,
          );
        }
      };

      return;


      // -----------------------------------------------
      // UNKNOWN RESPONSE
      // -----------------------------------------------

      Alert.alert(
        "Payment Status",
        response.message ||
        "Unexpected server response.",
      );
    } catch (error) {

      Alert.alert(
        "Payment Failed",
        error?.message ||
        "Something went wrong while creating the payment.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handleBack = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  // Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          handleBack,
        );

      return () =>
        subscription.remove();
    }, [handleBack]),
  );

  const discountAmount = Math.max(
    0,
    Number(plan.originalPrice) -
    Number(plan.price),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          Colors.primaryRed
        }
      />

      <LinearGradient
        colors={Colors.gradientLogo}
        style={styles.header}
      >
        <TouchableOpacity
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          activeOpacity={0.75}
          onPress={handleBack}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>
            Payment
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Secure & Safe Transactions
          </Text>
        </View>

        <View
          style={
            styles.headerSecureBlock
          }
        >
          <Feather
            name="shield"
            size={20}
            color={Colors.white}
          />

          <Text
            style={
              styles.headerSecureText
            }
          >
            {"100% Secure\nPayment"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {isLoadingPackage ? (
          <View
            style={
              styles.packageLoading
            }
          >
            <ActivityIndicator
              size="small"
              color={
                Colors.primaryRed
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading package details...
            </Text>
          </View>
        ) : (
          <View style={styles.planCard}>
            <View
              style={
                styles.planIconCircle
              }
            >
              <Feather
                name="award"
                size={26}
                color={Colors.white}
              />
            </View>

            <View
              style={
                styles.planTextBlock
              }
            >
              <Text
                style={
                  styles.planName
                }
              >
                {plan.name}
              </Text>

              <View
                style={
                  styles.planMetaRow
                }
              >
                <Text
                  style={
                    styles.planDuration
                  }
                >
                  {plan.duration}
                </Text>

                <View
                  style={
                    styles.planBadge
                  }
                >
                  <Text
                    style={
                      styles.planBadgeText
                    }
                  >
                    {plan.badge}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={
                styles.planPriceBlock
              }
            >
              <Text
                style={
                  styles.planPrice
                }
              >
                ₹{" "}
                {Number(
                  plan.price,
                ).toLocaleString(
                  "en-IN",
                )}
              </Text>

              {Number(
                plan.originalPrice,
              ) >
                Number(plan.price) && (
                  <Text
                    style={
                      styles.planOriginalPrice
                    }
                  >
                    ₹{" "}
                    {Number(
                      plan.originalPrice,
                    ).toLocaleString(
                      "en-IN",
                    )}
                  </Text>
                )}
            </View>

            {plan?.discountPercent > 0 &&
              <View
                style={
                  styles.planDiscountBlock
                }
              >
                <Text
                  style={
                    styles.planDiscountPercent
                  }
                >
                  {plan.discountPercent}%
                </Text>

                <Text
                  style={
                    styles.planDiscountLabel
                  }
                >
                  OFF
                </Text>
              </View>}
          </View>
        )}

        <Text
          style={
            styles.sectionHeading
          }
        >
          Select Payment Method
        </Text>

        {isLoadingPaymentTypes ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="small"
              color={
                Colors.primaryRed
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading payment methods...
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.methodsList
            }
          >
            {paymentMethods.map(
              (method) => (
                <PaymentMethodRow
                  key={method.key}
                  method={method}
                  selected={
                    selectedMethod ===
                    method.key
                  }
                  onSelect={() =>
                    setSelectedMethod(
                      method.key,
                    )
                  }
                />
              ),
            )}
          </View>
        )}

        <Text
          style={
            styles.sectionHeading
          }
        >
          Order Summary
        </Text>

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Plan
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {plan.name}
            </Text>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Duration
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {plan.duration}
            </Text>
          </View>

          {Number(
            plan.originalPrice,
          ) >
            Number(plan.price) && (
              <View
                style={
                  styles.summaryRow
                }
              >
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Original Price
                </Text>

                <Text
                  style={
                    styles.summaryStrikeValue
                  }
                >
                  ₹{" "}
                  {Number(
                    plan.originalPrice,
                  ).toLocaleString(
                    "en-IN",
                  )}
                </Text>
              </View>
            )}

          {discountAmount > 0 && (
            <View
              style={
                styles.summaryRow
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Discount
              </Text>

              <Text
                style={
                  styles.summaryDiscount
                }
              >
                - ₹{" "}
                {discountAmount.toLocaleString(
                  "en-IN",
                )}
              </Text>
            </View>
          )}

          <View
            style={
              styles.summaryDivider
            }
          />

          <View
            style={
              styles.summaryTotalRow
            }
          >
            <Text
              style={
                styles.summaryTotalLabel
              }
            >
              Total Amount
            </Text>

            <Text
              style={
                styles.summaryTotalValue
              }
            >
              ₹{" "}
              {Number(
                plan.price,
              ).toLocaleString(
                "en-IN",
              )}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.trustContainer
          }
        >
          {TRUST_BADGES.map(
            (item, index) => (
              <View
                key={index}
                style={
                  styles.trustItem
                }
              >
                <View
                  style={
                    styles.trustIconCircle
                  }
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={Colors.primaryRed}
                  />
                </View>

                <View
                  style={
                    styles.trustTextBlock
                  }
                >
                  <Text
                    style={
                      styles.trustTitle
                    }
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.trustSubtitle
                    }
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            ),
          )}
        </View>


        <View
          style={
            styles.bottomSpacing
          }
        />
      </ScrollView>
      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.footerTerms
          }
        >
          <Feather
            name="lock"
            size={16}
            color={Colors.primaryRed}
          />

          <Text
            style={
              styles.footerTermsText
            }
          >
            By continuing, you agree to our{" "}
            <Text
              style={
                styles.footerTermsBold
              }
            >
              Terms & Conditions
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={
            isPaying ||
            isLoadingPackage ||
            isLoadingPaymentTypes
          }
          onPress={handlePay}
          style={[
            styles.payButton,
            (isPaying ||
              isLoadingPackage ||
              isLoadingPaymentTypes) &&
            styles.payButtonDisabled,
          ]}
        >
          {isPaying ? (
            <>
              <ActivityIndicator
                size="small"
                color={Colors.white}
              />

              <Text
                style={
                  styles.payButtonText
                }
              >
                Processing...
              </Text>
            </>
          ) : (
            <>
              <Text
                style={
                  styles.payButtonText
                }
              >
                Pay ₹{" "}
                {Number(
                  plan.price,
                ).toLocaleString(
                  "en-IN",
                )}
              </Text>

              <Feather
                name="arrow-right"
                size={20}
                color={Colors.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function PaymentMethodRow({
  method,
  selected,
  onSelect,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      style={[
        styles.paymentMethodRow,
        selected &&
        styles.paymentMethodRowSelected,
      ]}
    >
      <View
        style={
          styles.paymentMethodIconCircle
        }
      >
        <Ionicons
          name={
            method.icon ||
            getPaymentIcon(method.label)
          }
          size={23}
          color={
            selected
              ? Colors.primaryRed
              : Colors.textDark
          }
        />
      </View>

      <View
        style={
          styles.paymentMethodContent
        }
      >
        <View
          style={
            styles.paymentMethodTitleRow
          }
        >
          <Text
            style={[
              styles.paymentMethodTitle,
              selected &&
              styles.paymentMethodTitleSelected,
            ]}
          >
            {method.label}
          </Text>

          {method.recommended && (
            <View
              style={
                styles.recommendedBadge
              }
            >
              <Text
                style={
                  styles.recommendedBadgeText
                }
              >
                Recommended
              </Text>
            </View>
          )}
        </View>

        {!!method.subtitle && (
          <Text
            style={
              styles.paymentMethodSubtitle
            }
          >
            {method.subtitle}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.radioOuter,
          selected &&
          styles.radioOuterSelected,
        ]}
      >
        {selected && (
          <View
            style={
              styles.radioInner
            }
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitleBlock: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    color: Colors.white,
    fontSize:
      FontSizes?.heading ||
      20,
    fontFamily:
      Fonts?.display?.bold,
  },

  headerSubtitle: {
    color: Colors.white,
    opacity: 0.85,
    marginTop: 2,
    fontSize:
      FontSizes?.small ||
      12,
    fontFamily:
      Fonts?.body?.regular,
  },

  headerSecureBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  headerSecureText: {
    color: Colors.white,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "right",
    fontFamily:
      Fonts?.body?.medium,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  packageLoading: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loadingContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color:
      Colors.textMuted ||
      "#777",
    fontFamily:
      Fonts?.body?.regular,
  },

  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      Colors.border ||
      "#EAEAEA",
  },

  planIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      Colors.primaryRed,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  planTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  planName: {
    fontSize: 15,
    color:
      Colors.textDark ||
      "#222",
    fontFamily:
      Fonts?.display?.bold,
  },

  planMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 5,
  },

  planDuration: {
    fontSize: 12,
    color:
      Colors.textMuted ||
      "#777",
    fontFamily:
      Fonts?.body?.regular,
  },

  planBadge: {
    marginLeft: 7,
    backgroundColor:
      Colors.primaryRed,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  planBadgeText: {
    color: Colors.white,
    fontSize: 8,
    fontFamily:
      Fonts?.body?.bold,
  },

  planPriceBlock: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  planPrice: {
    fontSize: 17,
    color:
      Colors.primaryRed,
    fontFamily:
      Fonts?.display?.bold,
  },

  planOriginalPrice: {
    fontSize: 11,
    color:
      Colors.textMuted ||
      "#888",
    textDecorationLine:
      "line-through",
    marginTop: 2,
    fontFamily:
      Fonts?.body?.regular,
  },

  planDiscountBlock: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  planDiscountPercent: {
    color:
      Colors.primaryRed,
    fontSize: 12,
    fontFamily:
      Fonts?.body?.bold,
  },

  planDiscountLabel: {
    color:
      Colors.textMuted ||
      "#777",
    fontSize: 8,
    fontFamily:
      Fonts?.body?.medium,
  },

  sectionHeading: {
    fontSize: 17,
    color:
      Colors.textDark ||
      "#222",
    fontFamily:
      Fonts?.display?.bold,
    marginBottom: 11,
  },

  methodsList: {
    marginBottom: 22,
  },

  paymentMethodRow: {
    backgroundColor: Colors.white,
    minHeight: 76,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      Colors.border ||
      "#E7E7E7",
  },

  paymentMethodRowSelected: {
    borderColor:
      Colors.primaryRed,
    backgroundColor:
      "#FFF8F8",
  },

  paymentMethodIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  paymentMethodContent: {
    flex: 1,
  },

  paymentMethodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  paymentMethodTitle: {
    fontSize: 14,
    color:
      Colors.textDark ||
      "#222",
    fontFamily:
      Fonts?.body?.bold,
  },

  paymentMethodTitleSelected: {
    color:
      Colors.primaryRed,
  },

  paymentMethodSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color:
      Colors.textMuted ||
      "#777",
    fontFamily:
      Fonts?.body?.regular,
  },

  recommendedBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor:
      "#EAF7EE",
  },

  recommendedBadgeText: {
    fontSize: 8,
    color: "#258A45",
    fontFamily:
      Fonts?.body?.bold,
  },

  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor:
      "#CFCFCF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  radioOuterSelected: {
    borderColor:
      Colors.primaryRed,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor:
      Colors.primaryRed,
  },

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor:
      Colors.border ||
      "#E7E7E7",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 12,
    color:
      Colors.textMuted ||
      "#777",
    fontFamily:
      Fonts?.body?.regular,
  },

  summaryValue: {
    fontSize: 12,
    color:
      Colors.textDark ||
      "#222",
    fontFamily:
      Fonts?.body?.medium,
    maxWidth: "65%",
    textAlign: "right",
  },

  summaryStrikeValue: {
    fontSize: 12,
    color:
      Colors.textMuted ||
      "#888",
    textDecorationLine:
      "line-through",
    fontFamily:
      Fonts?.body?.regular,
  },

  summaryDiscount: {
    fontSize: 12,
    color: "#258A45",
    fontFamily:
      Fonts?.body?.bold,
  },

  summaryDivider: {
    height: 1,
    backgroundColor:
      Colors.border ||
      "#EAEAEA",
    marginVertical: 8,
  },

  summaryTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },

  summaryTotalLabel: {
    fontSize: 15,
    color:
      Colors.textDark ||
      "#222",
    fontFamily:
      Fonts?.display?.bold,
  },

  summaryTotalValue: {
    fontSize: 19,
    color:
      Colors.primaryRed,
    fontFamily:
      Fonts?.display?.bold,
  },

  trustContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor:
      Colors.border ||
      "#E7E7E7",
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },

  trustIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      "#FFF4F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trustTextBlock: {
    flex: 1,
  },

  trustTitle: {
    fontSize: 12,
    color:
      Colors.textDark ||
      "#222",
    fontFamily:
      Fonts?.body?.bold,
  },

  trustSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color:
      Colors.textMuted ||
      "#777",
    fontFamily:
      Fonts?.body?.regular,
  },

  bottomSpacing: {
    height: 15,
  },

  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor:
      Colors.border ||
      "#E7E7E7",
  },

  footerTerms: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  footerTermsText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    color:
      Colors.textMuted ||
      "#777",
    fontFamily:
      Fonts?.body?.regular,
    lineHeight: 15,
  },

  footerTermsBold: {
    color: Colors.primaryRed,
    fontFamily: Fonts?.body?.bold,
  },

  payButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor:
      Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    gap: 9,
  },

  payButtonDisabled: {
    opacity: 0.55,
  },

  payButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts?.display?.bold,
  },
});