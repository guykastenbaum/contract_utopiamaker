import React, { useContext, useState } from 'react'
import axios from 'axios'
import Textfield from './Textfield';
import { useNavigate } from 'react-router-dom';
import { ProjectsContext, UserContext } from '../App';
import { BASE_API } from '../Models/Constants';

function SignUp() {

  const navigate = useNavigate();

  const {setUser} = useContext(UserContext);
  const {setProjects} = useContext(ProjectsContext)

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [disable, setDisable] = useState(false);

  const handleSubmit = () =>{
    axios.post(
      BASE_API+'/login/signup',
      signUpData
    ).then((response) => {
      if(response.status === 200){
        setUser({
          name: signUpData.name,
          email: signUpData.email,
          pass: signUpData.password,
          id: response.data.userId,
          projectsContributor: [],
          projectsCreator: [],
          projectsValidator: []
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
      setDisable(false);
    });
  }

  return (
    <>
    <div className="sign-up-container">
            <form className='sign-up-form'>
                <Textfield type='text' name='Name' placeholder='Name' onChange={(e) => setSignUpData({...signUpData, name:e.target.value})}/>
                <Textfield type='email' name='Email' placeholder='Email' onChange={(e) => setSignUpData({...signUpData, email:e.target.value})}/>
                <Textfield type='password' name='Password' placeholder='Password' onChange={(e) => setSignUpData({...signUpData, password:e.target.value})}/>
                <button disabled={disable} onClick={(e) => {
                    e.preventDefault();
                    setDisable(true);
                    handleSubmit();
                }}>Sign Up</button>
            </form>
        </div>
    </>
  )
}

export default SignUp
