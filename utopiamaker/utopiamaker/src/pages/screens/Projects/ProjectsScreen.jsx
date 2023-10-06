import axios from 'axios';
import React, {useContext, useState} from 'react'
import {ProjectsContext, UserContext} from '../../../App'
import Modal from '../../../Components/Modal';
import Textfield from '../../../Components/Textfield';
import { useNavigate } from 'react-router-dom';
import { BASE_API } from '../../../Models/Constants';

function ProjectsScreen({child}) {
  const {user, setUser} = useContext(UserContext);
  const {projects, setProjects} = useContext(ProjectsContext);
  const navigate = useNavigate();

  const [modal, setModal] = useState({
    isShowing: false,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
  });

  const [error, setError] = useState({
    isError: false,
    message: '',
  });

  const [project, setProject] = useState({
    name: null,
    creation: null,
    startDate: null,
    description: null,
    ownerId: user.id,
    ownerPass: user.pass,
    endDate: null,
  });

  const [navOption, setNavOption] = useState(0);

  const handleShow = () =>{
    if(modal.isShowing){
      setProject({...project, name: null, creation: null, startDate: null, description: null, endDate: null});
      setError({isError: false, message: ''});
    }
    setModal({...modal, isShowing: !modal.isShowing});
  }

  function validateData(){
    // VALIDATE THE FIELDS ARE NOT EMPTY
    if(!(project.name && project.description && project.startDate && project.endDate)){
      setError({isError: true, message: 'Please, fill all fields'});
      return false;
    }

    if(project.name === '' || project.description === ''){
      setError({isError: true, message: 'Please fill the name and description data'});
      return false;
    }
    
    if(parseInt(project.startDate, ) > parseInt(project.endDate)){
      setError({isError: true, message: 'The dates are invalid'});
      return false;
    }

    if(parseInt(project.creation) > parseInt(project.startDate)){
      setError({isError: true, message: 'The dates are invalid'});
      return false;
    }

    setError({isError: false, message: ''});
    return true;
  }

  return (
    <>
    <div className="title">
      <div className='flex spc-btw title-bar'>
        <h1>Projects</h1>
        <button className='btn-add' onClick={(e) => {
          e.preventDefault();
          setModal({...modal, isShowing: true});
          setProject({...project, creation: Date.now()+''})
        }}>Create new project</button>
      </div>
      <hr/>
    </div>
    {modal.isShowing && 
    <Modal handleShow={handleShow} title="Create a new project" isLoading={modal.isLoading} isError={modal.isError} isSuccess={modal.isSuccess}>
      <div className='flex flex-dv'>
        <label htmlFor="name">Project Name</label>
        <Textfield name='name' type='text' placeholder='Project name' onChange={(e) => {setProject({...project, name: e.target.value});}}/>
      </div>
      <div className='flex spc-btw'>
        <div className='flex flex-dv flex-grow-1'>
          <label htmlFor="startDate">Start date</label>
          <Textfield name='startDate' type='date' onChange={(e) => {setProject({...project, startDate: ((new Date(e.target.value)).getTime()+86400000)+''});}}/>
        </div>
        <div className='flex flex-dv flex-grow-1'>
          <label htmlFor="endDate">End date</label>
          <Textfield name='endDate' type='date' onChange={(e) => {setProject({...project, endDate: ((new Date(e.target.value)).getTime()+86400000)+''});}}/>
        </div>
      </div>
      <div className='flex flex-dv spc-arnd'>
        <div className='flex flex-dv'>
          <label htmlFor="description">Description</label>
          <Textfield name='description' type='text' placeholder='Description' onChange={(e) => {setProject({...project, description: e.target.value});}}/>
        </div>
        {error.isError && <div className='error-msg'>{error.message}</div>}
        <button className="btn-confirm alg-self-center" onClick={(e) => {
          e.preventDefault();
          if(validateData()){
            setModal({...modal, isLoading: true});
            axios.post(BASE_API+'projects/create', project)
            .then((response) => {
              setModal({...modal, isLoading: false, isSuccess: true});
              setUser({
                ...user,
                projectsCreator: [...user.projectsCreator, response.data.projectId],
                projectsContributor: [...user.projectsContributor, response.data.projectId],
                projectsValidator: [...user.projectsValidator, response.data.projectId],
              });
              axios.get(BASE_API+'projects/'+response.data.projectId).then((response) => {
                setProjects({
                  projectsContributor: [...projects.projectsContributor, response.data],
                  projectsCreator: [...projects.projectsCreator, response.data],
                  projectsValidator: [...projects.projectsValidator, response.data],
                })
              }).catch(error => console.log(error));
              setTimeout(() => {
                setModal({isShowing: false, isLoading: false, isSuccess: false, isError: false});
                setProject({...project, name: null, creation: null, startDate: null, description: null, endDate: null});
                setError({isError: false, message: ''});
              }, 3000);
            })
            .catch((error) => {
              console.log(error);
              setModal({...modal, isLoading: false, isSuccess: false, isError: true, message: error.message});
              setTimeout(() => {
                setModal({isShowing: false, isLoading: false, isSuccess: false, isError: false});
                setProject({...project, name: null, creation: null, startDate: null, description: null, endDate: null});
                setError({isError: false, message: ''});
              }, 3000);
            });
          }
        }}>Guardar</button>
      </div>
    </Modal>
    }
    <div className='flex flex-dv'>
      <div className='flex screen-nav'>
        <div className={(navOption === 0) ? 'screen-nav-tab-selected alg-self-center':'screen-nav-tab alg-self-center'} onClick={(e) => {
          e.preventDefault();
          setNavOption(0);
          navigate('../myprojects');
        }}>My projects</div>
        <div className={(navOption === 1) ? 'screen-nav-tab-selected alg-self-center':'screen-nav-tab alg-self-center'} onClick={(e) => {
          e.preventDefault();
          setNavOption(1);
          navigate('../contributor');
        }}>Contributor</div>
        <div className={(navOption === 2) ? 'screen-nav-tab-selected alg-self-center':'screen-nav-tab alg-self-center'} onClick={(e) => {
          e.preventDefault();
          setNavOption(2);
          navigate('../validator');
        }}>Validator</div>
      </div>
      <hr className='delimiter'/>
      {child}
    </div>
    </>
  )
}

export default ProjectsScreen