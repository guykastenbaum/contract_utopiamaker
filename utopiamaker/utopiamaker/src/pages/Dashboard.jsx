import React, { useContext } from 'react'
import { ProjectsContext, UserContext } from '../App';
import Sidebar from '../Components/Sidebar';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomeScreen from './screens/Home/HomeScreen';
import TransactionsScreen from './screens/Transactions/TransactionsScreen';
import ProjectsScreen from './screens/Projects/ProjectsScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';
import { useEffect } from 'react';
import ProjectsCreator from './screens/Projects/tabsPages/ProjectsCreator';
import ProjectsContributor from './screens/Projects/tabsPages/ProjectsContributor';
import ProjectsValidator from './screens/Projects/tabsPages/ProjectsValidator';
import ValidationScreen from './screens/Validations/ValidationScreen';
import axios from 'axios';
import { BASE_API } from '../Models/Constants';

function Dashboard() {

  const {user, setUser} = useContext(UserContext);
  const {setProjects} = useContext(ProjectsContext);
  const navigate = useNavigate();

  useEffect(() =>{
    const userData = JSON.parse(localStorage.getItem('userData'));
    if(!user.id && !userData){
      navigate('/');
    }else if(!user.id && userData){
      axios.post(
        BASE_API+'/login/signin',
        userData
      ).then((response) => {
        if(response.status === 200){
          setUser({
            name: response.data.name,
            email: userData.email,
            pass: userData.password,
            id: response.data.userId,
            projectsContributor: response.data.projectsContributor,
            projectsCreator: response.data.projectsCreator,
            projectsValidator: response.data.projectsValidator
          });
          axios.get(BASE_API+'/projects/user/'+response.data.userId).then((response) => {
            setProjects({
              projectsContributor: response.data.projectsContributor,
              projectsCreator: response.data.projectsCreator,
              projectsValidator: response.data.projectsValidator,
            })
          }).catch(error => console.log(error));
          navigate('/dashboard/home');
        }
      }).catch((error) =>{
          
      });
    }
  })

  return (<>
    <div className='flex'>
      <Sidebar/>
      <div className="content">
        <Routes>
          <Route path="/home" element={<HomeScreen/>}/>
          <Route path="/transactions" element={<TransactionsScreen/>}/>
          <Route path="/projects">
            <Route path='myprojects' element={<ProjectsScreen child={<ProjectsCreator/>}/>}/>
            <Route path='contributor' element={<ProjectsScreen child={<ProjectsContributor/>}/>}/>
            <Route path='validator' element={<ProjectsScreen child={<ProjectsValidator/>}/>}/>
          </Route>
          <Route path="/validations" element={<ValidationScreen/>} />
          <Route path="/profile" element={<ProfileScreen/>}/>
        </Routes>
      </div>
    </div>
  </>)
}

export default Dashboard
