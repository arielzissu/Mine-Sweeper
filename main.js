'use strict'

var BOMB_IMG = "💣";
var FLAG_IMG = "🚩";
var SMILE1_IMG = "😃";
var SMILE2_IMG = "😅";
var SMILE3_IMG = "😎";
var SMILE4_IMG = "😩";

var gCountLife = 3;
var gElLife = document.querySelector('.lifes').innerText = `Lifes: ${gCountLife}`;
var gCountOpenCell = 0;
var gCountHint = 3;
var gInterval;
var gTimer = 0;
var gCntMines = 0;
var gIsHint = false;
var gFirstClick = true;
var gBoard;
var gElReset = document.querySelector('.reset.special');
gElReset.innerText = '';

var gCell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: true,
};

var gLevel = {
    SIZE: 8,
    MINES: 12,
};

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};


function changeSize(size, numBomb) {
    gLevel.SIZE = size;
    gLevel.MINES = numBomb;
    init();
}

function init() {
    gCountLife = 3;
    gElLife = document.querySelector('.lifes').innerText = `Lifes: ${gCountLife}`;
    gCountOpenCell = 0;
    gCountHint = 3;
    gGame.shownCount = 0;
    document.querySelector('.hint-btn').innerText = `${gCountHint} Hints`;
    clearInterval(gInterval);
    gTimer = 0;
    document.querySelector('.timer').innerText = 'Timer:' + gTimer;
    gFirstClick = true;
    gGame.isOn = true;
    gBoard = buildBoard();
    drawBoard(gBoard);
    gElReset.innerText = SMILE1_IMG;
    console.log(gBoard);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                row: i,
                col: j,
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function placeMines(row, col) {
    for (var k = 0; k < gLevel.MINES; k++) {
        var idxI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var idxJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if (idxI === row && idxJ === col) {
            idxI = getRandomIntInclusive(0, gLevel.SIZE - 1);
            idxJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        }
        gBoard[idxI][idxJ].isMine = true;
    }
    createNumberCell();
}

function drawBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board.length; j++) {
            var tdId = `cell-${i}-${j}`;
            strHtml += `<td id="${tdId}"  class="board" oncontextmenu="cellMarked(this)" onclick="cellClicked(this)"></td>`;
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}


function renderCell(cell, isHint) {
    var elCell = document.querySelector(`#cell-${cell.row}-${cell.col}`);
    var cellFace = '';
    if (cell.isMarked) cellFace = FLAG_IMG;
    if (cell.isShown || isHint) {
        if (!cell.isMine) {
            cellFace = cell.minesAroundCount;
        }
        else {
            cellFace = BOMB_IMG;
        }
    }
    elCell.innerHTML = cellFace;
}

function createNumberCell() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            setMinesNegsCount(i, j, gBoard);
        }
    }
}

function setMinesNegsCount(cellI, cellJ, gBoard) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if ((i < 0) || (i >= gBoard.length)) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if ((j < 0) || (j >= gBoard.length)) continue;
            if ((i === cellI) && (j === cellJ)) continue;
            if (gBoard[i][j].isMine === true) {
                gBoard[cellI][cellJ].minesAroundCount++;
            }
        }
    }
}

function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function hintMode() {
    if (!gFirstClick) {
        if (gCountHint > 0) {
            gIsHint = true;
            gCountHint--;
            document.querySelector('.hint-btn').innerText = `${gCountHint} hint`;
        }
    }
}

function showHint(row, col) {
    if (!gFirstClick) {
        for (var i = row - 1; i <= row + 1; i++) {
            if ((i < 0) || (i >= gBoard.length)) continue;
            for (var j = col - 1; j <= col + 1; j++) {
                if ((j < 0) || (j >= gBoard.length)) continue;
                renderCell(gBoard[i][j], true);
            }
        }
        setTimeout(function () {
            hideHint(row, col)
        }, 1000);
    }
}

function hideHint(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if ((i < 0) || (i >= gBoard.length)) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if ((j < 0) || (j >= gBoard.length)) continue;
            renderCell(gBoard[i][j]);
        }
    }
    gGame.isOn = true;
    gIsHint = false;

}

function cellClicked(elCell) {
    if (!gGame.isOn) return;
    gElReset.innerText = SMILE2_IMG;
    setTimeout(function () {
        gElReset.innerText = SMILE1_IMG;
    }, 150);

    var coord = getCellCoord(elCell.id);
    if (gIsHint) {
        gGame.isOn = false;
        return showHint(coord.i, coord.j);
    }
    var cell = gBoard[coord.i][coord.j];
    gGame.shownCount++;
    if (gFirstClick) {
        placeMines(coord.i, coord.j);
        gTimer = 0;
        gInterval = setInterval(runTimer, 100);
        gFirstClick = false;
    }

    if (cell.isMine) {
        gCountLife--;
        cell.isShown = true;
        elCell.classList.add('marked');
        gElLife = document.querySelector('.lifes').innerText = `Lifes: ${gCountLife}`;
        if (gCountLife < 0) return loseGame();
    }
    if (cell.minesAroundCount === 0) return expandShown(coord.i, coord.j);
    cell.isShown = true;
    cell.isMarked = false;
    renderCell(cell);
}

function runTimer() {
    gTimer += 1;
    document.querySelector('.timer').innerText = 'Timer: ' + gTimer / 10;
}

function cellMarked(elCell) {
    document.addEventListener("contextmenu", function (elCell) {
        elCell.preventDefault();
    }, false);
    if (!gGame.isOn) return;
    var coord = getCellCoord(elCell.id);
    var cell = gBoard[coord.i][coord.j];
    if (cell.isMarked) {
        cell.isMarked = false;
        gGame.markedCount--;
    }
    else {
        cell.isMarked = true;
        gGame.markedCount++;
    }
    renderCell(cell);
    gCntMines++;
    if (gCntMines === gLevel.MINES) yesIsWin();
}

function yesIsWin() {
    gLevel.isOn = false;
    gElReset.innerText = SMILE3_IMG;
    console.log('You win');
    clearInterval(gInterval);
    gTimer = 0;
    document.querySelector('.timer').innerText = 'Timer:' + gTimer;
}

function loseGame() {
    clearInterval(gInterval);
    gTimer = 0;
    document.querySelector('.timer').innerText = 'Timer:' + gTimer;
    gGame.isOn = false;
    gElReset.innerText = SMILE4_IMG;
    console.log('You lose');
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine) {
                cell.isShown = true;
                renderCell(cell);
            }
        }
    }
}

function expandShown(i, j) {
    if (i < 0 || j < 0 || i >= gBoard.length || j >= gBoard.length) return;
    var cell = gBoard[i][j];
    if (cell.isShown || cell.isMine) return;
    cell.isShown = true;
    renderCell(cell);
    if (cell.minesAroundCount !== 0) return;
    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            expandShown(row, col);
        }
    }
}

function changeLight() {
    var elBody = document.body;
    elBody.classList.toggle("dark-mode");
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}