# Orbit ![alt text](https://raw.githubusercontent.com/aidan-d123/orbit/main/public/favicons/favicon.ico "Orbit Logo")


[Orbit](https://orbit.adempsey.me/) is a RISC-V assembly language editor and simulator. It supports the following: 


### Instructions
`add` `sub` `sll` `slt` `sltu` `xor` `srl` `sra` `or` `and` `srli` `slli` `srai` `sb` `sh` `sw` `addi` `slti` `sltiu` `xori` `ori` `andi` `lb` `lh` `lw` `lbu` `lhu` `jalr` `beq` `bne` `blt` `bge` `bltu` `bgeu` `jal` `auipc` `lui` `beqz` `bgez` `bgt` `bgtu` `bgtz` `ble` `bleu` `blez` `bltz` `bnez` `j` `jr` `la` `li` `mv` `neg` `nop` `ret` `not` `seqz` `sgtz` `sltz` `snez`

### Directives 
`.data` `.text` `.asciz` `.word` `.byte`

### Enviroment Calls
The environmental calls are compatible with [Venus' ecalls](https://github.com/kvakil/venus/wiki/Environmental-Calls).
| ID (`a0`)       | Name           | Description  |
| ------------- |:-------------:| -----:|
| 1      | print_int |	prints integer in `a1` |
| 4      | print_string	| prints the null-terminated string whose address is in `a1` |
| 9 | sbrk	| allocates `a1` bytes on the heap, returns pointer to start in `a0` |
| 10      | exit |	ends the program  |
| 11      | print_character |	prints ASCII character in `a1` |
| 17 |  exit2 |	ends the program with return code in `a1` |


### Editor

The editor provides syntax highlighting, auto bracket complete, several dark themes, and code linting. 
### Simulator
The simulator allows you to step through each instruction, showing you the machine and assembly code. You can view how registers and memory change as you step through instructions. There is a console to show error messages and to dump machine code.

### Profile

You can create an account to save your files

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/aidan-d123/orbit/blob/main/LICENSE) file for details.