interface state {
    init: boolean;
    final: boolean;
    transitions: Map<string, state>;
}

/////////////////////////////////////////////////////

function addWordToAutomaton(word: string, state: state, index: number): void {
    if (index === word.length) {
        state.final = true;
        return;
    }
    const nextChar = word[index];
    if (!state.transitions.has(nextChar)) {
        state.transitions.set(nextChar, { init: false, final: false, transitions: new Map() });
    }
    addWordToAutomaton(word, state.transitions.get(nextChar)!, index + 1);
}

function isWordRecognized(word: string, state: state, index: number): boolean {
    if (index === word.length) {
        return state.final;
    }
    const nextChar = word[index];
    if (!state.transitions.has(nextChar)) {
        return false;
    }
    return isWordRecognized(word, state.transitions.get(nextChar)!, index + 1);
}

