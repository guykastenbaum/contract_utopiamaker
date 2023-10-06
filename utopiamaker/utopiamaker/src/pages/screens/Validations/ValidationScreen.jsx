import React from 'react'
import { useContext } from 'react'
import { ProjectsContext } from '../../../App'
import ProjectValidationRow from '../../../Components/ProjectValidationRow'

function ValidationScreen() {

    const {projects} = useContext(ProjectsContext)

    return (
        <>
            <div className="title">
                <div className='flex spc-btw title-bar'>
                <h1>Validations</h1>
                </div>
                <hr/>
            </div>
            <div>
                {projects.projectsValidator.map((value, index) => <ProjectValidationRow projectName={value.name} transactions={value.transactions}/>)}
            </div>
        </>
    )
}

export default ValidationScreen