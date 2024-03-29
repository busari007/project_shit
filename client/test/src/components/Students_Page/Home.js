import "../Styles/Home.css";
import { FaArrowLeft, FaBars, FaBell, FaCopyright } from 'react-icons/fa';
import { useState, useEffect, useRef } from "react";
import logo from '../Pictures/logo.jpg';
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Axios  from "axios";

function Home (){
  const location = useLocation();
  // Retrieve username and matric_num from local storage
  const storedUsername = localStorage.getItem('username');
  const storedMatricNum = localStorage.getItem('matric_num');
  const { username = storedUsername || "Guest", matric_num = storedMatricNum || "" } = location.state || {};
  const navigate = useNavigate();  //To navigate through routes
 const [isOpen, setOpen] = useState(false); //To set slidebar to appear or disappear
 const sidebarRef = useRef(null); // A ref is a property that can hold a reference to a DOM element or a React component instance
 const [attendance, setAttendance] = useState([]);
 const [error, setError] = useState(null);
 const [loading, setLoading] = useState(true);

 function handleToggle(){
     setOpen(!isOpen);
 }

 const handleOutsideClick = (event) => {
  if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {  //To make sidebar close when a place outside of the sidebar is clicked
    setOpen(false);
  }
};

useEffect(() => {  //To handle the click event that closes the sidebar outside the sidebar
    // Save username and matric_num to local storage
    localStorage.setItem('username', username);
    localStorage.setItem('matric_num', matric_num);
  console.log(matric_num);
  Axios.post(`https://${window.location.hostname}:5000/getAttendance`,{
    matric_num: matric_num
  }).then((res)=>{
      setAttendance(res.data.records);
      console.log(res.data.records);
      console.log("Attendance data recieved");
  }).catch((error)=>{
    console.log(error);
    if(error.message === "Request failed with status code 500"){
      alert("Server's Offline");
      setError({message:"Backend Error. Please Refresh"});
      }else if(error.message === "Network Error"){
        alert("Server's Offline");
        setError({message:"Backend Error. Please Restart"});
      }else if(error.response.data.message === "No attendance records found for the specified matric_num"){
        alert("No attendance records found");
        setError(false);
      }else if(error.response.data.message === "No registered courses"){
        alert("No registered courses");
        setError(false);
      }
  })
  .finally(() => {
    setLoading(false);
  });;
  document.addEventListener('mousedown', handleOutsideClick);   

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, [matric_num,username]);

const uniqueCourses = Array.from(new Set(attendance.map(data => data.course_id))); //This extracts unique course IDs from the attendance data. The Set object is used to eliminate duplicate course IDs, and then Array.from is used to convert the set back into an array.

if (loading) {
  return <div><p style={{marginTop:"19%",fontSize:"40px",fontWeight:'bolder', textAlign:"center"}}>Loading...</p></div>;
}

    return (
      <div>
        <nav className="Header">
      <FaBars className="icons" onClick={handleToggle} />
      <img className="as_logo" src={logo} alt="logo"/>
      <h2 className="page_name">Home</h2>
    <p className="welcome_text">Welcome, {username || "Guest"}</p>
    <FaBell className="icons"/>
    </nav> 
    <div className={`sidebar ${isOpen ? 'open' : 'close'}`} ref={sidebarRef}>
      <div id="sidebarHeader">
      <FaArrowLeft style={{color:'rgb(65,65,65)'}} onClick={handleToggle} className="icons"/>
      <h2>UAS</h2>
     </div>
      <ul>
        <li><button className="sidebar-links" onClick={()=>{navigate('/courses', {state:{ username, matric_num }})}}>Course List</button></li>   {/*username and matric_num are passed into ./courses and ./addCourses as state in the navigate function*/}
        <li><button className="sidebar-links" onClick={()=>{navigate('/addCourses', {state:{ username, matric_num }})}}>Add Course</button></li>
        <li><button style={{marginRight:'29.5%'}} className="sidebar-links" onClick={()=>{navigate('/qrCodeScanner', {state:{ username, matric_num }})}}>QRCode Scanner</button></li> 
        <li><a style={{marginLeft:'31.5%'}} className="sidebar_content" href="/signIn">Log Out</a></li>    
      </ul>
      <FaCopyright style={{position:"absolute",bottom:5,left:5, fontSize:30,color:'#2a2aaf'}}/>
    </div>
    <div className="records_container">
    {uniqueCourses.map(courseId => {
      const courseData = attendance.filter(data => data.course_id === courseId);

      return (
        <div>
        <table className={`attendanceTable ${attendance.length > 4 ? "scrollable" : ""}`} key={courseData[0].course_id}>
          <caption>{courseData[0].course_name} - {courseData[0].course_code}</caption>
          <thead>
            <tr>
              <th>Attendance date</th>
              <th>Attendance time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {courseData.map((entry, entryIndex) => (
              <tr key={entryIndex}>
                <td>{entry.dateTaken}</td>
                <td>{entry.timeTaken}</td>
                <td className="status">{entry.Status}</td>
              </tr>
            ))}
          </tbody>
        </table> 
        </div>
      );
    })}
  {error? <div style={{color: "red"}}>{error.message}</div>: <p>{attendance.length === 0 && 'No attendance data yet'}</p>}
</div>

    </div>
    );
  }

export default Home;


