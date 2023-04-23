// editor themes
import 'codemirror/theme/material.css'
import 'codemirror/theme/railscasts.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/theme/ayu-mirage.css'
import 'codemirror/theme/lucario.css'
import 'codemirror/theme/erlang-dark.css'

// hooks
import { useCallback, useEffect, useState } from 'react'
import { useRegex } from '../hooks/riscvHooks/riscv/useRegex'

// components
import CodeMirror from "codemirror"

// styles & images
import "./ProjectPreview.css"
import { Link } from 'react-router-dom'
import Delete from "../images/delete.svg"

export default function ProjectPreview(props) {
  const { code, title, link, create, handleClick } = props
  const { registers, instructions, keywords } = useRegex()
  const [theme, setTheme] = useState("ayu-mirage")

  // retrieve selected theme from LocalStorage
  useEffect(() => {
    if (JSON.parse(window.localStorage.getItem("ORBIT_THEME")) !== null) {
      const data = JSON.parse(window.localStorage.getItem("ORBIT_THEME"))
      setTheme(data)
    }
  }, [])

  CodeMirror.defineMode("riscv", () => {

    const normal = (stream, state) => {
      let ch = stream.next()
      if (ch === "#") {
        stream.skipToEnd()
        return "comment"
      }

      if (ch === "\"" || ch === "'") {
        state.cur = string(ch)
        return state.cur(stream, state)
      }

      // finding imediate values
      if (/\d/.test(ch)) {
        stream.eatWhile(/[\w.%]/)
        return "number"
      }

      if (/[.\w_]/.test(ch)) {
        stream.eatWhile(/[\w\\\-_.]/)
        return "variable"
      }
      return null
    }

    const string = (quote) => {
      return (stream, state) => {
        // THIS IS RESPONSIBLE FOR KEEPING IDENT ON NEWLINE
        let escaped = false, ch
        while ((ch = stream.next()) != null) {
          if (ch === quote && !escaped) break
          escaped = !escaped && ch === "\\"
        }
        if (!escaped) state.cur = normal
        return "string"
      }
    }

    return {
      startState: (basecol) => {
        return {
          basecol: basecol || 0,
          indentDepth: 0,
          cur: normal
        }
      },

      token: (stream, state) => {
        if (stream.eatSpace()) {
          return null
        }

        let style = state.cur(stream, state)
        let word = stream.current()
        if (style === "variable") {
          if (keywords.test(word)) {
            style = "keyword"
          }
          else if (instructions.test(word)) {
            style = "builtin"
          }
          else if (registers.test(word)) {
            style = "variable-2"
          }
        }
        return style
      }
    }
  })

  // initialise the editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    const textArea = document.createElement("textarea")
    textArea.value = code
    textArea.classList.add("sub-code-mirror-wrapper")
    wrapper.append(textArea)
    let codeMirror = CodeMirror.fromTextArea(textArea,
      {
        lineNumbers: true,
        mode: "riscv",
        indentUnit: 8,
        autofocus: true,
        theme: theme,
        scrollbarStyle: "overlay",
        screenReaderLabel: "risc five code editor",
        gutters: ["CodeMirror-lint-markers"],
        readOnly: "nocursor"
      }
    )

  }, [theme])

  return (
    <div className='sub-editor-container grow'>
      <div className='sub-editor-title'>
        <Link to={!create ? `../project/${link}` : `../project/new`}>
          <span title={title}>{title.length < 15 ? title : title.substring(0, 15) + "..."}</span>
        </Link>
        {!create && <img className="delete grow" src={Delete} onClick={() => { handleClick(link) }} />}
      </div>
      <Link to={link ? (!create ? `../project/${link}` : `../project/new`) : "#"}>
        <div className='sub-subcontainer' ref={wrapperRef}>
        </div>
      </Link>
    </div>
  )
}