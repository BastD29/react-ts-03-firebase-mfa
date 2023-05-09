import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  NextOrObserver,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  applyActionCode,
  sendPasswordResetEmail,
  confirmPasswordReset,
  RecaptchaVerifier,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  MultiFactorResolver,
  getMultiFactorResolver,
  MultiFactorInfo,
  MultiFactorSession,
  PhoneInfoOptions,
} from "firebase/auth";
import { getFirebaseConfig } from "./firebase-config";

const app = initializeApp(getFirebaseConfig());
export const auth = getAuth(app);

export const signInUser = async (email: string, password: string) => {
  if (!email && !password) return;

  return await signInWithEmailAndPassword(auth, email, password);
};

export const userStateListener = (callback: NextOrObserver<User>) => {
  return onAuthStateChanged(auth, callback);
};

export const SignOutUser = async () => await signOut(auth);

export const registerUser = async (
  displayName: string,
  email: string,
  password: string
) => {
  if (!email && !password) return;

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (userCredential && auth.currentUser) {
    try {
      sendEmailVerification(auth.currentUser);
      updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: "https://robohash.org/2?set=set2",
      });
    } catch (error) {
      console.log(error);
    }
  }

  return userCredential;
};

export const confirmUserEmail = async (oobCode: string) => {
  if (!oobCode) return;

  try {
    await applyActionCode(auth, oobCode).then(() =>
      alert("Your email has been verified!")
    );
  } catch (error: any) {
    alert(error.code);
  }

  return;
};

export const passwordReset = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const confirmThePasswordReset = async (
  oobCode: string,
  newPassword: string
) => {
  if (!oobCode && !newPassword) return;

  return await confirmPasswordReset(auth, oobCode, newPassword);
};

let verificationId: string | null = null;

export const startEnrollMultiFactor = async (phoneNumber: string | null) => {
  const recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha",
    { size: "invisible" },
    auth
  );

  if (auth.currentUser) {
    verificationId = await multiFactor(auth.currentUser)
      .getSession()
      .then(function (multiFactorSession) {
        // Specify the phone number and pass the MFA session.
        const phoneInfoOptions = {
          phoneNumber: phoneNumber,
          session: multiFactorSession,
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);

        // Send SMS verification code.
        return phoneAuthProvider.verifyPhoneNumber(
          phoneInfoOptions,
          recaptchaVerifier
        );
      })
      .catch(function (error) {
        if (error.code == "auth/invalid-phone-number") {
          alert(
            `Error with phone number formatting. 
           Phone numbers must start with +. ${error}`
          );
        } else {
          alert(`Error enrolling second factor. ${error}`);
        }
        throw error;
      });
  } else {
    // The user is not verified.
    console.log("no user");
    return;
  }
};

export const finishEnrollMultiFactor = async (verificationCode: string) => {
  if (verificationId && auth.currentUser) {
    // Ask user for the verification code. Then:
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

    // Complete enrollment.
    await multiFactor(auth.currentUser)
      .enroll(multiFactorAssertion, "My cellphone number")
      .catch(function (error) {
        alert(`Error finishing second factor enrollment. ${error}`);
        throw error;
      });
    verificationId = null;
  }
};

let multiFactorResolver: MultiFactorResolver | null = null;

export const getMfaResolver = (error: any) => {
  multiFactorResolver = getMultiFactorResolver(auth, error);
  return multiFactorResolver;
};

export const startMfaSignin = async (
  multiFactorHint: MultiFactorInfo,
  session: MultiFactorSession
  // MultiFactorSessionImpl does not exist
  // session: MultiFactorSessionImpl
) => {
  const recaptchaVerifier = new RecaptchaVerifier(
    // specifies the ID of the reCAPTCHA element on the web page. In this case, the reCAPTCHA element is assumed to have an ID of "recaptcha", which is the same as the first argument.
    "recaptcha",
    // options object that configures the size of the reCAPTCHA widget. In this case, the size is set to "invisible", which means that the reCAPTCHA widget is not visible on the page and is triggered programmatically when needed.
    { size: "invisible" },
    // instance of the Firebase auth object, which provides the necessary configuration to initialize the reCAPTCHA verifier
    auth
  );

  if (multiFactorHint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
    const phoneInfoOptions: PhoneInfoOptions = {
      multiFactorHint: multiFactorHint,
      session: session,
    };
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    // Send SMS verification code
    verificationId = await phoneAuthProvider
      .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
      .catch(function (error) {
        alert(`Error verifying phone number. ${error}`);
        throw error;
      });
  } else {
    alert("Only phone number second factors are supported.");
  }
};

export const finishMfaSignIn = async (verificationCode: string) => {
  // Get the SMS verification code sent to the user.
  if (verificationId && multiFactorResolver) {
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

    // Complete sign-in.
    await multiFactorResolver
      .resolveSignIn(multiFactorAssertion)
      .then(function (userCredential) {
        // User successfully signed in with the second factor phone number.
        console.log(
          `${userCredential} successfully signed in with the second factor phone number`
        );
      })
      .catch(function (error: any) {
        alert(`Error completing sign in. ${error}`);
        throw error;
      });
  }

  multiFactorResolver = null;
  verificationId = null;
};
