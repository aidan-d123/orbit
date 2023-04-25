// styles
import "./Memory.css"

// hooks
import { useEffect, useState } from "react"
import { useMemorySegments } from "../../../hooks/riscvHooks/riscv/useMemorySegments"

// components
import Select from 'react-select'

export default function Memory(props) {
  const { TEXT_BEGIN, DATA_BEGIN, HEAP_BEGIN, STACK_BEGIN } = useMemorySegments()
  const { memory } = props
  const [displayMemory, setDisplayMemory] = useState([])
  const [memoryStart, setMemoryStart] = useState(0)
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

  const initMem = (arr, start) => {
    let chunks = []
    if (arr && arr.length > 0) {
      const newArr = JSON.parse(JSON.stringify(arr))
      newArr.sort(compare)
      for (let i = start; i < start + 52; i++) {

        let foundData = newArr.find(x => x.address === i)
        let hexValue = (foundData !== undefined ? foundData.value : 0).toString(16)
        hexValue = hexValue.length === 2 ? hexValue : `0${hexValue}`
        chunks.push(hexValue)
      }
    } else {
      for (let i = start; i < start + 52; i++) {
        chunks.push("00")
      }
    }
    return arrayChunk(chunks)
  }

  useEffect(() => {
    setDisplayMemory(initMem(memory, memoryStart))
  }, [memory, memoryStart])

  const changeSegment = segment => {
    if (segment === "data") {
      setMemoryStart(DATA_BEGIN)
    } else if (segment === "stack") {
      setMemoryStart(STACK_BEGIN - 36)
    } else if (segment === "text") {
      setMemoryStart(TEXT_BEGIN)
    } else if (segment === "heap") {
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

  const getAddress = (address) => {
    let newAddress = address.toString(16)
    return newAddress.length === 8 ? newAddress : "0".repeat(8 - newAddress.length) + newAddress
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
          {displayMemory && <tbody>
            {displayMemory.length > 0 && (
              displayMemory.map((row, i) => (
                <tr scope="row">
                  <td className="mem">0x{getAddress(memoryStart + (i * 4))}</td>
                  {row.map((col, j) => (
                    <td>{col}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>}
        </table>
      </div>
      <div className="mem-buttons">
        <div className="segment-select-container" >
          <Select placeholder="Memory Segment" options={segments} onChange={(option) => { changeSegment(option.value) }} styles={colourStyles} className="theme-selector" />
        </div>

        {memoryStart >= 4 && <button className="mem-button mem-button-left" onClick={() => { setMemoryStart(memoryStart - 4) }}>Up</button>}
        {memoryStart < 4 && <button className="mem-button mem-button-left unclickable">Up</button>}
        {memoryStart < STACK_BEGIN - 36 && <button className="mem-button mem-button-right" onClick={() => { setMemoryStart(memoryStart + 4) }}>Down</button>}
        {memoryStart >= STACK_BEGIN - 36 && <button className="mem-button mem-button-right unclickable">Down</button>}
      </div>
    </div >
  )
}
