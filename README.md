# Overview

This is a simple breakout game which I intend to expand. See READMEOLD.md for more info on that. To play the game, move your mouse across the screen. The paddle will follow your mouse and deflect the ball at the bricks, increasing your score. Try to beat my high score of 52! 

To play multiplayer, send the url to a friend. Be careful not to leave or refresh the page when you do – as of now, this will change your ID in the system and the link you must share will change. Once your friend has clicked on the link, they will begin playing breakout too, and your scores will be shared. 

I made this game so I could learn networking; not the charismatic business major sort, the nerdy computer major networking. I wanted to prove to myself that I could make a game that works, that you can share with your friends and enjoy together. This program still has a long way to go before it's worth publishing, but I'm proud of what I've accomplished in the four weeks I've fiddled with it so far.

{Provide a link to your YouTube demonstration.  It should be a 4-5 minute demo of the software running (you will need to show two pieces of software running and communicating with each other) and a walkthrough of the code.}

[Breakout Networking Demo](https://www.youtube.com/watch?v=0KluSCEwVWA)

# Network Communication

I used a peer-to-peer connection via PeerJS.

I'm currently using a protocol similar to TCP.

The messages are transfered in the form of JSON stringified objects and parsed on the receiving end.

# Development Environment

- Visual Studio Code
- JavaScript, HTML and CSS
- Git / GitHub
- PeerJS
- localStorage

# Useful Websites

## Sites Used During the Networking Phase

- [PeerJS, Docs](https://peerjs.com/docs/#start)

- [Tutorials Point, How can I make a browser to browser (peer to peer) connection in HTML?](https://www.tutorialspoint.com/How-can-I-make-a-browser-to-browser-peer-to-peer-connection-in-HTML)

- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

- [w3 Schools, Window localStorage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)

- [doFactory, HTML <button> hidden Attribute](dofactory.com/html/button/hidden)

## Sites Used During the Basic Game Development Phase

- [MDN Web Docs, Breakout Tutorial](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Create_the_Canvas_and_draw_on_it)
- [MDN Web Docs, Math.random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
- [MDN Web Docs, Drawing Text](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text)

- [SitePoint, Javascript Sleep Function](https://www.sitepoint.com/delay-sleep-pause-wait/)

- [W3Schools, JS For Loops](https://www.w3schools.com/js/js_loop_for.asp)

- [GeeksForGeeks, JS Mouse Coordinates](https://www.geeksforgeeks.org/javascript-coordinates-of-mouse/)

# Future Work

* Turn the game into breakout/pong/airhockey by adding a UDP connection, drawing an upside-down canvas with your opponent's game above your own, and allowing the balls to cross into each other's screen.

* Restart the scoring and later, the cash and upgrades for the duration of the connection, restoring or adding to old stats on connection close. 

* Permify stats using localStorage, save IDs so that connections can be recovered.

* See READMEOLD.md for basic breakout game improvements