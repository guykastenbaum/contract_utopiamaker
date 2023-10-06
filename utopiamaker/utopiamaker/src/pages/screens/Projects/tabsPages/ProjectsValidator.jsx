import React, { useContext } from 'react'
import { ProjectsContext } from '../../../../App';
import ProjectRow from '../../../../Components/ProjectRow';

function ProjectsValidator() {
    const {projects} = useContext(ProjectsContext)
    return (
        <>
            <div className='projects-list-containter'>
                {console.log(projects)}
                {projects.projectsValidator && <>{projects.projectsValidator.map((value, index) => {
                    return <ProjectRow key={index} id={value.id} name={value.name} description={value.description} project={value}/>;
                })}</>}
            </div>
        </>
    )
}

export default ProjectsValidator