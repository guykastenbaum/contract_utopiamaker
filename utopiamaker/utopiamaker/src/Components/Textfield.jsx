import React from 'react'
import PropTypes from 'prop-types'

function Textfield({type, name, placeholder, onChange, selectOptions}) {
  
    const handleChange = (e) => onChange(e);

    return (
    <>
        <div className='flex'>
            <input className={selectOptions && 'inputTextSelect'} type={type} name={name} placeholder={placeholder} onChange={(e) => {e.preventDefault(); handleChange(e);}}></input>
            {selectOptions && <select className='inputTextSelect' name={'select'+name}>{selectOptions && selectOptions.map((value, index) => <option key={index} value={value}>{value}</option>)}</select>}
        </div>
    </>
  )
}

Textfield.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    selectOptions: PropTypes.array,
}

export default Textfield

