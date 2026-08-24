import { useState } from "react";

function EditChat({ color, setColor, height, setHeight }) {

    function handleResizeStart(event) {
        const startY = event.clientY;
        const startHeight = height;

        function handleMouseMove(event) {
            const deltaY = event.clientY - startY;
            const newHeight = Math.max(25, startHeight + deltaY);

            setHeight(newHeight);
        }

        function handleMouseUp() {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    return (
        <div
            className="edit-chat"
            style={{ height: `${height}px` }}
        >
            <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
            />

            <div
                id="resizer"
                onMouseDown={handleResizeStart}>
                +
            </div>
        </div>
    );
}

export default EditChat;