// styles
import "./Simulator.css"

// components 
import Instructions from "../instructions/Instructions"
import Registers from "../registers/Registers"
import Memory from "../memory/Memory"

// hooks
import { useSimulator } from "../../../hooks/riscvHooks/Simulator/useSimulator"
import { useEffect, useRef, useState } from "react"

export default function Simulator(props) {
  const { talInstructions, data } = props
  const { setUpComponents, operate, programCounter, memory, registers, currentRegister } = useSimulator()
  const [storage, setStorage] = useState("reg")

  const consoleRef = useRef(null)
  const currentRef = useRef(null)

  useEffect(() => {
    setUpComponents(talInstructions, data)
  }, [])

  const dump = () => {
    setStorage("console")
    setTimeout(() => {
      let dumpLog = ""
      talInstructions.forEach(inst => {
        dumpLog += inst.machineCode + "\n"
      }, 3000)

      consoleRef.current.value = dumpLog
    })
  }

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    }

  }, [programCounter])

  return (
    <div className="simulator">
      <Instructions talInstructions={talInstructions} programCounter={programCounter} operate={operate} dump={dump} setStorage={setStorage} currentRef={currentRef} />

      <div className="storage">
        <div className="storage-tabs">
          <button class={`stor-tab stor-tab-left ${storage === "reg" ? "selected-tab" : ""}`} onClick={() => { setStorage("reg") }}>Registers</button>
          <button class={`stor-tab ${storage === "mem" ? "selected-tab" : ""}`} onClick={() => { setStorage("mem") }}>Memory</button>
          <button class={`stor-tab stor-tab-right ${storage === "console" ? "selected-tab" : ""}`} onClick={() => { setStorage("console") }}>Console</button>
        </div>
        {storage === "reg" && <Registers registers={registers} programCounter={programCounter} currentRegister={currentRegister} />}
        {storage === "mem" && <Memory memory={memory} />}
        {storage === "console" && <div className="console-container">
          <textarea ref={consoleRef} placeholder="Console Output" className="console" readOnly />
        </div>}
      </div>
    </div>
  )
}
