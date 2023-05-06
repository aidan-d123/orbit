// hooks
import { useState } from "react"
import { useRegisters } from "./useRegisters"
import { useUtils } from "../riscv/useUtils"
import { useMemorySegments } from "../riscv/useMemorySegments"

export const useSimulator = () => {
    const [memory, setMemory] = useState([])
    const [initialMemory, setInitialMemory] = useState([])
    const { registers, asignRegisters, readRegister, currentRegister, resetReg } = useRegisters()
    const [programCounter, setProgramCounter] = useState(0)
    const [instructionLength, setInstructionLength] = useState(0)
    const { invertNegative, getNumber } = useUtils()
    const { HEAP_BEGIN } = useMemorySegments()

    const setUpComponents = (instructions, data) => {
        setInitialMemory(JSON.parse(JSON.stringify(data)))

        let instMemory = assignInstructionMemory(instructions)
        setMemory(JSON.parse(JSON.stringify(instMemory.concat(data))))
        setProgramCounter(0)
        setInstructionLength(instructions.length * 4)
    }

    const operate = (inst, setConsoleError, setConsoleMessage) => {
        switch (inst[0]) {
            case "lui": uTypeOperation(inst[1], inst[2], false); break
            case "auipc": uTypeOperation(inst[1], inst[2], true); break
            case "jal": jal(inst[1], inst[2]); break
            case "jalr": jalr(inst[1], inst[2], inst[3]); break
            case "lb": lTypeOperation(inst[1], inst[2], inst[3], 1, false); break
            case "lh": lTypeOperation(inst[1], inst[2], inst[3], 2, false); break
            case "lw": lTypeOperation(inst[1], inst[2], inst[3], 4, false); break
            case "lbu": lTypeOperation(inst[1], inst[2], inst[3], 1, true); break
            case "lhu": lTypeOperation(inst[1], inst[2], inst[3], 2, true); break
            case "sltiu": sltiu(inst[1], inst[3], inst[2]); break
            case "sltu": sltu(inst[1], inst[2], inst[3]); break
            case "addi": iTypeOperation(inst[1], inst[3], inst[2], add); break
            case "slti": iTypeOperation(inst[1], inst[3], inst[2], slt); break
            case "xori": iTypeOperation(inst[1], inst[3], inst[2], xor); break
            case "ori": iTypeOperation(inst[1], inst[3], inst[2], or); break
            case "andi": iTypeOperation(inst[1], inst[3], inst[2], and); break
            case "slli": iTypeOperation(inst[1], inst[3], inst[2], sll); break
            case "srli": iTypeOperation(inst[1], inst[3], inst[2], srl); break
            case "srai": iTypeOperation(inst[1], inst[3], inst[2], sra); break
            case "add": rTypeOperation(inst[1], inst[2], inst[3], add); break
            case "sub": rTypeOperation(inst[1], inst[2], inst[3], sub); break
            case "slt": rTypeOperation(inst[1], inst[2], inst[3], slt); break
            case "xor": rTypeOperation(inst[1], inst[2], inst[3], xor); break
            case "or": rTypeOperation(inst[1], inst[2], inst[3], or); break
            case "and": rTypeOperation(inst[1], inst[2], inst[3], and); break
            case "sll": rTypeOperation(inst[1], inst[2], inst[3], sll); break
            case "srl": rTypeOperation(inst[1], inst[2], inst[3], srl); break
            case "sra": rTypeOperation(inst[1], inst[2], inst[3], sra); break
            case "beq": bTypeOperation(inst[1], inst[2], inst[3], eq); break
            case "bne": bTypeOperation(inst[1], inst[2], inst[3], ne); break
            case "blt": bTypeOperation(inst[1], inst[2], inst[3], lt); break
            case "bge": bTypeOperation(inst[1], inst[2], inst[3], ge); break
            case "bltu": bTypeUnsignedOperation(inst[1], inst[2], inst[3], lt); break
            case "bgeu": bTypeUnsignedOperation(inst[1], inst[2], inst[3], ge); break
            case "sb": sTypeOperation(inst[1], inst[2], inst[3], 1, setConsoleError); break
            case "sh": sTypeOperation(inst[1], inst[2], inst[3], 2, setConsoleError); break
            case "sw": sTypeOperation(inst[1], inst[2], inst[3], 4, setConsoleError); break
            case "ecall": ecall(setConsoleError, setConsoleMessage); break
        }
    }

    const iTypeOperation = (rd, imm, rs1, operation) => {
        const operand = readRegister(rs1)
        const after = operation(operand, imm)
        asignRegisters(rd, after)
        setProgramCounter(programCounter + 4)
    }

    const rTypeOperation = (rd, rs1, rs2, operation) => {
        const operand1 = readRegister(rs1)
        const operand2 = readRegister(rs2)
        const after = operation(operand1, operand2)
        asignRegisters(rd, after)
        setProgramCounter(programCounter + 4)
    }

    const bTypeOperation = (rs1, rs2, imm, operation) => {
        const value1 = readRegister(rs1)
        const value2 = readRegister(rs2)
        const newProgramCounter = operation(value1, value2) ? programCounter + imm : programCounter + 4
        setProgramCounter(newProgramCounter)
    }

    const uTypeOperation = (rd, imm, bool) => {
        let after = ((imm << 11) * 2)
        after = bool ? after + programCounter : after
        asignRegisters(rd, after)
        setProgramCounter(programCounter + 4)
    }

    const lTypeOperation = (rd, imm, rs1, n, unsigned) => {
        let word = ""
        let signedWord = ""
        let unsignedWord = ""
        let bits = 0

        let source = readRegister(rs1) + imm
        let newData = JSON.parse(JSON.stringify(memory))

        for (let i = 0; i < n; i++) {
            const newAddress = source + i
            const filteredMem = newData.filter(dat => {
                return dat.address === newAddress
            })

            if (filteredMem.length > 0) {
                let byte = filteredMem[0].value
                byte = byte < 0 ? invertNegative(byte, 8) : byte

                let hexByte = byte.toString(16)
                hexByte = hexByte.length >= 2 ? hexByte : "0".repeat(2 - hexByte.length) + hexByte

                word = hexByte + word
            } else {
                word = "00" + word
            }
        }

        bits = n * 8
        unsignedWord = parseInt(word, 16)
        signedWord = getNumber("0x" + unsignedWord.toString(16), bits, true)

        word = unsigned ? unsignedWord : signedWord
        asignRegisters(rd, word)
        setProgramCounter(programCounter + 4)
    }

    const sTypeOperation = (rs2, imm, rs1, n, setConsoleError) => {
        let newData = JSON.parse(JSON.stringify(memory))

        let value = readRegister(rs2)
        let hexString

        const destination = readRegister(rs1)
        let address = destination + imm

        if (address < instructionLength) {
            setConsoleError(`Error: Memory access violation. Attempted to write data to a read-only memory address (0x${address.toString(16)}) that is currently occupied by an instruction`)
        } else {
            let nBytes = n * 2

            if (value >= 0) {
                hexString = value.toString(16)
                if (hexString.length < nBytes) {
                    hexString = "0".repeat(nBytes - hexString.length) + hexString
                } else if (hexString.length > nBytes) {
                    hexString = hexString.slice(-nBytes)
                }
            } else {
                hexString = (value >>> 0).toString(16).slice(-nBytes)
                hexString = hexString.length === nBytes ? hexString : "1".repeat(nBytes - hexString.length) + hexString
            }

            hexString = hexString.match(/.{1,2}/g).reverse()

            hexString.forEach((string, index) => {
                const newValue = parseInt(string, 16)
                const newAddress = address + index

                const foundAddress = isAddressTaken(newAddress)
                if (foundAddress.length > 0) {
                    newData.map(mem => {
                        if (mem.address === newAddress) {
                            mem.value = newValue
                        }
                        return mem
                    })
                } else {
                    newData.push({
                        hexAddress: newAddress.toString(16),
                        address: newAddress,
                        value: newValue
                    })
                }
            })

            setMemory(newData)
            setProgramCounter(programCounter + 4)
        }
    }

    // J Type
    const jal = (rd, imm) => {
        asignRegisters(rd, programCounter + 4)
        setProgramCounter(programCounter + imm)
    }

    // I Type
    const jalr = (rd, imm, rs1) => {
        asignRegisters(rd, programCounter + 4)
        const returnAddress = readRegister(rs1)
        setProgramCounter(returnAddress + imm)
    }

    const sltiu = (rd, imm, rs1) => {
        const registerValue = readRegister(rs1)
        const unsignedRegisterValue = getNegativeNumber(registerValue)

        const unsignedImmediateValue = getNegativeNumber(imm)

        const assignedValue = unsignedRegisterValue < unsignedImmediateValue ? 1 : 0
        asignRegisters(rd, assignedValue)
        setProgramCounter(programCounter + 4)
    }

    const sltu = (rd, rs1, rs2) => {
        const registerValue1 = readRegister(rs1)
        const registerValue2 = readRegister(rs2)
        const unsignedRegisterValue1 = getNegativeNumber(registerValue1)
        const unsignedRegisterValue2 = getNegativeNumber(registerValue2)

        const assignedValue = unsignedRegisterValue1 < unsignedRegisterValue2 ? 1 : 0
        asignRegisters(rd, assignedValue)
        setProgramCounter(programCounter + 4)
    }

    const bTypeUnsignedOperation = (rs1, rs2, imm, operation) => {
        const value1 = readRegister(rs1)
        const value2 = readRegister(rs2)
        const value1Unsigned = getNegativeNumber(value1)
        const value2Unsigned = getNegativeNumber(value2)
        const newProgramCounter = operation(value1Unsigned, value2Unsigned) ? programCounter + imm : programCounter + 4
        setProgramCounter(newProgramCounter)
    }

    const add = (a, b) => a + b
    const slt = (a, b) => a < b ? 1 : 0
    const xor = (a, b) => a ^ b
    const or = (a, b) => a | b
    const and = (a, b) => a & b
    const sll = (a, b) => a << b
    const srl = (a, b) => a >>> b
    const sra = (a, b) => a >> b
    const sub = (a, b) => a - b
    const eq = (a, b) => a === b
    const ne = (a, b) => a !== b
    const lt = (a, b) => a < b
    const ge = (a, b) => a >= b

    const ecall = (setConsoleError, setConsoleMessage) => {
        const a0 = readRegister("x10")
        let a1 = readRegister("x11")
        let output = ""

        switch (a0) {
            case 1:
                setConsoleMessage(readRegister("x11"));
                setProgramCounter(programCounter + 4)
                break;
            case 4:
                let stringIndex = 0
                let stringByte
                let stringArray = JSON.parse(JSON.stringify(memory))

                while (stringByte !== "\n") {
                    const newAddress = a1 + stringIndex
                    const filteredMem = stringArray.filter(dat => {
                        return dat.address === newAddress
                    })

                    if (filteredMem.length > 0) {
                        stringByte = String.fromCharCode(filteredMem[0].value)
                    } else {
                        stringByte = "\n"
                    }
                    output += stringByte
                    stringIndex++
                }
                setConsoleMessage(output)
                setProgramCounter(programCounter + 4)
                break;
            case 9:
                let newData = JSON.parse(JSON.stringify(memory))
                let address = HEAP_BEGIN
                let hexString = "00".repeat(a1)
                hexString = hexString.match(/.{1,2}/g)

                hexString.forEach((string, index) => {
                    const newValue = parseInt(string, 16)
                    const newAddress = address + index

                    const foundAddress = isAddressTaken(newAddress)
                    if (foundAddress.length > 0) {
                        newData.map(mem => {
                            if (mem.address === newAddress) {
                                mem.value = newValue
                            }
                            return mem
                        })
                    } else {
                        newData.push({
                            hexAddress: newAddress.toString(16),
                            address: newAddress,
                            value: newValue
                        })
                    }
                })

                setMemory(newData)
                setProgramCounter(programCounter + 4)

                asignRegisters("x10", HEAP_BEGIN)
                break;
            case 10: resetSim(); break;
            case 11:
                setConsoleMessage(String.fromCharCode(a1));
                setProgramCounter(programCounter + 4)
                break;
            case 17:
                setConsoleError(`Exited with error code ${a1}`)
                resetSim()
                break;
            default: setConsoleError(`Invalid ecall ${a0}`)
        }
    }

    const assignInstructionMemory = instructions => {
        setMemory([])
        let endianMemory = []

        instructions.forEach((instruction, wordIndex) => {
            let endianValue = instruction.machineCode.match(/.{1,2}/g).reverse() //risc-v memory is little endian
            endianValue.forEach((byte, byteIndex) => {
                const address = (wordIndex * 4) + byteIndex
                endianMemory.push({
                    hexAddress: address.toString(16), address, value: parseInt(byte, 16)
                })
            })
        })

        return endianMemory
    }

    const getNegativeNumber = value => {
        let structuredValue
        const bits = 32

        if (value >= 0) {
            return value
        } else {
            structuredValue = (value >>> 0).toString(2).slice(-bits)
            structuredValue = structuredValue.length === bits ? structuredValue : "1".repeat(bits - structuredValue.length) + structuredValue
        }

        return parseInt(structuredValue, 2)
    }

    const isAddressTaken = address => {
        return memory.filter(mem => {
            return mem.address === address
        })
    }

    const resetSim = () => {
        resetReg()
        let test = JSON.parse(JSON.stringify(initialMemory))
        setMemory(JSON.parse(JSON.stringify(initialMemory)))
        setProgramCounter(-1)
    }

    return { setUpComponents, operate, programCounter, memory, registers, currentRegister }
}

