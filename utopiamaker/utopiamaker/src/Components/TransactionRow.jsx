import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ProjectsContext } from '../App'
import { MdAttachMoney, MdOutlineTimer } from 'react-icons/md';
import { BASE_API } from '../Models/Constants';

function getIndexById(id, array){
  let index = -1;
  array.forEach( (element, ind) => {
      if(element.id === id) index = ind;
  });
  return index;
}

function TransactionRow({id}) {
  
    const [transaction, setTransaction] = useState({
      data: null,
      index: -1,
    })
    const {projects} = useContext(ProjectsContext)
    
    useEffect(() => {
        if (!transaction.data) {
          axios.get(BASE_API+'/transactions/' + id)
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
        {console.log(transaction)}
          {transaction.data && <div className={'flex spc-btw alg-items-center '+(transaction.data.transaction.statusValidate ? 'transaction-card-accepted' : ' transaction-card-pending')}>
            <div className='flex flex-dv'>
              <p className='transaction-card-title'>{(transaction.data && (transaction.index !== -1)) && projects.projectsContributor[transaction.index].name}</p>
              <div className='flex'>
                {(transaction.data && transaction.data.transaction.assets.time) && <div className='flex alg-items-center'><MdOutlineTimer color='#111111'/>{transaction.data.transaction.assets.time}</div>}
                {(transaction.data && transaction.data.transaction.assets.money) && <div className='flex alg-items-center'><MdAttachMoney color='#111111'/>{transaction.data.transaction.assets.money}</div>}
              </div>
              <div>{(transaction.data && transaction.data.transaction.assets.assets) && transaction.data.transaction.assets.assets.join(", ")}</div>
            </div>
            <p>{ transaction && (transaction.data.transaction.statusValidate ? "Validate" : "Pending")}</p>
          </div>}
        </>
    )
}

TransactionRow.propTypes = {
    id: PropTypes.string.isRequired,
}

export default TransactionRow
