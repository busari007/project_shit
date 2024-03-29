import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [matricNum, setMatricNum] = useState("");
  const [password, setPassword] = useState("");
  const [matricNumError, setMatricNumError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();

  const handleMatricNumChange = (e) => {
    const newValue = e.target.value;
    setMatricNum(newValue);
  };

  const handlePasswordChange = (e) => {
    const newValue = e.target.value;
    setPassword(newValue);
  };

  const validateMatricNum = (value) => {
    if (value.length === 0) {
      setMatricNumError("Enter your Matriculation Number/ Application Id");
      return false;
    }
    const isValid = value.match(/^\d{2}\/\d{4}$/) || value.match(/^\d{6}$/) || value.match(/\b[a-zA-Z]{6,}\b/);
    setMatricNumError(isValid ? "" : "Improper format");
    return isValid;
  };

  const validatePassword = (value) => {
    if (value.length === 0) {
      setPasswordError("Enter your password");
      return false;
    }
    const isValid = value.length >= 6;
    setPasswordError(isValid ? "" : "Password should be at least 6 characters");
    return isValid;
  };

  useEffect(() => {
    setFormValid(validateMatricNum(matricNum) && validatePassword(password));
  }, [matricNum, password]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    Axios.post(`https://${window.location.hostname}:5000/passwordChange`, {
      matric_num: matricNum,
      password: password
    }).then((res) => {
      navigate('/passwordChanged', { state: { data: res.data.id } });
    }).catch((err) => {
      console.log(err);
      if (err.message === "Request failed with status code 401") {
        window.alert("Invalid Details");
      }else if(err.message === "Network Error") {
        window.alert("The Server is offline");
      }else if(err.message === "Request failed with status code 500") {
        window.alert("Internal Server Error");
      }
    });
  };
  

  return (
    <div>
      <div className='container' style={{ marginTop: "7%" }}>
        <h1 className='header' style={{ marginTop: "15vh" }}>Change Password</h1>
        <form className='form' style={{ marginLeft: "-5%" }} onSubmit={(e) => handleSubmit(e)}>
          <label>Enter your Matric Number/Username/Application ID</label>
          <label className="errors">{matricNumError}</label>
          <input id="forgotPasswordEmail" type='text' onChange={handleMatricNumChange} value={matricNum} />
          <label>Enter your current password</label>
          <label className="errors">{passwordError}</label> 
          <input id="currentPassword" type="password" onChange={handlePasswordChange} value={password} />
          {formValid ? "": (<label className="submitting_confirmation">Ensure all fields are filled</label>)}
          <input type='submit' className='submit'  style={{ width: "40%", marginLeft: "33.5%" }} />
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
