import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { phone } from "phone";
import { startEnrollMultiFactor } from "../firebase/firebase";

// import the toggle button css.
// https://www.w3schools.com/howto/howto_css_switch.asp

const defaultFormFields = {
  tel: "",
  country: "",
};

function Profile() {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const [isChecked, setIsChecked] = useState(false);
  const [phoneInput, setPhoneInput] = useState(false);
  const { currentUser, signOut } = useContext(AuthContext);
  const { tel, country } = formFields;
  const navigate = useNavigate();

  // Watch the toggle button
  useEffect(() => {
    if (!isChecked) {
      setPhoneInput(true);
    }
  }, [isChecked]);

  const resetFormFields = () => {
    return setFormFields(defaultFormFields);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const phoneNumber = phone(tel, { country: country });

      if (phoneNumber) {
        await startEnrollMultiFactor(phoneNumber.phoneNumber);
      }

      resetFormFields();
      setPhoneInput(false);
      // Redirect to the MFA route when the phone number is successful.
      navigate("/confirm-mfa-enroll");
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleButton = (e: ChangeEvent<HTMLInputElement>) =>
    setIsChecked(e.target.checked);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  return (
    <div>
      <h3>Welcome! {currentUser?.email}</h3>
      <div className="card">
        <p className="mfa-label">Multi-Factor Authentication</p>
        <label className="switch">
          <input
            type="checkbox"
            onChange={handleToggleButton}
            checked={isChecked}
          />
          <span className="slider"></span>
        </label>
        <form className="form-container" onSubmit={handleSubmit}>
          {isChecked && phoneInput && (
            <>
              <div className="container">
                <input
                  type="tel"
                  name="tel"
                  value={tel}
                  onChange={handleChange}
                  pattern="^\d{1,15}$" // no more than 15 digits
                  required
                  placeholder="Your Phone Number"
                />
                <select name="country" value={country} onChange={handleChange}>
                  <option value="US">US</option>
                  <option value="MX">MX</option>
                  <option value="FR">FR</option>
                </select>
              </div>
              <input id="recaptcha" type="submit" value="Send Phone" />
            </>
          )}
        </form>
      </div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
export default Profile;
