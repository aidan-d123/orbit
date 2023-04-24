// hooks
import { useState } from "react"
import { useRegisters } from "./useRegisters"
import { useMemorySegments } from "../riscv/useMemorySegments"
import { useUtils } from "../riscv/useUtils"

export const useSimulator = () => {
    const [memory, setMemory] = useState([])
    const [dataMemory, setDataMemory] = useState()
    const { registers, asignRegisters, readRegister, currentRegister } = useRegisters()
    const [programCounter, setProgramCounter] = useState(0)
    const { DATA_BEGIN, HEAP_BEGIN } = useMemorySegments()
    const { invertNegative, getNumber } = useUtils()

    const setUpComponents = (instructions, data) => {
        setDataMemory([...data])
        setProgramCounter(0)
        assignInstructionMemory(instructions)
    }

    const operate = (inst) => {
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
            case "sb": sTypeOperation(inst[1], inst[2], inst[3], 1); break
            case "sh": sTypeOperation(inst[1], inst[2], inst[3], 2); break
            case "sw": sTypeOperation(inst[1], inst[2], inst[3], 4); break
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
        let newData = JSON.parse(JSON.stringify(dataMemory))

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

    const sTypeOperation = (rs2, imm, rs1, n) => {
        let newData = JSON.parse(JSON.stringify(dataMemory))

        let value = readRegister(rs2)
        let hexString

        const destination = readRegister(rs1)
        let address = destination + imm

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

        setDataMemory(newData)
        setProgramCounter(programCounter + 4)
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

    const assignInstructionMemory = instructions => {
        setMemory([])
        let endianMemory = []

        instructions.forEach(instruction => {
            let endian = instruction.machineCode.match(/.{1,2}/g).reverse() //risc-v memory is little endian
            endianMemory = endianMemory.concat(endian)
        })

        setMemory(endianMemory)
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
        return dataMemory.filter(mem => {
            return mem.address === address
        })
    }

    return { setUpComponents, operate, programCounter, memory, dataMemory, registers, currentRegister }
}

