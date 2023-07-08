// CodeMirror themes
import 'codemirror/theme/material.css'
import 'codemirror/theme/material-darker.css'
import 'codemirror/theme/material-palenight.css'
import 'codemirror/theme/material-ocean.css'

// hooks
import { useRef, useEffect } from 'react'
import { useLogout } from "../../hooks/firebase/useLogout"
import { useAuthContext } from "../../hooks/firebase/useAuthContext"
import { useHistory, Link } from 'react-router-dom'

// components
import Select from 'react-select'

// images
import Logo from "../../images/logo.svg"
import Save from "../../images/save.svg"
import Download from "../../images/download.svg"
import Simulate from "../../images/simulate.svg"
import Code from "../../images/code.svg"
import Public from "../../images/public.svg"
import Private from "../../images/private.svg"
import Load from "../../images/load.svg"

// styles
import "./EditorTitle.css"
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/scroll/simplescrollbars.js'
import 'codemirror/addon/scroll/simplescrollbars.css'

export default function EditorTitle(props) {

    const {
        errors,
        warnings,
        code, title,
        setTitle,
        lastModified,
        editing,
        setEditing,
        setShowModal,
        setTheme,
        handleSave,
        visible,
        setVisble,
        createdBy,
        changeVisibility,
        saving } = props

    const { user } = useAuthContext()
    const { logout, error, isPending } = useLogout()
    const lastModifiedRef = useRef()
    const history = useHistory()

    const themes = [
        { value: "material-darker", label: "Satellite" },
        { value: "material-ocean", label: "Transit" },
        { value: "material-palenight", label: "Gravity" },
        { value: "material", label: "Comet" }
    ]

    const colourStyles = {
        control: (styles) => ({
            ...styles,
            backgroundColor: "#f3f3f3",
            fontFamily: "Poppins",
        }),

        option: (styles, { isFocused }) => {
            return {
                ...styles,
                backgroundColor: isFocused ? '#333' : "#f3f3f3",
                color: isFocused ? '#f3f3f3' : "#333",
                fontFamily: "Poppins"
            }
        }
    }

    // download project as .s file
    const downloadFile = () => {
        const type = "text/plain"
        const filename = title + ".s"
        const data = code

        let file = new Blob([data], { type: type })
        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, filename)
        else {
            const a = document.createElement("a"),
                url = URL.createObjectURL(file)
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            setTimeout(function () {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }, 0)
        }
    }

    // highlights the most recent save date when document is saved
    useEffect(() => {
        if (lastModifiedRef && lastModifiedRef.current !== undefined && lastModifiedRef !== null) {
            lastModifiedRef.current.classList.add("fading")
            setTimeout(() => {
                lastModifiedRef.current.classList.remove("fading")
            }, [1000])
        }
    }, [lastModified])

    // logout error
    useEffect(() => {
        if (error) {
            alert(error)
        }
    }, [error])

    return (
        <div className='editor-title-container'>
            <ul>
                <li className='logo'>
                    <img src={Logo} alt="Orbit Logo" title="Orbit" className='logo-icon' />
                </li>
                <li className='tagline'><span>RISC-V Assembly Editor & Simulator</span></li>

                {!saving && <li className='icon'><img src={Save} className='grow icon' alt="Save Icon" onClick={() => { handleSave(title, code) }} title="Save" /></li>}
                {saving && <li className='icon'><img src={Load} className='grow spinning icon' alt="Loading Icon" onClick={() => { handleSave(title, code) }} title="Save" /></li>}

                {!editing && <li className='icon code-icon'><img src={Code} className='grow icon' alt="Code Icon" title="Code" onClick={() => { setEditing(true) }} /></li>}
                {editing && !errors.length > 0 && !warnings.length > 0 && <li className='icon'><img src={Simulate} alt="Simulate Icon" className='grow icon' title="Simulate" onClick={() => { setEditing(false) }} /></li>}
                {editing && (errors.length > 0 || warnings.length > 0) && <li className='error-img'><img src={Simulate} alt="Simulate Icon" title="Resolve errors before simulating" /></li>}

                <li>
                    <Select placeholder="Editor Theme" options={themes} onChange={(option) => { setTheme(option.value) }} styles={colourStyles} className="theme-selector" />
                </li>


                {!isPending && !user && <li><button onClick={() => { setShowModal(true) }} className="btn">Login</button></li>}
                {!isPending && user && <button className='btn' onClick={() => {
                    handleSave(title, code)
                    logout()
                }}>Logout</button>}
                {isPending && <button className='btn'>Logging Out...</button>}

                {/* {!saving && <li className='icon'><img src={Save} className='grow' alt="Save Icon" onClick={() => { handleSave(title, code) }} title="Save" /></li>}
                {saving && <li className='icon'><img src={Load} className='grow spinning' alt="Loading Icon" onClick={() => { handleSave(title, code) }} title="Save" /></li>}
                {!editing && <li className='icon code-icon'><img src={Code} className='grow' alt="Code Icon" title="Code" onClick={() => { setEditing(true) }} /></li>}
                {editing && !errors.length > 0 && !warnings.length > 0 && <li className='icon'><img src={Simulate} alt="Simulate Icon" className='grow' title="Simulate" onClick={() => { setEditing(false) }} /></li>}
                {editing && (errors.length > 0 || warnings.length > 0) && <li className='error-img'><img src={Simulate} alt="Simulate Icon" title="Resolve errors before simulating" /></li>} */}

                {/* <li className='title'>
                    <input spellCheck={false} className='title-changer' value={title} onChange={e => { setTitle(e.target.value) }} />
                </li> */}

                {/* {editing && lastModified &&
                    <li className='title'>
                        <p ref={lastModifiedRef} className='last-modifed'>Saved: {lastModified.toDate().toDateString().slice(4)}, {lastModified.toDate("g").toLocaleTimeString('en-US')}</p>
                    </li>
                } */}

                {/* {editing && visible === true && user && createdBy === user.uid &&
                    <li className='icon'>
                        <img src={Public} className='grow' alt="Public Icon" onClick={() => {
                            setVisble(false)
                            changeVisibility(false)
                        }} title="Public" />
                    </li>
                } */}
                {/* {editing && visible === false && user && createdBy === user.uid &&
                    <li className='icon'>
                        <img src={Private} className='grow' alt="Private Icon" onClick={() => {
                            setVisble(true)
                            changeVisibility(true)
                        }} title="Private" />
                    </li>
                } */}

                {/* {editing &&
                    <li className='icon'>
                        <img className='grow' src={Download} alt="Download Icon" onClick={downloadFile} title="Download" />
                    </li>
                } */}





                {/*
                {!user &&
                    <li onClick={() => { setShowModal(true) }} className="login">Login</li>
                } */}
            </ul>
        </div>
    )
}