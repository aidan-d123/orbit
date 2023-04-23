// styles & images
import "./Project.css"

// hooks
import { useParams } from "react-router-dom";
import { useDocument } from "../../hooks/firebase/useDocument"
import { useEffect, useState } from "react";
import { timestamp } from "../../firebase/config"
import { useFirestore } from "../../hooks/firebase/useFirestore"
import { useAuthContext } from "../../hooks/firebase/useAuthContext"

// components
import Editor from "../../components/Editor/Editor";
import Simulator from "../../components/Simulator/simulator/Simulator";
import LoginModal from "../../components/LoginModal"
import EditorTitle from "../../components/Editor/EditorTitle";
import Unauthorised from "../../components/unauthorised/Unauthorised";

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
  const { error, document } = useDocument("projects", id);
  const { addDocument, updateDocument, response } = useFirestore("projects");

  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setCode(document.code);
      setLastModified(document.lastModified);
      setCreatedBy(document.createdBy)
      setVisble(document.visible)
      setShow(true);
      setIsNewProject(false)
      setUpdating(false)
    }
  }, [document]);

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

  if (error && !isNewProject) {
    return <div className="editor-container"><Unauthorised issue={error} /></div>
  }

  return (
    <div className="editor-container" onKeyDown={e => { ctrlS(e) }} onBefore>
      {(visible === true || (user && createdBy === user.uid)) && (show || id === "new") && (
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
          />
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
          />
        </>
      )}
      {!editing && (visible === true || (user && createdBy === user.uid)) && (show || id === "new") && <Simulator
        talInstructions={talInstructions}
        data={data}
      />}
      {showModal && <LoginModal setShowModal={setShowModal} />}

      {(!updating && (!(visible === true || (user && createdBy === user.uid)) && (show === false || id === "new"))) &&
        (< Unauthorised issue="The author has made this file private" />)
      }
    </div>
  )
}
