import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { finishEnrollMultiFactor } from "../firebase/firebase";

function ConfirmMfaEnroll() {
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSuccessMessage, setMfaSuccessMessage] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await finishEnrollMultiFactor(mfaCode);
      setMfaCode("");
      setMfaSuccessMessage(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card">
      {mfaSuccessMessage ? (
        <>
          <h3>Success you have enroll in Multi Factor Authentication</h3>
          <button onClick={() => navigate("/profile")}>Go to Profile</button>
        </>
      ) : (
        <>
          <p className="mfa-label">Insert your Mfa Code</p>
          <form className="form-container" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="mfaCode"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Mfa Code"
                pattern="^[0-9]*$"
                required
              />
              <input type="submit" value="Send Code" />
            </div>
          </form>
        </>
      )}
    </div>
  );
}
export default ConfirmMfaEnroll;
