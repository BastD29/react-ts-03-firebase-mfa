import { ChangeEvent, FormEvent, useState } from "react";
import { registerUser } from "../firebase/firebase";

const defaultFormFields = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { displayName, email, password, confirmPassword } = formFields;

  const resetFormFields = () => {
    return setFormFields(defaultFormFields);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (password !== confirmPassword) {
        alert("Passwords did not match.");
        return;
      }

      // The user will be login upon successful registration.
      await registerUser(displayName, email, password);
      resetFormFields();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("Email already exists!");
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
              type="text"
              name="displayName"
              value={displayName}
              onChange={handleChange}
              placeholder="Enter Your Name"
              required
            />
          </div>
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
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>
          <div>
            <input type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
export default Register;
