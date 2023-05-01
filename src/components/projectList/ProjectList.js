// styles & images
import "./ProjectList.css"

// hooks
import { useFirestore } from "../../hooks/firebase/useFirestore"

// components
import ProjectPreview from "../projectPreview/ProjectPreview"

export default function ProjectList(props) {
    const { deleteDocument } = useFirestore("projects");
    const { projects, isLoading } = props
    const skeleton = [1, 2, 3]
    return (
        <>
            <div className="project-list">
                <ProjectPreview title="New Project"
                    create={true}
                    code=""
                    link="new"
                />
                {projects && projects.map(project => (
                    <div key={project.id}>
                        <ProjectPreview
                            code={project.code}
                            title={project.title}
                            link={project.id}
                            handleClick={deleteDocument} />
                    </div>
                ))}
                {isLoading && skeleton.map(skel => (
                    <div key={skel}>
                        <ProjectPreview
                            code={""}
                            title={"Loading..."}
                        />
                    </div>
                ))}
            </div>
        </>
    )
}
