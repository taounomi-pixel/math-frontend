const fs = require('fs');

const code = fs.readFileSync('src/components/Header.jsx', 'utf8');

try {
    // We wrap it in an async function to allow 'await' if any
    new Function('async () => {' + code + '}');
    console.log("Syntax is VALID via Function constructor.");
} catch (e) {
    console.log("Syntax ERROR found:");
    console.log(e.message);
    
    // Try to find the line by splitting and validating chunks if possible, 
    // but the error message should have a hint.
}
