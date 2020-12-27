/* p5.js script to generate random avatar-identicon */

var buttonGenerate = document.getElementById('buttonGenerate');
buttonGenerate.addEventListener("click", generate);
var buttonDownload = document.getElementById('buttonDownload');
buttonDownload.addEventListener("click", download);
var textInput = document.getElementById('textInput');
//textInput.addEventListener("keypress", generateFromInput);
textInput.addEventListener("input", generateFromInput);

const PRECISION = 20; // values below PRECISION are cutted
const LINE_COLOR = "#736EFE";
const FILL_COLOR = "#FFFFFF00";

var hash;

var grid;

var canvas
function setup() {
    //generate image here
    canvas = createCanvas(256, 256);
    // Move the canvas so it’s inside our <div id="sketch-holder">.
    canvas.parent('sketch-holder');

    grid = new CGrid(8, 8); // 8 x 8 because md5 hash length is 32
                            // so display 32 cells on the left and
                            // 32 cells on the right
                            // sqrt(64) = 8
    
    background(0, 0);

    generate();
}

function draw() {
}


function generate() {
    clear(); // reset canvas

    var randomNumber = Math.random();
    hash = calcMD5(randomNumber.toString());

    grid.update_cells_creative(hash);
    grid.show_horizontal_symmetry();
}


function generateFromInput() {
    clear();
    
    hash = calcMD5(textInput.value);

    grid.update_cells_creative(hash);
    grid.show_horizontal_symmetry();
}


function download() {
    save(canvas, 'identitar.png')
}


class CCell {
    // a rectangular cell class with color and size

    constructor(size, color_value) {
        this.size = size;

        if(color_value <= PRECISION) {
            this.color = color(LINE_COLOR);
        }
        else {
            this.color = color(0, 0);
        }
    }

    show(pos) {
        push();
        noStroke();
        fill(this.color);
        rect(pos.x, pos.y, this.size, this.size);
        pop();
    }
}


class CGrid {
    // a grid class to handle cells

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        this.cell_size = canvas.width/rows;
    
        this.cells = [];
    }

    update_cells(hash) {
        this.cells = [];
        
        var hash_index = 0;
        for(let i = 0; i < this.cols/2; i++) {
            var col = [];
            for(let j = 0; j < this.rows; j++) {
                var color_value = get_color_value(hash, hash_index);
                col.push(new CCell(this.cell_size, color_value));
                hash_index += 1;
            }
            this.cells.push(col);
        }
    }

    update_cells_creative(hash) {
        // simmilar to update_cells but tends to produce 
        // some sort of characters - facial faces
        
        this.cells = [];
        for(let i = 0; i < this.cols/2; i++) {
            var col = [];
            for(let j = 0; j < this.rows; j++) {
                var color_value = get_color_value(hash, i * j);
                col.push(new CCell(this.cell_size, color_value));
            }
            this.cells.push(col);
        }
    }

    show_horizontal_symmetry() {
        // show 32 cells on the left side, and display them
        // symmetrically on the right side

        for(let i = 0; i < this.cols/2; i++) {
            for(let j = 0; j < this.rows; j++) {
                var pos = createVector(i * this.cell_size, j * this.cell_size);
                this.cells[i][j].show(pos);
            }
        }

        // symmetry:
        push();
        translate(canvas.width/2, 0);
        for(let i = 1; i <= this.cols/2; i++) {
            for(let j = 0; j < this.rows; j++) {
                var pos = createVector((i -1) * this.cell_size, j * this.cell_size);
                this.cells[this.cols/2 - i][j].show(pos);
            }
        }
        pop();
    }
}


function get_color_value(hash, hash_index) {
    // returns an int value from a character

    var c = hash.charAt(hash_index);
    if (isLetter(c)) {
        c = hash.charCodeAt(hash_index) - 97
    }

    return map(parseInt(c), 0, 26, 0, 255);
}


function isLetter(i) {
    return ((i >= 'a' && i <= 'z') || (i >= 'A' && i <= 'Z'));
}