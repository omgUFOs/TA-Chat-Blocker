// ==UserScript==
// @name         TA Chat Blocker
// @version      1.2.9
// @description  Blocks users on Toonami Aftermath..
// @author       nots
// @match        *://*.toonamiaftermath.com/*
// @icon         https://app.toonamiaftermath.com/config/sites/toonami%20aftermath/images/favicon.ico
// @grant        none
// ==/UserScript==

//Note:
// Properly return all text.
// More effecient DOM call
//

(function() {
	'use strict';

	const stfu = new Set();
	const originalMessages = new Map();

    // show notification popup when users are blocked.
    function noticePopup(popupmessage) {
        const notification = document.createElement('div');
        notification.innerText = popupmessage;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

	function addblockButton() {
		const messages = document.querySelectorAll('.message');
		messages.forEach(message => {
			const usernameElement = message.querySelector('.username');
			const textElement = message.querySelector('.text');
			// check elements to make sure they exist
			if (usernameElement && textElement) {
				if (!usernameElement.querySelector('.block-button')) {
					// create the block button
					const blockButton = document.createElement('timestamp');
					blockButton.textContent = '[x]';
					blockButton.className = 'block-button';
					blockButton.style.color = 'red';
					blockButton.style.cursor = 'crosshair';
					blockButton.style.marginRight = '1px';
					blockButton.style.marginTop = ' ';
					blockButton.style.fontSize = '9px';
					blockButton.addEventListener('click', function() {
						//block function.
						const username = usernameElement.textContent.trim();
						if (stfu.has(username)) {
							stfu.delete(username);
							usernameElement.classList.remove('blocked'); // remove strike through username
							noticePopup(`${username} Unblocked`);
							const originalMessage = originalMessages.get(username);
							if (originalMessage) { // Restore messages
								textElement.textContent = originalMessage;
							}
						}
						else {
							stfu.add(username);
							usernameElement.classList.add('blocked'); // add a strike through username
							originalMessages.set(username, textElement.textContent);
							textElement.textContent = '';
						}
						if (stfu.has(username)) {
							textElement.textContent = '';
							noticePopup(`${username} blocked`);
						}
					});
					usernameElement.prepend(blockButton);
				}
				const username = usernameElement.textContent.trim();
				if (stfu.has(username)) {
					usernameElement.classList.add('blocked'); // add a strike through when blocked
					textElement.textContent = '';
				}
			} else {
				console.error(
					'%cError: \nusernameElement or textElement is null:',"color:#da2c43; font-size: 16px; font-weight: bold;",
					{ usernameElement, textElement });
			}
		});
	}

	function hideBlockedMessages() {
		const messages = document.querySelectorAll('.message');
		messages.forEach(message => {
			const usernameElement = message.querySelector('.username');
			const textElement = message.querySelector('.text');
			if (usernameElement && textElement) { // Check if both elements exist
				const username = usernameElement.textContent.trim();
				if (stfu.has(username)) {
					textElement.textContent = '';
				}
			}
		});
	}

	const observer = new MutationObserver(() => {
		addblockButton();
		hideBlockedMessages();
	});
	observer.observe(document.body, { childList: true, subtree: true });
	addblockButton();
	//style for username
	const style = document.createElement('style');
	style.textContent = `
        .blocked {
            text-decoration: line-through;
            color: gray; }`;
	document.head.appendChild(style);
})();