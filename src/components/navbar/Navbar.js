import NavItem from "./NavItem"
import "./Navbar.css"
import { useRef } from "react"

export default function Navbar(props) {
    const { selectedProjects, setSelectedProject, selectedProject, changeProject, removeProject } = props
    const scrollRef = useRef(null)

    // horizontal scrolling for navbar
    const handleScroll = (e) => {
        if (e.deltaY > 0) scrollRef.current.scrollLeft -= 50;
        else scrollRef.current.scrollLeft += 50;
    }

    return (
        <div className="navbar-container">
            <div className="selected-projects-list" onWheel={e => { handleScroll(e) }} ref={scrollRef}>
                {selectedProjects.map(proj => (
                    <NavItem key={proj.id} proj={proj} selectedProject={selectedProject} setSelectedProject={setSelectedProject} changeProject={changeProject} removeProject={removeProject} />
                ))}
            </div>
        </div>
    )
}
