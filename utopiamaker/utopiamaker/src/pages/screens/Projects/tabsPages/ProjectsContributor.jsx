import React, { useContext } from 'react'
import { ProjectsContext } from '../../../../App';
import ProjectRow from '../../../../Components/ProjectRow';

function ProjectsContributor() {
    const {projects} = useContext(ProjectsContext)

    return (
        <>
            <div className='projects-list-containter'>
                {console.log(projects)}
                {projects.projectsContributor && <>{projects.projectsContributor.map((value, index) => {
                    return <ProjectRow key={index} id={value.id} name={value.name} description={value.description} project={value}/>;
                })}</>}
            </div>
        </>
    )
}

export default ProjectsContributor