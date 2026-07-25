const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let currentInput = "";
let lastResult = "";

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;

        if (!value) return;

        if (value === "C"){
            currentInput = " ";
            display.value = 0;
            return;
        }

        if (value === "|"){
            currentInput = currentInput.slice(0,-1);
            display.value = currentInput || 0;
            retunr;
        }

        if (value === "="){
            try{
                lastResult = eval(currentInput);
                display.value = lastResult;
                currentInput = lastResult.toString();
            }catch {
                display.value = "ERROR"
                currentInput = " "
            }
            return;
        }
        currentInput += value;
        display.value = currentInput;
    });
});