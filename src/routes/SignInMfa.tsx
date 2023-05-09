import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { finishMfaSignIn } from "../firebase/firebase";

function SignInMfa() {
  const [mfaCode, setMfaCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { displayName } = location.state;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await finishMfaSignIn(mfaCode);
      setMfaCode("");
      navigate("/profile");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card">
      {displayName && (
        <>
          <p>Hint: {displayName}</p>
          <form className="form-container" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="mfaCode"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Enter Mfa Code"
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
export default SignInMfa;
