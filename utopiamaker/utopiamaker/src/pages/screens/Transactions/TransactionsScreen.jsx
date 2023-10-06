// import axios from 'axios'
import React, { useContext, useState } from 'react'
import Modal from '../../../Components/Modal';
import Select from '../../../Components/Select';
import { ProjectsContext, UserContext } from '../../../App';
import axios from 'axios';
import Textfield from '../../../Components/Textfield';
import ProjectTransactionRow from '../../../Components/ProjectTransactionRow';
import { BASE_API } from '../../../Models/Constants';

function getIndexById(id, array){
  let index = -1;
  array.forEach( (element, ind) => {
      if(element.id === id) index = ind;
  });
  return index;
}

function TransactionsScreen() {
  
  const {user} = useContext(UserContext)
  const {projects, setProjects} = useContext(ProjectsContext)
  
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

  const [transaction, setTransaction] = useState({
    projectId: null,
    userId: user.id,
    userPass: user.pass,
    assets: {
      time: null,
      money: null,
      assets: null,
    },
    timestamp: null,
  })

  const [assets, setAssets] = useState({
    count: 0,
    assets: {},
  })

  const handleShow = () =>{
    if(modal.isShowing){
      setAssets({count: 0, assets: {}})
      setError({isError: false, message: ''});
      setTransaction({projectId: null,
        userId: user.id,
        userPass: user.pass,
        assets: {
          time: null,
          money: null,
          assets: null,
        },
        timestamp: null,});
    }
    setModal({...modal, isShowing: !modal.isShowing});
  }

  return (
    <>
      <div className="title">
        <div className='flex spc-btw title-bar'>
          <h1>Transactions</h1>
          <button className='btn-add' onClick={(e) => {
            e.preventDefault();
            handleShow();
          }}>Create new transaction</button>
        </div>
        <hr/>
      </div>
      {modal.isShowing && <Modal handleShow={handleShow} title={"Create new transaction"} isLoading={modal.isLoading} isError={modal.isError} isSuccess={modal.isSuccess}>
          <div className='flex flex-dv'>
            <label>Select the project</label>
            <Select name='projectId' options={projects.projectsContributor} onChange={(e) =>{
              setTransaction({...transaction, projectId: e.target.value});
              console.log(e.target.value);
            }}/>
          </div>
          <div className='flex spc-btw'>
            <div className='flex flex-dv flex-grow-1'>
              <label>Money</label>
              <Textfield type={"number"} name={'money'} placeholder={'Amount'} onChange={(e) => {
                setError({isError: false, message: ""})
                let value = e.target.value+" "+document.querySelector("select[name='selectmoney']").value;
                setTransaction({...transaction, assets: {...transaction.assets, money: value}});
              }} selectOptions={["USD"]}/>
            </div>
            <div className='flex flex-dv flex-grow-1'>
              <label>Time</label>
              <Textfield type={"number"} name={'time'} placeholder={''} onChange={(e) => {
                setError({isError: false, message: ""})
                let value = e.target.value+" "+document.querySelector("select[name='selecttime']").value;
                setTransaction({...transaction, assets: {...transaction.assets, time: value}});
              }} selectOptions={["Hours"]}/>
            </div>
          </div>
          <div className='flex flex-dv'>
              {/* <Textfield type={"text"} name={"asses"}/> */}
              <div className='flex spc-btw'><label className='alg-self-center'>Another assets</label><button className='btn-add' onClick={(e) =>{
                if(Object.keys(assets.assets).length === assets.count){
                  setAssets({
                    ...assets,
                    count: assets.count+1
                  });
                }
              }}>+</button></div>
              {(() => {
                let fields = [];
                for(let i = 0; i < assets.count; i++) {
                  fields.push(<div className='flex'><div className='flex-grow-3'><Textfield placeholder={'Input asset here'} name={'asset'+i} type={'text'} onChange={(e) => {
                    let auxAssets = assets.assets;
                    auxAssets['asset'+i] = e.target.value;
                    setAssets({...assets, assets: auxAssets});
                  }}/></div><button className='btn-cancel' onClick={(e) => {
                    let auxAssets = assets.assets;
                    delete auxAssets['asset'+i];
                    setAssets({ count: assets.count-1, assets: auxAssets});
                  }}>-</button></div>)
                }
                return fields;
              })()}
            </div>
          <div className='flex flex-dv'>
            {error.isError && <p>{error.message}</p>}
            <button className='btn-add alg-self-center' onClick={(e) => {
              e.preventDefault();
              console.log(assets);
              if(!transaction.projectId){
                if(projects.projectsContributor[0]){
                  transaction.projectId = projects.projectsContributor[0].id;
                }
                if(!transaction.projectId){
                  setError({isError: true, message: "You don't have any projects to add transaction"});
                  return;
                }
              }
              transaction.timestamp = Date.now()+86400000;
              transaction.assets.assets = Object.values(assets.assets);
              if((transaction.assets.time || transaction.assets.money || Object.keys(assets.assets).length > 0) && transaction.projectId){
                setModal({...modal, isLoading: true});
                axios.post(BASE_API+'transactions/create', transaction).then((response) => {
                  //ADD TRANSACTION
                  console.log(response);
                  let auxContributor = projects.projectsContributor;
                  let auxCreator = projects.projectsCreator;
                  let auxValidator = projects.projectsValidator;
                  let indCont = getIndexById(transaction.projectId, auxContributor);
                  let indCrea = getIndexById(transaction.projectId, auxCreator);
                  let indVali = getIndexById(transaction.projectId, auxValidator);
                  if(indCont !== -1) auxContributor[indCont].transactions.push(response.data.id);
                  if(indCrea !== -1) auxCreator[indCrea].transactions.push(response.data.id);
                  if(indVali !== -1) auxValidator[indVali].transactions.push(response.data.id);
                  setProjects({
                    ...projects,
                    projectsContributor: auxContributor,
                    projectsCreator: auxCreator,
                    projectsValidator: auxValidator,
                  })
                  setModal({...modal, isSuccess: true});
                  setTimeout(() => {
                    setModal({...modal, isSuccess: false, isShowing: false});
                  }, 3000);
                }).catch((error) => {
                  console.log(error);
                });
              }else{
                setError({isError: true, message: "Please fill almost one of the assets"})
              }
            }}>Add transaction</button>
          </div>
      </Modal>}
      <div>
        {projects.projectsContributor.map((value, index) => <ProjectTransactionRow key={index} projectName={value.name} transactions={value.transactions}/>)}
      </div>
    </>
  )
}

export default TransactionsScreen