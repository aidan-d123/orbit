// hooks
import { useRef, useEffect, useState } from 'react'

// styles
import "./Instructions.css"

export default function Instructions(props) {

  const { talInstructions, programCounter, operate, dump, currentRef } = props
  const [instructions, setInstructions] = useState([])
  const current = useRef()

  useEffect(() => {
    if (talInstructions.length < 10) {
      let tempInst = JSON.parse(JSON.stringify(talInstructions))
      for (let i = 0; i < 10 - talInstructions.length; i++) {
        tempInst.push({ line: ["--"], lineNo: "--", machineCode: "00000000", memoryLocation: ((talInstructions.length + i) * 4), talLine: ["--"] })
      }
      setInstructions(tempInst)
    } else {
      setInstructions(talInstructions)
    }

  }, [talInstructions])


  const handleForward = () => {
    if ((programCounter / 4) < talInstructions.length) {
      operate(talInstructions[programCounter / 4].talLine)
    }
  }

  return (
    <div className='instructions-container'>
      <div className='button-group'>
        <button className="inst-tab left-tab" onClick={() => { handleForward() }}>Step</button>
        <button className="inst-tab right-tab" onClick={() => {
          dump()
        }}>Dump</button>
      </div>
      <div id="container" className="inst-table-container">
        <table className="inst-table">
          <thead>
            <tr className='inst-header'>
              <th>PC</th>
              <th>Machine Code</th>
              <th>Assembly Code</th>
              <th>Original Code</th>
            </tr>
          </thead>
          <tbody>
            {instructions && instructions.map((instruction, index) => (
              <tr ref={index === (programCounter / 4) ? currentRef : current} key={instruction.memoryLocation} className={index === programCounter / 4 ? "chosen" : ""}>
                <td className='program-counter-address'>0x{instruction.memoryLocation.toString(16)}</td><td>0x{instruction.machineCode}</td><td className='tal'>{instruction.talLine.join(" ")}</td><td>{instruction.line.join(" ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div >
  )
}