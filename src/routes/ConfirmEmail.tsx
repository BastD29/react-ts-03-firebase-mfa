import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmUserEmail } from "../firebase/firebase";

function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirmEmailSuccess, setConfirmEmailSucess] = useState(false);

  let oobCode: string | null = searchParams.get("oobCode");

  // The hook is running twice when <React.StrictMode> is activated
  // causing the oobCode to be reused.
  useEffect(() => {
    if (oobCode) {
      try {
        confirmUserEmail(oobCode);
        setConfirmEmailSucess(true);
      } catch (error) {
        alert(error);
      }
    }

    // cleanup function.
    return () => {
      oobCode = null;
    };
  }, []);

  return (
    <div>
      {confirmEmailSuccess && oobCode ? (
        <div>
          <h3>Thankyou!</h3>
          <button onClick={() => navigate("/")}>Back to Home Page</button>
        </div>
      ) : (
        <div>
          <h3>There was a problem confirming your email.</h3>
          <button onClick={() => navigate("/")}>Back to Home Page</button>
        </div>
      )}
    </div>
  );
}
export default ConfirmEmail;
