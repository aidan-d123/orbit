import CodeIcon from "../../images/codeIcon.svg"
import { useState } from "react"
import Delete from "../../images/delete.svg"
import Confirm from "../../images/confirm.svg"
import Cancel from "../../images/cancel.svg"
import File from "../../images/file-icons/file.svg"
import Save from "../../images/save.svg"

import { useEffect } from "react"

export default function SidebarFile(props) {
    const { proj, removeProject, selectedProject, icon } = props
    const [deleting, setDeleting] = useState(false)

    return (
        <li key={proj.id} className={`project-list-item`}>
            <img className="file-icon" src={File} />
            <span className="project-list-item-text">{proj.title}</span>
            <img className="save grow" src={Save} onClick={() => { removeProject(proj.id) }} />
            {!deleting && <img className="delete grow" src={Delete} onClick={() => { setDeleting(true) }} />}

            {deleting && <img className="confirm grow" src={Confirm} onClick={() => {
                removeProject(proj.id)
                setDeleting(false)
            }} />}
            {deleting && <img className="delete grow" src={Cancel} onClick={() => { setDeleting(false) }} />}
        </li>
    )
}
