import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ProjectsContext, UserContext } from '../App'
import { MdAttachMoney, MdCheckCircle, MdOutlineTimer } from 'react-icons/md';
import Modal from './Modal';
import { BASE_API } from '../Models/Constants';

function getIndexById(id, array){
  let index = -1;
  array.forEach( (element, ind) => {
      if(element.id === id) index = ind;
  });
  return index;
}

function ValidationRow({id}) {
  
    const [transaction, setTransaction] = useState({
      data: null,
      index: -1,
    })
    const {projects} = useContext(ProjectsContext)
    const {user} = useContext(UserContext)

    const [modal, setModal] = useState({
      isError: false,
      isSuccess: false,
      isLoading: false,
      isShowing: false,
      message: '',
    })

    const handleShow =() =>{
      setModal({...modal, isShowing: !modal.isShowing});
    }
    
    useEffect(() => {
        if (!transaction.data) {
          axios.get(BASE_API+"/transactions/" + id)
            .then((response) => {
              setTransaction({data: response.data, index: getIndexById(response.data.transaction.projectId, projects.projectsContributor)}); // Assuming the transaction data is in response.data
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }, [id, transaction, projects.projectsContributor]);
  
    return (
        <>
          {(transaction.data && transaction.data.transaction.statusValidate === false) && <div className={'flex spc-btw alg-items-center '+(transaction.data.transaction.statusValidate ? 'transaction-card-accepted' : ' transaction-card-pending')}>
            <div className='flex flex-dv'>
              <p className='transaction-card-title'>{(transaction.data && (transaction.index !== -1)) && projects.projectsContributor[transaction.index].name}</p>
              <div className='flex'>
                {(transaction.data && transaction.data.transaction.assets.time) && <div className='flex alg-items-center'><MdOutlineTimer color='#111111'/>{transaction.data.transaction.assets.time}</div>}
                {(transaction.data && transaction.data.transaction.assets.money) && <div className='flex alg-items-center'><MdAttachMoney color='#111111'/>{transaction.data.transaction.assets.money}</div>}
              </div>
              <div>{(transaction.data && transaction.data.transaction.assets.assets) && transaction.data.transaction.assets.assets.join(", ")}</div>
            </div>
            <div>
                <MdCheckCircle size={36} color={"green"} style={{cursor: 'pointer'}} onClick={(e) => {
                    e.preventDefault();
                    handleShow();
                }}/>
            </div>
            {modal.isShowing && <Modal isError={modal.isError} isLoading={modal.isLoading} isSuccess={modal.isSuccess} handleShow={handleShow}>
                      <div className='flex flex-dv alg-items-center'>
                        <div>Do you want confirm this transaction?</div>
                        <div className='flex spc-arnd'>
                          <button className='btn-confirm' onClick={(e) => {
                            e.preventDefault();
                            setModal({...modal, isLoading: true});
                            axios.post(BASE_API+"validators/validate", {
                                transactionId: id,
                                validatorId: user.id,
                                validatorPass: user.pass,
                                timestamp: (new Date().getTime())+"",
                            }).then((response) => {
                              setModal({...modal, isLoading: false, isSuccess: true});
                              setTimeout(() =>{
                                  setModal({...modal, isSuccess:false, isLoading:false, isShowing: false})
                              }, 3000)  
                              console.log(response)
                            }).catch(error => console.log(error))
                          }}>Confirm</button>
                          <button className='btn-cancel' onClick={handleShow}>Cancel</button>
                        </div>
                      </div>
                    </Modal>}
          </div>}
        </>
    )
}

ValidationRow.propTypes = {
    id: PropTypes.string.isRequired,
}

export default ValidationRow
