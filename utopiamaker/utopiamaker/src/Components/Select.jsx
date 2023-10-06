import React from 'react'
import PropTypes from 'prop-types'

function Select({options, name, onChange}) {
  return (
    <>
        <select name={name} onChange={onChange}>
            {options && options.map((value, index) => <option key={index} value={value.id}>{value.name}</option>)}
        </select>
    </>
  )
}

Select.propTypes = {
    options: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

export default Select
