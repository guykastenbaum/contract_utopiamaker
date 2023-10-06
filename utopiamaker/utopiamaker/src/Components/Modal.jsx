import React from 'react'
import PropTypes from 'prop-types'
import {MdClear, MdErrorOutline, MdCheckCircleOutline} from "react-icons/md";

function Modal({title, children, handleShow, isLoading=false, isError=false, isSuccess=false}) {
  return (
    <>
        <div className='modal'>
            <div className='modal-container'>
                <div className='flex spc-btw'>
                    <h3>{title}</h3>
                    <MdClear onClick={()=> handleShow()}/>
                </div>
                <hr/>
                {isLoading && <div className='flex flex-dv'><div class="lds-roller alg-self-center"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><div className='alg-self-center'>Loading</div></div>}
                {isError && <div className='flex flex-dv'><MdErrorOutline className='alg-self-center' color='red' size={70}/><div className='alg-self-center'>An error has ocurred</div></div>}
                {isSuccess && <div className='flex flex-dv'><MdCheckCircleOutline className="alg-self-center" color='green' size={70}/><div className='alg-self-center'>Project created successfully</div></div>}
                {(!isLoading && !isError && !isSuccess) && <div>{children}</div>}
            </div>
        </div>
    </>
  )
}

Modal.propTypes = {
    title: PropTypes.string,
    handleShow: PropTypes.func.isRequired,
}

export default Modal
