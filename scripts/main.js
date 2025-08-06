window.onload = function() {
    const canvas = document.getElementById("myCanvas");

    canvas.width = 0.6 * window.innerWidth;
    canvas.height = canvas.width * 2/3;
    const ctx = canvas.getContext("2d");
    
    // Title text
    let titleFontSize = canvas.width * 0.17;
    ctx.font = "bold " + titleFontSize + "px Arial Black";
    ctx.fillStyle = "#2F2219";
    let titleText = "BREAKOUT";
    let titleWidth = ctx.measureText(titleText).width;
    let titleX = (canvas.width - titleWidth) / 2;
    let titleY = canvas.height * 0.42;
    ctx.fillText(titleText, titleX, titleY);


    let title2FontSize = titleFontSize * .5;
    ctx.font = "bold " + title2FontSize + "px Arial Black";
    let title2Text = "War Chapters";
    let title2Width = ctx.measureText(title2Text).width;
    let title2X = (canvas.width - title2Width) / 2;
    let title2Y = canvas.height * 0.2;
    ctx.fillText(title2Text, title2X, title2Y);
    
    // Button dimensions and positions
    const buttonWidth = canvas.width * 0.3;
    const buttonHeight = canvas.height * 0.10;
    const buttonFontSize = canvas.width * 0.04;
    const buttonSpacing = buttonHeight * 1.5;
    const startY = canvas.height * 0.5;
    
    // Function to create a button
    function drawButton(text, x, y, width, height) {
        // Button background
        ctx.fillStyle = "#2F2219";
        ctx.fillRect(x, y, width, height);
        
        // Button border
        ctx.strokeStyle = "#CCA27A";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text
        ctx.font = buttonFontSize + "px Arial";
        ctx.fillStyle = "#CCA27A";
        let textWidth = ctx.measureText(text).width;
        let textX = x + (width - textWidth) / 2;
        let textY = y + height * 0.65;
        ctx.fillText(text, textX, textY);
        
        // Return the button area for click detection
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            text: text
        };
    }
    
    // Create buttons
    const singlePlayerButton = drawButton(
        "Single Player", 
        (canvas.width - buttonWidth) / 2, 
        startY, 
        buttonWidth, 
        buttonHeight
    );
    
    const twoPlayerButton = drawButton(
        "Two Players", 
        (canvas.width - buttonWidth) / 2, 
        startY + buttonSpacing, 
        buttonWidth, 
        buttonHeight
    );
    
    // Add click event listener
    canvas.addEventListener("click", function(event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Check if single player button was clicked
        if (clickX >= singlePlayerButton.x && 
            clickX <= singlePlayerButton.x + singlePlayerButton.width &&
            clickY >= singlePlayerButton.y && 
            clickY <= singlePlayerButton.y + singlePlayerButton.height) {
            console.log("Single Player mode selected");
            window.location.href = "singlePlayer.html";
        }
        
        // Check if two player button was clicked
        if (clickX >= twoPlayerButton.x && 
            clickX <= twoPlayerButton.x + twoPlayerButton.width &&
            clickY >= twoPlayerButton.y && 
            clickY <= twoPlayerButton.y + twoPlayerButton.height) {
            console.log("Two Player mode selected");
            
            window.location.href = "twoPlayerCharacterSelect.html";
        }
    });
};