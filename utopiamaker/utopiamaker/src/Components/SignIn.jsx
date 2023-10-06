import {useState, useContext} from 'react';
import Textfield from './Textfield';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { ProjectsContext, UserContext } from '../App';
import { BASE_API } from '../Models/Constants';

function SignIn(){
    
    const navigate = useNavigate();

    const {setUser} = useContext(UserContext);
    const {setProjects} = useContext(ProjectsContext);

    const [disable, setDisable] = useState(false);

    const [signInData, setSignInData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState({
      isError: false,
      message: "",
    });

    const handleSubmit = () =>{
        axios.post(
          BASE_API+'/login/signin',
          signInData
        ).then((response) => {
          if(response.status === 200){
            setUser({
              name: response.data.name,
              email: signInData.email,
              pass: signInData.password,
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
          }else{
            setError({isError: true, message: response.data.message});
          }
          setDisable(false);
        }).catch((error) =>{
            setDisable(false);
            if(error.message.data && error.message.data.message){
              setError({isError: true, message: error.response.data.message});
            }
        });
      }

    return(<>
        <div className="sign-in-container">
            <form className='sign-in-form'>
                <Textfield type='email' name='Email' placeholder='Email' onChange={(e) => {
                  setSignInData({...signInData, email:e.target.value});
                  setError({isError:false, message:""});
                }}/>
                <Textfield type='password' name='Password' placeholder='Password' onChange={(e) => {
                  setSignInData({...signInData, password:e.target.value});
                  setError({isError:false, message:""});
                }}/>
                <button disabled={disable} onClick={(e) => {
                    e.preventDefault();
                    setDisable(true);
                    handleSubmit();
                }}>Login</button>
                {error.isError && <p>{error.message}</p>}
            </form>
        </div>
    </>);
}

export default SignIn;
