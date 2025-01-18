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

    // Get flip states
    const flipHorizontal = document.getElementById('flipHorizontal').checked;
    const flipVertical = document.getElementById('flipVertical').checked;

    // Apply transformations for flipping if needed
    if (flipHorizontal || flipVertical) {
        meshCtx.save();
        meshCtx.translate(
            flipHorizontal ? meshCanvas.width : 0,
            flipVertical ? meshCanvas.height : 0
        );
        meshCtx.scale(
            flipHorizontal ? -1 : 1,
            flipVertical ? -1 : 1
        );
    }

    const cellWidth = meshCanvas.width / 3; // Default for 3x3
    const cellHeight = meshCanvas.height / 3; // Default for 3x3

    // Draw the selected mesh type
    switch (meshType) {
        case '3x3':
            // Оставляем как есть, так как реализация корректна
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

        case 'triangle':
            // Находим ключевые точки
            const topMiddle = { x: meshCanvas.width / 2, y: 0 };
            const bottomMiddle = { x: meshCanvas.width / 2, y: meshCanvas.height };
            const leftMiddle = { x: 0, y: meshCanvas.height / 2 };
            const rightMiddle = { x: meshCanvas.width, y: meshCanvas.height / 2 };
            const topLeft = { x: 0, y: 0 };
            const topRight = { x: meshCanvas.width, y: 0 };
            const bottomLeft = { x: 0, y: meshCanvas.height };
            const bottomRight = { x: meshCanvas.width, y: meshCanvas.height };

            // Функция для рисования линии между двумя точками
            const drawLine = (point1, point2) => {
                meshCtx.beginPath();
                meshCtx.moveTo(point1.x, point1.y);
                meshCtx.lineTo(point2.x, point2.y);
                meshCtx.stroke();
            };

            // Рисуем горизонтальную и вертикальную линии посередине
            drawLine(topMiddle, bottomMiddle);
            drawLine(leftMiddle, rightMiddle);

            // Рисуем полные диагонали из угла в угол
            drawLine(topLeft, bottomRight);
            drawLine(topRight, bottomLeft);

            // Рисуем линии из углов к центрам противоположных сторон
            drawLine(topLeft, rightMiddle);
            drawLine(topLeft, bottomMiddle);
            
            drawLine(topRight, leftMiddle);
            drawLine(topRight, bottomMiddle);
            
            drawLine(bottomLeft, rightMiddle);
            drawLine(bottomLeft, topMiddle);
            
            drawLine(bottomRight, leftMiddle);
            drawLine(bottomRight, topMiddle);

            // Рисуем ромб, соединяя точки на серединах сторон
            drawLine(topMiddle, rightMiddle);
            drawLine(rightMiddle, bottomMiddle);
            drawLine(bottomMiddle, leftMiddle);
            drawLine(leftMiddle, topMiddle);
            break;

        case 'golden-ratio':
            // Правильная спираль золотого сечения из дуг окружностей
            const phi = (1 + Math.sqrt(5)) / 2;
            
            // Вычисляем размеры рабочей области с правильным соотношением сторон
            const vertical = meshCanvas.height > meshCanvas.width;
            const workingWidth = vertical ? meshCanvas.height / phi : meshCanvas.width;
            const workingHeight = vertical ? meshCanvas.height : meshCanvas.width / phi;
            const offset = vertical ? (meshCanvas.width - workingWidth) / 2 : (meshCanvas.height - workingHeight) / 2;
            
            // Начинаем с самого большого квадрата
            let size = vertical ? workingWidth : workingHeight; // Размер первого квадрата
            
            // Начальная позиция
            let x = vertical ? offset : 0;
            let y = vertical ? 0 : offset;
            
            // Рисуем квадраты и дуги
            for (let i = 0; i < 12; i++) {
                if (vertical) {
                    // Для вертикального холста рисуем повернутый квадрат
                    meshCtx.beginPath();
                    meshCtx.rect(x, y, size, size);
                    meshCtx.stroke();
                    
                    // Следующий размер
                    const nextSize = size / phi;
                    
                    // Рисуем дугу с повернутой логикой - просто меняем x и y местами из горизонтального кода
                    meshCtx.beginPath();
                    switch (i % 4) {
                        case 0: // Top-left corner (было x + size, y + size)
                            meshCtx.arc(x + size, y + size, size, Math.PI * 1, Math.PI * 1.5);
                            y = y + size; // Move down (было x = x + size)
                            break;
                        case 1: // Top-right corner (было x, y + size)
                            meshCtx.arc(x + size, y, size, Math.PI * 0.5, Math.PI * 1);
                            x = x + size; // Move right (было y = y + size)
                            y += size - nextSize; // Move down and adjust (было x += size - nextSize)
                            break;
                        case 2: // Bottom-right corner (было x, y)
                            meshCtx.arc(x, y, size, 0, Math.PI * 0.5);
                            y = y - nextSize; // Move up (было x = x - nextSize)
                            x += size - nextSize; // Move right and adjust (было y += size - nextSize)
                            break;
                        case 3: // Bottom-left corner (было x + size, y)
                            meshCtx.arc(x, y + size, size, Math.PI * 1.5, Math.PI * 2);
                            x = x - nextSize; // Move left (было y = y - nextSize)
                            break;
                    }
                    meshCtx.stroke();
                } else {
                    // Оригинальная логика для горизонтального холста
                    meshCtx.beginPath();
                    meshCtx.rect(x, y, size, size);
                    meshCtx.stroke();
                    
                    // Следующий размер
                    const nextSize = size / phi;
                    
                    // Рисуем дугу
                    meshCtx.beginPath();
                    switch (i % 4) {
                        case 0: // Top-left corner
                            meshCtx.arc(x + size, y + size, size, Math.PI, Math.PI * 1.5);
                            x = x + size; // Move right
                            break;
                        case 1: // Top-right corner
                            meshCtx.arc(x, y + size, size, Math.PI * 1.5, Math.PI * 2);
                            y = y + size; // Move down
                            x += size - nextSize; // Move right
                            break;
                        case 2: // Bottom-right corner
                            meshCtx.arc(x, y, size, 0, Math.PI * 0.5);
                            x = x - nextSize; // Move left
                            y += size - nextSize; // Move down
                            break;
                        case 3: // Bottom-left corner
                            meshCtx.arc(x + size, y, size, Math.PI * 0.5, Math.PI);
                            y = y - nextSize; // Move up
                            break;
                    }
                    meshCtx.stroke();
                }
                
                // Уменьшаем размер для следующего квадрата
                size = size / phi;
            }
            break;

        case 'fibonacci':
            // Правильная спираль Фибоначчи
            const fib = [0, 1];
            for (let i = 2; i < 10; i++) {
                fib[i] = fib[i - 1] + fib[i - 2];
            }
            
            // Находим максимальный размер спирали
            const maxFib = fib[fib.length - 1];
            const scale = Math.min(meshCanvas.width, meshCanvas.height) / (maxFib * 1.5);
            
            // Центрируем спираль
            let centerX = meshCanvas.width / 2;
            let centerY = meshCanvas.height / 2;
            
            meshCtx.beginPath();
            let currentX = centerX;
            let currentY = centerY;
            
            // Рисуем спираль
            for (let i = 2; i < fib.length; i++) {
                const size = fib[i] * scale;
                const prevSize = fib[i - 1] * scale;
                
                switch ((i - 2) % 4) {
                    case 0: // вправо и вниз
                        meshCtx.moveTo(currentX, currentY);
                        meshCtx.lineTo(currentX + size, currentY);
                        meshCtx.lineTo(currentX + size, currentY + prevSize);
                        currentX += size;
                        currentY += prevSize;
                        break;
                    case 1: // влево и вниз
                        meshCtx.moveTo(currentX, currentY);
                        meshCtx.lineTo(currentX, currentY + size);
                        meshCtx.lineTo(currentX - prevSize, currentY + size);
                        currentX -= prevSize;
                        currentY += size;
                        break;
                    case 2: // влево и вверх
                        meshCtx.moveTo(currentX, currentY);
                        meshCtx.lineTo(currentX - size, currentY);
                        meshCtx.lineTo(currentX - size, currentY - prevSize);
                        currentX -= size;
                        currentY -= prevSize;
                        break;
                    case 3: // вправо и вверх
                        meshCtx.moveTo(currentX, currentY);
                        meshCtx.lineTo(currentX, currentY - size);
                        meshCtx.lineTo(currentX + prevSize, currentY - size);
                        currentX += prevSize;
                        currentY -= size;
                        break;
                }
            }
            meshCtx.stroke();
            break;
    }

    // Restore the context if we applied transformations
    if (flipHorizontal || flipVertical) {
        meshCtx.restore();
    }

    // Draw the mesh on top of the image
    ctx.drawImage(meshCanvas, 0, 0);

    // Add download button if it doesn't exist
    let downloadButton = document.getElementById('downloadMeshButton');
    if (!downloadButton) {
        downloadButton = document.createElement('button');
        downloadButton.id = 'downloadMeshButton';
        downloadButton.textContent = 'Download Mesh';
        downloadButton.onclick = function() {
            const pngUrl = meshCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'mesh.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        document.getElementById('drawMeshButton').parentNode.insertBefore(downloadButton, document.getElementById('drawMeshButton').nextSibling);
    }
});