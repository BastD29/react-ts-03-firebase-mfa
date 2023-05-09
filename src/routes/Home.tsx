import { ChangeEvent, FormEvent, useState } from "react";
// import reactLogo from ".././assets/react.svg";
import {
  // auth,
  getMfaResolver,
  signInUser,
  startMfaSignin,
} from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

// import ".././App.css";

const defaultFormFields = {
  email: "",
  password: "",
};

function Home() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;
  const navigate = useNavigate();

  const resetFormFields = () => {
    return setFormFields(defaultFormFields);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const userCredential = await signInUser(email, password);

      if (userCredential) {
        resetFormFields();
        navigate("/profile");
      }
    } catch (error: any) {
      if (
        error instanceof FirebaseError &&
        error.code == "auth/multi-factor-auth-required"
      ) {
        // The user is a multi-factor user.
        // Second factor challenge is required.

        const resolver = getMfaResolver(error);

        // Pass index [0] to get the first multi-factor hint,
        // otherwise create a dropdown menu to allow the user
        // to choose what multi-factor he wants to use.
        await startMfaSignin(resolver.hints[0], resolver.session);
        // Redirect to the MFA form and pass the hint.
        navigate("/signin-with-mfa", {
          state: {
            displayName: resolver.hints[0].displayName,
          },
        });
      } else if (error.code == "auth/wrong-password") {
        console.log("User Sign In Failed", error.message);
      }
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  return (
    <div className="App">
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <div>
            <input id="recaptcha" type="submit" />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot your Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
