<script setup lang="ts">
let userResult: number;
let result: number;

interface gameNumbers {
  n: number;
  used: boolean;
}

let setNumber: Array<gameNumbers> = [];

enum operation {'+', '*', '-', '/'}

interface calcul {
  x: number;
  y: number;
  op: operation;
  res: number;
}

let userTries: Array<calcul>;

function isNumberinSet(n: number, numberSet: Array<gameNumbers>): boolean {
    return numberSet.some(num => num.n === n);
}

function validOperation(x: number, y: number, op: operation, numberSet: Array<gameNumbers>)
{
    if (!isNumberinSet(x, numberSet) || !isNumberinSet(y, numberSet)) {
        return false;
    }

    switch (op) {
        case '+':
            return true;
        case '-':
            return x >= y;
        case '*':
            return true;
        case '/':
            return x % y === 0 && y !== 0;
        default:
            return false;
    }
}

function generateRandomNumberSet(size: number): Array<gameNumbers> {
    const numbers: Array<gameNumbers> = [];
    for (let i = 0; i < size; i++) {
        numbers.push({ n: Math.floor(Math.random() * 100) + 1, used: false });
    }
    return numbers;
}

function approxSolution(numberSet: Array<gameNumbers>, attendedResult: number) : result
{
    
}
</script>

<template>
    <div id="chiffre">

    </div>
</template>