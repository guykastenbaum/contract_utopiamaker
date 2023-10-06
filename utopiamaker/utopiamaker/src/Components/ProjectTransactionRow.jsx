import React, { useState } from 'react'
import Modal from './Modal'
import TransactionRow from './TransactionRow';

function ProjectTransactionRow({projectName, transactions}) {
    
    const [modal, setModal] = useState({
        isShowing: false,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: '',
    })

    const handleShow = () => {
    // if(modal.isShowing){
    //     // setProject(null);
    //     setError({isError: false, message: ''});
    //     }
        setModal({...modal, isShowing: !modal.isShowing});
    }
    
    return (
        <>
            <div className='flex project-card spc-btw'>
                <h3 className='project-card-info'>{projectName}</h3>
                <button className='btn-add' onClick={(e) => {
                    e.preventDefault();
                    handleShow();
                }}>View transactions</button>
            </div>
            {modal.isShowing && <Modal handleShow={handleShow} isError={modal.isError} isLoading={modal.isLoading} isSuccess={modal.isSuccess} title={"Transactions of "+projectName}>
                <div className=''>

                </div>
                {transactions.map((value, index) => <TransactionRow key={index} id={value}/>)}
            </Modal>}
        </>
    )
}

export default ProjectTransactionRow