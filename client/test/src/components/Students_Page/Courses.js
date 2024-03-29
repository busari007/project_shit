import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaBars, FaBell, FaCopyright } from 'react-icons/fa';
import logo from '../Pictures/logo.jpg';
import  Axios  from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Courses(props){
    const location = useLocation();
    // Retrieve username and matric_num from local storage
    const storedUsername = localStorage.getItem('username');
    const storedMatricNum = localStorage.getItem('matric_num');
    const { username = storedUsername || "Guest", matric_num = storedMatricNum || "" } = location.state || {};
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [isOpen, setOpen] = useState(false);
    const sidebarRef = useRef(null); // A ref is a property that can hold a reference to a DOM element or a React component instance
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    function handleToggle(){
        setOpen(!isOpen);
    }
   

    const handleOutsideClick = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setOpen(false);
        }
      };
      
      function handleDelete(course_name,course_code,course_id){
        console.log(course_name,course_code,course_id);
         Axios.post(`https://${window.location.hostname}:5000/deleteCourses`,{
            course_code:course_code,
            course_name:course_name,
            course_id:course_id
         }).then((result)=>{
            console.log(result);
            alert(`${course_name} successfully deleted`);
            setCourses(prevCourses => prevCourses.filter(course => course.course_id !== course_id));
         }).catch((error)=>{
            console.log(error);
            if(error.message === "Network error"){
                alert("The server's Offline");
            }else if(error.message === "Request failed with status code 500"){
              alert("Internal Server Error");
          }else if(error.response.data === "Error deleting course from the database"){
            alert("Cant delete course as it has attendance data");
          }else{
            alert("Error deleting course");
            }
         });
      }

    useEffect(() => {
    // Save username and matric_num to local storage
     localStorage.setItem('username', username);
     localStorage.setItem('matric_num', matric_num);
        Axios.post(`https://${window.location.hostname}:5000/getCourses`,{
          matric_num: matric_num   //uses the matric number to filter the courses table to send only courses with the matric numbers value(its a foreign key in the db)
        })
        .then((response) => {
          // Set the courses state with the fetched data
          setCourses(response.data.courses);
          console.log(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
          if(error.message === "Request failed with status code 500"){
            alert("Server's Offline");
            setError({message:"Backend Error. Please Restart"});
            }else if(error.message === "Request failed with status code 401"){
              alert("No registered courses");
              setError({message:"You havent registered your courses"});
              setLoading(false);
            }else if(error.message === "Network Error"){
              alert("Server's Offline")
              setError({message:"Backend Error. Please Restart"});
            }
        });

        document.addEventListener('mousedown', handleOutsideClick);
      
        return () => {
          document.removeEventListener('mousedown', handleOutsideClick);
        };
      }, [matric_num,username]);

      if (loading) {
        return <div><p style={{marginTop:"19%",fontSize:"40px",fontWeight:'bolder', textAlign:"center"}}>Loading...</p></div>;
      }

   return(
    <div>
         <nav className="Header">
      <FaBars className="icons" onClick={handleToggle} />
      <img className="as_logo" src={logo} alt="logo"/>
      <h2 className="page_name">Course List</h2>
    <p className="welcome_text">Welcome, {username || "Guest"}</p>
    <FaBell className="icons"/>
    </nav> 
    <div className={`sidebar ${isOpen ? 'open' : 'close'}`} ref={sidebarRef}>
      <div id="sidebarHeader">
      <FaArrowLeft style={{color:'rgb(65,65,65)'}} onClick={handleToggle} className="icons"/>
       <h2>UAS</h2>
      </div>
      <ul>
        <li><button style={{marginLeft:'35.5%'}} className="sidebar-links" onClick={()=>{navigate('/home', {state:{ username, matric_num }})}}>Home</button></li>
        <li><button className="sidebar-links" onClick={()=>{navigate('/addCourses', {state:{ username, matric_num }})}}>Add Courses</button></li>
        <li><button style={{marginRight:'29.5%'}} className="sidebar-links" onClick={()=>{navigate('/qrCodeScanner', {state:{ username, matric_num }})}}>QRCode Scanner</button></li> 
        <li><a style={{marginLeft:'32.5%'}} className="sidebar_content" href="/signIn">Log Out</a></li>      
      </ul>
      <FaCopyright style={{position:"absolute",bottom:5,left:5, fontSize:30,color:'#2a2aaf'}}/>
    </div>

   {error ? <h2 style={{color: "red", textAlign:'center'}}>{error.message}</h2> : <div className="course_container" style={{ marginTop:'2%', border:'none', fontWeight:'600', fontSize:'x-large'}}>
    <ul>
        {courses.map((course) => (  //displays the courses fetched
          <li key={course.course_id} style={{margin:'2%', marginTop:"3%"}}>
            {course.course_name} - {course.course_code}
            <button style={{ textAlign:"center"}} className="delete" key={course.course_id} onClick={()=>handleDelete(course.course_name,course.course_code,course.course_id)}>X</button>
          </li>
        ))}
      </ul>
      </div>
      }
    </div>
   );
}

export default Courses;