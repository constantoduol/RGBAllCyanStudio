    function Grid() {
        this.grid = [[null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]];
        this.nextList = ["red", "green", "blue"];
        this.direction = { up: 1, down: 2, right: 3, left: 4 }; // 1 = up, 2 = down, 3 = left to right, 4 = right to left
        var width = this.getDim()[0];
        this.cellWidth = (width-70)/4; // border-spacing = 8px * 4, grid border = 5px * 2, body padding = 10px *2 = 70px
        this.cyanTiles = [];
        this.previousTilesLength = 0;
    }

    function Tile(value, row, col, state,meta) {
        this.value = value; // red,green,blue,cyan,magenta,yellow
        this.row = row;
        this.col = col;
        this.state = state; //merged or new
        this.meta = meta; //any more info about the tile
    }
    


     Grid.prototype.init = function () {
        var grid = document.getElementById("grid");
        window.grid.motion = true;
        grid.innerHTML = "";
        var table = document.createElement("table");
        table.setAttribute("id","grid-table");
        table.setAttribute("style","background : rgba(169, 169, 169, 0.6);margin-bottom:0px;");
        for (var x = 0; x < 4; x++) {
            var rowId = "row-" + x;
            var row = document.createElement("tr");
            row.setAttribute("id", rowId);
            for (var y = 0; y < 4; y++) {
                var cellId = "cell-" + x + "-" + y;
                var cell = document.createElement("td");
                cell.setAttribute("class", "cell");
                cell.setAttribute("id", cellId);
                cell.setAttribute("style", "width : " + this.cellWidth + "px;height : "+this.cellWidth+"px;");
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        grid.appendChild(table); 
    };

    Grid.prototype.run = function () {
        var storedGrid = localStorage.getItem("the-grid");
        var currentScore = localStorage.getItem("current-score");
        if(!storedGrid || storedGrid === "null"){
            this.nextTile();
            this.nextTile();
    	}
    	else {
            this.grid = JSON.parse(storedGrid);
            if (currentScore) {
                $("#current-score").html(currentScore);
            }
            for (var y = 0; y < 4; y++) {
                for (var x = 0; x < 4; x++) {
                    var tile = this.grid[x][y];
                    if (tile) {
                        this.actuate(tile.value, tile.row, tile.col, "new");
                        if (tile.value === "cyan") {
                            this.cyanTiles.push(tile);
                        }
                    }
                }
            }
    	}
        new KeyboardInputManager();
    };




    Grid.prototype.addColors = function (color1, color2) {
        if ((color1 === color2 && color1 === "cyan") ) {
            return undefined;
        }
        else if (color1 === color2) {
            return color1;
        }
        else if ((color1 === "red" && color2 === "blue") || (color1 === "blue" && color2 === "red")) {
            return "magenta";
        }
        else if ((color1 === "blue" && color2 === "green") || (color1 === "green" && color2 === "blue")) {
            return "cyan";
        }
        else if ((color1 === "red" && color2 === "green") || (color1 === "green" && color2 === "red")) {
            return "yellow";
        }
        else if ((color1 === "magenta" && color2 === "yellow") || (color1 === "yellow" && color2 === "magenta")) {
            return "red";
        }

        else if ((color1 === "yellow" && color2 === "cyan") || (color1 === "cyan" && color2 === "yellow")) {
            return "green";
        }
        else if ((color1 === "cyan" && color2 === "magenta") || (color1 === "magenta" && color2 === "cyan")) {
            return "blue";
        }

    };

    Grid.prototype.merge = function (arr, dir) {
        if (dir === this.direction.up || dir === this.direction.left) {
            for (var x = 0; x < 4; x++) {
                var next = x === 3 ? 3 : x + 1;
                var nextTile = arr[next];
                var currentTile = arr[x];
                if (nextTile && currentTile && x < 3) {
                    var newValue = this.addColors(currentTile.value, nextTile.value);
                    if (!newValue)
                        continue;
                    //at this point the two tiles currentTile and nextTile were merged
                    var mergedFrom = [currentTile,nextTile];
                    arr[next] = new Tile(newValue, nextTile.row, nextTile.col, "merged",mergedFrom);
                    arr[x] = null;
                    x++;
                    if(newValue === "cyan"){
                       if((this.cyanTiles.length +1) > this.previousTilesLength){
                         var score = Math.floor(Math.pow(( (this.cyanTiles.length + 1) / 2),4)) * 20; 
                         this.addScore(score); 
                         this.previousTilesLength = this.cyanTiles.length + 1;
                       }
                       
                    }
                }
            }
        }
        else {
            for (var x = 3; x >= 0; x--) {
                var next = x === 0 ? 0 : x - 1;
                var nextTile = arr[next];
                var currentTile = arr[x];
                if (nextTile && currentTile && x > 0) {
                    var newValue = this.addColors(currentTile.value, nextTile.value);
                    if (!newValue)
                        continue;
                     //at this point the two tiles currentTile and nextTile were merged
                    var mergedFrom = [currentTile,nextTile];
                    arr[next] = new Tile(newValue, nextTile.row, nextTile.col, "merged",mergedFrom);
                    arr[x] = null;
                    x--;
                    if(newValue === "cyan"){
                       if( (this.cyanTiles.length + 1) > this.previousTilesLength){
                         var score = Math.floor(Math.pow(( (this.cyanTiles.length + 1) / 2),4)) * 20; 
                         this.addScore(score); 
                         this.previousTilesLength = this.cyanTiles.length + 1;
                       }
                       
                    }
                }
            }
        }
    };






    Grid.prototype.move = function (dir) { //the move criteria is percolate, merge, percolate
        var moved = false;
        if (dir === this.direction.left || dir === this.direction.right) {
            for (var x = 0; x < 4; x++) {
                var percolated1 = this.percolate(this.grid[x], dir);
                this.merge(percolated1, dir);
                var percolated = this.percolate(percolated1, dir);
                var similar = this.compare(percolated, this.grid[x]); // if there was any motion, these two won't be the same
                if (similar === false)
                    moved = true;
                this.grid[x] = percolated;
                //console.log(percolated);
                for (var y = 0; y < 4; y++) {
                    //actuate the array i.e set the colors of the tiles
                    var tile = percolated[y];
                    if (tile) {
                        var oldRow = tile.row;
                        var oldCol = tile.col;
                        tile.col = y; // the column has changes since we are moving left or right
                        var translate = {value : tile.value, direction : "left",current_row : tile.row,current_col:tile.col,previous_row : oldRow ,previous_col : oldCol, dx : (tile.col - oldCol)*(this.cellWidth+8)};//plus 8 due to table border-spacing
                        this.actuate(tile.value, tile.row, tile.col, tile.state,translate);
                    }
                }
                
            }
        }
        else {
            for (var y = 0; y < 4; y++) {
                var temp = [];
                for (var x = 0; x < 4; x++) {
                    temp.push(this.grid[x][y]); // e.g grid[0][0]; grid[1][0];  grid[2][0]; grid[3][0];
                }

                var percolated1 = this.percolate(temp, dir);
                this.merge(percolated1, dir);
                var percolated = this.percolate(percolated1, dir);
                var similar = this.compare(percolated, temp); //if there was any motion, these two wont be the same
                if (similar === false)
                    moved = true;
                
                for (var x = 0; x < 4; x++) {
                    var tile = percolated[x];
                    this.grid[x][y] = tile;
                    if (tile) {
                        var oldRow = tile.row;
                        var oldCol = tile.col;
                        tile.row = x; //the tile has been moved to another row so change it
                        var translate = {value: tile.value,direction : "top",current_row : tile.row,current_col:tile.col,previous_row : oldRow ,previous_col : oldCol, dy : (tile.row - oldRow)*(this.cellWidth+8)};//plus 8 due to table border-spacing
                        this.actuate(tile.value, tile.row, tile.col, tile.state,translate); //actuate the array i.e set the colors of the tiles
                    }
                }
            }
        }
      
     
        if (moved) {
            if(localStorage.getItem("sound-on") === "on"){
                //soundManager.play("tile_move"); 
            }
           this.nextTile();
        }
        this.checkWin(moved);
      
    };
    
    Grid.prototype.randomColor = function () {
        return "#" + ((1 << 24) * Math.random() | 0).toString(16);
    };

    
    function animateColor(state,self,row,col,color,translate){
       self.runLater(50,function(){
          if (state === "new") {
            var colorTileId = "colortile-" + row + "-" + col;
            var cellId = "cell-" +row + "-" + col;
            var colorTile = $("<div class='colortile' style='line-height : " + self.cellWidth + "px;top:0px;left:0px;font-size:" + self.cellWidth /2.5 + "px ' id=" + colorTileId + " >");
            colorTile.css("background",color);
            if(self.grid[row][col]){
               $("#"+cellId).html(colorTile); 
            }
            colorTile.addClass("tile-new");
            var label = color.charAt(0).toUpperCase();
            colorTile.html(label);
            self.runLater(500, function () {
                colorTile.removeClass("tile-new");
                if (self.grid[row][col])
                    self.grid[row][col].state = undefined;
                });
               return;
            }
          else if(state === "init"){
             var cellId = "cell-" +row + "-" + col; 
             $("#"+cellId).html("");
         }
       });
      
         
        
       if(translate){
                //we translate the div from its original location, after translating it we destroy it in its original location
                // and recreate it in the new location
           var ctranslateRow = translate.current_row;
           var ctranslateCol = translate.current_col;
           var ptranslateRow = translate.previous_row;
           var ptranslateCol = translate.previous_col;
           var newCellId = "cell-" + ctranslateRow + "-" + ctranslateCol;
           var colorTileId = "colortile-" + ptranslateRow + "-" + ptranslateCol;
           var newColorTileId = "colortile-" + ctranslateRow + "-" + ctranslateCol;
           var tileToTranslate = $("#"+colorTileId);
           if(translate.dx){
               var currentLeft = tileToTranslate[0].style.left;
               currentLeft = parseFloat(currentLeft) + translate.dx;
               tileToTranslate[0].style.left = currentLeft+"px";  
           }
           else {
               var currentTop = tileToTranslate[0].style.top;
               currentTop = parseFloat(currentTop) + translate.dy;
               tileToTranslate[0].style.top = currentTop+"px";  
           }
            var tileMeta = self.grid[ctranslateRow][ctranslateCol].meta;
            self.runLater(50,function(){
                if(translate.dy === 0 || translate.dx === 0){
                    //no motion
                 }// for a tile merge, make the other tile transparent and show the new tile
                 else {
                     if (state === "merged") {
                             var tileOne = $("#"+"colortile-"+tileMeta[0].row+"-"+tileMeta[0].col);
                             var tileTwo = $("#"+"colortile-"+tileMeta[1].row+"-"+tileMeta[1].col);
                             if(!self.grid[tileMeta[0].row][tileMeta[0].col]){
                                 tileOne.css("background","transparent");
                                 tileOne.html(""); // dont overwrite existing tiles
                             }
                             if(!self.grid[tileMeta[1].row][tileMeta[1].col]){
                                 tileTwo.css("background","transparent");
                                 tileTwo.html(""); //dont overwrite existing tiles
                             }
                              
                             var newColorTile = $("<div class='colortile' style='line-height:"+self.cellWidth+"px;top:0px;left:0px;font-size:"+self.cellWidth/2.5+"px' id="+newColorTileId+" >");
                             newColorTile.css("background",translate.value);
                             newColorTile.addClass("tile-merged");
                             newColorTile.html(translate.value.charAt(0).toUpperCase());
                             $("#"+newCellId).html(newColorTile);
                             self.runLater(500, function () {
                                newColorTile.removeClass("tile-merged");
                                if (self.grid[row][col])
                                    self.grid[row][col].state = undefined;
                            });
                        }
                        else { ////this is for normal translates
                         var newColorTile = $("<div class='colortile' style='line-height:" + self.cellWidth + "px;top:0px;left:0px;font-size:" + self.cellWidth /2.5 + "px' id=" + newColorTileId + " >");
                            var color = tileToTranslate[0].style.background; 
                            newColorTile.css("background",color);
                            newColorTile.html(tileToTranslate.html());
                            //if(!self.grid[ptranslateRow][ptranslateCol]){
                               tileToTranslate.css("background","transparent");
                               tileToTranslate.html(""); //dont overwrite an existing tile
                            //}
                            
                           // if(!self.grid[ctranslateRow][ctranslateCol]){
                              $("#"+newCellId).html(newColorTile); // recreate the tile in the new location  
                            //}
                            
                        }
                   
                    }
               });
            }
      }
           
    


    Grid.prototype.actuate = function (color, row, col, tileState,translate) {
        var self = this;
        if(window.requestAnimationFrame){
            window.requestAnimationFrame(function(){
               animateColor(tileState,self,row,col,color,translate); 
            });
        }
        else{
           animateColor(tileState,self,row,col,color,translate); 
        }
    };

    Grid.prototype.checkWin = function (moved) {
        var emptyTiles = [];
        var cyanTiles = [];
        var mergePossible = false;
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {	
                var next = y === 3 ? 3 : y + 1;
                if (this.grid[x][y] && this.grid[x][next] && y < 3) { //0 and 1, 1 and 2,2 and 3 
                    var color = this.addColors(this.grid[x][y].value, this.grid[x][next].value);
                    if( color ){
                        mergePossible = true;
                    }
                }

                if (this.grid[y][x] && this.grid[next][x] && y < 3) {
                    var color = this.addColors(this.grid[y][x].value, this.grid[next][x].value);
                    
                    if (color) {
                        mergePossible = true;
                    }
                }
            	

                if (!this.grid[x][y]) {
                    var emptyTile = {};
                    emptyTile.row = x;
                    emptyTile.col = y;
                    emptyTiles.push(emptyTile);
                }
                else if (this.grid[x][y].value === "cyan") {
                    var cyanTile = {};
                    cyanTile.row = x;
                    cyanTile.col = y;
                    cyanTiles.push(cyanTile);
                }
            }
        }
        this.cyanTiles = cyanTiles;
        
        if (cyanTiles.length === 15) {
            this.showMessage("You Win!");
            localStorage.setItem("the-grid",null);
            return;
        }
        else if (emptyTiles.length === 0 && mergePossible === false) {
            this.showMessage("Game Over!");
            localStorage.setItem("the-grid",null);
            return;
        }
        if (moved) {
           var score = this.cyanTiles.length*this.cyanTiles.length;
           this.addScore(score);
        }
    };
    
    Grid.prototype.addScore = function(score){
        var currentScore = $("#current-score").html();
        var bestScore = $("#best-score").html();
        currentScore = parseInt(currentScore) + parseInt(score);
        $("#current-score").html(currentScore);
        if (currentScore > bestScore) {
            bestScore = parseInt(bestScore) + parseInt(score);
            $("#best-score").html(bestScore);
            $("#current-score").html(bestScore);
        }
        localStorage.setItem("best-score",bestScore);
        localStorage.setItem("current-score",currentScore);
        localStorage.setItem("the-grid",JSON.stringify(this.grid));
    };

    Grid.prototype.clone = function (arr) {
        var temp = [];
        for (var x = 0; x < arr.length; x++) {
            temp[x] = arr[x];
        }
        return temp;
    };

    Grid.prototype.compare = function (arr1, arr2) {
        var similar = true;
        for (var x = 0; x < arr1.length; x++) {
            if (arr1[x] !== arr2[x]) {
                similar = false;
                break;
            }
        }
        return similar;
    };

    Grid.prototype.percolate = function (arr, dir) {
        //percolating down is the same as left to right
        //percolating up is the same as right to left
        var temp = [];
        var len = arr.length;
        var limit = len;
        for (var x = 0; x < limit; x++) {
            if (x < len) {
                var tile = arr[x];
                if (tile)
                    temp.push(tile);
                if (x === (len - 1))
                    limit = limit + (len - temp.length);
            }
            else {
                if (dir === this.direction.up || dir === this.direction.left) {
                    temp.push(null);
                }
                else {
                    temp.unshift(null);
                }
            }
        }
        return temp;
    };



    Grid.prototype.nextTile = function () {
        var nextIndex = Math.floor(Math.random() * this.nextList.length);
        var emptyTiles = [];
        var nextValue = this.nextList[nextIndex];
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                if (!this.grid[x][y]) {
                    var emptyTile = {};
                    emptyTile.row = x;
                    emptyTile.col = y;
                    emptyTiles.push(emptyTile);
                }
            }
        }
         
        if (emptyTiles.length === 0) {
            return;
        }
        var nextLocation = Math.floor(Math.random() * emptyTiles.length);
        var row = emptyTiles[nextLocation].row;
        var col = emptyTiles[nextLocation].col;
        var tile = new Tile(nextValue, row, col, "new");
        this.grid[row][col] = tile;
        this.actuate(tile.value, tile.row, tile.col, tile.state);
        return tile;

    };

    Grid.prototype.runLater = function (limit, func) {
        return setTimeout(func, limit);
    };

  

    Grid.prototype.toString = function () {
        for (var x = 0; x < 4; x++) {
            var val1 = 0, val2 = 0, val3 = 0, val4 = 0;
            if (this.grid[x][0]) {
                val1 = this.grid[x][0].value.charAt(0).toUpperCase();
            }
            if (this.grid[x][1]) {

                val2 = this.grid[x][1].value.charAt(0).toUpperCase();
            }
            if (this.grid[x][2]) {

                val3 = this.grid[x][2].value.charAt(0).toUpperCase();
            }
            if (this.grid[x][3]) {
                val4 = this.grid[x][3].value.charAt(0).toUpperCase();
            }
            console.log(val1 + "	" + val2 + "	" + val3 + "	" + val4);
        }
        console.log("\n");

    };


    Grid.prototype.getDim = function () {
        var body = window.document.body;
        var screenHeight;
        var screenWidth;
        if (window.innerHeight) {
            screenHeight = window.innerHeight;
            screenWidth = window.innerWidth;
        }
        else if (body.parentElement.clientHeight) {
            screenHeight = body.parentElement.clientHeight;
            screenWidth = body.parentElement.clientWidth;
        }
        else if (body && body.clientHeight) {
            screenHeight = body.clientHeight;
            screenWidth = body.clientWidth;
        }
        return [screenWidth, screenHeight];
    };

 

    Grid.prototype.showMessage = function (msg) {
        var height = this.getDim()[1];
        var div = $("<div id='message' style='margin-top : "+0.3*height+"px;font-size : 20px;'></div>");
        var span = $("<span id='win-or-lose' >"+msg+"</span><br><br>");
        var href = $("<a href='#' id='message-link' onclick='restart()' class='message-link'>Play Again</a>");
        
        div.append(span);
        div.append(href);
        var gmsg = $("#game-message");
        gmsg.css("background","rgba(255, 215, 0, 0.5)");
        gmsg.html(div);
        
        gmsg.addClass("message-anim");
        window.grid.motion = false;
        gmsg.css("display","block");
        this.runLater(1000, function () {
            gmsg.removeClass("message-anim");
        });
		
    };
	
    Grid.prototype.menuBuilder = function (menu, autoSaveFunc) {
        var selectIds = [];
        var menuArea = $("#game-message");
        menuArea.css("background","rgba(255, 215, 0, 0.5)");
        menuArea.html("");
        var table = $("<table  style='margin-top:20px;font-family:arial;font-size:14px;border-spacing:20px'>");
        var width = this.getDim()[0];
        for(var x = 0; x < menu.length; x++){
            var subMenu = menu[x];
            var options = subMenu.options;
	        var label = subMenu.label;
	        var preset = subMenu.preset;
	        var tr = $("<tr>");
	        var td1 = $("<td style='margin-right : 20px; padding : 5px; background:lightblue;color:black;border-radius:5px;font-size:14px'>" + label + "</td>");
	        var td2 = $("<td>");
	        var selectId = "select_" + Math.floor(Math.random() * 10000000);
	        selectIds.push(selectId);
	        var select = $("<select id=" + selectId + " style='font-size:14px'>");
	        for (var y = 0; y < options.length; y++) {
	            var option = $("<option value=" + options[y] + ">" + options[y] + "</option>");
	            select.append(option);
	        }
	        select.val(preset);
	        td2.html(select);
	        tr.append(td1);
	        tr.append(td2);
	        table.append(tr);
            
	 }

	    var buttonDiv = $("<div style='margin-top : 20px'>");
	    var ok = $("<input type='button' class='btn btn-primary' value='OK' style='width : " + 0.8 * width + "px;font-size:20px'>");
	    ok.attr("onclick", autoSaveFunc + "(" + JSON.stringify(selectIds) + ")");
	    buttonDiv.append(ok);
	    menuArea.append(table);
	    menuArea.append(buttonDiv);
	    menuArea.addClass("message-anim");
	    menuArea.css("display", "block");
	    this.runLater(1000, function () {
	        menuArea.removeClass("message-anim");
	    });
            
	};
	
        
        Grid.prototype.confirm = function(msg,callback){
            var height = this.getDim()[1];
            var div = $("<div id='message' style='margin-top : "+0.3*height+"px;'></div>");
            var span = $("<span id='win-or-lose' style='font-size : 20px'>" + msg + "</span><br><br>");
            var href = $("<a href='#' class='message-link' style='font-size : 20px'>Yes</a>");
            href[0].addEventListener("click",callback,false);
            var href1 = $("<a href='#' class='message-link' style='margin-left:50px;font-size : 20px;'>No</a>");
            href1.attr("onclick","$('#game-message').css('display','none')");
            div.append(span);
            div.append(href);
            div.append(href1);
            var gmsg = $("#game-message");
            gmsg.css("background","rgba(255, 215, 0, 0.5)");
            gmsg.html(div);
            gmsg.addClass("message-anim");
            gmsg.css("display","block");
            this.runLater(1000, function () {
                gmsg.removeClass("message-anim");
            });
        };
        
       Grid.prototype.showHelp = function(){
         var width = this.getDim()[0];
         var height = this.getDim()[1];
         var area = $("#game-message");  
         area.css("background","white");
         area.html("");
         var help1 = $("<p style='margin:20px;font-size:16px'>The goal of the game is to fill the grid with 15 cyan colored tiles</p>");
         var help1Image = $("<img src='img/win.png' width="+0.8*width+">");
         var help2 = $("<p style='margin:20px;font-size:16px'>Primary colors(Red, Green and Blue) combine to form secondary colors(Yellow, Cyan and Magenta)</p>");
         var help2Image = $("<img src='img/combine1.png' width="+width+" height="+0.8*height+">");
         var help2P =$("<p>Secondary colors combine to give the original primary colors. Cyan colored tiles do not combine</p>");
         var help2PImage = $("<img src='img/combine2.png' width="+width+" height="+0.8*height+">");
         var help3 = $("<p style='margin:20px;font-size:16px'>If you fill the grid with 16 tiles and there are no more possible moves, the game ends</p>");
         var help3Image = $("<img src='img/lose.png' width="+0.8*width+">");
         var help4 = $("<p style='margin:20px;font-size:16px'>Swipe left,right, up and down to navigate through the grid</p>");
         area.append(help1);
         area.append(help1Image);
         area.append(help2);
         area.append(help2Image);
         area.append(help2P);
         area.append(help2PImage);
         area.append(help3);
         area.append(help3Image);
         area.append(help4);
         var buttonDiv = $("<div style='margin-top : 20px'>");
         var ok = $("<input type='button' class='btn btn-primary' value='Back to Game' style='width : "+0.8*width+"px; margin-bottom:20px'>");
         ok.attr("onclick","$('#game-message').css('display','none')");
         buttonDiv.append(ok);
         area.append(buttonDiv);
         area.addClass("message-anim");
         area.css("display","block");
         this.runLater(1000, function () {
             area.removeClass("message-anim");
         });
       };
       
       Grid.prototype.showAbout = function(){
         var width = this.getDim()[0];
         var area = $("#game-message");  
         area.css("background","white");
         area.html("");  
         var about1 = $("<p style='margin:20px;'>RGB All Cyan is brought to you by Quest LTD, Nairobi, Kenya</p>");
         var about2 = $("<p style='margin:20px;'>This game is inpired by Gabriele Cirulli's 2048 and uses sounds from freesounds.org</p>");
         var about1Image = $("<img src='img/logo.png' width="+0.6*width+"px' style='border-radius:10px;'>");
         area.append(about1);
         area.append(about2);
         area.append(about1Image);
         var buttonDiv = $("<div style='margin-top : 20px'>");
         var ok = $("<input type='button' class='btn btn-primary' value='Back to Game' style='width : "+0.8*width+"px'>");
         ok.attr("onclick","$('#game-message').css('display','none')");
         buttonDiv.append(ok);
         area.append(buttonDiv);
         area.addClass("message-anim");
         area.css("display","block");
         this.runLater(1000, function () {
             area.removeClass("message-anim");
         });
       };

	
	

    Grid.prototype.cyanTest = function () {
        var time = setInterval(function () {
            if (false) {
                clearInterval(time);
            }
            else {
                var nextMove = Math.floor(Math.random() * 4) + 1;
                this.grid.move(nextMove);
            }
        }, 400);
    };
    
	


