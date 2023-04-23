export const useRegex = () => {

    // The following code is modified from 
    // https://github.com/kvakil/venus/blob/master/src/main/frontend/js/risc-mode.js

    // creates regex expressions for list of words
    const regexFromWords = (words, ins) => {
        let regexpression = new RegExp("^(?:" + words.join("|") + ")$", ins);
        return regexpression
    }

    // regex expression for riscv instructions
    let instructions = regexFromWords([
        "add", "sub", "sll", "slt", "sltu", "xor", "srl", "sra", "or", "and", "srli", "slli", "srai", "sb", "sh", "sw",
        "addi", "slti", "sltiu", "xori", "ori", "andi", "lb", "lh", "lw", "lbu", "lhu", "jalr", "beq", "bne", "blt",
        "bge", "bltu", "bgeu", "jal", "auipc", "lui", /*pseduos*/ "beqz", "bgez", "bgt", "bgtu", "bgtz", "ble", "bleu",
        "blez", "bltz", "bnez", "j", "jr", "la", "li", "mv", "neg", "nop", "ret", "not", "seqz", "sgtz", "sltz", "snez",
        "fence"
    ], "i");

    // regex expression for fake instructions used in assembly
    let fakeLoadInstructions = regexFromWords([
        "la1", "la2", "lb1", "lw1", "lbu1", "lh1", "lhu1", "lb2", "lw2", "lbu2", "lh2", "lhu2"
    ], "i");

    // regex for each assembly syntax
    let rType = regexFromWords(["add", "sub", "sll", "slt", "sltu", "xor", "srl", "sra", "or", "and"], "i");     //inst rd rs1 rs2
    let iTypeShift = regexFromWords(["srli", "slli", "srai"], "i");                                              // inst rd rs1 shamt
    let sType = regexFromWords(["sb", "sh", "sw"], "i");                                                         // inst rd imm(rs1)
    let iType = regexFromWords(["addi", "slti", "sltiu", "xori", "ori", "andi"], "i");                           // inst rd rs1 imm
    let iTypeMem = regexFromWords(["lb", "lh", "lw", "lbu", "lhu", "jalr"], "i");                                // inst rd imm(rs1)
    let bType = regexFromWords(["beq", "bne", "blt", "bge", "bltu", "bgeu"], "i");                               // inst rd rs1 label
    let jType = regexFromWords(["jal"], "i");                                                                    // inst rd imm
    let uType = regexFromWords(["lui", "auipc"], "i");                                                           // inst rd imm

    // regex expression for registers
    let registers = regexFromWords([
        "x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8", "x9", "x10", "x11", "x12", "x13", "x14", "x15", "x16",
        "x17", "x18", "x19", "x20", "x21", "x22", "x23", "x24", "x25", "x26", "x27", "x28", "x29", "x30", "x31", "zero",
        "ra", "sp", "gp", "tp", "t0", "t1", "t2", "s0", "s1", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "s2", "s3",
        "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6"
    ], "");

    // regex expressions for directives
    let keywords = regexFromWords([
        ".data", ".text", ".globl", ".float", ".double",
        ".asciz", ".ascii", ".string", ".word", ".byte", ".equ"
    ], "i");

    return { instructions, fakeLoadInstructions, registers, keywords, rType, iTypeShift, sType, iType, iTypeMem, bType, jType, uType }

}