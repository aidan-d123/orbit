import { useState } from "react"

export default function NavItem(props) {
    const { proj, selectedProject, setSelectedProject, changeProject, removeProject } = props
    return (
        <div className={`selected-project ${selectedProject.id === proj.id ? 'selected-proj' : ''}`} key={proj.id}>
            <div></div>
            <div className="nav-item-text" onClick={() => {
                setSelectedProject({ title: proj.title, id: proj.id, code: proj.code })
                changeProject(proj.title, proj.code)
            }}>{proj.title}</div>
            <div className="nav-item-close" onClick={() => { removeProject(proj.id) }}>x</div>
        </div >
    )
}
