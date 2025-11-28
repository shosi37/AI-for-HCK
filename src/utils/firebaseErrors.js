// src/utils/firebaseErrors.js

export function translateFirebaseError(code) {
  // ALL login, signup, reset-password related credential errors → same message
  const invalidEverywhere = [
    "auth/invalid-credential",
    "auth/wrong-password",
    "auth/user-not-found",
    "auth/invalid-email",
    "auth/missing-email",
    "auth/missing-password",
    "auth/too-many-requests",
    "auth/email-not-found",
    "auth/user-disabled",
    "auth/internal-error",
    "auth/network-request-failed",
    "auth/invalid-login",
  ];

  // Applies to Login + Signup + Reset Password
  if (invalidEverywhere.includes(code)) {
    return "Invalid email or password";
  }

  // Signup-specific
  if (code === "auth/email-already-in-use") {
    return "This email is already registered";
  }

  if (code === "auth/weak-password") {
    return "Password should be at least 6 characters";
  }

  // Default fallback
  return "Something went wrong. Please try again.";
}
