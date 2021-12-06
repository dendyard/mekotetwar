const mapWidth = 300
const mapHeight = 600
const numberOfRows = 20
const numberOfCols = 10
const cellSize = mapWidth / numberOfCols
const borderSize = 0


const zType = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
]

const xType = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 1, 0],
]

const sType = [
  [0, 2, 2],
  [2, 2, 0],
  [0, 0, 0],
]

const iType = [
  [0, 3, 0, 0],
  [0, 3, 0, 0],
  [0, 3, 0, 0],
  [0, 3, 0, 0],
]

const lType = [
  [4, 0, 0],
  [4, 0, 0],
  [4, 4, 0],
]

const jType = [
  [0, 0, 5],
  [0, 0, 5],
  [0, 5, 5],
]

const oType = [
  [6, 6],
  [6, 6],
]

const tType = [
  [0, 7, 0],
  [7, 7, 7],
  [0, 0, 0],
]


const blockColors = [
  '#ffff66',
  '#ff3399',
  '#ff00cc',
  '#33ffcc',
  '#66ccff',
  '#66ff66',
  '#ff0000',
]

const blockTypes = {
    zType,
    sType,
    iType,
    lType,
    jType,
    oType,
    tType,
    xType,
}

class Block {
    constructor(cells, x, y) {
        this.cells = cells
        this.position = {
            x,
            y
        }
        this.isAlive = true
    }

    rotate() {
        const newCells = []
        for (let i = 0; i < this.cells.length; i++) {
            newCells[i] = []
            for (let j = 0; j < this.cells.length; j++) {
                newCells[i][j] = this.cells[this.cells.length - 1 - j][i]
            }
        }
        this.cells = newCells
    }

    moveBlockByEvent(e) {
        switch (e.key) {
            case 'ArrowLeft': {
                this.position.x--;
                break
            }
            case 'ArrowRight': {
                this.position.x++
                break
            }
            case 'ArrowDown': {
                this.position.y++
                break
            }
            case 'ArrowUp': {
                this.rotate()
                rotate.currentTime = 0;
                rotate.play();
                rotate.volume = 1;
                break
            }
        }
    }

    findCollison(field) {
        const {
            x,
            y
        } = this.position
        this.cells.forEach((rows, i) => {
            rows.forEach((cell, j) => {
                if (cell && ((y + i >= numberOfRows) || field[y + i][x + j])) {

                    this.isAlive = false
                    return
                }
            })
        })
    }
}

Block.timeToChange = 500

const canMoveLeft = (block, field) => {
    const {
        cells,
        position
    } = block
    const {
        x,
        y
    } = position
    return !cells.some((rows, i) => {
        return rows.some((cell, j) => {
            if (
                (cell && x + j < 0) ||
                (cell && x + j >= numberOfCols) ||
                (cell && field[y + i][x + j])
            ) return true
        })
    })
    return true
}

const updateScore = (score) => {
    const scoreElem = document.getElementById('score')
    scoreElem.innerHTML = score
}

const drawField = (field, ctx) => {
    field.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
            ctx.fillStyle = cell ? blockColors[cell - 1] : '#1b1b1b'

            ctx.strokeStyle = '#1b1b1b'
            ctx.lineWidth = borderSize
            
            const args = [
                columnIndex * cellSize, rowIndex * cellSize,
                cellSize, cellSize,
              ]

            ctx.fillRect(...args)
            ctx.strokeRect(...args)

        })
    })
    
}

const {
    requestAnimationFrame
} = window
const fps = 24
const timeToMoveDown = 500

let counterOfF = 0
let prevTime = 0
let level = 1
let prevPosition = {
    x: 0,
    y: 0
}

var releasekraken = 1;

let prevBlockCells = [[]]

