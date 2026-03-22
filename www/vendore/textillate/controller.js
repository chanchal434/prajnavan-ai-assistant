$(document).ready(function () {

    // Display Speak Message - Improved version
    eel.expose(DisplayMessage)
    function DisplayMessage(message) {
        try {
            // Format the message with proper line breaks and wrapping
            const formattedMessage = formatChatMessage(message);
            
            // Update the message element
            const messageElement = $(".siri-message");
            messageElement.html(formattedMessage);
            
            // Restart textillate animation if needed
            try {
                messageElement.textillate('start');
            } catch (e) {
                // If textillate fails, just ensure the message is visible
                console.log("Textillate restart:", e);
            }
            
        } catch (error) {
            console.error("DisplayMessage error:", error);
            // Fallback: simple text update
            $(".siri-message").text(message);
        }
    }

    // Helper function to format chat messages with proper line breaks
    function formatChatMessage(text) {
        if (!text) return '';
        
        // Replace multiple spaces with single spaces
        let formatted = text.replace(/\s+/g, ' ');
        
        // Add line breaks after sentences (periods followed by space)
        formatted = formatted.replace(/\.\s/g, '.<br><br>');
        
        // Add line breaks after question marks and exclamation marks
        formatted = formatted.replace(/\?\s/g, '?<br><br>');
        formatted = formatted.replace(/\!\s/g, '!<br><br>');
        
        // Ensure proper spacing after commas
        formatted = formatted.replace(/,\s/g, ', ');
        
        return formatted;
    }
    
    // Display hood
    eel.expose(ShowHood)
    function ShowHood() {
        $("#Oval").attr("hidden", false);
        $("#SiriWave").attr("hidden", true);
    }

    eel.expose(senderText)
    function senderText(message) {
        var chatBox = document.getElementById("chat-canvas-body");
        if (message.trim() !== "") {
            chatBox.innerHTML += `<div class="row justify-content-end mb-4">
            <div class = "width-size">
            <div class="sender_message">${message}</div>
        </div>`; 
    
            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
    

    eel.expose(receiverText)
    function receiverText(message) {
        var chatBox = document.getElementById("chat-canvas-body");
        if (message.trim() !== "") {
            const formattedMessage = formatChatMessage(message);
            chatBox.innerHTML += `<div class="row justify-content-start mb-4">
            <div class = "width-size">
            <div class="receiver_message">${formattedMessage}</div>
            </div>
        </div>`; 
    
            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        
    }
});