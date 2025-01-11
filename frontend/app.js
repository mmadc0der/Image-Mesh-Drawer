document.getElementById('imageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('imageCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            console.log("Image uploaded and drawn on canvas.");
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
});

// Handle paste event
document.addEventListener('paste', function(event) {
    console.log("Paste event triggered.");
    const items = event.clipboardData.items;
    let imageFound = false; // Flag to check if an image is found

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`Item ${i}: type = ${item.type}`);
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.getElementById('imageCanvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    console.log("Image pasted and drawn on canvas.");
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
            imageFound = true; // Set flag to true if an image is found
        }
    }

    if (!imageFound) {
        console.log("No image found in clipboard.");
    } else {
        console.log("Image pasted successfully.");
    }
});

document.getElementById('loadClipboardButton').addEventListener('click', async function () {
    console.log("Load from Clipboard button clicked.");
    
    if (!navigator.clipboard || !navigator.clipboard.read) {
        console.error("Clipboard API is not supported in this browser or context.");
        return;
    }
    
    console.log(navigator.clipboard);
    
    try {
        console.log("Reading clipboard contents...");
        const clipboardItems = await navigator.clipboard.read();
        console.log("Clipboard items retrieved:", clipboardItems);

        for (const clipboardItem of clipboardItems) {
            console.log("Clipboard item types:", clipboardItem.types);

            for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                    console.log(`Found image type: ${type}`);
                    
                    const blob = await clipboardItem.getType(type);
                    console.log("Image blob:", blob);

                    const img = new Image();
                    img.onload = function () {
                        const canvas = document.getElementById('imageCanvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        console.log("Image loaded from clipboard and drawn on canvas.");
                    };
                    img.src = URL.createObjectURL(blob);
                    return; // Exit after loading the first image
                } else {
                    console.log(`Skipping unsupported type: ${type}`);
                }
            }
        }
        console.log("No image found in clipboard.");
    } catch (err) {
        console.error('Failed to read clipboard contents:', err);
    }
});


document.getElementById('drawMeshButton').addEventListener('click', function() {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    // Get the selected mesh type
    const meshType = document.getElementById('meshType').value;

    // Get the line color and weight from the inputs
    const lineColor = document.getElementById('lineColor').value;
    const lineWeight = document.getElementById('lineWeight').value;

    // Create a new canvas for the transparent PNG
    const meshCanvas = document.createElement('canvas');
    meshCanvas.width = canvas.width;
    meshCanvas.height = canvas.height;
    const meshCtx = meshCanvas.getContext('2d');

    // Set the stroke style and line width
    meshCtx.strokeStyle = lineColor;
    meshCtx.lineWidth = lineWeight;

    const cellWidth = meshCanvas.width / 3; // Default for 3x3
    const cellHeight = meshCanvas.height / 3; // Default for 3x3

    // Draw the selected mesh type
    switch (meshType) {
        case '3x3':
            for (let i = 1; i < 3; i++) {
                meshCtx.beginPath();
                meshCtx.moveTo(i * cellWidth, 0);
                meshCtx.lineTo(i * cellWidth, meshCanvas.height);
                meshCtx.stroke();
            }
            for (let j = 1; j < 3; j++) {
                meshCtx.beginPath();
                meshCtx.moveTo(0, j * cellHeight);
                meshCtx.lineTo(meshCanvas.width, j * cellHeight);
                meshCtx.stroke();
            }
            break;

        case 'diagonal':
            meshCtx.beginPath();
            meshCtx.moveTo(0, 0);
            meshCtx.lineTo(meshCanvas.width, meshCanvas.height);
            meshCtx.stroke();
            meshCtx.beginPath();
            meshCtx.moveTo(meshCanvas.width, 0);
            meshCtx.lineTo(0, meshCanvas.height);
            meshCtx.stroke();
            break;

        case 'golden-ratio':
            const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
            const goldenCellWidth = meshCanvas.width / phi;
            const goldenCellHeight = meshCanvas.height / phi;
            for (let i = 1; i < 3; i++) {
                meshCtx.beginPath();
                meshCtx.moveTo(i * goldenCellWidth, 0);
                meshCtx.lineTo(i * goldenCellWidth, meshCanvas.height);
                meshCtx.stroke();
            }
            for (let j = 1; j < 3; j++) {
                meshCtx.beginPath();
                meshCtx.moveTo(0, j * goldenCellHeight);
                meshCtx.lineTo(meshCanvas.width, j * goldenCellHeight);
                meshCtx.stroke();
            }
            break;

        case 'fibonacci':
            const fib = [0, 1];
            for (let i = 2; i < 10; i++) {
                fib[i] = fib[i - 1] + fib[i - 2];
            }

            let x = 0;
            let y = 0;

            for (let i = 1; i < fib.length; i++) {
                const width = fib[i] * 10;
                const height = fib[i - 1] * 10;

                meshCtx.strokeRect(x, y, width, height);

                x += width;
                y += height;
            }

            for (let i = 0; i <= meshCanvas.width; i += 10) {
                meshCtx.beginPath();
                meshCtx.moveTo(i, 0);
                meshCtx.lineTo(i, meshCanvas.height);
                meshCtx.stroke();
            }

            for (let j = 0; j <= meshCanvas.height; j += 10) {
                meshCtx.beginPath();
                meshCtx.moveTo(0, j);
                meshCtx.lineTo(meshCanvas.width, j);
                meshCtx.stroke();
            }
    }

    // Convert the canvas to a PNG and prompt for download
    const pngUrl = meshCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'mesh.png'; // Default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});