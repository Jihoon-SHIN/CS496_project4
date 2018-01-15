/**
 * Todo: add more commands?
 */

var terminal = document.getElementById('terminal');

terminal.addEventListener('keydown', function(ev) {
  if (!ev) ev = window.event;
  if (ev.keyCode !== 13) return;
  ev.preventDefault();

  var str = terminal.lastElementChild.innerHTML;

  switch (str) {
    case 'codepen-server: ~ server$ open hackeverything':
      var percentage = 0;

      while (percentage < 100) {
        percentage += Math.ceil(Math.random()*10);
        if (percentage > 100) percentage = 100;

        setTimeout(
          timeoutCallBack.bind(this, 'Hacking in progress... '+percentage+'%'),
          percentage*100
        );
      }

      setTimeout(
        timeoutCallBack.bind(this, 'Hacking done, retrieving message...'),
        10000
      );

      setTimeout(
        timeoutCallBack.bind(this, '> thank you team codepen! you guys are awesome <3'),
        12000
      );

      break;
    default:
      createNewCommand('Command not recognized. Sorry :(');

      break;
   }


  function timeoutCallBack(str) {
    createNewCommand(str);
  }

  function createNewCommand(str) {
    terminal.lastElementChild.contentEditable = 'false';
    var p = document.createElement('p');
    p.innerHTML =str;
    p.contentEditable = false;
    terminal.appendChild(p);
    createNew();
  }

  function createNew(){
    terminal.lastElementChild.contentEditable = 'false';
    console.log("123");
    var p = document.createElement('p');
    p.innerHTML = "unknown-MacBook-pro:~ unknown$";
    p.contentEditable = true;
    terminal.appendChild(p);
    p.focus();
  }
}, false);

// terminal.lastElementChild.focus();
