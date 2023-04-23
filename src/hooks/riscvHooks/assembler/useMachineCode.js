export const useMachineCode = () => {

    const iTypeMachineCode = (inst, rd, rs1, imm) => {
        let binaryImm = imm >= 0 ? imm.toString(2) : ((imm >>> 0).toString(2).slice(-12))
        if (imm >= 0) {
            binaryImm = binaryImm.length === 12 ? binaryImm : ("0".repeat(12 - binaryImm.length) + binaryImm)
        }
        const register1 = determineRegister(rs1)
        const f3 = determineF3(inst)
        const registerDestination = determineRegister(rd)
        const opcode = determineOpcode(inst)
        let hexString = (parseInt(binaryImm + register1 + f3 + registerDestination + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const sTypeMachineCode = (inst, rs2, imm, rs1) => {
        let binaryImm = imm >= 0 ? imm.toString(2) : ((imm >>> 0).toString(2).slice(-12))
        if (imm >= 0) {
            binaryImm = binaryImm.length === 12 ? binaryImm : ("0".repeat(12 - binaryImm.length) + binaryImm)
        }
        const firstImm = binaryImm.substring(0, 7)
        const register2 = determineRegister(rs2)
        const register1 = determineRegister(rs1)
        const f3 = determineF3(inst)
        const secondImm = binaryImm.substring(7, 12)
        const opcode = "0100011"
        let hexString = (parseInt(firstImm + register2 + register1 + f3 + secondImm + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const iTypShifteMachineCode = (inst, rd, rs1, shamt) => {
        const f7 = determineF7(inst)
        let binaryShamt = shamt.toString(2)
        binaryShamt = binaryShamt.length === 5 ? binaryShamt : ("0".repeat(5 - binaryShamt.length) + binaryShamt)
        const register1 = determineRegister(rs1)
        const f3 = determineF3(inst)
        const registerDestination = determineRegister(rd)
        const opcode = "0010011"
        let hexString = (parseInt(f7 + binaryShamt + register1 + f3 + registerDestination + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const uTypeMachineCode = (inst, rd, imm) => {
        let binaryImm = imm.toString(2)
        binaryImm = binaryImm.length === 20 ? binaryImm : ("0".repeat(20 - binaryImm.length) + binaryImm)
        const registerDestination = determineRegister(rd)
        const opcode = determineOpcode(inst)
        let hexString = (parseInt(binaryImm + registerDestination + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const rTypeMachineCode = (inst, rd, rs1, rs2) => {
        const f7 = determineF7(inst)
        const register2 = determineRegister(rs2)
        const register1 = determineRegister(rs1)
        const f3 = determineF3(inst)
        const registerDestination = determineRegister(rd)
        const opcode = "0110011"
        let hexString = (parseInt(f7 + register2 + register1 + f3 + registerDestination + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const bTypeMachineCode = (inst, rs1, rs2, imm) => {
        let binaryImm = imm >= 0 ? imm.toString(2) : ((imm >>> 0).toString(2).slice(-12))
        if (imm >= 0) {
            binaryImm = binaryImm.length === 12 ? binaryImm : ("0".repeat(12 - binaryImm.length) + binaryImm)
        }
        binaryImm = binaryImm.charAt(0).repeat(1) + binaryImm.substring(0, binaryImm.length - 1)
        const firstBinaryImm = binaryImm.charAt(0) + binaryImm.substring(2, 8)
        const register2 = determineRegister(rs2)
        const register1 = determineRegister(rs1)
        const f3 = determineF3(inst)
        const secondBinaryImm = binaryImm.substring(8, 12) + binaryImm.charAt(1)
        const opcode = "1100011"
        let hexString = (parseInt(firstBinaryImm + register2 + register1 + f3 + secondBinaryImm + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const jTypeMachineCode = (inst, rd, imm) => {
        let binaryImm = imm >= 0 ? imm.toString(2) : ((imm >>> 0).toString(2).slice(-20))
        if (imm >= 0) {
            binaryImm = binaryImm.length === 20 ? binaryImm : ("0".repeat(20 - binaryImm.length) + binaryImm)
        }
        binaryImm = binaryImm.charAt(0).repeat(1) + binaryImm.substring(0, binaryImm.length - 1)
        binaryImm = binaryImm.charAt(0) + binaryImm.substring(10, 20) + binaryImm.charAt(9) + binaryImm.substring(1, 9)        // const register2 = determineRegister(rs2)
        const registerDestination = determineRegister(rd)
        const opcode = "1101111"
        let hexString = (parseInt(binaryImm + registerDestination + opcode, 2)).toString(16)
        hexString = hexString.length === 8 ? hexString : ("0".repeat(8 - hexString.length) + hexString)
        return hexString
    }

    const determineF7 = (inst) => {
        switch (inst.toLowerCase()) {
            case "add": case "sll": case "slt": case "sltu": case "xor": case "srl": case "or": case "and": case "slli": case "srli": return "0000000"
            case "sra": case "sub": case "srai": return "0100000"
        }
    }

    const determineF3 = (inst) => {
        switch (inst.toLowerCase()) {
            case "beq": case "jalr": case "lb": case "addi": case "sb": case "add": case "sub": case "mul": return "000"
            case "bne": case "lh": case "sh": case "sll": case "slli": case "mulh": return "001"
            case "lw": case "slti": case "sw": case "slt": case "mulhsu": return "010"
            case "sltiu": case "sltu": case "mulhu": return "011"
            case "blt": case "lbu": case "xori": case "xor": case "div": return "100"
            case "bge": case "lhu": case "srl": case "srli": case "sra": case "srai": case "divu": return "101"
            case "bltu": case "ori": case "or": case "rem": return "110"
            case "bgeu": case "andi": case "and": case "remu": return "111"
        }
    }

    const determineRegister = (reg) => {
        switch (reg) {
            case "x0": case "zero": return "00000"
            case "x1": case "ra": return "00001"
            case "x2": case "sp": return "00010"
            case "x3": case "gp": return "00011"
            case "x4": case "tp": return "00100"
            case "x5": case "t0": return "00101"
            case "x6": case "t1": return "00110"
            case "x7": case "t2": return "00111"
            case "x8": case "s0": case "fp": return "01000"
            case "x9": case "s1": return "01001"
            case "x10": case "a0": return "01010"
            case "x11": case "a1": return "01011"
            case "x12": case "a2": return "01100"
            case "x13": case "a3": return "01101"
            case "x14": case "a4": return "01110"
            case "x15": case "a5": return "01111"
            case "x16": case "a6": return "10000"
            case "x17": case "a7": return "10001"
            case "x18": case "s2": return "10010"
            case "x19": case "s3": return "10011"
            case "x20": case "s4": return "10100"
            case "x21": case "s5": return "10101"
            case "x22": case "s6": return "10110"
            case "x23": case "s7": return "10111"
            case "x24": case "s8": return "11000"
            case "x25": case "s9": return "11001"
            case "x26": case "s10": return "11010"
            case "x27": case "s11": return "11011"
            case "x28": case "t3": return "11100"
            case "x29": case "t4": return "11101"
            case "x30": case "t5": return "11110"
            case "x31": case "t6": return "11111"
        }
    }

    const determineOpcode = (inst) => {
        switch (inst.toLowerCase()) {
            case "lui": return "0110111"
            case "auipc": return "0010111"
            case "jalr": return "1100111"
            case "lb": case "lh": case "lw": case "lbu": case "lhu": return "0000011"
            case "addi": case "slti": case "sltiu": case "xori": case "ori": case "andi": return "0010011"
            case "slli": case "srli": case "srai": return "0010011"
        }
    }

    return { iTypeMachineCode, iTypShifteMachineCode, rTypeMachineCode, bTypeMachineCode, uTypeMachineCode, jTypeMachineCode, sTypeMachineCode }
}

