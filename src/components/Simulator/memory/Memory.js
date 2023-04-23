// styles
import "./Memory.css"

// hooks
import { useEffect, useState } from "react"
import { useMemorySegments } from "../../../hooks/riscvHooks/riscv/useMemorySegments"

// components
import Select from 'react-select'

export default function Memory(props) {
  const { DATA_BEGIN, HEAP_BEGIN, STACK_BEGIN } = useMemorySegments()
  const { dataMemory, memory } = props
  const [chunkedMemory, setChunkedMemory] = useState([])
  const [chunkedInstructions, setChunkedInstructions] = useState([])
  const [memoryStart, setMemoryStart] = useState(DATA_BEGIN)
  const [instructionStart, setInstructionStart] = useState(0)
  const [segment, setSegment] = useState("text")
  const segments = [
    { value: "text", label: "text" },
    { value: "data", label: "data" },
    { value: "heap", label: "heap" },
    { value: "stack", label: "stack" }
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

  useEffect(() => {
    let chunks = []
    if (dataMemory && dataMemory.length > 0) {
      const newDataMemory = JSON.parse(JSON.stringify(dataMemory))
      newDataMemory.sort(compare)
      for (let i = memoryStart; i < memoryStart + 52; i++) {
        let foundData = newDataMemory.find(x => x.address === i)
        chunks.push(foundData !== undefined ? foundData.value : 0)
      }
    } else {
      for (let i = memoryStart; i < memoryStart + 52; i++) {
        chunks.push(0)
      }
    }
    chunks = arrayChunk(chunks)
    setChunkedMemory(chunks)
  }, [dataMemory, memoryStart])

  useEffect(() => {
    let chunks = []
    if (memory && memory.length > 0) {
      const newMemory = JSON.parse(JSON.stringify(memory))
      for (let i = instructionStart; i < instructionStart + 52; i++) {
        chunks.push(newMemory[i] !== undefined ? newMemory[i] : 0)
      }
    } else {
      for (let i = instructionStart; i < instructionStart + 52; i++) {
        chunks.push(0)
      }
    }
    chunks = arrayChunk(chunks)
    setChunkedInstructions(chunks)
  }, [memory, instructionStart])

  const changeSegment = segment => {
    if (segment === "data") {
      setSegment(segment)
      setMemoryStart(DATA_BEGIN)
    } else if (segment === "stack") {
      setSegment(segment)
      setMemoryStart(STACK_BEGIN - 36)
    } else if (segment === "text") {
      setSegment(segment)
    } else if (segment === "heap") {
      setSegment(segment)
      setMemoryStart(HEAP_BEGIN)
    }
  }

  const arrayChunk = (arr) => {
    const array = arr.slice()
    const chunks = []
    while (array.length) chunks.push(array.splice(0, 4))
    return chunks
  }

  const compare = (a, b) => {
    if (a.address < b.address) {
      return -1
    }
    if (a.address > b.address) {
      return 1
    }
    return 0
  }

  const getAddress = (address, i) => {
    let newAddress = (address + (i * 4)).toString(16)
    newAddress = newAddress.length === 8 ? address : "0".repeat(8 - newAddress.length) + newAddress
    return newAddress
  }

  return (
    <div className="mem-table-container">
      <div className="mem-cont">
        <table className="mem-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>+0</th>
              <th>+1</th>
              <th>+2</th>
              <th>+3</th>
            </tr>
          </thead>
          {(segment === "data" || segment === "stack" || segment === "heap") && <tbody>
            {chunkedMemory.length > 0 && (
              chunkedMemory.map((row, i) => (
                <tr scope="row">
                  <td className="mem">0x{(memoryStart + (i * 4)).toString(16)}</td>
                  {row.map((col, j) => (
                    <td>{col}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>}

          {segment === "text" && <tbody>
            {chunkedInstructions.map((row, i) => (
              <tr scope="row">
                <td className="mem">0x{getAddress(instructionStart, i)}</td>
                {row.map((col) => (
                  <td>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>}
        </table>
      </div>
      <div className="mem-buttons">
        <div className="segment-select-container" >
          <Select placeholder="Memory Segment" options={segments} onChange={(option) => { changeSegment(option.value) }} styles={colourStyles} className="theme-selector" />
        </div>
        {segment === "text" && instructionStart >= 4 && <button className="mem-button mem-button-left" onClick={() => { setInstructionStart(instructionStart - 4) }}>Up</button>}
        {segment === "text" && instructionStart < 4 && <button className="mem-button mem-button-left unclickable">Up</button>}
        {segment === "text" && <button className="mem-button mem-button-right" onClick={() => { setInstructionStart(instructionStart + 4) }}>Down</button>}

        {segment === "data" && memoryStart >= DATA_BEGIN + 4 && <button className="mem-button mem-button-left" onClick={() => { setMemoryStart(memoryStart - 4) }}>Up</button>}
        {segment === "data" && memoryStart < DATA_BEGIN + 4 && <button className="mem-button mem-button-left unclickable">Up</button>}
        {segment === "data" && <button className="mem-button mem-button-right" onClick={() => { setMemoryStart(memoryStart + 4) }}>Down</button>}

        {segment === "heap" && <button className="mem-button mem-button-left" onClick={() => { setMemoryStart(memoryStart - 4) }}>Up</button>}
        {segment === "heap" && <button className="mem-button mem-button-right" onClick={() => { setMemoryStart(memoryStart + 4) }}>Down</button>}

        {segment === "stack" && <button className="mem-button mem-button-left" onClick={() => { setMemoryStart(memoryStart - 4) }}>Up</button>}
        {segment === "stack" && memoryStart <= STACK_BEGIN - 40 && <button className="mem-button mem-button-right" onClick={() => { setMemoryStart(memoryStart + 4) }}>Down</button>}
        {segment === "stack" && memoryStart > STACK_BEGIN - 40 && <button className="mem-button mem-button-right unclickable">Down</button>}
      </div>
    </div>
  )
}
