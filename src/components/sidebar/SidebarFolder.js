// styles
import "./Sidebar.css"
import Folder from "../../images/file-icons/folder.svg"
import OpenFolder from "../../images/file-icons/openFolder.svg"
import File from "../../images/file-icons/file.svg"

import { useState } from "react"
import SidebarFile from "./SidebarFile"


export default function SidebarFolder(props) {
    const { proj } = props
    const [open, setOpen] = useState(false)
    return (
        <>
            <li className="project-list-item" onClick={() => { setOpen(!open) }}><img className="folder-icon" src={open ? OpenFolder : Folder} /><span>{proj.title}</span></li>
            {open && proj.files.length > 0 && (
                <ul>
                    {proj.files.map(subProj => (
                        <SidebarFile key={subProj.id} proj={subProj} />
                    ))}
                </ul>
            )}
        </>

    )
}
