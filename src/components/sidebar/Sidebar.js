import "./Sidebar.css"
import SidebarFile from "./SidebarFile"
import SidebarFolder from "./SidebarFolder"

import Add from "../../images/add.svg"
import Folder from "../../images/file-icons/folder.svg"
import File from "../../images/file-icons/file.svg"
import NewFolder from "../../images/NewFolder.svg"
import NewFile from "../../images/NewFile.svg"

import { useState } from "react"


export default function Sidebar(props) {
    const { projectList, createNewProject, createNewFolder, removeProject, selectedProjects, setSelectedProjects, selectedProject, setSelectedProject, changeProject } = props
    const [showIcons, setShowIcons] = useState(false)

    // const handleClick = (title, id, code) => {
    //     setSelectedProject({ title, id, code })
    //     changeProject(title, code)

    //     const filteredProj = selectedProjects.filter(proj => {
    //         return proj.id === id
    //     })

    //     setSelectedProjects(prevSelectedProjects => {
    //         if (filteredProj.length === 0) {
    //             return [...prevSelectedProjects, { title, id, code }]
    //         } else {
    //             return prevSelectedProjects
    //         }
    //     })
    // }

    return (
        <div className="sidebar-container" onMouseOver={() => { setShowIcons(true) }} onMouseLeave={() => { setShowIcons(false) }}>
            <div className="sidebar-title">
                <span className="sidebar-title-text">Projects</span>
                {showIcons &&
                    <>
                        <img className="sidebar-title-images grow" title="New File" src={NewFile} onClick={() => { createNewProject() }} />
                        <img className="sidebar-title-images grow" title="New Folder" src={NewFolder} onClick={() => { createNewFolder() }} />
                    </>
                }
            </div>
            <div className="sidebar-content">
                {projectList.length === 0 && <span className="no-projects">No projects</span>}
                {projectList.length > 0 && (
                    <ul className="project-list">
                        {projectList.map(proj => {
                            return proj.folder ?
                                <SidebarFolder key={proj.key} proj={proj} selectedProject={selectedProject} removeProject={removeProject} />
                                : <SidebarFile key={proj.key} proj={proj} selectedProject={selectedProject} removeProject={removeProject} />

                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}
