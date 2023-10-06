import React from 'react'
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'

function SidebarItem({title, to, isSelected, onChange}) {
  return (
    <>
      <li className={isSelected ? 'sidebar-selected': ''}>
        <Link to={to} onClick={(e) => {
          console.log(""+to+"- "+isSelected)
          onChange();
        }}>{title}</Link>
      </li>
    </>
  )
}

SidebarItem.propTypes = {
  to: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired
}

export default SidebarItem