export const useMemorySegments = () => {
    const TEXT_BEGIN = 0x0000_0000
    const DATA_BEGIN = 0x1000_0000
    const HEAP_BEGIN = 0x1000_0800
    const STACK_BEGIN = 0x7fff_fff0


    return { TEXT_BEGIN, DATA_BEGIN, HEAP_BEGIN, STACK_BEGIN }
}