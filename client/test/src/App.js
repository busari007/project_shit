import "./Styles/App.css";
import SignUp from "./components/signUpPage";
import SignIn from "./components/signInPage";
import Home from "./components/Home";
import { BrowserRouter,Routes, Route} from "react-router-dom";
import React from "react";

class App extends React.Component{

  constructor(){
    super();
  this.state={
      username:"",
      matric_num:"",
      password:"",
      matricNum_valid:false,
      password_valid:false,
      homesRender:false,
      result:false,
      form_valid:false,
      email:"",
        usernameValid:false,
        emailValid:false,
      Errors:{
          C_username:"",
          C_email:"",
          C_password:"",
          C_matricNum:""
      },
    submitError:false
  }
}
 render(){
  return(
    <div>
       <BrowserRouter>
        <Routes>
            <Route path="/signUp" element={<SignUp state={this.state}/>}/>  
            <Route path="/home" element={<Home/>}/>
            <Route path="/" element={<SignIn state={this.state}/>}/>
       </Routes>    
       </BrowserRouter>
    </div>
  );
}
}
export default App;