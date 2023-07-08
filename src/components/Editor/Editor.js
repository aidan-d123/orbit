// hooks
import { useCallback, useEffect } from 'react'
import { useRegex } from '../../hooks/riscvHooks/riscv/useRegex'
import { useAssembler } from "../../hooks/riscvHooks/assembler/useAssembler"

// components
import CodeMirror from "codemirror"

// styles
import "codemirror/addon/lint/lint"
import "codemirror/addon/lint/lint.css"
import "codemirror/addon/edit/closebrackets"
import "codemirror/addon/display/placeholder"
import "./Editor.css"

export default function Editor(props) {
  const { code, setCode, editing, theme, integer, setInteger, setErrors, errors, setWarnings, warnings, setTalInstructions, setData, user, id, selectedProject } = props
  const { registers, instructions, keywords } = useRegex()
  const { assemble, } = useAssembler()

  useEffect(() => {
    setErrors([])
    setWarnings([])
    const { talInstructions, dataMemory } = assemble(code, setErrors, setWarnings)
    setTalInstructions([...talInstructions])
    setData([...dataMemory])
  }, [code, selectedProject])

  // The "registerHelper" and "defineMode" code is modified from 
  // https://github.com/kvakil/venus/blob/master/src/main/frontend/js/risc-mode.js
  CodeMirror.registerHelper("lint", "riscv", (text) => {
    let structuredErrors = []
    let structuredInfo = []

    const parseError = (err) => {
      const line = err.errorLine
      structuredErrors.push({
        from: CodeMirror.Pos(line - 1, 0),
        to: CodeMirror.Pos(line, 0),
        severity: "error",
        message: err.errorMessage
      })
    }

    const parseWarning = (warning) => {
      const line = warning.warningLine
      structuredInfo.push({
        from: CodeMirror.Pos(line - 1, 0),
        to: CodeMirror.Pos(line, 0),
        severity: "warning",
        message: warning.warningMessage
      })
    }

    for (const error of errors) {
      parseError(error)
    }

    for (const warning of warnings) {
      parseWarning(warning)
    }

    return structuredErrors.concat(structuredInfo)

  })

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
    textArea.classList.add("code-mirror-wrapper")
    wrapper.append(textArea)

    let codeMirror = CodeMirror.fromTextArea(textArea,
      {
        lineNumbers: true,
        mode: "riscv",
        indentUnit: 8,
        autofocus: true,
        lint: true,
        theme: theme,
        scrollbarStyle: "overlay",
        screenReaderLabel: "risc five code editor",
        gutters: ["CodeMirror-lint-markers"],
        readOnly: false,
        autoCloseBrackets: true,
        placeholder: "Enter RISC-V Code",
      }
    )

    codeMirror.on("change", () => {
      setCode(codeMirror.doc.getValue())
    })
  }, [theme, integer])

  useEffect(() => {
    setInteger(integer === 1 ? 0 : 1)
  }, [editing])

  return (
    <>
      {editing && <div className='subcontainer' ref={wrapperRef}></div>}
    </>
  )
}