const render = (game, block, time) => {
    if (!block) {
        const arrOfTypes = Object.values(blockTypes)
        const blockType = arrOfTypes[(arrOfTypes.length-releasekraken) * Math.random() | 0]
        const x = ((numberOfCols - blockType.length) / 2) | 0
        block = new Block(blockType, x, 0)
        prevPosition = {
            x,
            y: 0
        }
        
        releasekraken = (score > 18000 ?  0 :  1);
        
        addEventListener('keydown', (e) => block.moveBlockByEvent.bind(block)(e))
    }

    const {
        ctx,
        field
    } = game
    const {
        position
    } = block

    if (time - prevTime > 1000 / fps) {
        counterOfF++
        if (counterOfF === (fps * timeToMoveDown) / 1000) {
            counterOfF = 0
            if (block && block.isAlive) {
                position.y++
            } else {
                block = null
            }
        }

        prevTime = time

        insertIntoArray(prevBlockCells, field, prevPosition.y, prevPosition.x, true)

        const canMove = canMoveLeft(block, field)

        if (!canMove) {
            position.x = prevPosition.x
            block.cells = prevBlockCells
        }

        if (position.y > prevPosition.y) {
            position.y = prevPosition.y + 1
        }

        block.findCollison(field)
        if (block.isAlive) {
            insertIntoArray(block.cells, field, position.y, position.x)
            drawField(field, ctx)
            prevPosition = Object.assign({}, position)
            prevBlockCells = [].concat(block.cells)

        } else if (prevPosition.y > block.cells.length - 1) {
            
            insertIntoArray(block.cells, field, prevPosition.y, prevPosition.x)
            game.field = findFilledRow(field, block)
            
            drawField(game.field, ctx)
            block = null

        } else {
            insertIntoArray(prevBlockCells, field, prevPosition.y, prevPosition.x)
            const lastBlock = block.cells.filter((row) => !row.every((cell) => !cell)).slice(-prevPosition.y)

            insertIntoArray(lastBlock, field, 0, position.x)
            drawField(game.field, ctx)
            setTimeout(() => {
                //console.log('Game Over Guys')
            }, 0)
            gameover = true;
            game.field = generateField(numberOfRows + 4, numberOfCols)
            updateScore(0)
            block = null

        }
    }
    if (!gameover) {
        requestAnimationFrame((time) => render(game, block, time))
    } else {
        cancelAnimationFrame((time) => render(game, block, time));
        if (isItWin) {
            winner_all();
        }else{
            gameover_all();    
        }
        
    }

}

const insertIntoArray = (childArr, parrentArr, row, col, clearMode) => {
    let i = 0

    while (i < childArr.length) {
        let j = 0
        while (j < childArr[i].length) {
            parrentArr[row + i][col + j] = !clearMode ?
                childArr[i][j] ?
                childArr[i][j] :
                parrentArr[row + i][col + j] :
                childArr[i][j] ?
                0 :
                parrentArr[row + i][col + j]
            j++
        }
        i++
    }
}

let score = 0
let coronce = 0
let gameover = false;
let isItWin = false;
let cordiff = 10;
let win = false;


const findFilledRow = (field, block) => {
    const filteredField = field.filter((row) => row.some((cell) => (cell === 0)))
    const diff = field.length - filteredField.length
    
    var chk;
    for (i=0; i<= 19; i++){

        chk = field[i].filter(isemp => isemp === 0);
        
        if (chk.length == 0) {
            score += (diff * 50) * (diff + 25)
            
            updateScore(score)
            kaboom.currentTime = 0;
            kaboom.play();
            explodeboard(diff);
            
            enemycont[i][0] = 8;

        }
    }
    
    const filledArr = generateField(diff, numberOfCols)
    return [...filledArr, ...filteredField]

}


function winthegame() {
    gameover = true;
    win = true;
    console.log('You win');
}

const generateField = (rows, cols) => {

    const field = Array.from({
            length: rows
        },
        () => Array.from({
            length: cols
        }, () => 0))
    return field


}

window.onload = () => {

    const canvas = document.getElementById('map')
    const ctx = canvas.getContext('2d')
    
    
    const game = {
        ctx,
        field: generateField(numberOfRows + 4, numberOfCols),
    }
    
    mulai.addEventListener('click', function(){
        howto.style.display = 'none';
        mulai.style.display = 'none';
        initenemycont();
        render(game);
    });
    
    strbtn.addEventListener('click', function() {
        
        dhuar.style.zIndex = 20;
        meko.style.zIndex = 21;
        
        cover.style.opacity = 0;
        strbtn.style.display = 'none';
        
        partyrussia.play();
        partyrussia.volume = 1;
        rotate.volume = 0.7;
        logotet.style.display = 'block';
        
        howto.style.display = 'block';
        mulai.style.display = 'block';
        
    })

}


