export class Character {
    constructor(name, rows, columns, frameRate, reverse = false, totalFrames = 0 /* For spritesheets that don't end at the bottom right corner */, frameWidth = 32, frameHeight = 32) {
        this.name = name;
        this.imagePath = "images/" + name + ".png";
        this.reverseImagePath = "images/" + name + "Reversed.png";
        this.rows = rows;
        this.columns = columns;
        this.frameRate = frameRate;
        this.totalFrames = totalFrames || rows * columns;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.image = new Image();
        this.image.src = reverse ? this.reverseImagePath : this.imagePath;

        // Animator internal state
        this.currentFrame = 0;
        this.elapsedTime = 0;

        // Bounding box cache
        this.boundingBoxes = [];
        this.boundingBoxesCalculated = false;
    }

    static buildCharacterByName(name, reverse = false) {
        const characters = {
            "Nephi": {"name": "Nephi", "rows": 4, "columns": 3, "framerate": 10, "totalFrames": 11},
            "Moroni": {"name": "Moroni", "rows": 3, "columns": 3, "framerate": 12, "totalFrames": 9},
            "Teancum": {"name": "Teancum", "rows": 4, "columns": 3, "framerate": 18, "totalFrames": 12},
            "Amalackiah": {"name": "Amalackiah", "rows": 5, "columns": 5, "framerate": 12, "totalFrames": 25}
        }

        if (characters[name]) {
            const { rows, columns, framerate, totalFrames } = characters[name];
            return new Character(name, rows, columns, framerate, reverse, totalFrames);
        }

    }

    // Calculate bounding boxes for all frames and find maximum dimensions
    calculateBoundingBoxes() {
        if (this.boundingBoxesCalculated) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.frameWidth;
        tempCanvas.height = this.frameHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Disable image smoothing for crisp pixel art
        tempCtx.imageSmoothingEnabled = false;

        let maxWidth = 0;
        let maxHeight = 0;

        for (let frame = 0; frame < this.totalFrames; frame++) {
            const frameX = frame % this.columns;
            const frameY = Math.floor(frame / this.columns);

            // Clear and draw the current frame
            tempCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
            tempCtx.drawImage(
                this.image,
                frameX * this.frameWidth,
                frameY * this.frameHeight,
                this.frameWidth,
                this.frameHeight,
                0,
                0,
                this.frameWidth,
                this.frameHeight
            );

            // Get image data and find bounding box
            const imageData = tempCtx.getImageData(0, 0, this.frameWidth, this.frameHeight);
            const data = imageData.data;

            let minX = this.frameWidth;
            let minY = this.frameHeight;
            let maxX = 0;
            let maxY = 0;

            // Scan for opaque pixels
            for (let y = 0; y < this.frameHeight; y++) {
                for (let x = 0; x < this.frameWidth; x++) {
                    const index = (y * this.frameWidth + x) * 4;
                    const alpha = data[index + 3];

                    if (alpha > 0) { // If pixel is not fully transparent
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            // Store bounding box (handle case where no opaque pixels found)
            if (minX <= maxX && minY <= maxY) {
                const width = maxX - minX + 1;
                const height = maxY - minY + 1;
                this.boundingBoxes[frame] = {
                    x: minX,
                    y: minY,
                    width: width,
                    height: height
                };
                // Track maximum dimensions across all frames
                maxWidth = Math.max(maxWidth, width);
                maxHeight = Math.max(maxHeight, height);
            } else {
                // Fallback to full frame if no opaque pixels found
                this.boundingBoxes[frame] = {
                    x: 0,
                    y: 0,
                    width: this.frameWidth,
                    height: this.frameHeight
                };
                maxWidth = Math.max(maxWidth, this.frameWidth);
                maxHeight = Math.max(maxHeight, this.frameHeight);
            }
        }

        // Store maximum dimensions for consistent scaling
        this.maxBoundingWidth = maxWidth;
        this.maxBoundingHeight = maxHeight;
        this.boundingBoxesCalculated = true;
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime > 1000 / this.frameRate) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.elapsedTime = 0;
        }
    }

    draw(ctx, x, y, targetHeight) {
        // Calculate bounding boxes if not done yet
        if (!this.boundingBoxesCalculated) {
            this.calculateBoundingBoxes();
        }

        const frameX = this.currentFrame % this.columns;
        const frameY = Math.floor(this.currentFrame / this.columns);

        // Scale based on the maximum bounding box height for consistent sizing
        const scale = targetHeight / this.maxBoundingHeight;

        // Always draw the full frame, but scale it consistently
        // Use the bottom of the frame as the anchor point
        const scaledFrameWidth = this.frameWidth * scale;
        const scaledFrameHeight = this.frameHeight * scale;

        // Position so the bottom of the frame aligns with the y parameter
        const drawX = x - scaledFrameWidth / 2; // Center horizontally
        const drawY = y - scaledFrameHeight;    // Anchor to bottom

        ctx.drawImage(
            this.image,
            frameX * this.frameWidth,           // Source x (full frame)
            frameY * this.frameHeight,          // Source y (full frame)
            this.frameWidth,                    // Source width (full frame)
            this.frameHeight,                   // Source height (full frame)
            drawX,                              // Destination x
            drawY,                              // Destination y
            scaledFrameWidth,                   // Destination width (scaled)
            scaledFrameHeight                   // Destination height (scaled)
        );
    }
}