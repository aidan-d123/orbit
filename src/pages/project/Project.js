// styles & images
import "./Project.css"

// hooks
import { useParams } from "react-router-dom";
import { useDocument } from "../../hooks/firebase/useDocument"
import { useEffect, useState } from "react";
import { timestamp } from "../../firebase/config"
import { useFirestore } from "../../hooks/firebase/useFirestore"
import { useAuthContext } from "../../hooks/firebase/useAuthContext"
import { useCollection } from "../../hooks/firebase/useCollection"

// components
import Editor from "../../components/editor/Editor"
import Simulator from "../../components/simulator/simulator/Simulator";
import LoginModal from "../../components/loginModal/LoginModal"
import Unauthorised from "../../components/unauthorised/Unauthorised";

// components
import EditorTitle from "../../components/editor/EditorTitle";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

export default function Project() {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("Hello, World!");
  const [show, setShow] = useState(false);
  const [lastModified, setLastModified] = useState();
  const [editing, setEditing] = useState(true);
  const [theme, setTheme] = useState("material-darker");
  const [integer, setInteger] = useState(0);
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [talInstructions, setTalInstructions] = useState([]);
  const [data, setData] = useState([]);
  const [visible, setVisble] = useState(true)
  const [createdBy, setCreatedBy] = useState("")
  const [isNewProject, setIsNewProject] = useState(true);
  const [updating, setUpdating] = useState(false)
  const { user } = useAuthContext();
  const { id } = useParams();
  const { /*error,*/ document } = useDocument("projects", id);
  const { addDocument, updateDocument, response } = useFirestore("projects");
  const { documents, error } = useCollection(
    "projects",
    ["lastModified", "desc"]);
  const [projectList, setProjectList] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState("")

  // useEffect(() => {
  //   if (document) {
  //     setTitle(document.title)
  //     setCode(document.code);
  //     setLastModified(document.lastModified);
  //     setCreatedBy(document.createdBy)
  //     setVisble(document.visible)
  //     setShow(true);
  //     setIsNewProject(false)
  //     setUpdating(false)
  //   }
  // }, [document]);

  useEffect(() => {
    console.log(documents)
  }, [documents])

  useEffect(() => {
    if (id !== "new") {
      setIsNewProject(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      setShowModal(false)
    }
  }, [user])

  // retrieve selected theme from LocalStorage
  useEffect(() => {
    if (JSON.parse(window.localStorage.getItem("ORBIT_THEME")) !== null) {
      const data = JSON.parse(window.localStorage.getItem("ORBIT_THEME"));
      setTheme(data)
      setInteger(integer === 1 ? 0 : 1);
    }
  }, []);

  // add selected theme to LocalStorage
  useEffect(() => {
    window.localStorage.setItem("ORBIT_THEME", JSON.stringify(theme));
  }, [theme]);

  const ctrlS = e => {
    if (e.ctrlKey && (e.key === 's' || e.key === "S")) {
      e.preventDefault()
      handleSave(title, code)
    }
  }

  // saving project to database
  const handleSave = async (fileTitle, fileCode) => {
    // if not signed in, prompt user
    if (!user) {
      setTitle(fileTitle);
      setCode(fileCode);
      setShowModal(true);
    }

    // if new project, create new document
    else if (user && id === "new") {
      setUpdating(true)

      const project = {
        title: fileTitle,
        code: fileCode,
        createdAt: timestamp.now(),
        lastModified: timestamp.now(),
        createdBy: user.uid,
        visible
      }

      await addDocument(project);
    }

    // if not new project, update document
    else if (user && id !== "new") {
      setUpdating(true)

      await updateDocument(id, {
        title,
        code,
        lastModified: timestamp.now(),
        visible
      })
    }
  }

  const changeVisibility = async (visible) => {
    await updateDocument(id, {
      visible
    })
  }

  /********************************************************************************************** */

  // get projects from firestore
  // useEffect(() => {
  //   if (documents) {
  //     setProjectList(documents)
  //   }
  // }, [documents])

  const createNewProject = () => {
    const proj = {
      folder: false,
      title: "Hello, World!",
      code: "",
      id: uuid()
    }

    setProjectList(prevProjectList => {
      return [...prevProjectList, proj]
    })

    selectProject(proj)
  }

  const createNewFolder = () => {
    const proj = {
      folder: true,
      title: "New Folder",
      files: [{
        folder: false,
        title: "Hello, World!",
        code: "",
        id: uuid()
      }],
      id: uuid()
    }

    setProjectList(prevProjectList => {
      return [...prevProjectList, proj]
    })
  }

  const selectProject = proj => {
    setSelectedProject(proj)
    setTitle(proj.title)
    setCode(proj.code)
  }

  const removeProject = id => {
    console.log(id)
    const filteredProj = projectList.filter(proj => {
      return proj.id !== id
    })

    setProjectList(filteredProj)

    if (filteredProj.length > 0) {
      const newSelectedProj = filteredProj[0]
      selectProject(newSelectedProj)
    }
  }

  const uuid = () => {
    const temp_url = URL.createObjectURL(new Blob());
    const uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.substr(uuid.lastIndexOf('/') + 1); // remove prefix (e.g. blob:null/, blob:www.test.com/, ...)
  }

  // re-render editor when new project is selected
  useEffect(() => {
    setInteger(integer === 1 ? 0 : 1)
  }, [selectedProject])

  // sort array alphabetically
  useEffect(() => {
    projectList.sort((a, b) => {
      if (a.title < b.title) {
        return -1
      }
      if (a.title > b.title) {
        return 1
      }
      return 0
    }
    )

    console.log(projectList)
  }, [projectList])

  return (
    <>
      <EditorTitle
        errors={errors}
        warnings={warnings}
        code={code}
        title={title}
        setTitle={setTitle}
        lastModified={lastModified}
        editing={editing}
        setEditing={setEditing}
        setShowModal={setShowModal}
        setTheme={setTheme}
        handleSave={handleSave}
        visible={visible}
        setVisble={setVisble}
        createdBy={createdBy}
        changeVisibility={changeVisibility}
        saving={response.isPending}
        selectedProject={selectedProject}
      />
      <Sidebar projectList={projectList} createNewProject={createNewProject} createNewFolder={createNewFolder} removeProject={removeProject} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
      {editing && selectedProjects.length > 0 && <Navbar selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} removeProject={removeProject} />}
      {editing && selectedProject &&
        <Editor
          code={code}
          setCode={setCode}
          editing={editing}
          theme={theme}
          integer={integer}
          setInteger={setInteger}
          setErrors={setErrors}
          errors={errors}
          setWarnings={setWarnings}
          warnings={warnings}
          setTalInstructions={setTalInstructions}
          setData={setData}
          user={user}
          id={id}
        />}
      {!editing && <Simulator
        talInstructions={talInstructions}
        data={data}
      />}
      {showModal && <LoginModal setShowModal={setShowModal} />}

    </>
    // <>
    //   {(visible === true || (user && createdBy === user.uid)) && (show || id === "new") && (
    //     <>
    //       <EditorTitle
    //         errors={errors}
    //         warnings={warnings}
    //         code={code}
    //         title={title}
    //         setTitle={setTitle}
    //         lastModified={lastModified}
    //         editing={editing}
    //         setEditing={setEditing}
    //         setShowModal={setShowModal}
    //         setTheme={setTheme}
    //         handleSave={handleSave}
    //         visible={visible}
    //         setVisble={setVisble}
    //         createdBy={createdBy}
    //         changeVisibility={changeVisibility}
    //         saving={response.isPending}
    //       />
    //       <Editor
    //         code={code}
    //         setCode={setCode}
    //         editing={editing}
    //         theme={theme}
    //         integer={integer}
    //         setInteger={setInteger}
    //         setErrors={setErrors}
    //         errors={errors}
    //         setWarnings={setWarnings}
    //         warnings={warnings}
    //         setTalInstructions={setTalInstructions}
    //         setData={setData}
    //         user={user}
    //         id={id}
    //       />
    //     </>
    //   )}
    //   {!editing && (visible === true || (user && createdBy === user.uid)) && (show || id === "new") && <Simulator
    //     talInstructions={talInstructions}
    //     data={data}
    //   />}

    //   {(!updating && (!(visible === true || (user && createdBy === user.uid)) && (show === false || id === "new"))) &&
    //     (< Unauthorised issue="The author has made this file private" />)
    //   }
    // </>
  )
}
