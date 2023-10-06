import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Modal from './Modal';
import Textfield from './Textfield';
import { ProjectsContext, UserContext } from '../App';
import { MdExpandMore } from "react-icons/md";
import UserRow from './UserRow';
import { BASE_API } from '../Models/Constants';

function getIndexById(id, array){
    let index = -1;

    array.forEach( (element, ind) => {
        if(element.id === id) index = ind;
    });

    return index;
}

function ProjectRow({id, name, description, project}) {

    const {user} = useContext(UserContext);
    const {projects, setProjects} = useContext(ProjectsContext);

    const [newContributor, setNewContributor] = useState('');
    const [newValidator, setNewValidator] = useState('');

    const [modal, setModal] = useState({
        isShowing: false,
    })

    const [errorContributor, setErrorContributor] = useState({
        isError: false,
        message: '',
    });

    const [errorValidator, setErrorValidator] = useState({
        isError: false,
        message: '',
    });

    const [tabs, setTab] = useState({
        isValidatorShowing: false,
        isContributorShowing: false,
    });

    // if(!project){
    //     axios.get(BASE_API+'/projects/'+id).then((response) => {
    //         if(response.status === 200) {
    //             setProject(response.data);
    //         }
    //     });
    // }

    const handleShow = () => {
        setModal({...modal, isShowing: !modal.isShowing});
    }

    return (
        <>
        <div className='flex spc-btw project-card'>
            <div className='flex flex-dv project-card-info'>
                {name && <p className='project-name'>{name}</p>}
                {description && <p className='project-description'>{description}</p>}
            </div>
            <button className='btn-confirm' onClick={handleShow}>Ver más</button>
            {(modal.isShowing && id) && 
            <Modal handleShow={handleShow} title={"Information of "+name}>
                <div className='flex flex-dv'>
                    <label>Description</label>
                    <div>{description}</div>
                </div>
                <div className='flex spc-btw'>
                    <div className='flex flex-dv flex-grow-1'>
                        <label>Start date</label>
                        <div>{(new Date(parseInt(project.startDate))).toDateString()}</div>
                    </div>
                    <div className='flex flex-dv flex-grow-1'>
                        <label>End date</label>  
                        <div>{(new Date(parseInt(project.endDate))).toDateString()}</div>
                    </div>
                </div>
                <hr></hr>
                <div className='flex flex-dv'>
                    <div className='flex spc-btw contributors-modal-tab'>
                        <h4>Contributors</h4>
                        <MdExpandMore onClick={(e) => {
                            e.preventDefault();
                            setTab({
                                isContributorShowing: !tabs.isContributorShowing,
                                isValidatorShowing: false,
                            });
                        }}/>
                    </div>
                    { tabs.isContributorShowing && <div className='contributors-modal-pane'>
                        <div className='flex spc-btw'>
                            <Textfield name='contributor-email' placeholder={'Contributor email'} onChange={(e) => {setNewContributor(e.target.value)}}/>
                            <button className='btn-add' onClick={(e) => {
                                axios.post(BASE_API+'/contributors/add',{
                                    userId: user.id,
                                    userPass: user.pass,
                                    projectId: id,
                                    contributorEmail: newContributor
                                }).then((response) => {
                                    console.log(response);
                                    if(response.status === 200){
                                        setErrorContributor({isError: false, message: ""});
                                        let index = getIndexById(id, projects.projectsContributor);

                                        if(index !== -1){
                                            let auxProjectContributor = projects.projectsContributor;
                                            auxProjectContributor[index].contributors.push(response.data.contributorId);
                                            setProjects({...projects, projectsContributor: auxProjectContributor});
                                        }
                                    }else{
                                        setErrorContributor({isError: true, message: response.data.message});
                                    }
                                })
                            }}>Add Contributor</button>
                        </div>
                        {errorContributor.isError && <p>{errorContributor.message}</p>}
                        <div>
                            {project.contributors.map((value, index) => <UserRow id={value} key={"c"+index}/>)}
                        </div>
                    </div>}
                </div>
                <div className='flex flex-dv'>
                    <div className='flex spc-btw validators-modal-tab'>
                        <h4>Validators</h4>
                        <MdExpandMore onClick={(e) => {
                            e.preventDefault();
                            setTab({
                                isValidatorShowing: !tabs.isValidatorShowing,
                                isContributorShowing: false,
                            });
                        }}/>
                    </div>
                    {tabs.isValidatorShowing && <div className='validators-modal-pane'>
                        <div className='flex spc-btw'>
                            <Textfield name='validator-email' placeholder={'Validator email'} onChange={(e) => {setNewValidator(e.target.value)}}/>
                            <button className='btn-add' onClick={(e) => {
                                axios.post(BASE_API+'/validators/add',{
                                    userId: user.id,
                                    userPass: user.pass,
                                    projectId: id,
                                    validatorEmail: newValidator
                                }).then((response) => {
                                    if(response.status === 200){
                                        setErrorValidator({isError: false, message: ""});
                                        let index = getIndexById(id, projects.projectsValidator);

                                        if(index !== -1){
                                            let auxProjectValidator = projects.projectsValidator;
                                            auxProjectValidator[index].validators.push(response.data.validatorId);
                                            setProjects({...projects, projectsValidator: auxProjectValidator});
                                        }
                                    }else{
                                        setErrorValidator({isError: true, message: response.data.message});
                                    }
                                })
                            }}>Add Validator</button>
                        </div>
                        {errorValidator.isError && <p>{errorValidator.message}</p>}
                        <div>
                            {project.validators.map((value, index) => <UserRow id={value} key={"v"+index}/>)}
                        </div>
                    </div>}
                </div>
            </Modal>
            }
        </div>
        </>
    )
}

ProjectRow.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
}

export default ProjectRow
